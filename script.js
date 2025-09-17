// Premenne
let currentColor = document.getElementById('colorPicker').value;
let eraserMode = false;
let drawMode = false;
let brushSize = 10;
let eraserSize = 10;
window.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key, 'Code:', e.code);
}); 
const drawCanvas = document.getElementById('drawCanvas');
const mapImage = document.getElementById('mapImage');
const mapArea = document.getElementById('mapArea');
const ctx = drawCanvas.getContext('2d');

const brushControls = document.getElementById('brushControls');
const eraserControls = document.getElementById('eraserControls');
const eraserBtn = document.getElementById('eraserBtn');

function resizeCanvas() {
  const img = document.getElementById('mapImage');
  drawCanvas.style.position = 'absolute';
  drawCanvas.style.left = '0';
  drawCanvas.style.top = '0';
  drawCanvas.width = img.clientWidth;
  drawCanvas.height = img.clientHeight;
}

window.addEventListener('resize', resizeCanvas);

document.getElementById('colorPicker').addEventListener('input', (e) => {
  currentColor = e.target.value;

  // Vyresetuj hodnoty inputov v legende (ak ich máš), aby sa vizuálne "nepokazili"
  document.querySelectorAll('.legend-color').forEach(input => {
    if (input.value !== currentColor) {
      input.value = input.value; // vynúti refresh hodnoty
    }
  });

  // Ak máš vizuálne bloky farieb, prepíš ich tiež
  document.querySelectorAll('.color-block').forEach(block => {
    block.style.backgroundColor = block.style.backgroundColor; // refresh štýlu
  });
});

document.getElementById('brushSize').addEventListener('input', (e) => {
  brushSize = e.target.value;
});

document.getElementById('eraserSize').addEventListener('input', (e) => {
  eraserSize = e.target.value;
  if (!eraserMode) {
    eraserMode = true;
    drawMode = false;
    eraserBtn.classList.add('active');
    document.getElementById('drawBtn').classList.remove('active');
    brushControls.classList.add('hidden');
    eraserControls.classList.remove('hidden');
  }
});

document.getElementById('drawBtn').addEventListener('click', () => {
  drawMode = !drawMode;
  if (drawMode) eraserMode = false;
  document.getElementById('drawBtn').classList.toggle('active', drawMode);
  eraserBtn.classList.remove('active');
  brushControls.classList.toggle('hidden', !drawMode);
  eraserControls.classList.add('hidden');
});

eraserBtn.addEventListener('click', () => {
  eraserMode = !eraserMode;
  if (eraserMode) {
    drawMode = false;
    eraserBtn.classList.add('active');
    document.getElementById('drawBtn').classList.remove('active');
    brushControls.classList.add('hidden');
    eraserControls.classList.remove('hidden');
    eraserSize = document.getElementById('eraserSize').value;
  } else {
    eraserBtn.classList.remove('active');
    eraserControls.classList.add('hidden');
  }
});

let isDrawing = false;

drawCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  drawOrErase(e);
});

drawCanvas.addEventListener('mouseup', () => {
  isDrawing = false;
  ctx.beginPath();
});

drawCanvas.addEventListener('mouseleave', () => {
  isDrawing = false;
  ctx.beginPath();
});

drawCanvas.addEventListener('mousemove', (e) => {
  if (isDrawing) drawOrErase(e);
});

function drawOrErase(e) {
  const rect = drawCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (eraserMode) {
    ctx.clearRect(x - eraserSize / 2, y - eraserSize / 2, eraserSize, eraserSize);
    removeIconsUnderCursor(e.clientX, e.clientY);
  } else if (drawMode) {
    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

const iconsContainer = mapArea;
let draggedIcon = null;
let offsetX, offsetY;

document.querySelectorAll('.icons i.draggable, .icons img.draggable').forEach(icon => {
  icon.addEventListener('click', () => {
    const newIcon = icon.cloneNode(true);
    newIcon.classList.remove('draggable');
    newIcon.classList.add('draggable-icon');
    const mapRect = iconsContainer.getBoundingClientRect();
    newIcon.style.position = 'absolute';
    newIcon.style.left = (mapRect.width / 2) + 'px';
    newIcon.style.top = (mapRect.height / 2) + 'px';

    // Ak má ikona nastavenú farbu cez color picker, aplikujeme ju
    const iconWithColor = icon.closest('.icon-with-color');
    if (iconWithColor) {
      const colorInput = iconWithColor.querySelector('.icon-color-picker');
      if (colorInput) {
        newIcon.style.color = colorInput.value;
      }
    }

    iconsContainer.appendChild(newIcon);
    enableDrag(newIcon);
  });
});

// Pridanie event listenerov na všetky color pickery v ikonách, aby menili farbu ikony v preview (v paneli)
document.querySelectorAll('.icons .icon-color-picker').forEach(picker => {
  picker.addEventListener('input', (e) => {
    const input = e.target;
    const iconWithColor = input.closest('.icon-with-color');
    if (iconWithColor) {
      const icon = iconWithColor.querySelector('i.fa-solid');
      if (icon) {
        icon.style.color = input.value;
      }
    }
  });
});
/*mazanie textových polí*/
mapArea.addEventListener('mousedown', e => {
  if (!eraserMode) return;

  if (e.target.classList.contains('draggable-text')) {
    e.target.remove();
    saveState();
  }

  if (e.target.classList.contains('draggable-icon')) {
    e.target.remove();
    saveState();
  }
});


function enableDrag(icon) {
  icon.addEventListener('mousedown', (e) => {
    if (eraserMode) {
      icon.remove();
      return;
    }
    draggedIcon = icon;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    icon.style.cursor = 'grabbing';
    e.preventDefault();
  });
}

window.addEventListener('mouseup', () => {
  if (draggedIcon) {
    draggedIcon.style.cursor = 'move';
    draggedIcon = null;
  }
});

window.addEventListener('mousemove', (e) => {
  if (draggedIcon) {
    const rect = mapArea.getBoundingClientRect();
    let left = e.clientX - rect.left - offsetX;
    let top = e.clientY - rect.top - offsetY;
    left = Math.max(0, Math.min(left, rect.width - draggedIcon.offsetWidth));
    top = Math.max(0, Math.min(top, rect.height - draggedIcon.offsetHeight));
    draggedIcon.style.left = left + 'px';
    draggedIcon.style.top = top + 'px';
  }
});

function removeIconsUnderCursor(clientX, clientY) {
  const elements = document.elementsFromPoint(clientX, clientY);
  elements.forEach(el => {
    if (el.classList && el.classList.contains('draggable-icon')) {
      el.remove();
    }
  });
}

// *** TU JE TVOJ EXPORT TLAČIDLO: ***
document.getElementById('exportBtn').addEventListener('click', (e) => {
  e.preventDefault();

  const legendRows = document.querySelectorAll('.legend-row');
  const addRowBtn = document.getElementById('addLegendRow');

  addRowBtn.style.display = 'none';

  // Nastav rovnakú veľkosť všetkým legendovým štvorcom pred exportom
  document.querySelectorAll('#legend-rows .color-block').forEach(block => {
    block.style.width = '30px';
    block.style.height = '30px';
  });

  legendRows.forEach(row => {
    const colorInput = row.querySelector('.legend-color');
    const colorBlock = row.querySelector('.color-block');
    const textInput = row.querySelector('.legend-text');
    const removeBtn = row.querySelector('.remove-row');

    colorBlock.style.backgroundColor = colorInput.value;
    colorInput.style.display = 'none';
    textInput.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'none';
    colorBlock.style.display = 'inline-block';

    let textSpan = row.querySelector('.legend-text-span');
    if (!textSpan) {
      textSpan = document.createElement('span');
      textSpan.className = 'legend-text-span';
      textSpan.style.color = 'white';
      textSpan.style.marginLeft = '10px';
      row.appendChild(textSpan);
    }
    textSpan.textContent = textInput.value;
    textSpan.style.display = 'inline-block';
  });

  html2canvas(document.querySelector('#mapArea'), {
    useCORS: true,
    backgroundColor: null,
    allowTaint: true,
    scale: 2
  }).then(canvas => {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'mapa.png';
    a.click();

    legendRows.forEach(row => {
      row.querySelector('.legend-color').style.display = 'inline-block';
      row.querySelector('.legend-text').style.display = 'inline-block';
      const removeBtn = row.querySelector('.remove-row');
      if (removeBtn) removeBtn.style.display = 'inline-block';
      row.querySelector('.color-block').style.display = 'none';
      const textSpan = row.querySelector('.legend-text-span');
      if (textSpan) textSpan.remove();
    });

    addRowBtn.style.display = 'inline-block';
  });
});



const legendRows = document.getElementById('legend-rows');

document.getElementById('addLegendRow').addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'legend-row';

  const colorBox = document.createElement('div');  // z div na span
  colorBox.className = 'color-block';
  colorBox.style.backgroundColor = '#000000';
  colorBox.style.width = '25px';      // zmenené na jednotnú šírku
  colorBox.style.height = '30px';     // zmenené na jednotnú výšku
  colorBox.style.marginRight = '10px';
  colorBox.style.display = 'none';

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.className = 'legend-color';
  colorInput.value = '#000000';
  colorInput.addEventListener('input', () => {
    colorBox.style.backgroundColor = colorInput.value;
  });

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.className = 'legend-text';
  textInput.value = 'Nový riadok';

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-row';
  removeBtn.innerHTML = '&times;';
  removeBtn.addEventListener('click', () => {
    row.remove();
  });

  row.appendChild(colorBox);
  row.appendChild(colorInput);
  row.appendChild(textInput);
  row.appendChild(removeBtn);
  legendRows.appendChild(row);
});


window.addEventListener('mouseup', () => {
  isDragging = false;
});

window.addEventListener('mousemove', e => {
  if (isDragging) {
    legend.style.left = (e.clientX - dragOffsetX) + 'px';
    legend.style.top = (e.clientY - dragOffsetY) + 'px';
  }
});

document.getElementById('addTextBox').addEventListener('click', () => {
  const textBox = document.createElement('div');
  textBox.className = 'draggable-text';
  textBox.contentEditable = true;
  textBox.textContent = 'Nový text';

  // Pridáme štýly pre absolutné pozicionovanie a začneme s viditeľným kurzorom text
  textBox.style.position = 'absolute';
  textBox.style.cursor = 'text';

  // Pridáme do mapArea (nie do body), aby sme vedeli obmedziť pohyb v rámci mapy
  const mapArea = document.getElementById('mapArea');
  mapArea.appendChild(textBox);

  // Vypočítame stred mapArea a umiestnime tam textBox
  const rect = mapArea.getBoundingClientRect();
  const textRect = textBox.getBoundingClientRect();

  // left a top tak, aby bol textBox na strede (počítame polovičku jeho veľkosti)
  const left = (rect.width / 2) - (textRect.width / 2);
  const top = (rect.height / 2) - (textRect.height / 2);

  textBox.style.left = `${left}px`;
  textBox.style.top = `${top}px`;

  makeDraggable(textBox, mapArea);
});

// Upravená funkcia makeDraggable, ktorá dostane druhý parameter (kontajner na obmedzenie pohybu)
function makeDraggable(el, container) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  el.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  el.addEventListener('mousedown', (e) => {
    if (e.button === 2) { // pravé tlačidlo
      isDragging = true;

      // offset v rámci elementu
      offsetX = e.clientX - el.getBoundingClientRect().left;
      offsetY = e.clientY - el.getBoundingClientRect().top;
      el.style.cursor = 'grabbing';

      // zabránime selekcii textu počas ťahania
      e.preventDefault();
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      el.style.cursor = 'text';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // Vypočítame novú pozíciu relatívnu ku kontajneru
    let left = e.clientX - containerRect.left - offsetX;
    let top = e.clientY - containerRect.top - offsetY;

    // Obmedzenie pozície - nech nevyjde mimo containeru
    left = Math.max(0, Math.min(left, containerRect.width - el.offsetWidth));
    top = Math.max(0, Math.min(top, containerRect.height - el.offsetHeight));

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  });
}


/*vyber fontov*/

const fontToggleBtn = document.getElementById('fontToggleBtn');
const fontList = document.getElementById('fontList');

let activeTextBox = null;

// Zaregistruj focusin, aby sme vedeli, ktoré textové pole je aktívne
document.body.addEventListener('focusin', (e) => {
  if (e.target.classList.contains('draggable-text')) {
    activeTextBox = e.target;
  } else {
    activeTextBox = null;
  }
});

// Prepnutie zobrazovania font listu
fontToggleBtn.addEventListener('mousedown', e => {
  e.preventDefault(); // zabráni strate focusu
});
fontToggleBtn.addEventListener('click', () => {
  if (fontList.style.display === 'none') {
    fontList.style.display = 'block';
    fontToggleBtn.textContent = 'Font ▲';
  } else {
    fontList.style.display = 'none';
    fontToggleBtn.textContent = 'Font ▼';
  }
});

// Zabraňuje strate focusu pri kliknutí na položky v zozname
document.querySelectorAll('#fontList .font-option').forEach(item => {
  item.addEventListener('mousedown', e => {
    e.preventDefault();
  });
});

// Pri kliknutí na font zmeníme font len označenému textu
document.querySelectorAll('#fontList .font-option').forEach(item => {
  item.addEventListener('click', () => {
    if (!activeTextBox) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!activeTextBox.contains(range.commonAncestorContainer)) return;
    if (selection.isCollapsed) return;

    const fontName = item.getAttribute('data-font');

    // Vytvoríme span s novým fontom
    const span = document.createElement('span');
    span.style.fontFamily = fontName;
    span.textContent = selection.toString();

    // Vymažeme pôvodný výber a vložíme nový span
    range.deleteContents();
    range.insertNode(span);

    // Obnovíme selection a focus
    selection.removeAllRanges();
    activeTextBox.focus();

    fontList.style.display = 'none';
    fontToggleBtn.textContent = 'Font ▼';
  });
});



resizeCanvas();
