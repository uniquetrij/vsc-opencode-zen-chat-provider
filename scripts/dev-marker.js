#!/usr/bin/env node
'use strict';

// Toggle a leading "DEBUG: " on the chat provider displayName in package.json.
// Wired into the F5 debug flow (see .vscode/launch.json + tasks.json):
//   - preLaunchTask runs `mark`   -> dev host shows "DEBUG: OpenCode Zen"
//   - postDebugTask runs `unmark` -> working tree returns to canonical name
// The committed manifest stays clean; the "DEBUG: " prefix only exists during a debug session.
//
// Usage: node scripts/dev-marker.js <mark|unmark>

const fs = require('fs');
const path = require('path');

const PREFIX = 'DEBUG: ';
const mode = process.argv[2];

if (mode !== 'mark' && mode !== 'unmark') {
    console.error('Usage: node scripts/dev-marker.js <mark|unmark>');
    process.exit(1);
}

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkgRaw = fs.readFileSync(pkgPath, 'utf8');

const providersBlockRe = /"languageModelChatProviders"\s*:\s*\[[\s\S]*?\]/m;
const providersMatch = providersBlockRe.exec(pkgRaw);
if (!providersMatch) {
    console.error('dev-marker: no languageModelChatProviders in package.json - nothing to do.');
    process.exit(0);
}

let changed = false;
const providersBlock = providersMatch[0];
const nextProvidersBlock = providersBlock.replace(
    /("displayName"\s*:\s*")([^"]*)(")/g,
    (_all, start, currentName, end) => {
        const stripped = currentName.replace(/^DEBUG: /, '');
        const next = mode === 'mark' ? PREFIX + stripped : stripped;
        if (next !== currentName) {
            changed = true;
        }
        return `${start}${next}${end}`;
    }
);

if (changed) {
    const nextRaw =
        pkgRaw.slice(0, providersMatch.index) +
        nextProvidersBlock +
        pkgRaw.slice(providersMatch.index + providersBlock.length);
    fs.writeFileSync(pkgPath, nextRaw, 'utf8');
    console.log(`dev-marker: ${mode} applied.`);
} else {
    console.log(`dev-marker: already ${mode === 'mark' ? 'marked' : 'unmarked'} - no change.`);
}
