import * as vscode from "vscode";
import { removeTsComments } from "./typescript";
import { removePyComments } from "./python";
import { removeVueComments } from "./vue";
import { removeSvelteComments } from "./svelte";
export type SupportedLanguage = "typescript" | "python" | "vue" | "other" | "svelte";

export function getFileType(document: vscode.TextDocument): SupportedLanguage {
  const fileName = document.fileName.toLowerCase();

  // Handle unsaved files by checking the language mode
  if (fileName.includes("untitled")) {
    return getLanguageFromMode(document.languageId);
  }

  if (/\.(ts|tsx|js|jsx)$/.test(fileName)) return "typescript";
  if (fileName.endsWith(".py")) return "python";
  if (fileName.endsWith(".vue")) return "vue";

  return "other";
}

function getLanguageFromMode(languageId: string): SupportedLanguage {
  switch (languageId) {
    case "javascript":
    case "typescript":
    case "javascriptreact":
    case "typescriptreact":
      return "typescript";
    case "python":
      return "python";
    case "vue":
      return "vue";
    case "svelte":
      return "svelte";
    default:
      return "other";
  }
}

export const removeComments: Record<
  SupportedLanguage,
  | ((editor: vscode.TextEditor, doc: vscode.TextDocument) => Promise<void>)
  | undefined
> = {
  typescript: removeTsComments,
  python: removePyComments,
  vue: removeVueComments,
  svelte: removeSvelteComments,
  other: async (_, document) => {
    const extension = document.fileName.split(".").pop();
    vscode.window.showWarningMessage(
      `The file type ".${extension}" is not yet supported by Anticomment.`
    );
  },
};
