const socket = io();
const terminal = document.getElementById('terminal');
const filesList = document.getElementById('files');
const fileContent = document.getElementById('file-content');

function appendLog(msg) {
  terminal.textContent += msg;
  terminal.scrollTop = terminal.scrollHeight;
}

socket.on('log', appendLog);
socket.on('error', appendLog);
socket.on('done', code => appendLog(`\nProcess finished with code ${code}\n`));

function startScript(script) {
  fetch(`/scrape/start?script=${encodeURIComponent(script)}`)
    .then(r => r.json())
    .then(d => appendLog(`\n${d.message}\n`))
    .catch(e => appendLog(`\nError: ${e}\n`));
}

document.getElementById('actions').addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    startScript(e.target.getAttribute('data-script'));
  }
});

function loadFiles() {
  fetch('/scrape/files')
    .then(r => r.json())
    .then(files => {
      filesList.innerHTML = '';
      files.forEach(f => {
        const li = document.createElement('li');
        li.textContent = `${f.name} - ${f.lastModified}`;
        li.style.cursor = 'pointer';
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

loadFiles();
