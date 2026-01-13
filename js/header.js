// Header component that shows user name/email and logout
(function(){
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

    function update(state){
      if(state && state.user){
        userPill.textContent = state.user.name || state.user.email || 'User';
        logoutBtn.style.display = '';
      } else {
        userPill.textContent = '';
        logoutBtn.style.display = 'none';
      }
    }

    ServeyState.subscribe(update);
    container.appendChild(el);
    return el;
  }

  window.ServeyHeader = {createHeader};
})();
