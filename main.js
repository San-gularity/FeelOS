const wm = {
  createWindow(title, content) {
    const win = document.createElement('div');
    win.className = 'window';
    win.style.left = '100px';
    win.style.top = '100px';

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
    
    win.appendChild(titlebar);
    win.appendChild(contentDiv);
    
    makeDraggable(win, titlebar);
    
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

async function openFileExplorer() {
  const container = document.createElement('div');
  container.textContent = 'Loading...';
  wm.createWindow('File Explorer', container);
  
  try {
    const response = await fetch('http://localhost:8000/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'open_file_explorer' })
    });
    
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    container.textContent = `Error: ${error.message}`;
  }
}

document.getElementById('explorer-btn').addEventListener('click', openFileExplorer);

