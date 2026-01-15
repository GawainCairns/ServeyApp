// Header component that shows user name/email and logout
(function(){
  function createLink(text, href){
    const a = document.createElement('a');
    a.className = 'link';
    a.href = href;
    a.textContent = text;
    a.style.marginLeft = '12px';
    return a;
  }

  function createHeader(container){
    const el = document.createElement('div');
    el.className = 'header card';

    const left = document.createElement('div');
    left.innerHTML = '<strong>ServeyApp</strong>';

    const right = document.createElement('div');
    right.className = 'center';

    const userPill = document.createElement('div');
    userPill.className = 'user-pill';
    userPill.textContent = '';

    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'link';
    logoutBtn.textContent = 'Logout';
    logoutBtn.addEventListener('click', ()=>{
      ServeyState.clear();
      location.hash = '#/';
    });

    right.appendChild(userPill);
    right.appendChild(logoutBtn);

    el.appendChild(left);
    el.appendChild(right);

    // keep track of dynamic link nodes so we can clear them on update
    let dynamicLinks = [];

    function clearDynamicLinks(){
      for(const n of dynamicLinks){ if(n.parentNode) n.parentNode.removeChild(n); }
      dynamicLinks = [];
    }

    function update(state){
      clearDynamicLinks();

      // Home: lead to the landing page; use concrete HTML pages so links work from any page
      const homeHref = 'index.html';
      const homeLink = createLink('Home', homeHref);
      left.appendChild(homeLink); dynamicLinks.push(homeLink);

      if(!state || !state.user){
        // not logged-in: About, Login, Register
        const aboutLink = createLink('About', 'about.html'); left.appendChild(aboutLink); dynamicLinks.push(aboutLink);
        const loginLink = createLink('Login', 'index.html#/login'); left.appendChild(loginLink); dynamicLinks.push(loginLink);
        const regLink = createLink('Register', 'index.html#/register'); left.appendChild(regLink); dynamicLinks.push(regLink);

        userPill.textContent = '';
        logoutBtn.style.display = 'none';
      } else {
        // logged-in: Dashboard always
        const dashLink = createLink('Dashboard', 'dashboard.html'); left.appendChild(dashLink); dynamicLinks.push(dashLink);

        // admin gets Admin Dashboard link
        try{
          if(state.user && state.user.role === 'admin'){
            const adminLink = createLink('Admin Dashboard', 'index.html#/admin'); left.appendChild(adminLink); dynamicLinks.push(adminLink);
          }
        }catch(e){}

        userPill.textContent = state.user.name || state.user.email || 'User';
        logoutBtn.style.display = '';
      }
    }

    ServeyState.subscribe(update);
    container.appendChild(el);
    return el;
  }

  window.ServeyHeader = {createHeader};
})();
