import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {

	// Register the Sidebar Panel
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"g9todoman-sidebar",
			sidebarProvider
		)
	);

	context.subscriptions.push(vscode.commands.registerCommand('g9todoman.addTodo', async () => {
		const todo = await vscode.window.showInputBox({
			prompt: "Enter a new todo"
		});
		if (todo && todo.trim()) {
			// Send message to the sidebar webview to add and persist the todo
			sidebarProvider._view?.webview.postMessage({
				type: "addTodo",
				value: todo.trim()
			});
		}
	}));

	// Always set up a listener for when the webview is resolved
	const setupWebviewListener = (webviewView: vscode.WebviewView) => {
		webviewView.webview.onDidReceiveMessage((message) => {
			switch (message.type) {
				// handle messages from webview if needed
			}
		});
	};
	sidebarProvider.onDidResolveWebviewView(setupWebviewListener);
}

// this method is called when your extension is deactivated
export function deactivate() { }
