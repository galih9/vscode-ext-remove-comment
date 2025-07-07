import * as assert from 'assert';
import * as vscode from 'vscode';

suite('TypeScript/JavaScript Comment Removal', () => {
	test('Removes single-line and block comments', async () => {
		const input = `
		// Single-line comment
		const x = 1; // Inline comment
		/*
			Block comment
		*/
		const y = 2;
		`;
		const expected = `
const x = 1;

const y = 2;
`;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'typescript' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeTypescriptComments');
		const result = editor.document.getText();
		assert.strictEqual(result.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
	});

	test('Does not remove URLs or comments in strings', async () => {
		const input = `
const url = "https://example.com/path?query=1#anchor"; // This is a comment
const str = "// not a comment";
const another = "http://test.com/#notacomment";
`;
		const expected = `
const url = "https://example.com/path?query=1#anchor";
const str = "// not a comment";
const another = "http://test.com/#notacomment";
`;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'typescript' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeTypescriptComments');
		const result = editor.document.getText();
		assert.strictEqual(result.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
	});

	test('Does not remove regex literals', async () => {
		const input = `
const pattern = /\\/\\/[^\\n]*/g; // Regex to match JS single-line comments
const another = /https?:\\/\\//; // Regex for URL
// Remove this comment
`;
		const expected = `
const pattern = /\\/\\/[^\\n]*/g;
const another = /https?:\\/\\//;
`;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'typescript' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeTypescriptComments');
		const result = editor.document.getText();
		assert.strictEqual(result.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
	});

	test('Handles empty file', async () => {
		const input = ``;
		const expected = ``;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'typescript' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeTypescriptComments');
		const result = editor.document.getText();
		assert.strictEqual(result, expected);
	});

	test('Handles file with only comments', async () => {
		const input = `// comment
/* block
comment */
`;
		const expected = ``;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'typescript' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeTypescriptComments');
		const result = editor.document.getText();
		assert.strictEqual(result.trim(), expected.trim());
	});
});
