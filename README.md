# JSON Visualizer

A powerful and intuitive VS Code extension for viewing JSON data in an interactive, collapsible tree format. Highly inspired by markdown preview extension in vscode.

## Features

* **Interactive Tree View**: Easily navigate complex JSON structures with a clear, hierarchical tree representation. Nodes can be expanded or collapsed with a simple click.

* **VS Code Theme Integration**: Seamlessly adapts to your active VS Code theme, providing a consistent and aesthetically pleasing experience whether you're using a light, dark, or high-contrast theme.

* **Customizable Root Node**: The top-level JSON object or array is clearly labeled as "JSON" for quick identification.

* **Rich Data Type Indicators**: Visual cues (small colored squares) provide immediate recognition of data types, making it easy to distinguish between strings, numbers, booleans, objects, arrays, and null values.

* **Concise Object/Array Summaries**: When collapsed, object nodes display `{}` and array nodes display `[]`, along with a meta-information showing the number of items or properties they contain (e.g., "3 items").

* **Global Expand/Collapse Controls**:
    * **`Expand All` Button**: Instantly expands every node in the entire JSON tree, providing a full overview of your data.
    * **`Collapse All` Button**: Quickly collapses all expandable nodes back to their summarized state, perfect for decluttering large JSON files.

* **Smart Copy Functionality (Object & Array Specific)**:
    * **Contextual Copy Buttons**: A dedicated "Copy" button appears **only** next to object and array nodes, allowing you to copy specific sub-sections of your JSON.
    * **Toggleable Visibility**: A global `Show/Hide Copy Buttons` control allows you to display or hide all individual copy buttons, keeping your tree view clean when not needed.
    * **Formatted Copy**: Clicking a copy button copies the entire JSON content of that specific object or array (formatted with a 2-space indent) directly to your clipboard.
    * **Visual Feedback**: Get instant confirmation with a temporary visual highlight and an icon change when content is successfully copied to your clipboard.

## How to Use

1.  **Open a JSON File**: Simply open any `.json` file in Visual Studio Code.
2.  **Viewer Activation**: Click the curly braces logo on the editor action panel. And then the view for your json will be rendered on the right side of the opened tab.
3.  **Navigate & Control**:
    * Click on the `+` or `-` icons next to individual nodes to expand or collapse them.
    * Use the `Expand All` and `Collapse All` buttons at the top of the viewer for global control.
    * Toggle the `Show/Hide Copy Buttons` to reveal or conceal the individual copy buttons.
    * Click the individual copy buttons (next to objects/arrays) to copy their content.

---