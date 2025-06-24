import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "anticomment" is now active!');
  const disposable = vscode.commands.registerCommand(
    "anticomment.helloWorld",
    () => {
      vscode.window.showInformationMessage("ASSALAMUALAIKUM!");
    }
  );

  const secondDisposable = vscode.commands.registerCommand(
    "anticomment.second",
    () => {
      vscode.window.showInformationMessage("SECOND COMMAND EXECUTED!");
    }
  );

  const removeCommentDisposable = vscode.commands.registerCommand(
    "anticomment.removeComment",
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

      // Collapse multiple empty lines (including lines with only spaces/tabs) to a single empty line
      uncommentedText = uncommentedText.replace(
        /((?:[ \t]*\r?\n){2,})/g,
        "\n\n"
      );

      // Remove leading empty lines
      uncommentedText = uncommentedText.replace(/^(\s*\r?\n)+/, "");

      // Split into lines for further processing
      let lines = uncommentedText.split(/\r?\n/);

      // Remove lines that are only whitespace and trim trailing whitespace
      lines = lines
        .map((line) => line.replace(/[ \t]+$/g, "")) // trim trailing whitespace
        .filter((line) => line.trim().length > 0 || line === ""); // keep empty lines, remove whitespace-only

      // Dedent top-level code (not inside any block)
      let dedentedLines: string[] = [];
      let blockLevel = 0;
      for (let line of lines) {
        // Count { and } to track block level
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;

        // If not inside a block, dedent
        if (blockLevel === 0) {
          dedentedLines.push(line.replace(/^[ \t]+/, ""));
        } else {
          dedentedLines.push(line);
        }

        blockLevel += openBraces - closeBraces;
        if (blockLevel < 0) {
          blockLevel = 0;
        } // safety
      }

      uncommentedText = dedentedLines.join("\n");

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
