// Simple state manager using localStorage + subscribers
(function(){
  const KEY = 'serveyapp_user_v1';
  const subscribers = new Set();

  function read(){
    try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null}catch(e){return null}
  }
  function write(obj){localStorage.setItem(KEY,JSON.stringify(obj));notify();}
  function clear(){localStorage.removeItem(KEY);notify();}
  function notify(){for(const s of subscribers)try{s(get())}catch(e){}
  }
  function get(){return read()}
  function set(user, token){write({user,token})}
  function subscribe(fn){subscribers.add(fn);fn(get());return ()=>subscribers.delete(fn)}

  window.ServeyState = {get,set,clear,subscribe}
})();
