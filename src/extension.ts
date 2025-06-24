import * as vscode from "vscode";

function getFileType(document: vscode.TextDocument): "typescript" | "python" | "other" {
  const fileName = document.fileName.toLowerCase();
  if (fileName.endsWith(".ts") || fileName.endsWith(".tsx") || fileName.endsWith(".js") || fileName.endsWith(".jsx")) {
    return "typescript";
  }
  if (fileName.endsWith(".py")) {
    return "python";
  }
  return "other";
}

async function removeCommentTs(editor: vscode.TextEditor, document: vscode.TextDocument) {
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
    "All TypeScript/JS comments and extra empty lines removed."
  );
}

async function removeCommentPy(editor: vscode.TextEditor, document: vscode.TextDocument) {
  const fullText = document.getText();

  // Remove triple-quoted strings (docstrings and multiline comments)
  let uncommentedText = fullText.replace(/("""|''')[\s\S]*?\1/g, "");

  // Remove single-line comments
  uncommentedText = uncommentedText.replace(/^\s*#.*$/gm, "");

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

  uncommentedText = lines.join("\n");

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
    "All Python comments and extra empty lines removed."
  );
}

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
      const fileType = getFileType(document);

      if (fileType === "typescript") {
        await removeCommentTs(editor, document);
      } else if (fileType === "python") {
        await removeCommentPy(editor, document);
      } else {
        vscode.window.showWarningMessage("Unsupported file type for comment removal.");
      }
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(secondDisposable);
  context.subscriptions.push(removeCommentDisposable);
}

export function deactivate() {}
