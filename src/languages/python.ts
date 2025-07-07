import * as vscode from "vscode";
import { normalizeWhitespace } from "../utils/textUtils";

async function replaceEditorText(
editor: vscode.TextEditor,
document: vscode.TextDocument,
newText: string
) {
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length)
  );
  await editor.edit((editBuilder) => editBuilder.replace(fullRange, newText));
}

function removeHashComments(text: string): string {
  const lines = text.split("\n");
  const cleanedLines: string[] = [];

  let inTripleSingle = false;
  let inTripleDouble = false;

  for (const line of lines) {
    let newLine = '';
    let inSingle = false;
    let inDouble = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const next2 = line.slice(i, i + 3);

      // Handle triple quotes
      if (!inSingle && !inDouble) {
        if (next2 === "'''") {
          inTripleSingle = !inTripleSingle;
          newLine += next2;
          i += 3;
          continue;
        }
        if (next2 === `"""`) {
          inTripleDouble = !inTripleDouble;
          newLine += next2;
          i += 3;
          continue;
        }
      }

      if (inTripleSingle || inTripleDouble) {
        newLine += char;
        i++;
        continue;
      }

      // Handle strings
      if (!inDouble && char === "'") {
        inSingle = !inSingle;
        newLine += char;
        i++;
        continue;
      }

      if (!inSingle && char === `"`) {
        inDouble = !inDouble;
        newLine += char;
        i++;
        continue;
      }

      // Handle inline comment
      if (char === "#" && !inSingle && !inDouble && !inTripleSingle && !inTripleDouble) {
        break; // Ignore the rest of the line
      }

      newLine += char;
      i++;
    }

    cleanedLines.push(newLine.trimEnd());
  }

  return cleanedLines.join("\n");
}



function removeDocstrings(text: string): string {
  return text.replace(/("""|''')[\s\S]*?\1/g, "");
}


export async function removePyComments(
  editor: vscode.TextEditor,
  document: vscode.TextDocument
) {
  let processedText = document.getText();

  processedText = removeDocstrings(processedText);

  processedText = removeHashComments(processedText);

  const finalCleanedText = normalizeWhitespace(processedText);

  await replaceEditorText(editor, document, finalCleanedText);
  vscode.window.showInformationMessage(
    "All Python comments and extra empty lines removed."
  );
}