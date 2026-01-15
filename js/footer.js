(function(){
  // Simple footer population script
  const defaultAdmins = [
    {name: 'Admin One', role: 'Lead Admin', email: 'admin1@example.com'},
    {name: 'Admin Two', role: 'Support Admin', email: 'admin2@example.com'}
  ];

  function makeAdminCard(a){
    const d = document.createElement('div'); d.className = 'footer-admin';
    const n = document.createElement('div'); n.className='a-name'; n.textContent = a.name || '';
    const r = document.createElement('div'); r.className='a-role'; r.textContent = a.role || '';
    const e = document.createElement('a'); e.className='a-email'; e.href = 'mailto:' + (a.email||''); e.textContent = a.email || '';
    d.appendChild(n); d.appendChild(r); d.appendChild(e);
    return d;
  }

  function populateFooter(admins){
    try{
      const root = document.getElementById('site-footer');
      if(!root) return;
      const adminsWrap = root.querySelector('.footer-admins');
      if(!adminsWrap) return;
      adminsWrap.innerHTML = '';
      (admins || defaultAdmins).slice(0,2).forEach(a => adminsWrap.appendChild(makeAdminCard(a)));
    }catch(e){ console.error('populateFooter', e) }
  }

  // Expose a setter so other scripts (like admin UI) can update footer admins
  window.ServeyFooter = window.ServeyFooter || {};
  window.ServeyFooter.setAdmins = function(admins){
    window._servey_footer_admins = admins; populateFooter(admins);
  };

  // If admin module exists, attach a convenience method there too
  if(window.ServeyAdmin){ window.ServeyAdmin.setFooterAdmins = function(admins){ window.ServeyFooter.setAdmins(admins); } }

  // Initial populate with any pre-set admins or defaults
  setTimeout(()=>{
    populateFooter(window._servey_footer_admins || defaultAdmins);
  }, 20);
})();
