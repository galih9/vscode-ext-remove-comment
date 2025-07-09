// media/jsonViewer.js

const vscode = acquireVsCodeApi();

// Global state to track visibility of individual copy buttons
let copyButtonsVisible = false;

/**
 * Renders the JSON data into the specified container.
 * @param {object} data The JSON data to render.
 * @param {string} containerId The ID of the HTML element to render into.
 */
function renderJson(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; // Clear previous content

    const ul = document.createElement('ul');
    ul.appendChild(createNode(data, null, true)); // Pass true for isRoot
    container.appendChild(ul);

    addToggleListeners(); // Add listeners for expand/collapse clicks on nodes
    addGlobalToggleListeners(); // Add listeners for global expand/collapse and show/hide copy buttons
    updateCopyButtonVisibility(); // Set initial visibility of copy buttons
}

/**
 * Recursively creates HTML nodes for JSON data.
 * @param {*} value The value of the JSON node.
 * @param {string | null} key The key of the JSON node (null for root).
 * @param {boolean} isRoot True if this is the root node, false otherwise.
 * @returns {HTMLLIElement} The created list item (<li>) element.
 */
function createNode(value, key = null, isRoot = false) {
    const li = document.createElement('li');
    let type = getType(value);
    let expandIconHtml = '';
    let nodeInitialStateClass = '';
    let keyHtml = '';
    let valueHtml = '';
    let typeIndicatorHtml = '';
    let containerIndicatorHtml = '';
    let metaInfoHtml = '';

    // --- Determine initial state, expand icon, and various content parts ---
    if (type === 'object' || type === 'array') {
        // Objects and arrays are expandable
        if (isRoot) {
            nodeInitialStateClass = 'expanded';
            expandIconHtml = '<span class="expand-icon expanded"></span>';
            keyHtml = '<span class="key root-key">JSON</span>';
        } else {
            nodeInitialStateClass = 'collapsed';
            expandIconHtml = '<span class="expand-icon collapsed"></span>';
            keyHtml = `<span class="key">${escapeHtml(key)}</span>`;
        }

        containerIndicatorHtml = (type === 'object') ? '<span class="brace-indicator">{}</span>' : '<span class="bracket-indicator">[]</span>';
        const numChildren = Object.keys(value).length;
        metaInfoHtml = ` <span class="${type}-meta">${numChildren} ${numChildren === 1 ? 'item' : 'items'}</span>`;
        valueHtml = '';
    } else {
        // Primitive values are not expandable
        expandIconHtml = '<span class="expand-icon empty"></span>';
        nodeInitialStateClass = 'primitive';
        keyHtml = `<span class="key">${escapeHtml(key)}</span>`;

        if (type === 'string') {
            valueHtml = `<span class="value">${escapeHtml(JSON.stringify(value))}</span>`;
        } else {
            valueHtml = `<span class="value">${String(value)}</span>`;
        }
        containerIndicatorHtml = '';
        metaInfoHtml = '';
    }

    typeIndicatorHtml = `<span class="type-indicator type-${type}"></span>`;

    // --- Node Header (the clickable part that contains all visible info for a node) ---
    const headerDiv = document.createElement('div');
    headerDiv.className = 'node-header';

    let headerContent = '';
    headerContent += expandIconHtml;
    headerContent += typeIndicatorHtml;
    headerContent += containerIndicatorHtml;
    headerContent += keyHtml;

    if (type === 'object' || type === 'array') {
        headerContent += ` `;
    } else if (key !== null) {
        headerContent += `<span class="separator">:</span> `;
    }
    headerContent += valueHtml;
    headerContent += metaInfoHtml;

    headerDiv.innerHTML = headerContent;

    // --- NEW: Wrapper for node header and copy button ---
    const nodeLineContent = document.createElement('div');
    nodeLineContent.className = 'node-line-content';
    nodeLineContent.appendChild(headerDiv);

    // --- Add Copy Button for Objects and Arrays ONLY ---
    if (type === 'object' || type === 'array') {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-node-btn';
        copyButton.title = `Copy this ${type}`;

        // Explicitly add "Copy" text
        copyButton.textContent = 'Copy';

        // Add codicon icon (will appear next to "Copy" text if codicon.css is loaded)
        const iconSpan = document.createElement('span');
        iconSpan.className = 'codicon codicon-copy';
        copyButton.appendChild(iconSpan); // Appends the icon AFTER the text

        // Store the actual JSON value on the button itself for easy access during click
        copyButton.__dataToCopy = value;

        nodeLineContent.appendChild(copyButton); // Append button to the new wrapper
        addCopyButtonListener(copyButton); // Attach listener immediately
    }

    li.appendChild(nodeLineContent); // Append the wrapper to the li


    // --- Node Children (recursively generated) ---
    if (type === 'object' || type === 'array') {
        const childrenUl = document.createElement('ul');
        childrenUl.className = 'node-children';

        for (const childKey in value) {
            if (Object.prototype.hasOwnProperty.call(value, childKey)) {
                childrenUl.appendChild(createNode(value[childKey], childKey));
            }
        }
        li.appendChild(childrenUl); // Append children UL directly to li (below nodeLineContent)
    }

    // Apply the initial state class
    if (nodeInitialStateClass !== 'primitive') {
        li.classList.add(nodeInitialStateClass);
    }

    return li;
}

/**
 * Determines the type of a JSON value for styling.
 * @param {*} value The JSON value.
 * @returns {string} The type as a string.
 */
function getType(value) {
    if (value === null) return 'null';
    const type = typeof value;
    if (type === 'object') {
        return Array.isArray(value) ? 'array' : 'object';
    }
    return type;
}

/**
 * Escapes HTML characters in a string.
 * @param {string} str The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

/**
 * Adds click listeners to all node headers that are expandable.
 */
function addToggleListeners() {
    document.querySelectorAll('.json-viewer li.collapsed, .json-viewer li.expanded').forEach(li => {
        const header = li.querySelector('.node-header');
        if (header) {
            header.onclick = null; // Remove previous listener to prevent duplicates
            header.onclick = function(event) {
                event.stopPropagation(); // Prevent event from bubbling up

                const isCollapsed = li.classList.contains('collapsed');
                li.classList.toggle('collapsed', !isCollapsed);
                li.classList.toggle('expanded', isCollapsed);

                const expandIcon = header.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.classList.toggle('collapsed', !isCollapsed);
                    expandIcon.classList.toggle('expanded', isCollapsed);
                }
            };
        }
    });
}

/**
 * Adds event listener for a single copy button.
 * @param {HTMLButtonElement} button The copy button element.
 */
function addCopyButtonListener(button) {
    button.onclick = function(event) {
        event.stopPropagation(); // Prevent the parent node from expanding/collapsing

        const dataToCopy = this.__dataToCopy; // Access the stored data
        const jsonString = JSON.stringify(dataToCopy, null, 2); // Format with 2-space indent

        navigator.clipboard.writeText(jsonString).then(() => {
            this.classList.add('copied');
            const icon = this.querySelector('.codicon');
            if (icon) {
                icon.classList.remove('codicon-copy');
                icon.classList.add('codicon-check');
            }
            setTimeout(() => {
                this.classList.remove('copied');
                if (icon) {
                    icon.classList.remove('codicon-check');
                    icon.classList.add('codicon-copy');
                }
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy JSON:', err);
            // Optionally, show an error message in the UI
        });
    };
}

/**
 * Adds event listeners to the global "Expand All", "Collapse All", and "Show/Hide Copy Button" buttons.
 */
function addGlobalToggleListeners() {
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');
    const showCopyBtn = document.getElementById('showCopyBtn');

    if (expandAllBtn) {
        expandAllBtn.onclick = () => toggleAllNodes('expanded');
    }

    if (collapseAllBtn) {
        collapseAllBtn.onclick = () => toggleAllNodes('collapsed');
    }

    if (showCopyBtn) {
        showCopyBtn.onclick = null; // Remove previous listener
        showCopyBtn.onclick = () => {
            copyButtonsVisible = !copyButtonsVisible;
            updateCopyButtonVisibility();
            showCopyBtn.textContent = copyButtonsVisible ? 'Hide Copy Buttons' : 'Show Copy Buttons';
        };
    }
}

/**
 * Toggles the state of all expandable nodes in the viewer.
 * @param {'expanded' | 'collapsed'} targetState The state to set all nodes to.
 */
function toggleAllNodes(targetState) {
    document.querySelectorAll('.json-viewer li.collapsed, .json-viewer li.expanded').forEach(li => {
        const expandIcon = li.querySelector('.expand-icon');

        if (targetState === 'expanded') {
            li.classList.remove('collapsed');
            li.classList.add('expanded');
            if (expandIcon) {
                expandIcon.classList.remove('collapsed');
                expandIcon.classList.add('expanded');
            }
        } else {
            li.classList.remove('expanded');
            li.classList.add('collapsed');
            if (expandIcon) {
                expandIcon.classList.remove('expanded');
                expandIcon.classList.add('collapsed');
            }
        }
    });
}

/**
 * Updates the display style of all individual copy buttons based on `copyButtonsVisible`.
 */
function updateCopyButtonVisibility() {
    document.querySelectorAll('.json-viewer .copy-node-btn').forEach(btn => {
        if (copyButtonsVisible) {
            btn.style.display = 'inline-flex';
        } else {
            btn.style.display = 'none';
        }
    });
}

// --- Event Listener for Messages from the Extension (VS Code communication) ---
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'updateJsonData':
            renderJson(message.data, 'json-tree-container');
            break;
    }
});