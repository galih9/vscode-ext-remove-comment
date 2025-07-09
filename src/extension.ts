import * as vscode from "vscode";
import * as fs from "fs";

let currentPanel: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand(
    "vswv-json.displayJson",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;

        if (document.languageId === "json") {
          const text = document.getText();
          try {
            const jsonData = JSON.parse(text);

            if (currentPanel) {
              currentPanel.reveal(vscode.ViewColumn.Beside);
              currentPanel.webview.postMessage({
                command: "updateJsonData",
                data: jsonData,
              });
              currentPanel.title = `JSON Viewer: ${vscode.workspace.asRelativePath(
                document.uri
              )}`;
            } else {

              currentPanel = vscode.window.createWebviewPanel(
                "jsonViewer",
                "JSON Viewer",
                vscode.ViewColumn.Beside,
                {
                  enableScripts: true,
                  retainContextWhenHidden: true,

                  localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, "media"),
                  ],
                }
              );

              const htmlPath = vscode.Uri.joinPath(
                context.extensionUri,
                "media",
                "jsonViewer.html"
              );
              let htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");

              const styleUri = currentPanel.webview.asWebviewUri(
                vscode.Uri.joinPath(
                  context.extensionUri,
                  "media",
                  "jsonViewer.css"
                )
              );
              const scriptUri = currentPanel.webview.asWebviewUri(
                vscode.Uri.joinPath(
                  context.extensionUri,
                  "media",
                  "jsonViewer.js"
                )
              );

              const nonce = getNonce();

              htmlContent = htmlContent
                .replace(/%CSP_SOURCE%/g, currentPanel.webview.cspSource)
                .replace(/%NONCE%/g, nonce)
                .replace(/%STYLE_URI%/g, styleUri.toString())
                .replace(/%SCRIPT_URI%/g, scriptUri.toString());

              currentPanel.webview.html = htmlContent;
              currentPanel.title = `JSON Viewer: ${vscode.workspace.asRelativePath(
                document.uri
              )}`;

              currentPanel.webview.postMessage({
                command: "updateJsonData",
                data: jsonData,
              });

              currentPanel.onDidDispose(
                () => {
                  currentPanel = undefined;
                },
                null,
                context.subscriptions
              );

              currentPanel.webview.onDidReceiveMessage(
                (message) => {
                  console.log(`Message from webview: ${message.command}`);

                },
                undefined,
                context.subscriptions
              );
            }
          } catch (e: any) {
            vscode.window.showErrorMessage(`Invalid JSON: ${e.message}`);
          }
        } else {
          vscode.window.showWarningMessage(
            "This command is intended for JSON files."
          );
        }
      } else {
        vscode.window.showWarningMessage("No active text editor found.");
      }
    }
  );

  context.subscriptions.push(disposable);
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function deactivate() {}