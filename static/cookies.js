(function(){
  // Affiche la bannière si aucun consentement n'est enregistré
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  const consentGiven = document.cookie.includes('consent=true');
  if (!consentGiven) {
    banner.style.display = 'block';
  }
  document.getElementById('accept-cookies')?.addEventListener('click', () => {
    fetch('/cookies/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: true })
    })
      .then(() => {
        banner.style.display = 'none';
        document.cookie = 'consent=true; path=/; max-age=31536000; samesite=lax';
      });
  });
})();
