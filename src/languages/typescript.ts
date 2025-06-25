import * as vscode from "vscode";
import { normalizeWhitespace } from "../utils/textUtils";

export async function removeTsComments(editor: vscode.TextEditor, document: vscode.TextDocument) {
  const fullText = document.getText();

  let text = fullText
    .replace(/\/\*[\s\S]*?\*\//g, "")         // Block comments
    .replace(/(^|\s)\/\/.*$/gm, "");           // Line comments

  const dedented = dedentTopLevel(normalizeWhitespace(text));

  await replaceEditorText(editor, document, dedented);
  vscode.window.showInformationMessage("All TypeScript/JS comments and extra empty lines removed.");
}

function dedentTopLevel(text: string): string {
  const lines = text.split(/\r?\n/);
  let blockLevel = 0;
  const dedented = lines.map(line => {
    const open = (line.match(/{/g) || []).length;
    const close = (line.match(/}/g) || []).length;

    const clean = blockLevel === 0 ? line.replace(/^[ \t]+/, "") : line;
    blockLevel += open - close;
    if (blockLevel < 0) blockLevel = 0;
    return clean;
  });
  return dedented.join("\n").trim();
}

async function replaceEditorText(editor: vscode.TextEditor, document: vscode.TextDocument, text: string) {
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length)
  );
  await editor.edit(editBuilder => editBuilder.replace(fullRange, text));
}
