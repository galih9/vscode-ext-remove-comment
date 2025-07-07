import * as vscode from "vscode";
import { getFileType, removeComments } from "./languages";
import { removeTsComments } from "./languages/typescript";
import { removePyComments } from "./languages/python";
import { removeVueComments } from "./languages/vue";
import { removeSvelteComments } from "./languages/svelte";

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
        vscode.window.showWarningMessage(
          `Unsupported file type for comment removal: "${document.fileName}"`
        );
      }
    })
  );
  // --- New Specific Language Commands ---

  // Command for TypeScript/JavaScript Comments
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "anticomment.removeTypescriptComments",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("No active editor found.");
          return;
        }
        await removeTsComments(editor, editor.document);
      }
    )
  );

  // Command for Python Comments
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "anticomment.removePythonComments",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("No active editor found.");
          return;
        }
        await removePyComments(editor, editor.document);
      }
    )
  );

  // Command for Vue.js Comments
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "anticomment.removeVueComments",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("No active editor found.");
          return;
        }
        await removeVueComments(editor, editor.document);
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "anticomment.removeSvelteComments",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("No active editor found.");
          return;
        }
        await removeSvelteComments(editor, editor.document);
      }
    )
  );
}

export function deactivate() {}
