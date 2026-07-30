#!/usr/bin/env node
/**
 * Static audit for mishandled promise rejections.
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
 * `// noinspection JSIgnoredPromiseFromCall` convention on the line above (check 2). Acknowledged
 * findings are counted but not listed unless --all is given.
 *
 * Usage:
 *   node scripts/auditPromiseRejections.mjs [path ...] [--all] [--strict]
 *
 *   path      one or more directories to scan (default: src)
 *   --all     list acknowledged findings too
 *   --strict  exit non-zero if there are unacknowledged findings (for CI)
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

const args = process.argv.slice(2);
const listAll = args.includes('--all');
const strict = args.includes('--strict');
const targets = args.filter((arg) => !arg.startsWith('--'));

if (!targets.length) {
    targets.push('src');
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
            if (entry.name !== 'node_modules' && entry.name !== 'dist') {
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
            console.error(`Could not parse ${file}: ${error.message}`);
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
                            file,
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
                        file,
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
                            file,
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

const sections = [
    ['Swallowing rejection handlers', findings.swallowed],
    ['Floating promise chains', findings.floating],
    ['try/catch returning undefined', findings.catchUndefined],
];

let unacknowledgedTotal = 0;

for (const [title, entries] of sections) {
    const shown = listAll ? entries : entries.filter((entry) => !entry.acknowledged);
    const acknowledged = entries.length - entries.filter((entry) => !entry.acknowledged).length;

    unacknowledgedTotal += entries.length - acknowledged;

    console.log(`\n=== ${title} ===`);

    if (!shown.length) {
        console.log(acknowledged ? `none unacknowledged (${acknowledged} marked @intentional)` : 'none');
        continue;
    }

    shown.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

    for (const entry of shown) {
        console.log(`${entry.file}:${entry.line}  [${entry.note}]${entry.acknowledged ? ' (acknowledged)' : ''}`);
        console.log(`    ${entry.snippet}`);
    }

    console.log(`(${shown.length} shown${acknowledged ? `, ${acknowledged} acknowledged` : ''})`);
}

console.log(`\nScanned ${filesScanned} files. ${unacknowledgedTotal} unacknowledged findings.`);
console.log('Mark a reviewed case with an @intentional comment inside the handler.');

if (strict && unacknowledgedTotal) {
    process.exit(1);
}
