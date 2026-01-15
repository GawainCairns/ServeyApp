// Small floating widget to simulate auth states for testing
(function(){
  function makeBtn(text, onClick){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'aw-btn';
    b.textContent = text;
    b.addEventListener('click', onClick);
    return b;
  }

  function renderWidget(){
    if(window._servey_auth_widget) return; // only once
    const w = document.createElement('div');
    w.className = 'auth-widget';

    const title = document.createElement('div'); title.className = 'aw-title'; title.textContent = 'Auth Test';
    const controls = document.createElement('div'); controls.className = 'aw-controls';

    const btnAnon = makeBtn('Not logged-in', ()=>{ try{ServeyState.clear(); location.hash = '#/';}catch(e){alert('ServeyState not ready')} });
    const btnUser = makeBtn('User', ()=>{ try{ServeyState.set({name:'Test User',email:'user@example.com',role:'user'}, 'tok'); location.hash = '#/home';}catch(e){alert('ServeyState not ready')} });
    const btnAdmin = makeBtn('Admin', ()=>{ try{ServeyState.set({name:'Admin User',email:'admin@example.com',role:'admin'}, 'tok'); location.hash = '#/home';}catch(e){alert('ServeyState not ready')} });

    controls.appendChild(btnAnon); controls.appendChild(btnUser); controls.appendChild(btnAdmin);

    const status = document.createElement('div'); status.className = 'aw-status'; status.textContent = 'State: unknown';

    w.appendChild(title); w.appendChild(controls); w.appendChild(status);

    // subscribe to state changes if available
    function attach(){
      if(window.ServeyState && ServeyState.subscribe){
        ServeyState.subscribe(s => {
          if(!s || !s.user) return status.textContent = 'State: not logged-in';
          status.textContent = `State: ${s.user.role || 'user'} — ${s.user.name || s.user.email}`;
        });
      }
    }

    // try attach now or later
    attach();
    setTimeout(attach, 500);

    document.body.appendChild(w);
    window._servey_auth_widget = w;
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderWidget); else renderWidget();

})();
