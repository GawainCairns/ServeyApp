// Render About / Contact page and fetch admin contacts
(function(){
  function render(){
    const root = document.getElementById('app');
    root.innerHTML = '';
    // ensure header is mounted before content so it isn't removed by innerHTML
    try{ if(window.ServeyHeader && document.getElementById('app')) ServeyHeader.createHeader(document.getElementById('app')); }catch(e){}
    const wrap = document.createElement('div');
    wrap.className = 'card about-page';

    const title = document.createElement('h1');
    title.textContent = 'About ServeyApp';
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'ServeyApp is a lightweight survey system for creating, distributing and analysing surveys quickly. It focuses on speed, simplicity and accessibility.';

    const features = document.createElement('div');
    features.innerHTML = '<h3>Features</h3><ul><li>Create and edit surveys with multiple question types</li><li>Share surveys via links</li><li>Collect responses in real-time</li><li>Export results as CSV</li><li>Mobile-friendly respondent UI</li></ul>';

    const contact = document.createElement('div');
    contact.innerHTML = '<h3>Contact</h3><p class="muted">For support or questions, reach out to the admins below.</p>';
    const list = document.createElement('div');
    list.className = 'contact-list';
    list.textContent = 'Loading contacts...';

    wrap.appendChild(title);
    wrap.appendChild(p);
    wrap.appendChild(features);
    wrap.appendChild(contact);
    wrap.appendChild(list);

    root.appendChild(wrap);

    // fetch admin info from endpoint (explicit backend host/port)
    fetch('http://127.0.0.1:3000/user/admin/info')
      .then(res=>{
        if(!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data=>{
        // expect data to be array of {name,email}
        list.innerHTML = '';
        if(!data || !data.length){ list.textContent = 'No admin contacts available.'; return }
        const ul = document.createElement('ul');
        ul.className = 'contact-ul';
        data.forEach(a=>{
          const li = document.createElement('li');
          li.className = 'contact-item';
          const n = document.createElement('div'); n.className='contact-name'; n.textContent = a.name || '—';
          const e = document.createElement('a'); e.href = 'mailto:' + (a.email || ''); e.textContent = a.email || '';
          li.appendChild(n); li.appendChild(e);
          ul.appendChild(li);
        });
        list.appendChild(ul);
      })
      .catch(err=>{
        list.textContent = 'Unable to load contacts.';
      });
  }

  // wait for header to mount then render content so header appears first
  window.addEventListener('load', ()=> setTimeout(render, 20));
})();
