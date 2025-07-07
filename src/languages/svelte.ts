import * as vscode from "vscode";
import { normalizeWhitespace } from "../utils/textUtils";

export async function removeSvelteComments(editor: vscode.TextEditor, document: vscode.TextDocument) {
  const fullText = document.getText();
  let cleanedText = fullText;

  cleanedText = cleanedText.replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (match, scriptAttrs, scriptContent) => {
    let uncommentedScript = scriptContent
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\s)\/\/.*$/gm, "");

    uncommentedScript = normalizeWhitespace(uncommentedScript);
    return `<script${scriptAttrs}>\n${uncommentedScript}\n</script>`;
  });

  cleanedText = cleanedText.replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (match, styleAttrs, styleContent) => {
    let uncommentedStyle = styleContent
      .replace(/\/\*[\s\S]*?\*\//g, "");

    uncommentedStyle = normalizeWhitespace(uncommentedStyle);
    return `<style${styleAttrs}>\n${uncommentedStyle}\n</style>`;
  });

  cleanedText = normalizeWhitespace(cleanedText);

  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(fullText.length)
  );

  await editor.edit(editBuilder => {
    editBuilder.replace(fullRange, cleanedText);
  });

  vscode.window.showInformationMessage("All Svelte comments removed.");
}