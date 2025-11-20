export function escapeXml(value?: string | null): string {
    if (!value) return "";
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function truncate(value: string, max = 6): string {
    if (value.length <= max) return value;
    return value.slice(0, max - 1) + "…";
}
