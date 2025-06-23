import * as vscode from "vscode";

// Utility function to remove comments, but ignore those inside strings and regex literals
function removeCommentsSmart(text: string): string {
  let result = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateString = false;
  let inRegex = false;
  let inBlockComment = false;
  let inLineComment = false;
  let prevChar = "";
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    // Handle block comments (only if not inside string/template/regex)
    if (
      !inSingleQuote &&
      !inDoubleQuote &&
      !inTemplateString &&
      !inRegex &&
      !inLineComment &&
      !inBlockComment &&
      char === "/" &&
      nextChar === "*"
    ) {
      inBlockComment = true;
      i += 2;
      continue;
    }
    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false;
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    // Handle line comments (only if not inside string/template/regex)
    if (
      !inSingleQuote &&
      !inDoubleQuote &&
      !inTemplateString &&
      !inRegex &&
      !inLineComment &&
      !inBlockComment &&
      char === "/" &&
      nextChar === "/"
    ) {
      inLineComment = true;
      i += 2;
      continue;
    }
    if (inLineComment) {
      if (char === "\n" || char === "\r") {
        inLineComment = false;
        result += char;
      }
      i++;
      continue;
    }

    // Handle string literals
    if (
      !inSingleQuote &&
      !inDoubleQuote &&
      !inTemplateString &&
      !inRegex &&
      char === "'"
    ) {
      inSingleQuote = true;
      result += char;
      i++;
      continue;
    }
    if (inSingleQuote) {
      result += char;
      if (char === "'" && prevChar !== "\\") {
        inSingleQuote = false;
      }
      prevChar = char;
      i++;
      continue;
    }
    if (
      !inSingleQuote &&
      !inDoubleQuote &&
      !inTemplateString &&
      !inRegex &&
      char === '"'
    ) {
      inDoubleQuote = true;
      result += char;
      i++;
      continue;
    }
    if (inDoubleQuote) {
      result += char;
      if (char === '"' && prevChar !== "\\") {
        inDoubleQuote = false;
      }
      prevChar = char;
      i++;
      continue;
    }
    if (
      !inSingleQuote &&
      !inDoubleQuote &&
      !inTemplateString &&
      !inRegex &&
      char === "`"
    ) {
      inTemplateString = true;
      result += char;
      i++;
      continue;
    }
    if (inTemplateString) {
      result += char;
      if (char === "`" && prevChar !== "\\") {
        inTemplateString = false;
      }
      prevChar = char;
      i++;
      continue;
    }

    // Handle regex literals (simple heuristic: after =, (, [, {, :, ,, !, ;, ?, or start of line)
    if (
      !inSingleQuote &&
      !inDoubleQuote &&
      !inTemplateString &&
      !inRegex &&
      char === "/" &&
      (i === 0 || /[\s(=:\[,!;?{]/.test(text[i - 1]))
    ) {
      // Try to find the end of the regex literal
      let j = i + 1;
      let inEscape = false;
      let inCharClass = false;
      while (j < text.length) {
        const c = text[j];
        if (!inEscape && c === "/" && !inCharClass) {
          break;
        }
        if (!inEscape && c === "[") {
          inCharClass = true;
        }
        if (!inEscape && c === "]") {
          inCharClass = false;
        }
        inEscape = !inEscape && c === "\\";
        if (c !== "\\") {
          inEscape = false;
        }
        j++;
      }
      // If found regex end, copy it as-is and skip comment removal inside
      if (j < text.length && text[j] === "/") {
        result += text.slice(i, j + 1);
        i = j + 1;
        // Copy regex flags
        while (i < text.length && /[a-z]/i.test(text[i])) {
          result += text[i];
          i++;
        }
        continue;
      }
    }

    // Default: copy character
    result += char;
    prevChar = char;
    i++;
  }
  return result;
}

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

      // Remove comments, but ignore those inside strings and regex
      let uncommentedText = removeCommentsSmart(fullText);

      // Collapse multiple empty lines to a single empty line
      uncommentedText = uncommentedText.replace(/(\r?\n){2,}/g, "\n\n");

      // Remove leading empty lines
      uncommentedText = uncommentedText.replace(/^(\s*\r?\n)+/, "");

      // If the result is only whitespace, clear it
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
