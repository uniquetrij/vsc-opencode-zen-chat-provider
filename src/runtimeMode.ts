import * as fs from 'fs';
import * as path from 'path';

const DEBUG_MARKER_PROPERTY = 'x-dev-marker-debug';

export const BASE_VENDOR_ID = 'opencode-zen';
export const DEBUG_VENDOR_ID = 'opencode-zen-dev';
export const BASE_COMMAND_NAMESPACE = 'opencodeZen';
export const DEBUG_COMMAND_NAMESPACE = 'opencodeZenDev';
export const BASE_CONFIGURATION_NAMESPACE = 'opencodeZen';
export const DEBUG_CONFIGURATION_NAMESPACE = 'opencodeZenDev';

export function isDebugModeFromDisk(): boolean {
    try {
        const packageJsonPath = path.join(__dirname, '..', 'package.json');
        const raw = fs.readFileSync(packageJsonPath, 'utf8');
        return Boolean(JSON.parse(raw)[DEBUG_MARKER_PROPERTY]);
    } catch {
        return false;
    }
}

export function getRuntimeVendorId(): string {
    return isDebugModeFromDisk() ? DEBUG_VENDOR_ID : BASE_VENDOR_ID;
}

export function getRuntimeCommandNamespace(): string {
    return isDebugModeFromDisk() ? DEBUG_COMMAND_NAMESPACE : BASE_COMMAND_NAMESPACE;
}

export function getRuntimeConfigurationNamespace(): string {
    return isDebugModeFromDisk() ? DEBUG_CONFIGURATION_NAMESPACE : BASE_CONFIGURATION_NAMESPACE;
}
