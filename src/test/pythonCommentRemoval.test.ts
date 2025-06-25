import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Python Comment Removal', () => {
	test('Removes single-line comments and docstrings', async () => {
		const input = `
# This is a comment

x = 1  # Inline comment

"""
This is a docstring
that should be removed
"""

y = 2

'''
Another docstring
'''

z = 3

    # Another comment

`;
		const expected = `
x = 1

y = 2

z = 3
`;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'python' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeComment');
		const result = editor.document.getText();
		assert.strictEqual(result.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
	});

	test('Does not remove comments in strings', async () => {
		const input = `
x = "# not a comment"
y = '""" not a docstring """'
z = 1 # real comment
`;
		const expected = `
x = "# not a comment"
y = '""" not a docstring """'
z = 1
`;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'python' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeComment');
		const result = editor.document.getText();
		assert.strictEqual(result.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
	});

	test('Handles empty file', async () => {
		const input = ``;
		const expected = ``;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'python' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeComment');
		const result = editor.document.getText();
		assert.strictEqual(result, expected);
	});

	test('Handles file with only comments', async () => {
		const input = `# comment
"""
docstring
"""
`;
		const expected = ``;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'python' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeComment');
		const result = editor.document.getText();
		assert.strictEqual(result.trim(), expected.trim());
	});
});
