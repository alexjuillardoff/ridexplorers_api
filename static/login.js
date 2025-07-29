(function(){
  const statusEl = document.getElementById('auth-status');
  const form = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-button');
  const userInput = document.getElementById('username');
  const passInput = document.getElementById('password');

  function updateStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
      statusEl.textContent = 'Connect\u00e9';
      form.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
    } else {
      statusEl.textContent = 'Non connect\u00e9';
      form.style.display = 'flex';
      logoutBtn.style.display = 'none';
    }
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const token = btoa(`${userInput.value}:${passInput.value}`);
    localStorage.setItem('authToken', token);
    userInput.value = '';
    passInput.value = '';
    updateStatus();
  });

  logoutBtn.addEventListener('click', function(){
    localStorage.removeItem('authToken');
    updateStatus();
  });

  updateStatus();
})();
