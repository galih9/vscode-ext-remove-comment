export function normalizeWhitespace(text: string): string {
  return text
    .replace(/((?:[ \t]*\r?\n){2,})/g, "\n\n")  // Collapse empty lines
    .replace(/^(\s*\r?\n)+/, "")                // Remove leading empty lines
    .split(/\r?\n/)
    .map(line => line.replace(/[ \t]+$/g, ""))  // Trim trailing spaces
    .filter(line => line.trim().length > 0 || line === "") // Remove whitespace-only lines
    .join("\n");
}
