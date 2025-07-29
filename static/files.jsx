const { useState, useEffect } = React;
const ToastContainer = window.ReactToastify ? window.ReactToastify.ToastContainer : () => null;
const toast = window.ReactToastify ? window.ReactToastify.toast : {
  success: (msg) => alert(msg),
  error: (msg) => alert(msg)
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState(null);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    if (token) loadFiles();
  }, [token]);

  const authHeader = () => (token ? { Authorization: 'Basic ' + token } : {});

  const login = (e) => {
    e.preventDefault();
    const tok = btoa(`${username}:${password}`);
    localStorage.setItem('authToken', tok);
    setToken(tok);
    setUsername('');
    setPassword('');
    toast.success('Connect\u00e9');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken('');
    setFiles([]);
    setContent('');
  };

  const loadFiles = () => {
    fetch('/scrape/files', { headers: authHeader() })
      .then((r) => r.json())
      .then((list) =>
        setFiles(list.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)))
      )
      .catch(() => {
        setFiles([]);
        setContent('');
      });
  };

  const viewFile = (name) => {
    fetch(`/scrape/files/${name}`, { headers: authHeader() })
      .then((r) => r.json())
      .then((data) => setContent(JSON.stringify(data, null, 2)))
      .catch(() => setContent(''));
  };

  const removeFile = (name) => {
    fetch(`/scrape/files/${name}`, { method: 'DELETE', headers: authHeader() })
      .then((r) => {
        if (r.ok) {
          toast.success('Fichier supprim\u00e9');
          loadFiles();
          setContent('');
        } else {
          toast.error('Erreur lors de la suppression');
        }
      })
      .catch(() => toast.error('Erreur lors de la suppression'));
  };

  const uploadFile = (file) => {
    const xhr = new XMLHttpRequest();
    const data = new FormData();
    data.append('file', file);
    setStartTime(Date.now());
    setProgress({ percent: 0, remaining: 0 });

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = e.loaded / (elapsed || 1);
        const remaining = rate ? (e.total - e.loaded) / rate : 0;
        setProgress({ percent, remaining });
      }
    });

    xhr.onload = () => {
      setProgress(null);
      if (xhr.status === 200) {
        toast.success('Fichier envoy\u00e9');
        loadFiles();
      } else {
        toast.error('Erreur envoi fichier');
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      toast.error('Erreur envoi fichier');
    };
    xhr.open('POST', '/scrape/upload');
    if (token) {
      xhr.setRequestHeader('Authorization', 'Basic ' + token);
    }
    xhr.send(data);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  return (
    <>
      <div className="navbar">
        <span className="api-name">RIDEXPLORERS API</span>
        <div className="navbar-right">
          <span className="auth-status">{token ? 'Connect\u00e9' : 'Non connect\u00e9'}</span>
          {!token ? (
            <form onSubmit={login} id="login-form">
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
              <button type="submit">Login</button>
            </form>
          ) : (
            <button id="logout-button" onClick={logout}>Logout</button>
          )}
        </div>
      </div>
      <nav className="nav-links">
        <a href="/">Accueil</a>
        <a href="/docs" target="_blank">Swagger Docs</a>
        <a href="/files.html">Gestionnaire de fichiers</a>
      </nav>
      <div className="container">
        <h1>Gestion des fichiers</h1>
        <p className="auth-info">
          Utilisez l'authentification Basic pour tester l'API. Les identifiants sont
          définis par <code>AUTH_USER</code> et <code>AUTH_PASSWORD</code>.
        </p>
        {token && (
          <section>
            <h2>Data Files</h2>
            <input type="file" accept="application/json" onChange={onFileChange} />
            {progress && (
              <>
                <progress value={progress.percent} max="100" style={{ width: '100%' }}></progress>
                <div>{progress.percent}% - reste {progress.remaining.toFixed(1)} s</div>
              </>
            )}
            <ul id="files">
              {files.length === 0 && <li>Aucun fichier disponible</li>}
              {files.map((f) => (
                <li key={f.name} className="file-item">
                  <span className="file-name" onClick={() => viewFile(f.name)}>{f.name}</span>
                  <span className="file-date">{new Date(f.lastModified).toLocaleString()}</span>
                  <button onClick={() => removeFile(f.name)} style={{ marginLeft: '0.5rem' }}>Delete</button>
                </li>
              ))}
            </ul>
            <pre id="file-content">{content}</pre>
          </section>
        )}
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
