// Simple SPA router and renderers
(function(){
  const root = document.getElementById('app');

  function clear(){root.innerHTML=''}

  function mountHeader(){
    ServeyHeader.createHeader(root);
  }

  function renderLanding(){
    clear();
    mountHeader();
    const wrap = document.createElement('div');
    wrap.className = 'hero';
    const left = document.createElement('div'); left.className='left';
    left.innerHTML = '<h1>Lightweight survey system</h1><p>Create and respond to surveys quickly. Sign in to manage your surveys.</p>';
    const cta = document.createElement('div'); cta.className='cta-row';
    const loginBtn = document.createElement('button'); loginBtn.className='btn'; loginBtn.textContent='Login';
    loginBtn.addEventListener('click', ()=> location.hash = '#/login');
    const regBtn = document.createElement('button'); regBtn.className='btn secondary'; regBtn.textContent='Register';
    regBtn.addEventListener('click', ()=> location.hash = '#/register');
    const serveysBtn = document.createElement('button'); serveysBtn.className='btn secondary'; serveysBtn.textContent='Serveys';
    serveysBtn.addEventListener('click', ()=> location.hash = '#/serveys');
    cta.appendChild(loginBtn); cta.appendChild(regBtn); cta.appendChild(serveysBtn);
    left.appendChild(cta);

    const right = document.createElement('div'); right.className='card'; right.innerHTML = '<strong>Features</strong><ul><li>Easy surveys</li><li>Reports</li></ul>';

    wrap.appendChild(left); wrap.appendChild(right);
    root.appendChild(wrap);
  }

  function renderForm(type){
    clear();
    mountHeader();
    const card = document.createElement('div'); card.className='card';
    const h = document.createElement('h3'); h.textContent = type==='login' ? 'Login' : 'Register';
    card.appendChild(h);

    const form = document.createElement('form');
    const err = document.createElement('div'); err.className='error';

    if(type==='register'){
      const name = document.createElement('input'); name.placeholder='Full name'; name.name='name'; name.type='text'; form.appendChild(name);
    }
    const email = document.createElement('input'); email.placeholder='Email'; email.name='email'; email.type='email'; form.appendChild(email);
    const pwd = document.createElement('input'); pwd.placeholder='Password'; pwd.name='password'; pwd.type='password'; form.appendChild(pwd);
    const submit = document.createElement('button'); submit.className='btn'; submit.textContent = type==='login' ? 'Login' : 'Register';
    form.appendChild(submit);
    card.appendChild(err);
    card.appendChild(form);
    root.appendChild(card);

    form.addEventListener('submit', async (e)=>{
      e.preventDefault(); err.textContent='';
      const data = {email:email.value, password:pwd.value};
      if(type==='register') data.name = form.querySelector('input[name=name]').value || '';
      try{
        if(type==='register'){
          await ServeyAuth.registerUser(data);
          // after register, go to login
          location.hash = '#/login';
        } else {
          await ServeyAuth.loginUser(data);
          location.hash = '#/home';
        }
      }catch(er){
        err.textContent = (er && er.message) || JSON.stringify(er);
      }
    });
  }

  function renderHome(){
    clear();
    mountHeader();
    const state = ServeyState.get();
    const card = document.createElement('div'); card.className='card';
    const welcome = document.createElement('h2');
    const who = (state && state.user && (state.user.name || state.user.email)) || 'User';
    welcome.textContent = `Welcome, ${who}`;
    const p = document.createElement('p'); p.textContent = 'This is your dashboard.';
    const openServeys = document.createElement('button'); openServeys.className='btn'; openServeys.textContent='Manage Serveys';
    openServeys.addEventListener('click', ()=> location.hash = '#/serveys');
    card.appendChild(openServeys);
    // if admin, show admin link
    try{
      if(state && state.user && state.user.role === 'admin'){
        const adminBtn = document.createElement('button'); adminBtn.className='btn secondary'; adminBtn.textContent='Admin';
        adminBtn.addEventListener('click', ()=> location.hash = '#/admin');
        card.appendChild(adminBtn);
      }
    }catch(e){}
    card.appendChild(welcome); card.appendChild(p);
    root.appendChild(card);
  }

  function route(){
    const hash = location.hash.replace('#','') || '/';
    const state = ServeyState.get();
    if(hash === '/' ){ renderLanding(); return }
    if(hash === '/login'){ renderForm('login'); return }
    if(hash === '/register'){ renderForm('register'); return }
    if(hash === '/home'){ if(state && state.user){ renderHome(); } else { location.hash = '#/login' } return }
    if(hash === '/serveys'){ if(state && state.user){ if(window.ServeyUI && ServeyUI.renderServeyPage){ ServeyUI.renderServeyPage(root, mountHeader); } else { location.hash = '#/home' } } else { location.hash = '#/login' } return }
    if(hash === '/admin'){ if(state && state.user && state.user.role === 'admin'){ if(window.ServeyAdmin && ServeyAdmin.renderAdminPage){ ServeyAdmin.renderAdminPage(root, mountHeader); } else { location.hash = '#/home' } } else { location.hash = '#/login' } return }
    renderLanding();
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('load', ()=>{
    // ensure header subscribes and route depending on auth
    route();
  });

})();
