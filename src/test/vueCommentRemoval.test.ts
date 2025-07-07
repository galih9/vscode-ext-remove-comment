import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Vue Comment Removal', () => {
	test('Removes JS/TS and HTML comments in <script> and <template>', async () => {
		const input = `
<template>
  <!-- This is an HTML comment -->
  <div>Hello<!-- inline comment --> world</div>
</template>

<script>
// Single-line comment
const x = 1; // Inline comment
/*
  Block comment
*/
const y = 2;
</script>
`;
		const expected = `
<template>
  <div>Hello world</div>

</template>

<script>
const x = 1;

const y = 2;

</script>
`;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'vue' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeVueComments');
		const result = editor.document.getText();
		assert.strictEqual(result.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
	});

	test('Does not remove content outside <script> or <template>', async () => {
		const input = `
<style>
/* This is a CSS comment */
body { color: red; }
</style>
<template>
  <!-- HTML comment -->
  <span>Text</span>
</template>
<script>
// JS comment
let a = 1;
</script>
`;
		const expected = `
<style>
/* This is a CSS comment */
body { color: red; }
</style>
<template>
  <span>Text</span>

</template>
<script>
let a = 1;

</script>
`;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'vue' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeVueComments');
		const result = editor.document.getText();
		assert.strictEqual(result.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
	});

	test('Handles empty file', async () => {
		const input = ``;
		const expected = ``;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'vue' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeVueComments');
		const result = editor.document.getText();
		assert.strictEqual(result, expected);
	});

	test('Handles file with only comments', async () => {
		const input = `
<template>
  <!-- only comment -->
</template>
<script>
  // only comment
</script>
`;
		const expected = `
<template>

</template>
<script>

</script>
`;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'vue' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeVueComments');
		const result = editor.document.getText();
		assert.strictEqual(result.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
	});

	test('Does not remove comments in strings in <script>', async () => {
		const input = `
<script>
const str = "// not a comment";
const html = "<!-- not a comment -->";
</script>
`;
		const expected = `
<script>
const str = "// not a comment";
const html = "<!-- not a comment -->";

</script>
`;
		const doc = await vscode.workspace.openTextDocument({ content: input, language: 'vue' });
		const editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('anticomment.removeVueComments');
		const result = editor.document.getText();
		assert.strictEqual(result.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
	});
});
