import * as vscode from "vscode";
import { normalizeWhitespace } from "../utils/textUtils";

/**
 * Removes JS/TS comments in <script> and HTML comments in <template>.
 */
export async function removeVueComments(editor: vscode.TextEditor, document: vscode.TextDocument) {
  const fullText = document.getText();
  let cleanedText = fullText;

  // Remove JS/TS comments from <script> block(s)
  cleanedText = cleanedText.replace(/<script[^>]*>([\s\S]*?)<\/script>/g, (match, scriptContent) => {
    let uncommented = scriptContent
      .replace(/\/\*[\s\S]*?\*\//g, "")      // Block comments
      .replace(/(^|\s)\/\/.*$/gm, "");       // Line comments

    uncommented = normalizeWhitespace(uncommented);
    return match.replace(scriptContent, `\n${uncommented}\n`);
  });

  // Remove HTML comments from <template> block(s)
  cleanedText = cleanedText.replace(/<template[^>]*>([\s\S]*?)<\/template>/g, (match, templateContent) => {
    let uncommented = templateContent.replace(/<!--[\s\S]*?-->/g, ""); // HTML comments
    uncommented = normalizeWhitespace(uncommented);
    return match.replace(templateContent, `\n${uncommented}\n`);
  });

  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(fullText.length)
  );

  await editor.edit(editBuilder => {
    editBuilder.replace(fullRange, cleanedText);
  });

  vscode.window.showInformationMessage("All Vue <script> and <template> comments removed.");
}
