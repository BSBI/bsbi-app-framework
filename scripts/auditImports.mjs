#!/usr/bin/env node
/**
 * Static audit for broken imports.
 *
 * This file is mirrored, byte for byte, in bsbi-app-framework, bsbi-app-framework-view and
 * bsbi-recording-app, so that each can gate its own CI without depending on a sibling checkout.
 * Update all three together.
 *
 * Catches the refactoring mistakes that a bundler will happily build and only fail at runtime, on
 * whichever code path happens to touch them:
 *
 *   1. Unresolved identifiers
 *      A name is used but never imported, declared or known as a global - the classic 'moved the
 *      code, left the import behind'.
 *
 *   2. Import/export mismatches
 *      A named import that the target module does not export, or a relative import path that does
 *      not resolve to a file. Catches a renamed or removed export whose importers weren't updated.
 *
 *   3. Imports escaping the repository
 *      A relative path that resolves outside the repository, e.g. '../../../../bsbi-app-framework'.
 *      IDEs generate these when they resolve a workspace sibling by path rather than by package
 *      name. They work only while the sibling happens to be checked out alongside, so they build on
 *      a developer's machine and fail in CI. The package name should be used instead.
 *
 * Deliberate simplification for check 1: declarations are gathered per *file* rather than per
 * lexical scope. That trades some false negatives (a name declared in an unrelated function in the
 * same file will mask a genuine omission elsewhere in it) for effectively no false positives, which
 * is the right way round for a gate people have to trust. Nothing here understands shadowing.
 *
 * Extra globals can be declared per repo in .import-audit-globals.json, as a JSON array of names.
 *
 * Usage:
 *   node scripts/auditImports.mjs [path ...] [options]
 *
 *   path                 directories to scan (default: src)
 *   --baseline[=file]    compare against a recorded baseline (default .import-audit-baseline.json)
 *   --update-baseline[=file]  rewrite the baseline from the current state, then exit
 *   --strict             exit 1 on regressions, or on any finding when no baseline is in use
 *
 * Exit codes: 0 clean, 1 gate failed, 2 tool or usage error.
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

const DEFAULT_BASELINE_FILE = '.import-audit-baseline.json';
const EXTRA_GLOBALS_FILE = '.import-audit-globals.json';

/**
 * Names that are always available. Kept broad on purpose: a missing entry produces a false positive,
 * which is far more damaging to a gate's credibility than a missed fault.
 */
const KNOWN_GLOBALS = new Set([
    // language
    'globalThis', 'undefined', 'NaN', 'Infinity', 'Object', 'Array', 'String', 'Number', 'Boolean',
    'Symbol', 'BigInt', 'Math', 'JSON', 'Date', 'RegExp', 'Error', 'TypeError', 'RangeError',
    'SyntaxError', 'ReferenceError', 'EvalError', 'URIError', 'AggregateError', 'Function',
    'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet', 'WeakRef', 'Proxy', 'Reflect', 'Intl',
    'ArrayBuffer', 'SharedArrayBuffer', 'DataView', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
    'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array',
    'BigInt64Array', 'BigUint64Array', 'Atomics', 'FinalizationRegistry',
    'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'eval',
    'encodeURI', 'encodeURIComponent', 'decodeURI', 'decodeURIComponent', 'escape', 'unescape',
    'structuredClone', 'queueMicrotask', 'reportError',

    // timers and scheduling
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame',
    'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback', 'scheduler',

    // window and DOM
    'window', 'document', 'console', 'navigator', 'location', 'history', 'screen', 'frames',
    'parent', 'top', 'opener', 'alert', 'confirm', 'prompt', 'getComputedStyle', 'matchMedia',
    'addEventListener', 'removeEventListener', 'dispatchEvent', 'scrollTo', 'scrollBy',
    'localStorage', 'sessionStorage', 'indexedDB', 'caches', 'crypto', 'performance',
    'btoa', 'atob', 'open', 'close', 'focus', 'blur', 'print',
    'Element', 'HTMLElement', 'HTMLInputElement', 'HTMLImageElement', 'HTMLCanvasElement',
    'HTMLSelectElement', 'HTMLTextAreaElement', 'HTMLFormElement', 'HTMLButtonElement',
    'HTMLAnchorElement', 'HTMLDialogElement', 'Node', 'NodeList', 'NodeFilter', 'Text',
    'DocumentFragment', 'DOMParser', 'XMLSerializer', 'DOMException', 'CSS', 'CSSStyleSheet',
    'Event', 'CustomEvent', 'MouseEvent', 'KeyboardEvent', 'TouchEvent', 'PointerEvent',
    'FocusEvent', 'InputEvent', 'MessageEvent', 'ErrorEvent', 'PromiseRejectionEvent',
    'IntersectionObserver', 'ResizeObserver', 'MutationObserver', 'PerformanceObserver',
    'Image', 'Audio', 'Option', 'FileReader', 'FileList', 'Blob', 'File', 'FormData',
    'URL', 'URLSearchParams', 'AbortController', 'AbortSignal', 'TextEncoder', 'TextDecoder',
    'ReadableStream', 'WritableStream', 'TransformStream',
    'MessageChannel', 'MessagePort', 'BroadcastChannel', 'Worker', 'SharedWorker',
    'WebSocket', 'EventSource', 'XMLHttpRequest', 'fetch', 'Request', 'Response', 'Headers',
    'Notification', 'PushManager', 'geolocation', 'IDBKeyRange', 'IDBRequest',
    'CanvasRenderingContext2D', 'Path2D', 'OffscreenCanvas', 'createImageBitmap',
    'openDatabase', 'visualViewport', 'speechSynthesis', 'SpeechSynthesisUtterance',
    'WakeLock', 'MediaQueryList', 'ImageData', 'Range', 'Selection', 'HTMLCollection',

    // service worker
    'self', 'clients', 'registration', 'skipWaiting', 'importScripts', 'ExtendableEvent',
    'FetchEvent', 'ServiceWorkerGlobalScope', 'Cache', 'CacheStorage',

    // node, for the scripts directory
    'process', 'require', 'module', 'exports', '__dirname', '__filename', 'Buffer', 'URLPattern',
]);

const args = process.argv.slice(2);

/**
 * @param {string} name
 * @returns {string|null}
 */
function option(name) {
    const match = args.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`));

    if (!match) {
        return null;
    }

    return match.includes('=') ? match.slice(match.indexOf('=') + 1) : '';
}

const strict = option('strict') !== null;
const baselineOption = option('baseline');
const updateBaselineOption = option('update-baseline');
const baselineFile = (updateBaselineOption || baselineOption) || DEFAULT_BASELINE_FILE;
const usingBaseline = baselineOption !== null || updateBaselineOption !== null;

const targets = args.filter((arg) => !arg.startsWith('--'));

if (!targets.length) {
    targets.push('src');
}

const extraGlobals = new Set();

if (fs.existsSync(EXTRA_GLOBALS_FILE)) {
    try {
        for (const name of JSON.parse(fs.readFileSync(EXTRA_GLOBALS_FILE, 'utf8'))) {
            extraGlobals.add(name);
        }
    } catch (error) {
        console.error(`Could not read ${EXTRA_GLOBALS_FILE}: ${error.message}`);
        process.exit(2);
    }
}

/**
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
 * Generic child walk.
 *
 * @param {{}} node
 * @param {function({}, string, {}): (boolean|void)} visit return true to skip the subtree
 * @param {{}} [parent]
 * @param {string} [key]
 */
function walk(node, visit, parent = null, key = '') {
    if (!node || typeof node.type !== 'string') {
        return;
    }

    if (visit(node, key, parent)) {
        return;
    }

    for (const childKey of Object.keys(node)) {
        if (childKey === 'type' || childKey === 'start' || childKey === 'end' || childKey === 'loc') {
            continue;
        }

        const child = node[childKey];

        if (Array.isArray(child)) {
            child.forEach((item) => walk(item, visit, node, childKey));
        } else if (child && typeof child.type === 'string') {
            walk(child, visit, node, childKey);
        }
    }
}

/**
 * Every name a pattern introduces.
 *
 * @param {{}} pattern
 * @param {Set<string>} into
 */
function bindPattern(pattern, into) {
    if (!pattern) {
        return;
    }

    switch (pattern.type) {
        case 'Identifier':
            into.add(pattern.name);
            break;

        case 'ObjectPattern':
            for (const property of pattern.properties) {
                bindPattern(property.type === 'RestElement' ? property.argument : property.value, into);
            }
            break;

        case 'ArrayPattern':
            pattern.elements.forEach((element) => bindPattern(element, into));
            break;

        case 'AssignmentPattern':
            bindPattern(pattern.left, into);
            break;

        case 'RestElement':
            bindPattern(pattern.argument, into);
            break;

        default:
            break;
    }
}

/**
 * @param {{}} ast
 * @returns {Set<string>} every name declared anywhere in the file
 */
function declaredNames(ast) {
    const names = new Set(['this', 'arguments', 'super']);

    walk(ast, (node) => {
        switch (node.type) {
            case 'ImportDeclaration':
                node.specifiers.forEach((specifier) => names.add(specifier.local.name));
                break;

            case 'VariableDeclarator':
                bindPattern(node.id, names);
                break;

            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
                if (node.id) {
                    names.add(node.id.name);
                }

                node.params.forEach((param) => bindPattern(param, names));
                break;

            case 'ClassDeclaration':
            case 'ClassExpression':
                if (node.id) {
                    names.add(node.id.name);
                }
                break;

            case 'CatchClause':
                bindPattern(node.param, names);
                break;

            case 'LabeledStatement':
                names.add(node.label.name);
                break;

            default:
                break;
        }
    });

    return names;
}

/**
 * Identifier references, excluding every position where an identifier is a name rather than a
 * reference: property accesses, object and class keys, labels, import and export specifiers.
 *
 * @param {{}} ast
 * @returns {Array<{name: string, line: number}>}
 */
function identifierReferences(ast) {
    const references = [];

    walk(ast, (node, key, parent) => {
        if (node.type === 'ImportDeclaration' || node.type === 'ExportAllDeclaration') {
            return true;
        }

        if (node.type === 'ExportNamedDeclaration' && node.source) {
            return true;
        }

        if (node.type === 'ExportSpecifier' || node.type === 'ImportSpecifier'
            || node.type === 'ImportDefaultSpecifier' || node.type === 'ImportNamespaceSpecifier') {
            return true;
        }

        // new.target and import.meta: both halves are Identifier nodes but neither is a binding
        if (node.type === 'MetaProperty') {
            return true;
        }

        if (node.type !== 'Identifier') {
            return;
        }

        if (!parent) {
            return;
        }

        // a.b - 'b' names a property, not a binding
        if (parent.type === 'MemberExpression' && key === 'property' && !parent.computed) {
            return true;
        }

        // {a: 1} and class members - the key is a name. Shorthand {a} shares one node between key
        // and value, so it is still reached through 'value'.
        if ((parent.type === 'Property' || parent.type === 'PropertyDefinition'
                || parent.type === 'MethodDefinition') && key === 'key' && !parent.computed) {
            return true;
        }

        if (parent.type === 'LabeledStatement' || parent.type === 'BreakStatement'
            || parent.type === 'ContinueStatement') {
            return true;
        }

        references.push({name: node.name, line: node.loc.start.line});
    });

    return references;
}

/**
 * @param {{}} ast
 * @returns {Set<string>}
 */
function exportedNames(ast) {
    const names = new Set();

    for (const node of ast.body) {
        if (node.type === 'ExportDefaultDeclaration') {
            names.add('default');
        } else if (node.type === 'ExportNamedDeclaration') {
            if (node.declaration) {
                if (node.declaration.type === 'VariableDeclaration') {
                    node.declaration.declarations.forEach((declarator) => bindPattern(declarator.id, names));
                } else if (node.declaration.id) {
                    names.add(node.declaration.id.name);
                }
            }

            node.specifiers.forEach((specifier) => names.add(specifier.exported.name));
        }
    }

    return names;
}

/**
 * @param {string} fromFile
 * @param {string} specifier
 * @returns {string|null} resolved path, or null when it cannot be resolved
 */
function resolveRelative(fromFile, specifier) {
    const base = path.resolve(path.dirname(fromFile), specifier);
    const candidates = [base, `${base}.js`, `${base}.mjs`];

    // A directory may be a package in its own right - the recording app reaches into sibling
    // checkouts this way - so honour its package.json entry point as a bundler would.
    const packageFile = path.join(base, 'package.json');

    if (fs.existsSync(packageFile)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

            for (const entry of [manifest.module, manifest.main]) {
                if (entry) {
                    candidates.push(path.resolve(base, entry));
                }
            }
        } catch (error) {
            // an unreadable manifest just means the directory candidates below are all there is
        }
    }

    candidates.push(path.join(base, 'index.js'), path.join(base, 'index.mjs'));

    for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return candidate;
        }
    }

    return null;
}

/**
 * The repository being audited. npm sets the working directory to the package root, which is where
 * these scripts are meant to be run from.
 *
 * @type {string}
 */
const REPO_ROOT = process.cwd();

/**
 * @param {string} targetPath
 * @returns {boolean}
 */
function escapesRepository(targetPath) {
    const relative = path.relative(REPO_ROOT, targetPath);

    return relative.startsWith('..') || path.isAbsolute(relative);
}

/**
 * Nearest enclosing package name, used to suggest the specifier that should have been written.
 *
 * @param {string} targetPath
 * @returns {string|null}
 */
function packageNameFor(targetPath) {
    let dir = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()
        ? targetPath
        : path.dirname(targetPath);

    for (let depth = 0; depth < 12; depth++) {
        const manifest = path.join(dir, 'package.json');

        if (fs.existsSync(manifest)) {
            try {
                const name = JSON.parse(fs.readFileSync(manifest, 'utf8')).name;

                if (name) {
                    return name;
                }
            } catch (error) {
                // unreadable manifest: keep walking up
            }
        }

        const parent = path.dirname(dir);

        if (parent === dir) {
            break;
        }

        dir = parent;
    }

    return null;
}

const parsedCache = new Map();

/**
 * @param {string} file
 * @returns {{ast: {}, exports: Set<string>, starSources: Array<string>}|null}
 */
function parseModule(file) {
    if (parsedCache.has(file)) {
        return parsedCache.get(file);
    }

    let result = null;

    try {
        const ast = parse(fs.readFileSync(file, 'utf8'), {
            ecmaVersion: 2022,
            sourceType: 'module',
            locations: true,
        });

        result = {
            ast,
            exports: exportedNames(ast),
            starSources: ast.body
                .filter((node) => node.type === 'ExportAllDeclaration')
                .map((node) => node.source.value),
        };
    } catch (error) {
        result = null;
    }

    parsedCache.set(file, result);

    return result;
}

/**
 * Follows `export * from` chains so that a re-exporting barrel resolves correctly.
 *
 * @param {string} file
 * @param {number} [depth]
 * @returns {Set<string>|null} null when a star source could not be followed, so absence is unproven
 */
function resolvedExports(file, depth = 0) {
    const module = parseModule(file);

    if (!module) {
        return null;
    }

    if (!module.starSources.length || depth > 8) {
        return module.exports;
    }

    const names = new Set(module.exports);

    for (const source of module.starSources) {
        if (!source.startsWith('.')) {
            // re-exported from a package: cannot verify, so treat the set as open
            return null;
        }

        const target = resolveRelative(file, source);

        if (!target) {
            return null;
        }

        const nested = resolvedExports(target, depth + 1);

        if (!nested) {
            return null;
        }

        nested.forEach((name) => names.add(name));
    }

    return names;
}

const findings = {unresolved: [], badImport: [], escaping: []};
let filesScanned = 0;
let parseFailures = 0;

for (const target of targets) {
    if (!fs.existsSync(target)) {
        console.error(`No such path: ${target}`);
        process.exit(2);
    }

    for (const file of collectSourceFiles(target, [])) {
        const module = parseModule(file);

        if (!module) {
            console.error(`Could not parse ${relativePath(file)}`);
            parseFailures++;
            continue;
        }

        filesScanned++;

        const declared = declaredNames(module.ast);
        const seen = new Set();

        for (const reference of identifierReferences(module.ast)) {
            if (declared.has(reference.name)
                || KNOWN_GLOBALS.has(reference.name)
                || extraGlobals.has(reference.name)
                || seen.has(reference.name)
            ) {
                continue;
            }

            seen.add(reference.name);

            findings.unresolved.push({
                file: relativePath(file),
                line: reference.line,
                detail: reference.name,
            });
        }

        for (const node of module.ast.body) {
            const isImport = node.type === 'ImportDeclaration';
            const isReExport = (node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') && node.source;

            if (!isImport && !isReExport) {
                continue;
            }

            const source = node.source.value;

            if (!source.startsWith('.')) {
                // a package: outside this repo's control
                continue;
            }

            const resolved = resolveRelative(file, source);

            if (!resolved) {
                findings.badImport.push({
                    file: relativePath(file),
                    line: node.loc.start.line,
                    detail: `cannot resolve '${source}'`,
                });
                continue;
            }

            if (escapesRepository(resolved)) {
                const packageName = packageNameFor(resolved);

                findings.escaping.push({
                    file: relativePath(file),
                    line: node.loc.start.line,
                    detail: `'${source}' resolves outside the repository`
                        + (packageName ? `; use '${packageName}'` : ''),
                });

                // the escaping path is the fault to fix; don't also report on its exports
                continue;
            }

            const available = resolvedExports(resolved);

            if (!available) {
                // target unparseable, or re-exports from a package - absence cannot be proven
                continue;
            }

            const wanted = isImport
                ? node.specifiers
                    .filter((specifier) => specifier.type === 'ImportSpecifier')
                    .map((specifier) => specifier.imported.name)
                : (node.specifiers || []).map((specifier) => specifier.local.name);

            const wantsDefault = isImport && node.specifiers.some(
                (specifier) => specifier.type === 'ImportDefaultSpecifier'
            );

            if (wantsDefault && !available.has('default')) {
                findings.badImport.push({
                    file: relativePath(file),
                    line: node.loc.start.line,
                    detail: `'${source}' has no default export`,
                });
            }

            for (const name of wanted) {
                if (!available.has(name)) {
                    findings.badImport.push({
                        file: relativePath(file),
                        line: node.loc.start.line,
                        detail: `'${name}' is not exported by '${source}'`,
                    });
                }
            }
        }
    }
}

const CATEGORIES = [
    ['unresolved', 'Unresolved identifiers (missing import?)'],
    ['badImport', 'Import/export mismatches'],
    ['escaping', 'Imports escaping the repository'],
];

/**
 * @returns {Object<string, Object<string, number>>}
 */
function currentCounts() {
    const counts = {};

    for (const [category] of CATEGORIES) {
        for (const finding of findings[category]) {
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

let total = 0;

for (const [category, title] of CATEGORIES) {
    const entries = findings[category];
    total += entries.length;

    console.log(`\n=== ${title} ===`);

    if (!entries.length) {
        console.log('none');
        continue;
    }

    entries.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

    for (const entry of entries) {
        console.log(`${entry.file}:${entry.line}  ${entry.detail}`);
    }

    console.log(`(${entries.length})`);
}

console.log(`\nScanned ${filesScanned} files. ${total} findings.`);

let gateFailed = false;

if (parseFailures) {
    console.log(`${parseFailures} file(s) could not be parsed and were not audited.`);
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

    for (const file of [...new Set([...Object.keys(counts), ...Object.keys(baseline)])].sort()) {
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
} else if (total) {
    gateFailed = true;
}

if (strict && gateFailed) {
    process.exit(1);
}
