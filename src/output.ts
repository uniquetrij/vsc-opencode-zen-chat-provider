import * as vscode from 'vscode';
import { isDebugModeFromDisk } from './runtimeMode';

let outputChannel: vscode.LogOutputChannel | undefined;

export function getOutputChannel(): vscode.LogOutputChannel {
	if (!outputChannel) {
		const debugPrefix = isDebugModeFromDisk() ? '🔧 ' : '';
		outputChannel = vscode.window.createOutputChannel(`${debugPrefix}OpenCode Provider`, { log: true });
	}
	return outputChannel;
}
