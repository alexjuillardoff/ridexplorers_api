const filesList = document.getElementById('files');
const fileContent = document.getElementById('file-content');
const fileInput = document.getElementById('file-upload');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

function authToken() {
  return localStorage.getItem('authToken') || '';
}

function authHeader() {
  const token = authToken();
  return token ? { Authorization: 'Basic ' + token } : {};
}

function showLogin() {
  loginForm.style.display = 'flex';
  usernameInput.focus();
}

function hideLogin() {
  loginForm.style.display = 'none';
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const token = btoa(`${usernameInput.value}:${passwordInput.value}`);
  localStorage.setItem('authToken', token);
  hideLogin();
  loadFiles();
});

function authFetch(url, options = {}) {
  options.headers = { ...(options.headers || {}), ...authHeader() };
  return fetch(url, options).then((r) => {
    if (r.status === 401) {
      showLogin();
      throw new Error('Unauthorized');
    }
    return r;
  });
}

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
  const token = authToken();
  if (token) {
    xhr.setRequestHeader('Authorization', 'Basic ' + token);
  }
  xhr.send(data);
}

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(uploadFile);
  e.target.value = '';
});

function loadFiles() {
  authFetch('/scrape/files')
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
    })
    .catch(() => {
      filesList.innerHTML = '';
      fileContent.textContent = '';
    });
}

function loadFile(name) {
  authFetch(`/scrape/files/${name}`)
    .then(r => r.json())
    .then(data => {
      fileContent.textContent = JSON.stringify(data, null, 2);
    })
    .catch(() => {
      fileContent.textContent = '';
    });
}

if (authToken()) {
  loadFiles();
} else {
  showLogin();
}
