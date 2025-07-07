import * as vscode from "vscode";
import { normalizeWhitespace } from "../utils/textUtils";

export async function removeJavaComments(
  editor: vscode.TextEditor,
  document: vscode.TextDocument
) {
  const fullText = document.getText();
  let cleanedText = fullText;

  cleanedText = cleanedText.replace(/\/\*\*[\s\S]*?\*\//g, "");

  cleanedText = cleanedText.replace(/\/\*[\s\S]*?\*\//g, "");

  cleanedText = cleanedText.replace(/(?<!https?:)\/\/.*$/gm, "");

  cleanedText = normalizeWhitespace(cleanedText);

  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(fullText.length)
  );

  await editor.edit((editBuilder) => {
    editBuilder.replace(fullRange, cleanedText);
  });

  vscode.window.showInformationMessage("All Java comments removed.");
}
