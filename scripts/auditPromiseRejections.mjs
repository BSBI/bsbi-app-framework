#!/usr/bin/env node
/**
 * Static audit for mishandled promise rejections.
 *
 * This file is mirrored, byte for byte, in bsbi-app-framework, bsbi-app-framework-view and
 * bsbi-recording-app, so that each can gate its own CI without depending on a sibling checkout.
 * Update all three together.
 *
 * Looks for three shapes that have each produced real faults in this codebase, all of which share a
 * symptom: a failure disappears, and the work that should have followed it silently doesn't happen.
 *
 *   1. Swallowing rejection handlers
 *      A .catch(fn) or .then(onOk, onRejected) whose handler neither returns a value nor throws, so
 *      the chain continues as though nothing went wrong. Often deliberate; sometimes not.
 *
 *   2. Floating promise chains
 *      A promise chain used as a bare statement. Nothing waits for it and nothing handles a
 *      rejection, so a failure becomes an unhandled rejection and any follow-up work is skipped.
 *
 *   3. try/catch returning undefined
 *      A function whose try block returns a value but whose catch block falls through, so callers
 *      that chain .then()/.finally() onto the result get a TypeError instead. This is what made
 *      Logger.logError unsafe to chain onto.
 *
 * None of these is automatically a bug. To mark a finding as reviewed and intended, put a comment
 * containing @intentional inside the handler (checks 1 and 3), or use the existing
 * `// noinspection JSIgnoredPromiseFromCall` convention on the line above (check 2).
 *
 * Usage:
 *   node scripts/auditPromiseRejections.mjs [path ...] [options]
 *
 *   path                 directories to scan (default: src)
 *   --all                list acknowledged findings too
 *   --baseline[=file]    compare against a recorded baseline (default .promise-audit-baseline.json)
 *   --update-baseline[=file]  rewrite the baseline from the current state, then exit
 *   --strict             exit 1 on regressions against the baseline, or on any unacknowledged
 *                        finding when no baseline is in use
 *
 * Exit codes: 0 clean, 1 gate failed, 2 tool or usage error.
 *
 * CI note: run with --baseline --strict. The baseline records per-file counts rather than line
 * numbers, so ordinary edits don't invalidate it; the gate fires when a file gains a finding.
 * Retiring findings is encouraged - re-run with --update-baseline to lock the improvement in.
 */

import fs from 'fs';
import path from 'path';

let parse;

try {
    ({parse} = await import('acorn'));
} catch (error) {
    console.error("This tool needs 'acorn'. Run: npm install");
    process.exit(2);
}

const FUNCTION_TYPES = new Set(['FunctionExpression', 'ArrowFunctionExpression', 'FunctionDeclaration']);
const THENABLE_METHODS = new Set(['then', 'catch', 'finally']);
const ACKNOWLEDGEMENT = /@intentional/;
const FLOATING_ACKNOWLEDGEMENT = /noinspection JSIgnoredPromiseFromCall/;
const DEFAULT_BASELINE_FILE = '.promise-audit-baseline.json';

const CATEGORIES = [
    ['swallowed', 'Swallowing rejection handlers'],
    ['floating', 'Floating promise chains'],
    ['catchUndefined', 'try/catch returning undefined'],
];

const args = process.argv.slice(2);

/**
 * @param {string} name
 * @returns {string|null} the option's value, '' when given without one, or null when absent
 */
function option(name) {
    const match = args.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`));

    if (!match) {
        return null;
    }

    return match.includes('=') ? match.slice(match.indexOf('=') + 1) : '';
}

const listAll = option('all') !== null;
const strict = option('strict') !== null;
const baselineOption = option('baseline');
const updateBaselineOption = option('update-baseline');
const baselineFile = (updateBaselineOption || baselineOption) || DEFAULT_BASELINE_FILE;
const usingBaseline = baselineOption !== null || updateBaselineOption !== null;

const targets = args.filter((arg) => !arg.startsWith('--'));

if (!targets.length) {
    targets.push('src');
}

/**
 * Repo-relative, forward-slashed, so that baselines are portable between a Windows workstation and
 * a Linux CI runner.
 *
 * @param {string} filePath
 * @returns {string}
 */
function relativePath(filePath) {
    return path.relative(process.cwd(), filePath).split(path.sep).join('/');
}

/**
 * @param {string} dir
 * @param {Array<string>} found
 * @returns {Array<string>}
 */
function collectSourceFiles(dir, found) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // 'public' holds built bundles in the recording app; auditing minified output would be
            // meaningless and very slow
            if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'public') {
                collectSourceFiles(entryPath, found);
            }
        } else if (/\.m?js$/.test(entry.name) && !entry.name.includes('.old.')) {
            found.push(entryPath);
        }
    }

    return found;
}

/**
 * Visits a function's own statements, without descending into nested functions - their returns
 * belong to them, not to the handler being assessed.
 *
 * @param {{}} fnNode
 * @param {function({}): (boolean|void)} visit return true to stop descending
 */
function walkOwnBody(fnNode, visit) {
    (function scan(node) {
        if (!node || typeof node.type !== 'string') {
            return;
        }

        if (node !== fnNode.body && FUNCTION_TYPES.has(node.type)) {
            return;
        }

        if (visit(node)) {
            return;
        }

        for (const key of Object.keys(node)) {
            if (key === 'type' || key === 'start' || key === 'end' || key === 'loc') {
                continue;
            }

            const child = node[key];

            if (Array.isArray(child)) {
                child.forEach(scan);
            } else if (child && typeof child.type === 'string') {
                scan(child);
            }
        }
    })(fnNode.body);
}

/**
 * @param {{}} fnNode
 * @returns {{settles: boolean, note: string}}
 */
function assessHandler(fnNode) {
    if (!fnNode || !FUNCTION_TYPES.has(fnNode.type)) {
        // a reference to a named function - not assessable here
        return {settles: true, note: ''};
    }

    if (fnNode.body.type !== 'BlockStatement') {
        // concise arrow body: implicitly returns
        return {settles: true, note: ''};
    }

    let found = false;
    let bare = false;

    walkOwnBody(fnNode, (node) => {
        if (node.type === 'ReturnStatement') {
            found = true;

            if (!node.argument) {
                bare = true;
            }

            return true;
        }

        if (node.type === 'ThrowStatement') {
            found = true;
            return true;
        }
    });

    return {
        settles: found && !bare,
        note: bare ? 'bare return' : 'no return or throw',
    };
}

/**
 * @param {{}} node
 * @returns {boolean}
 */
function containsReturningTry(node) {
    let returns = false;

    (function scan(current) {
        if (!current || typeof current.type !== 'string') {
            return;
        }

        if (current !== node && FUNCTION_TYPES.has(current.type)) {
            return;
        }

        if (current.type === 'ReturnStatement' && current.argument) {
            returns = true;
            return;
        }

        for (const key of Object.keys(current)) {
            if (key === 'type' || key === 'start' || key === 'end' || key === 'loc') {
                continue;
            }

            const child = current[key];

            if (Array.isArray(child)) {
                child.forEach(scan);
            } else if (child && typeof child.type === 'string') {
                scan(child);
            }
        }
    })(node);

    return returns;
}

const findings = {swallowed: [], floating: [], catchUndefined: []};
let filesScanned = 0;
let parseFailures = 0;

for (const target of targets) {
    if (!fs.existsSync(target)) {
        console.error(`No such path: ${target}`);
        process.exit(2);
    }

    for (const file of collectSourceFiles(target, [])) {
        const source = fs.readFileSync(file, 'utf8');
        const lines = source.split(/\r?\n/);
        const comments = [];

        let ast;

        try {
            ast = parse(source, {
                ecmaVersion: 2022,
                sourceType: 'module',
                locations: true,
                onComment: comments,
            });
        } catch (error) {
            // A file that cannot be parsed is silently unaudited, which would quietly weaken the
            // gate, so it is treated as a failure in its own right.
            console.error(`Could not parse ${relativePath(file)}: ${error.message}`);
            parseFailures++;
            continue;
        }

        filesScanned++;

        const acknowledgedWithin = (start, end) => comments.some(
            (comment) => comment.start >= start && comment.end <= end && ACKNOWLEDGEMENT.test(comment.value)
        );

        const snippetOf = (node) => source.slice(node.start, Math.min(node.end, node.start + 100))
            .replace(/\s+/g, ' ');

        (function walk(node) {
            if (!node || typeof node.type !== 'string') {
                return;
            }

            if (node.type === 'CallExpression'
                && node.callee.type === 'MemberExpression'
                && !node.callee.computed
            ) {
                const method = node.callee.property.name;

                let handler = null;

                if (method === 'catch' && node.arguments.length === 1) {
                    handler = node.arguments[0];
                } else if (method === 'then' && node.arguments.length === 2) {
                    handler = node.arguments[1];
                }

                if (handler && FUNCTION_TYPES.has(handler.type)) {
                    const verdict = assessHandler(handler);

                    if (!verdict.settles) {
                        findings.swallowed.push({
                            file: relativePath(file),
                            line: node.loc.start.line,
                            note: `${method === 'catch' ? '.catch()' : '.then() onRejected'}, ${verdict.note}`,
                            snippet: snippetOf(handler),
                            acknowledged: acknowledgedWithin(handler.start, handler.end),
                        });
                    }
                }
            }

            if (node.type === 'ExpressionStatement') {
                const expression = node.expression;

                if (expression
                    && expression.type === 'CallExpression'
                    && expression.callee.type === 'MemberExpression'
                    && !expression.callee.computed
                    && THENABLE_METHODS.has(expression.callee.property.name)
                ) {
                    const previousLine = lines[node.loc.start.line - 2] || '';

                    findings.floating.push({
                        file: relativePath(file),
                        line: node.loc.start.line,
                        note: `chain ends in .${expression.callee.property.name}()`,
                        snippet: snippetOf(node),
                        acknowledged: FLOATING_ACKNOWLEDGEMENT.test(previousLine)
                            || acknowledgedWithin(node.start, node.end),
                    });
                }
            }

            if (FUNCTION_TYPES.has(node.type) && node.body && node.body.type === 'BlockStatement') {
                walkOwnBody(node, (inner) => {
                    if (inner.type !== 'TryStatement' || !inner.handler) {
                        return;
                    }

                    if (containsReturningTry(inner.block) && !assessHandler({
                        type: 'FunctionExpression',
                        body: inner.handler.body,
                    }).settles) {
                        findings.catchUndefined.push({
                            file: relativePath(file),
                            line: inner.handler.loc.start.line,
                            note: 'try returns a value, catch does not',
                            snippet: snippetOf(inner.handler),
                            acknowledged: acknowledgedWithin(inner.handler.start, inner.handler.end),
                        });
                    }
                });
            }

            for (const key of Object.keys(node)) {
                if (key === 'type' || key === 'start' || key === 'end' || key === 'loc') {
                    continue;
                }

                const child = node[key];

                if (Array.isArray(child)) {
                    child.forEach(walk);
                } else if (child && typeof child.type === 'string') {
                    walk(child);
                }
            }
        })(ast);
    }
}

/**
 * Per-file counts of unacknowledged findings. Deliberately not line numbers: those shift with every
 * edit, which would make the baseline useless within a day.
 *
 * @returns {Object<string, Object<string, number>>}
 */
function currentCounts() {
    const counts = {};

    for (const [category] of CATEGORIES) {
        for (const finding of findings[category]) {
            if (finding.acknowledged) {
                continue;
            }

            counts[finding.file] = counts[finding.file] || {};
            counts[finding.file][category] = (counts[finding.file][category] || 0) + 1;
        }
    }

    return counts;
}

const counts = currentCounts();

if (updateBaselineOption !== null) {
    fs.writeFileSync(baselineFile, `${JSON.stringify(counts, null, 2)}\n`, 'utf8');
    console.log(`Baseline written to ${baselineFile} (${Object.keys(counts).length} files with findings).`);
    process.exit(0);
}

let unacknowledgedTotal = 0;

for (const [category, title] of CATEGORIES) {
    const entries = findings[category];
    const unacknowledged = entries.filter((entry) => !entry.acknowledged);
    const shown = listAll ? entries : unacknowledged;

    unacknowledgedTotal += unacknowledged.length;

    console.log(`\n=== ${title} ===`);

    if (!shown.length) {
        const acknowledged = entries.length - unacknowledged.length;
        console.log(acknowledged ? `none unacknowledged (${acknowledged} marked @intentional)` : 'none');
        continue;
    }

    shown.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

    for (const entry of shown) {
        console.log(`${entry.file}:${entry.line}  [${entry.note}]${entry.acknowledged ? ' (acknowledged)' : ''}`);
        console.log(`    ${entry.snippet}`);
    }

    console.log(`(${shown.length} shown)`);
}

console.log(`\nScanned ${filesScanned} files. ${unacknowledgedTotal} unacknowledged findings.`);

let gateFailed = false;

if (parseFailures) {
    console.log(`\n${parseFailures} file(s) could not be parsed and were not audited.`);
    gateFailed = true;
}

if (usingBaseline) {
    let baseline = {};

    if (fs.existsSync(baselineFile)) {
        try {
            baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
        } catch (error) {
            console.error(`Could not read baseline ${baselineFile}: ${error.message}`);
            process.exit(2);
        }
    } else {
        console.log(`\nNo baseline at ${baselineFile}; treating every finding as new.`);
    }

    const regressions = [];
    const improvements = [];

    const files = new Set([...Object.keys(counts), ...Object.keys(baseline)]);

    for (const file of [...files].sort()) {
        for (const [category, title] of CATEGORIES) {
            const now = counts[file]?.[category] || 0;
            const was = baseline[file]?.[category] || 0;

            if (now > was) {
                regressions.push(`  ${file}  ${title}: ${was} -> ${now}`);
            } else if (now < was) {
                improvements.push(`  ${file}  ${title}: ${was} -> ${now}`);
            }
        }
    }

    if (improvements.length) {
        console.log(`\nImproved since the baseline (re-run with --update-baseline to lock in):`);
        improvements.forEach((line) => console.log(line));
    }

    if (regressions.length) {
        console.log(`\nNew findings against ${baselineFile}:`);
        regressions.forEach((line) => console.log(line));
        gateFailed = true;
    } else {
        console.log(`\nNo new findings against ${baselineFile}.`);
    }
} else if (unacknowledgedTotal) {
    console.log('Mark a reviewed case with an @intentional comment inside the handler.');
    gateFailed = true;
}

if (strict && gateFailed) {
    process.exit(1);
}
