import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Listen for messages from the Sidebar component and execute action
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        // case "onSomething: {
        //     // code here...
        //     break;
        // }
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this._extensionUri.fsPath, "media", "reset.css")
      )
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this._extensionUri.fsPath, "media", "vscode.css")
      )
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this._extensionUri.fsPath, "out/compiled/sidebar.js")
      )
    );
    const styleMainUri = ""; // Update if you add a main CSS file

    const nonce = getNonce();

    // Read the HTML template file
    const htmlPath = path.join(
      this._extensionUri.fsPath,
      "media",
      "sidebar.html"
    );
    let html = fs.readFileSync(htmlPath, "utf8");

    // Replace placeholders in the HTML template
    html = html
      .replace(/\${styleResetUri}/g, styleResetUri.toString())
      .replace(/\${styleVSCodeUri}/g, styleVSCodeUri.toString())
      .replace(/\${styleMainUri}/g, styleMainUri)
      .replace(/\${scriptUri}/g, scriptUri.toString())
      .replace(/\${nonce}/g, nonce)
      .replace(/\${cspSource}/g, webview.cspSource);

    return html;
  }
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