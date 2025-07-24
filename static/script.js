const socket = io();
const terminal = document.getElementById('terminal');
const filesList = document.getElementById('files');
const fileContent = document.getElementById('file-content');
const fileInput = document.getElementById('file-upload');

function appendLog(msg) {
  terminal.textContent += msg;
  terminal.scrollTop = terminal.scrollHeight;
}

socket.on('log', appendLog);
socket.on('error', appendLog);
socket.on('done', msg => {
  appendLog(msg);
  loadFiles();
});

function uploadFile(file) {
  const data = new FormData();
  data.append('file', file);
  const toast = new window.Toast({
    position: 'top-right',
    toastMsg: `Uploading ${file.name}... 0%`,
    autoCloseTime: 0,
    showProgress: true,
    canClose: false,
    type: 'info',
    theme: 'dark',
  });
  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      toast.update({ toastMsg: `Uploading ${file.name}... ${percent}%` });
    }
  });
  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      toast.update({ toastMsg: `${file.name} uploaded`, type: 'success', autoCloseTime: 3000, canClose: true });
      loadFiles();
    } else {
      toast.update({ toastMsg: `Error uploading ${file.name}`, type: 'error', autoCloseTime: 3000, canClose: true });
    }
  });
  xhr.addEventListener('error', () => {
    toast.update({ toastMsg: `Error uploading ${file.name}`, type: 'error', autoCloseTime: 3000, canClose: true });
  });
  xhr.open('POST', '/scrape/upload');
  xhr.send(data);
}

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(uploadFile);
  e.target.value = '';
});

function loadFiles() {
  fetch('/scrape/files')
    .then(r => r.json())
    .then(files => {
      filesList.innerHTML = '';
      if (files.length === 0) {
        filesList.textContent = 'No files uploaded';
        fileContent.textContent = '';
        return;
      }
      files.forEach(f => {
        const li = document.createElement('li');
        const date = new Date(f.lastModified).toLocaleString();
        li.textContent = `${f.name} - ${date}`;
        li.addEventListener('click', () => loadFile(f.name));
        filesList.appendChild(li);
      });
    });
}

function loadFile(name) {
  fetch(`/scrape/files/${name}`)
    .then(r => r.json())
    .then(data => {
      fileContent.textContent = JSON.stringify(data, null, 2);
    });
}

function loadLogs() {
  fetch('/scrape/logs')
    .then(r => r.json())
    .then(logs => {
      terminal.textContent = '';
      logs.forEach(appendLog);
    });
}

loadFiles();
loadLogs();
