# OpenCode Zen – VS Code Chat Model Provider

> **Disclaimer:** This project is a community project and is not maintained by the OpenCode team (https://opencode.ai/) and has no ties to the OpenCode team.


This extension provides **OpenCode Zen** models to VS Code via the **Language Model Chat Provider** API (vendor id: `opencode-zen`).

## Prerequisites

- VS Code `^1.104`
- Node.js (recent LTS recommended)
- An OpenCode API key (`OPENCODE_API_KEY`)

## Install

```bash
npm install
```

## Build

```bash
npm run compile
```

## Watch

```bash
npm run watch
```

## Create Extension Package
```bash
vsce package
```

## Run (Extension Development Host)

1. Open this folder in VS Code
2. Press `F5` (Run → Start Debugging)
3. In the Extension Development Host, open Chat and enable the **OpenCode Zen** provider in the model picker.

### Side-by-Side Debug With Installed Extension

The debug host is configured to run as a separate dev flavor so it does not replace the installed extension:

- Pre-launch task (`Dev Marker: Mark`) temporarily switches identity and namespaces to `-dev` variants.
- Post-debug task (`Dev Marker: Unmark`) restores the canonical manifest values.

During debug sessions, the extension uses distinct IDs/namespaces for:

- extension identity (`name`/`publisher`)
- chat provider vendor
- command IDs
- configuration keys

This allows installed and debug providers to coexist without registration conflicts.

## Commands

Open the command palette (`Ctrl/Cmd+Shift+P`):

- `OpenCode Zen: Set API Key` (`opencodeZen.setApiKey`)
  - Stores the key in **SecretStorage** (not in settings).
- `OpenCode Zen: Clear API Key` (`opencodeZen.clearApiKey`)
- `OpenCode Zen: Refresh Model List` (`opencodeZen.refreshModels`)
  - Refetches models from `https://models.dev/api.json` (filtered to provider `opencode`).
- `OpenCode Zen: Self Test` (`opencodeZen.selfTest`)
  - Prompts for a model, then runs a small tool-calling roundtrip.
  - Output is written to the **OpenCode Zen** Output Channel.

## Notes

- Tool calling is supported by streaming `LanguageModelToolCallPart` from the provider.
- Tool execution is handled by the caller (VS Code) by sending back `LanguageModelToolResultPart` on the next request.
- If no API key is configured, requests use `apiKey: public` and only free OpenCode Zen models are shown (matching opencode behavior).
