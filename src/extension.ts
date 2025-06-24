import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "nocomment" is now active!');
  const disposable = vscode.commands.registerCommand(
    "nocomment.helloWorld",
    () => {
      vscode.window.showInformationMessage("ASSALAMUALAIKUM!");
    }
  );

  const secondDisposable = vscode.commands.registerCommand(
    "nocomment.second",
    () => {
      vscode.window.showInformationMessage("SECOND COMMAND EXECUTED!");
    }
  );

  const removeCommentDisposable = vscode.commands.registerCommand(
    "nocomment.removeComment",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("No active editor found.");
        return;
      }

      const document = editor.document;
      const fullText = document.getText();

      let uncommentedText = fullText
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|\s)\/\/.*$/gm, "");

      uncommentedText = uncommentedText.replace(
        /((?:[ \t]*\r?\n){2,})/g,
        "\n\n"
      );

      uncommentedText = uncommentedText.replace(/^(\s*\r?\n)+/, "");

      if (/^\s*$/.test(uncommentedText)) {
        uncommentedText = "";
      }

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length)
      );

      await editor.edit((editBuilder) => {
        editBuilder.replace(fullRange, uncommentedText);
      });
      vscode.window.showInformationMessage(
        "All comments and extra empty lines removed."
      );
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(secondDisposable);
  context.subscriptions.push(removeCommentDisposable);
}

export function deactivate() {}
