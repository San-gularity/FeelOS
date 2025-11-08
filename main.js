const wm = {
  createWindow(title, content) {
    const win = document.createElement('div');
    win.className = 'window';
    win.style.left = '100px';
    win.style.top = '100px';
    win.style.width = '560px';
    win.style.height = '320px';

    const titlebar = document.createElement('div');
    titlebar.className = 'window-titlebar';
    
    const titleText = document.createElement('span');
    titleText.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'window-close';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => win.remove();
    
    titlebar.appendChild(titleText);
    titlebar.appendChild(closeBtn);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'window-content';
    contentDiv.appendChild(content);
    
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'window-resize-handle';
    
    win.appendChild(titlebar);
    win.appendChild(contentDiv);
    win.appendChild(resizeHandle);
    
    makeDraggable(win, titlebar);
    makeResizable(win, resizeHandle);
    
    document.getElementById('desktop').appendChild(win);
  }
};

function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + 'px';
    element.style.left = (element.offsetLeft - pos1) + 'px';
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function makeResizable(element, handle) {
  handle.onmousedown = startResize;
  
  function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.offsetWidth;
    const startHeight = element.offsetHeight;
    
    function resize(e) {
      const width = startWidth + (e.clientX - startX);
      const height = startHeight + (e.clientY - startY);
      element.style.width = Math.max(200, width) + 'px';
      element.style.height = Math.max(150, height) + 'px';
    }
    
    function stopResize() {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    }
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  }
}

async function openApp(appName) {
  if (!appName) return;
  
  const container = document.createElement('div');
  container.className = 'loading';
  container.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">Loading ${appName}...</div>
  `;
  wm.createWindow(appName, container);
  
  try {
    const response = await fetch('http://localhost:8000/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'open_app', data: { app_name: appName } })
    });
    
    const html = await response.text();
    container.className = '';
    container.innerHTML = html;
  } catch (error) {
    container.className = '';
    container.innerHTML = `<div style="padding: 20px; color: #c00;">Error: ${error.message}</div>`;
  }
}

function createDesktopIcon(name, x, y) {
  const icon = document.createElement('div');
  icon.className = 'desktop-icon';
  icon.style.left = x + 'px';
  icon.style.top = y + 'px';
  icon.draggable = true;
  icon.dataset.iconId = `icon-${Date.now()}-${Math.random()}`;
  
  const image = document.createElement('div');
  image.className = 'desktop-icon-image';
  image.textContent = '📦';
  
  const label = document.createElement('div');
  label.className = 'desktop-icon-label';
  label.textContent = name;
  
  icon.appendChild(image);
  icon.appendChild(label);
  
  let dragStart = null;
  
  icon.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', icon.dataset.iconId);
    e.dataTransfer.effectAllowed = 'move';
  });
  
  icon.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (label.contentEditable === 'true') return;
    
    e.preventDefault();
    icon.draggable = false;
    
    dragStart = { x: e.clientX - icon.offsetLeft, y: e.clientY - icon.offsetTop };
    
    function onMouseMove(e) {
      icon.style.left = (e.clientX - dragStart.x) + 'px';
      icon.style.top = (e.clientY - dragStart.y) + 'px';
    }
    
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      icon.draggable = true;
      saveDesktopState();
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
  
  icon.addEventListener('dblclick', () => {
    openApp(label.textContent);
  });
  
  icon.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, [
      { label: 'Open', action: () => openApp(label.textContent) },
      { label: 'Rename', action: () => renameIcon(label) },
      { label: 'Delete', action: () => {
        icon.remove();
        saveDesktopState();
      }}
    ]);
  });
  
  document.getElementById('desktop').appendChild(icon);
  return icon;
}

function renameIcon(label) {
  label.contentEditable = 'true';
  label.focus();
  
  const range = document.createRange();
  range.selectNodeContents(label);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  
  function finishRename() {
    label.contentEditable = 'false';
    if (!label.textContent.trim()) {
      label.textContent = 'Untitled';
    }
    label.removeEventListener('blur', finishRename);
    label.removeEventListener('keydown', onKeyDown);
    saveDesktopState();
  }
  
  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      label.blur();
      finishRename();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      label.textContent = label.textContent;
      label.blur();
      finishRename();
    }
  }
  
  label.addEventListener('blur', finishRename);
  label.addEventListener('keydown', onKeyDown);
}

function showContextMenu(x, y, items) {
  const menu = document.getElementById('context-menu');
  menu.innerHTML = '';
  menu.style.display = 'block';
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  
  items.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'context-menu-item';
    menuItem.textContent = item.label;
    menuItem.onclick = () => {
      item.action();
      hideContextMenu();
    };
    menu.appendChild(menuItem);
  });
}

function hideContextMenu() {
  document.getElementById('context-menu').style.display = 'none';
}

document.getElementById('desktop').addEventListener('contextmenu', (e) => {
  if (e.target.id === 'desktop') {
    e.preventDefault();
    const x = e.clientX - 40;
    const y = e.clientY - 40;
    showContextMenu(e.clientX, e.clientY, [
      { label: 'New App', action: () => {
        const icon = createDesktopIcon('New App', x, y);
        const label = icon.querySelector('.desktop-icon-label');
        saveDesktopState();
        setTimeout(() => renameIcon(label), 0);
      }}
    ]);
  }
});

document.addEventListener('click', hideContextMenu);

function saveDesktopState() {
  const icons = Array.from(document.querySelectorAll('.desktop-icon'))
    .map(icon => ({
      name: icon.querySelector('.desktop-icon-label').textContent,
      x: parseInt(icon.style.left),
      y: parseInt(icon.style.top)
    }));
  localStorage.setItem('desktop-icons', JSON.stringify(icons));
}

function loadDesktopState() {
  const saved = localStorage.getItem('desktop-icons');
  if (saved) {
    const icons = JSON.parse(saved);
    icons.forEach(icon => createDesktopIcon(icon.name, icon.x, icon.y));
  } else {
    createDesktopIcon('File Explorer', 20, 20);
  }
}

loadDesktopState();

