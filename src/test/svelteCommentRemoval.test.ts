// test case for svelte comment removal

import * as vscode from "vscode";
import * as assert from "assert";

suite("Svelte Comment Removal Tests", () => {
  test("Removes Svelte comments from script and style tags", async () => {
    const input = `
<script>
  // This is a comment
  let x = 1; /* This is a block comment */
</script>
<style>
  /* This is a style comment */
  .class {
    color: red; /* Another comment */
  }
</style>
<div>
  <!-- This is an HTML comment -->
  <p>Hello World</p>
</div>
`;
    const expected = `<script>
  let x = 1;
</script>
<style>
  .class {
    color: red;
  }
</style>
<div>
  <p>Hello World</p>
</div>
`;
    const doc = await vscode.workspace.openTextDocument({
      content: input,
      language: "svelte",
    });
    const editor = await vscode.window.showTextDocument(doc);
    await vscode.commands.executeCommand("anticomment.removeSvelteComments");
    const result = editor.document.getText();
    assert.strictEqual(
      result.replace(/\r\n/g, "\n").trim(),
      expected.replace(/\r\n/g, "\n").trim()
    );
  });

  test("Does not remove comments in strings", async () => {
    const input = `
<script>
  let x = "This is not a comment"; // This is a comment
</script>
<style>
    .class {
        color: "This is not a style comment"; /* This is a style comment */
    }
</style>
<div>
  <p>This is not an HTML comment</p>
</div>
`;
    const expected = `<script>
  let x = "This is not a comment"; // This is a comment
</script>
<style>
    .class {
        color: "This is not a style comment"; /* This is a style comment */
    }
</style>
<div>
  <p>This is not an HTML comment</p>
</div>
`;

    const doc = await vscode.workspace.openTextDocument({
      content: input,
      language: "svelte",
    });

    const editor = await vscode.window.showTextDocument(doc);
    await vscode.commands.executeCommand("anticomment.removeSvelteComments");
    const result = editor.document.getText();
    assert.strictEqual(
      result.replace(/\r\n/g, "\n").trim(),
      expected.replace(/\r\n/g, "\n").trim()
    );
  });
});
