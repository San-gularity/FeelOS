## Minimal Grug Browser OS (Blank Desktop + File Explorer)

Goal: the smallest runnable toy OS:
- Blank desktop.
- One app: File Explorer.
- No hardcoded files/folders/content.
- Ready to plug an LLM later to generate items on demand.

### Run

```bash
cd /Users/nate/github.com/zzstoatzz/browser-os
python3 -m http.server 5173
# visit http://localhost:5173
```

### Files

- `index.html`: full-screen desktop and module script include.
- `main.js`: window manager, minimal File Explorer opener.

### Minimal behaviors

- Desktop is empty on load.
- “File Explorer” button opens a window titled “File Explorer”.
- The window is draggable; contents are empty for now.

### Hook points for LLM (future)

- Inside `openFileExplorer()` you’ll dispatch user actions (e.g., open folder, create item).
- A thin “data provider” interface will proxy those actions to an LLM and update the view.
- Keep UI stateless where possible; re-render from the provider’s current snapshot.

### Relevant snippets

Minimal Explorer window:

```js
function openFileExplorer() {
  const container = document.createElement('div');
  container.style.width = '560px';
  container.style.height = '320px';
  container.style.padding = '12px';
  const label = document.createElement('div');
  label.textContent = 'Empty';
  container.appendChild(label);
  wm.createWindow('File Explorer', container);
}
```

Launcher button:

```js
const explorerBtn = document.createElement('button');
explorerBtn.textContent = 'File Explorer';
explorerBtn.style.position = 'fixed';
explorerBtn.style.top = '12px';
explorerBtn.style.left = '12px';
explorerBtn.style.zIndex = '9999';
explorerBtn.style.padding = '8px 12px';
explorerBtn.style.border = '1px solid var(--window-border)';
explorerBtn.style.borderRadius = '6px';
explorerBtn.style.background = 'var(--window-bar)';
explorerBtn.style.color = 'var(--window-bar-text)';
explorerBtn.style.cursor = 'pointer';
explorerBtn.addEventListener('click', openFileExplorer);
document.body.appendChild(explorerBtn);
```

That’s it. Once we decide the LLM interface, we’ll swap the “Empty” content for a thin renderer bound to a provider that can create folders/files on demand.


