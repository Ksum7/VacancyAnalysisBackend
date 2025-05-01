export function parseBoolean(str?: string): boolean {
    const truthyValues = new Set(['true', '1', 'yes', 'y']);
    return truthyValues.has(str?.toLowerCase() ?? '');
}
