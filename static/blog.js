(function(){
  const schemaContainer = document.getElementById('schema-editor');
  const itemContainer = document.getElementById('item-editor');
  const feedNameInput = document.getElementById('feed-name');
  const feedSelect = document.getElementById('feed-select');
  const saveFeedBtn = document.getElementById('save-feed');
  const addItemBtn = document.getElementById('add-item');

  const schemaEditor = new JSONEditor(schemaContainer, { mode: 'code' });
  let itemEditor = new JSONEditor(itemContainer, { mode: 'code' });

  function authHeader() {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: 'Basic ' + token } : {};
  }

  function loadFeeds() {
    fetch('/api/blog/feeds', { headers: authHeader() })
      .then(r => r.json())
      .then(feeds => {
        feedSelect.innerHTML = '<option value="">-- Choisir un flux --</option>';
        feeds.forEach(f => {
          const opt = document.createElement('option');
          opt.value = f.name;
          opt.textContent = f.name;
          opt.dataset.schema = JSON.stringify(f.schema || {});
          feedSelect.appendChild(opt);
        });
      });
  }

  feedSelect.addEventListener('change', () => {
    const selected = feedSelect.options[feedSelect.selectedIndex];
    const schema = selected.dataset.schema ? JSON.parse(selected.dataset.schema) : {};
    feedNameInput.value = selected.value;
    schemaEditor.set(schema);
    itemEditor.destroy();
    itemEditor = new JSONEditor(itemContainer, { mode: 'code', schema });
    itemEditor.set({});
  });

  saveFeedBtn.addEventListener('click', () => {
    const name = feedNameInput.value;
    const schema = schemaEditor.get();
    fetch('/api/blog/feeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ name, schema })
    }).then(() => loadFeeds());
  });

  addItemBtn.addEventListener('click', () => {
    const feed = feedSelect.value || feedNameInput.value;
    if (!feed) return;
    const item = itemEditor.get();
    fetch(`/api/blog/feeds/${encodeURIComponent(feed)}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(item)
    });
  });

  loadFeeds();
})();
