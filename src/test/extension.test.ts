import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Remove comments and clean empty lines', async () => {
		const input = `
		// This is a single-line comment

		const x = 1;   // Inline comment

		/*
			This is a
			multi-line comment
		*/

		const y = 2;

		    
		// Another comment

		const z = 3;
		`;

		const expected = `
const x = 1;

const y = 2;

const z = 3;
`;

		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'typescript' });
		const editor = await vscode.window.showTextDocument(doc);

		await vscode.commands.executeCommand('anticomment.removeComment');

		const result = doc.getText();

		// Normalize line endings and trim for comparison
		assert.strictEqual(result.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
	});
});
