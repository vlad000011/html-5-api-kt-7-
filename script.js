// Локальное хранилище для файлов (в base64)
const STORAGE_KEY = 'localFiles';

// ======== Элементы ========
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const typeFilter = document.getElementById('typeFilter');
const sizeFilter = document.getElementById('sizeFilter');
const applyFilters = document.getElementById('applyFilters');
const clearStorage = document.getElementById('clearStorage');

// ======== Drag & Drop ========
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', e => {
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

// ======== Input upload ========
fileInput.addEventListener('change', e => {
  handleFiles(e.target.files);
});

// ======== Основная функция обработки ========
function handleFiles(files) {
  const arr = Array.from(files);
  arr.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(ev) {
      const dataUrl = ev.target.result;
      const storedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: dataUrl,
        date: new Date().toISOString()
      };
      saveFile(storedFile);
    };
    reader.readAsDataURL(file);
  });
}

// ======== Работа с localStorage ========
function getStoredFiles() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveFile(fileObj) {
  const files = getStoredFiles();
  files.push(fileObj);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  renderFiles();
}

function deleteFile(index) {
  const files = getStoredFiles();
  files.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  renderFiles();
}

// ======== Фильтрация ========
function filterFiles(files) {
  const typeVal = typeFilter.value;
  const maxSizeKB = parseInt(sizeFilter.value) || Infinity;

  return files.filter(f => {
    const typeOk = (typeVal === 'all' || f.type.startsWith(typeVal));
    const sizeOk = f.size / 1024 <= maxSizeKB;
    return typeOk && sizeOk;
  });
}

// ======== Отрисовка ========
function renderFiles() {
  let files = getStoredFiles();
  files = filterFiles(files);

  fileList.innerHTML = '';
  if (!files.length) {
    fileList.innerHTML = '<tr><td colspan="4" class="small">Нет файлов</td></tr>';
    return;
  }

  files.forEach((file, index) => {
    const tr = document.createElement('tr');
    const sizeKB = (file.size / 1024).toFixed(1);

    tr.innerHTML = `
      <td>${file.name}</td>
      <td>${file.type || '(неизвестно)'}</td>
      <td>${sizeKB} КБ</td>
      <td><button data-index="${index}" class="delete-btn">Удалить</button></td>
    `;
    fileList.appendChild(tr);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = e.target.getAttribute('data-index');
      deleteFile(idx);
    });
  });
}

// ======== События ========
applyFilters.addEventListener('click', renderFiles);

clearStorage.addEventListener('click', () => {
  if (confirm('Очистить всё хранилище?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderFiles();
  }
});

// ======== Первичная отрисовка ========
renderFiles();
