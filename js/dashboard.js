(function(){
  function mount(){
    const app = document.getElementById('app');
    if(!app) return console.warn('No #app found');
    // ensure header is mounted inside the app
    const mountHeader = ()=> ServeyHeader.createHeader(app);
    // render the servey management UI into the app
    if(window.ServeyUI && typeof ServeyUI.renderServeyPage === 'function'){
      ServeyUI.renderServeyPage(app, mountHeader);
    } else {
      app.innerHTML = '<div class="card"><p class="muted">Servey UI not available</p></div>';
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
