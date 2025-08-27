(function(){
  const listEl = document.getElementById('feeds-list');
  const createBtn = document.getElementById('create-feed');
  const editorContainer = document.getElementById('feed-editor');
  const saveBtn = document.getElementById('save-feed');
  const editorTitle = document.getElementById('editor-title');

  let editor = new JSONEditor(editorContainer, { mode: 'code' });
  let currentSlug = null;

  function authHeader() {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: 'Basic ' + token } : {};
  }

  function createActionButton(label, handler) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.addEventListener('click', handler);
    return btn;
  }

  function loadFeeds() {
    fetch('/api/blog/feeds', { headers: authHeader() })
      .then(r => r.json())
      .then(feeds => {
        listEl.innerHTML = '';
        feeds.forEach(f => {
          const li = document.createElement('li');
          li.className = 'feed-item';
          const nameSpan = document.createElement('span');
          nameSpan.textContent = f.name;
          nameSpan.className = 'feed-name';
          nameSpan.addEventListener('click', () => openFeed(f));
          const actions = document.createElement('span');
          actions.className = 'feed-actions';
          actions.appendChild(createActionButton('Voir', (e) => {
            e.stopPropagation();
            window.open(`/blog/${f.slug}`, '_blank');
          }));
          actions.appendChild(createActionButton('Renommer', async (e) => {
            e.stopPropagation();
            const name = prompt('Nouveau nom', f.name);
            if (!name) return;
            const res = await fetch(`/api/blog/feeds/${f.slug}/rename`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeader() },
              body: JSON.stringify({ name })
            });
            const updated = await res.json();
            loadFeeds();
            if (currentSlug === f.slug) {
              openFeed(updated);
            }
          }));
          actions.appendChild(createActionButton('Supprimer', async (e) => {
            e.stopPropagation();
            await fetch(`/api/blog/feeds/${f.slug}`, { method: 'DELETE', headers: authHeader() });
            if (currentSlug === f.slug) {
              editor.set({});
              editorTitle.textContent = '';
              saveBtn.style.display = 'none';
              currentSlug = null;
            }
            loadFeeds();
          }));
          li.appendChild(nameSpan);
          li.appendChild(actions);
          listEl.appendChild(li);
        });
      });
  }

  async function openFeed(feed) {
    currentSlug = feed.slug;
    editorTitle.textContent = feed.name;
    saveBtn.style.display = 'inline-block';
    const content = await fetch(`/api/blog/feeds/${feed.slug}`, { headers: authHeader() }).then(r => r.json());
    editor.set(content);
  }

  saveBtn.addEventListener('click', async () => {
    if (!currentSlug) return;
    const content = editor.get();
    await fetch(`/api/blog/feeds/${currentSlug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(content)
    });
  });

  createBtn.addEventListener('click', async () => {
    const name = prompt('Nom du flux');
    if (!name) return;
    const res = await fetch('/api/blog/feeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ name })
    });
    const feed = await res.json();
    loadFeeds();
    openFeed(feed);
  });

  loadFeeds();
})();
