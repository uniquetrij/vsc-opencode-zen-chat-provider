# OpenCode Zen – VS Code Chat Model Provider

> **Disclaimer:** This project is a community project and is not maintained by the OpenCode team (https://opencode.ai/) and has no ties to the OpenCode team.

This extension provides **OpenCode Zen** models to VS Code via the **Language Model Chat Provider** API (vendor id: `opencode-zen`). It supports multiple upstream providers (Anthropic, OpenAI, Google, and OpenAI-compatible) through the [models.dev](https://models.dev) registry, with streaming, tool calling, thinking/reasoning, and prompt caching.

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
./scripts/package/build-vsix.sh
```

Or directly via `vsce package`.

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

## Configuration

All settings are under `opencodeZen.*` in VS Code Settings (`Ctrl/Cmd+Shift+P` → "Preferences: Open User Settings (JSON)").

### Model Cache

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `opencodeZen.modelCacheTtlMinutes` | `number` | `60` | How long to cache models.dev model metadata before refetching. Set to `0` to disable caching. |

### Prompt Caching

Prompt caching reduces token usage by preserving prefix cache state across requests. Supported for Anthropic, OpenAI, and OpenAI-compatible providers.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `opencodeZen.promptCaching.enabled` | `boolean` | `true` | Enable prompt caching hints for supported providers. |
| `opencodeZen.promptCaching.retention` | `string` | `"in_memory"` | Retention policy for OpenAI prompt caching. `"24h"` requires a compatible OpenAI model. |
| `opencodeZen.promptCaching.cacheKeyScope` | `string` | `"workspace"` | Scope for the prompt cache key (`"workspace"`, `"global"`, or `"none"`). |
| `opencodeZen.promptCaching.anthropicTtl` | `string` | `"5m"` | Anthropic `cache_control` TTL for cached message blocks. `"none"` omits the TTL. |

## Features

- **Multi-provider support** — Routes requests to the appropriate AI SDK (`@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/openai-compatible`) based on model metadata from models.dev.
- **Streaming** — Full streaming support for chat completions.
- **Tool calling** — Tools defined by VS Code are converted to AI SDK tool schemas. The provider emits `LanguageModelToolCallPart` and VS Code handles execution via `LanguageModelToolResultPart`.
- **Thinking / reasoning** — Supports the `languageModelThinkingPart` proposed API for models that expose chain-of-thought reasoning.
- **Prompt caching** — Configurable prompt cache hints (Anthropic, OpenAI, OpenAI-compatible) to reduce token usage across turns.
- **Context truncation** — Automatically truncates older messages to 85% of the model's `maxInputTokens` to stay within context limits.
- **Graceful degradation** — If no API key is configured, requests use `apiKey: public` and only free models are shown. If the model registry fails to load, the extension returns an empty model list instead of crashing.
- **Self-test** — Built-in command that runs a tool-calling roundtrip against any available model, with output in the OpenCode Zen Output Channel.
