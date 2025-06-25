import * as vscode from "vscode";
import { getFileType, removeComments } from "./languages";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "anticomment" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand("anticomment.removeComment", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("No active editor found.");
        return;
      }

      const document = editor.document;
      const fileType = getFileType(document);
      const remove = removeComments[fileType];

      if (remove) {
        await remove(editor, document);
      } else {
        vscode.window.showWarningMessage(`Unsupported file type for comment removal: "${document.fileName}"`);
      }
    })
  );
}

export function deactivate() {}
