import * as vscode from "vscode";
import { normalizeWhitespace } from "../utils/textUtils";

export async function removePyComments(editor: vscode.TextEditor, document: vscode.TextDocument) {
  const fullText = document.getText();

  let text = fullText
    .replace(/("""|''')[\s\S]*?\1/g, "") // Triple-quoted strings
    .replace(/^\s*#.*$/gm, "");         // Line comments

  const cleaned = normalizeWhitespace(text);

  await replaceEditorText(editor, document, cleaned);
  vscode.window.showInformationMessage("All Python comments and extra empty lines removed.");
}

async function replaceEditorText(editor: vscode.TextEditor, document: vscode.TextDocument, text: string) {
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length)
  );
  await editor.edit(editBuilder => editBuilder.replace(fullRange, text.trim()));
}
