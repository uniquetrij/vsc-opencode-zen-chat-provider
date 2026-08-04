#!/usr/bin/env node
'use strict';

// Toggle a leading "⚠ " on the chat provider displayName in package.json.
// Wired into the F5 debug flow (see .vscode/launch.json + tasks.json):
//   - preLaunchTask runs `mark`   → dev host shows "⚠ OpenCode Zen"
//   - postDebugTask runs `unmark` → working tree returns to canonical name
// The committed manifest stays clean; the "⚠ " prefix only exists during a debug session.
//
// Usage: node scripts/dev-marker.js <mark|unmark>

const fs = require('fs');
const path = require('path');

const DEBUG_MARKER_PROPERTY = 'x-dev-marker-debug';
const mode = process.argv[2];

if (mode !== 'mark' && mode !== 'unmark') {
    console.error('Usage: node scripts/dev-marker.js <mark|unmark>');
    process.exit(1);
}

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const providers = pkg.contributes && pkg.contributes.languageModelChatProviders;
if (!Array.isArray(providers) || providers.length === 0) {
    console.error('dev-marker: no languageModelChatProviders in package.json — nothing to do.');
    process.exit(0);
}

let changed = false;
for (const provider of providers) {
    if (typeof provider.displayName !== 'string') {
        continue;
    }
    // Strip any existing prefix first so repeated calls are idempotent.
    const stripped = provider.displayName.replace(/^⚠ /, '');
    const next = mode === 'mark' ? '⚠ ' + stripped : stripped;
    if (next !== provider.displayName) {
        provider.displayName = next;
        changed = true;
    }
}

if (mode === 'mark') {
    pkg[DEBUG_MARKER_PROPERTY] = true;
} else {
    delete pkg[DEBUG_MARKER_PROPERTY];
}

if (changed || mode === 'mark' || mode === 'unmark') {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`dev-marker: ${mode} applied.`);
} else {
    console.log(`dev-marker: already ${mode === 'mark' ? 'marked' : 'unmarked'} — no change.`);
}
