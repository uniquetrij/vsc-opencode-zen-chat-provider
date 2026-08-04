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
const DEV_SUFFIX = '-dev';
const BASE_NAMESPACE = 'opencodeZen';
const DEV_NAMESPACE = 'opencodeZenDev';
const mode = process.argv[2];

if (mode !== 'mark' && mode !== 'unmark') {
    console.error('Usage: node scripts/dev-marker.js <mark|unmark>');
    process.exit(1);
}

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function toDev(value) {
    return typeof value === 'string' && !value.endsWith(DEV_SUFFIX) ? `${value}${DEV_SUFFIX}` : value;
}

function toBase(value) {
    return typeof value === 'string' && value.endsWith(DEV_SUFFIX)
        ? value.slice(0, -DEV_SUFFIX.length)
        : value;
}

function switchNamespace(value) {
    if (typeof value !== 'string') {
        return value;
    }

    if (mode === 'mark') {
        return value.startsWith(`${BASE_NAMESPACE}.`)
            ? `${DEV_NAMESPACE}.${value.slice(BASE_NAMESPACE.length + 1)}`
            : value;
    }

    return value.startsWith(`${DEV_NAMESPACE}.`)
        ? `${BASE_NAMESPACE}.${value.slice(DEV_NAMESPACE.length + 1)}`
        : value;
}

const providers = pkg.contributes && pkg.contributes.languageModelChatProviders;
if (!Array.isArray(providers) || providers.length === 0) {
    console.error('dev-marker: no languageModelChatProviders in package.json — nothing to do.');
    process.exit(0);
}

let changed = false;
for (const provider of providers) {
    if (typeof provider.vendor === 'string') {
        const nextVendor = mode === 'mark' ? toDev(provider.vendor) : toBase(provider.vendor);
        if (nextVendor !== provider.vendor) {
            provider.vendor = nextVendor;
            changed = true;
        }
    }

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

if (typeof pkg.name === 'string') {
    const nextName = mode === 'mark' ? toDev(pkg.name) : toBase(pkg.name);
    if (nextName !== pkg.name) {
        pkg.name = nextName;
        changed = true;
    }
}

if (typeof pkg.publisher === 'string') {
    const nextPublisher = mode === 'mark' ? toDev(pkg.publisher) : toBase(pkg.publisher);
    if (nextPublisher !== pkg.publisher) {
        pkg.publisher = nextPublisher;
        changed = true;
    }
}

if (Array.isArray(pkg.activationEvents)) {
    pkg.activationEvents = pkg.activationEvents.map((eventName) => {
        if (typeof eventName !== 'string') {
            return eventName;
        }
        if (!eventName.startsWith('onCommand:')) {
            return eventName;
        }
        const commandId = eventName.slice('onCommand:'.length);
        const nextCommandId = switchNamespace(commandId);
        if (nextCommandId !== commandId) {
            changed = true;
        }
        return `onCommand:${nextCommandId}`;
    });
}

const commands = pkg.contributes && pkg.contributes.commands;
if (Array.isArray(commands)) {
    for (const command of commands) {
        if (!command || typeof command.command !== 'string') {
            continue;
        }
        const nextCommand = switchNamespace(command.command);
        if (nextCommand !== command.command) {
            command.command = nextCommand;
            changed = true;
        }
    }
}

const properties = pkg.contributes && pkg.contributes.configuration && pkg.contributes.configuration.properties;
if (properties && typeof properties === 'object' && !Array.isArray(properties)) {
    const nextProperties = {};
    for (const [key, value] of Object.entries(properties)) {
        const nextKey = switchNamespace(key);
        nextProperties[nextKey] = value;
        if (nextKey !== key) {
            changed = true;
        }
    }
    pkg.contributes.configuration.properties = nextProperties;
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
