// Admin UI and API helpers for user management
(function(){
  const API = 'http://localhost:3000/admin';

  async function apiCreateUser(data){
    const res = await fetch(API + '/user', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
    const body = await res.json(); if(!res.ok) throw body; return body;
  }
  async function apiUpdateUser(id,data){
    const res = await fetch(API + '/user/'+encodeURIComponent(id), {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
    const body = await res.json(); if(!res.ok) throw body; return body;
  }
  async function apiGetAllUsers(){
    const res = await fetch(API + '/users'); const body = await res.json(); if(!res.ok) throw body; return body;
  }
  async function apiGetUser(id){
    const res = await fetch(API + '/user/'+encodeURIComponent(id)); const body = await res.json(); if(!res.ok) throw body; return body;
  }
  async function apiDeleteUser(id){
    const res = await fetch(API + '/user/'+encodeURIComponent(id), {method:'DELETE'});
    if(res.status === 204 || res.status === 200) return {ok:true};
    const body = await res.json(); if(!res.ok) throw body; return body;
  }

  function showMessage(container, msg, ok=true){
    const el = document.createElement('div'); el.className = ok? 'message success' : 'message error'; el.textContent = msg;
    container.appendChild(el);
    setTimeout(()=>{ try{container.removeChild(el)}catch(e){} }, 4000);
  }

  function makeInput(name, placeholder, type='text', value=''){
    const input = document.createElement('input'); input.name = name; input.placeholder = placeholder; input.type = type; input.value = value; return input;
  }

  function renderAdminPage(root, mountHeader){
    root.innerHTML='';
    mountHeader();
    const wrap = document.createElement('div'); wrap.className='admin-area';

    // Create user card
    const createCard = document.createElement('div'); createCard.className='card';
    const h1 = document.createElement('h3'); h1.textContent='Create New User';
    createCard.appendChild(h1);
    const createForm = document.createElement('form');
    const nameIn = makeInput('name','Full name');
    const emailIn = makeInput('email','Email','email');
    const passIn = makeInput('password','Password','password');
    const roleIn = makeInput('role','Role (user|admin)'); roleIn.value='user';
    const createBtn = document.createElement('button'); createBtn.className='btn'; createBtn.textContent='Create User';
    createForm.appendChild(nameIn); createForm.appendChild(emailIn); createForm.appendChild(passIn); createForm.appendChild(roleIn); createForm.appendChild(createBtn);
    createCard.appendChild(createForm);
    wrap.appendChild(createCard);

    // Update user card (by id)
    const updateCard = document.createElement('div'); updateCard.className='card';
    const h2 = document.createElement('h3'); h2.textContent='Update User by ID'; updateCard.appendChild(h2);
    const updateForm = document.createElement('form');
    const idIn = makeInput('id','User ID');
    const uName = makeInput('name','Full name');
    const uEmail = makeInput('email','Email','email');
    const uPass = makeInput('password','Password','password');
    const uRole = makeInput('role','Role (user|admin)');
    const fetchBtn = document.createElement('button'); fetchBtn.className='btn secondary'; fetchBtn.type='button'; fetchBtn.textContent='Load User';
    const updateBtn = document.createElement('button'); updateBtn.className='btn'; updateBtn.textContent='Update User';
    updateForm.appendChild(idIn); updateForm.appendChild(fetchBtn); updateForm.appendChild(document.createElement('br'));
    updateForm.appendChild(uName); updateForm.appendChild(uEmail); updateForm.appendChild(uPass); updateForm.appendChild(uRole); updateForm.appendChild(updateBtn);
    updateCard.appendChild(updateForm);
    wrap.appendChild(updateCard);

    // List users
    const listCard = document.createElement('div'); listCard.className='card';
    const h3 = document.createElement('h3'); h3.textContent='All Users'; listCard.appendChild(h3);
    const loadBtn = document.createElement('button'); loadBtn.className='btn secondary'; loadBtn.textContent='Load All Users';
    const usersDiv = document.createElement('div'); usersDiv.className='users-list';
    listCard.appendChild(loadBtn); listCard.appendChild(usersDiv);
    wrap.appendChild(listCard);

    // View/Delete quick box
    const quickCard = document.createElement('div'); quickCard.className='card';
    const qh = document.createElement('h3'); qh.textContent='Get / Delete User by ID'; quickCard.appendChild(qh);
    const qForm = document.createElement('form');
    const qId = makeInput('id','User ID');
    const qGet = document.createElement('button'); qGet.className='btn secondary'; qGet.type='button'; qGet.textContent='Get User';
    const qDel = document.createElement('button'); qDel.className='btn danger'; qDel.type='button'; qDel.textContent='Delete User';
    const qRes = document.createElement('div'); qRes.className='result';
    qForm.appendChild(qId); qForm.appendChild(qGet); qForm.appendChild(qDel); qForm.appendChild(qRes);
    quickCard.appendChild(qForm);
    wrap.appendChild(quickCard);

    root.appendChild(wrap);

    // Handlers
    createForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      try{
        const data = {name: nameIn.value, email: emailIn.value, password: passIn.value, role: roleIn.value || 'user'};
        const out = await apiCreateUser(data);
        showMessage(createCard, 'User created successfully (id: '+out.id+')', true);
        createForm.reset();
      }catch(er){
        showMessage(createCard, 'Create failed: '+(er && er.message ? er.message : JSON.stringify(er)), false);
      }
    });

    fetchBtn.addEventListener('click', async ()=>{
      const id = idIn.value.trim(); if(!id) return showMessage(updateCard,'Enter an id', false);
      try{
        const u = await apiGetUser(id);
        uName.value = u.name || ''; uEmail.value = u.email || ''; uPass.value = ''; uRole.value = u.role || 'user';
        showMessage(updateCard,'User loaded', true);
      }catch(er){ showMessage(updateCard,'Load failed: '+(er && er.message ? er.message : JSON.stringify(er)), false) }
    });

    updateForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const id = idIn.value.trim(); if(!id) return showMessage(updateCard,'Enter an id', false);
      try{
        const data = {name: uName.value, email: uEmail.value, password: uPass.value, role: uRole.value || 'user'};
        const out = await apiUpdateUser(id, data);
        showMessage(updateCard,'User updated successfully (id: '+out.id+')', true);
      }catch(er){ showMessage(updateCard,'Update failed: '+(er && er.message ? er.message : JSON.stringify(er)), false) }
    });

    loadBtn.addEventListener('click', async ()=>{
      usersDiv.innerHTML = 'Loading...';
      try{
        const list = await apiGetAllUsers();
        usersDiv.innerHTML = '';
        if(!list || list.length===0) { usersDiv.textContent = 'No users'; return }
        const table = document.createElement('table'); table.className='users-table';
        const thead = document.createElement('thead'); thead.innerHTML = '<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>';
        table.appendChild(thead);
        const tb = document.createElement('tbody');
        list.forEach(u=>{
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td>`;
          const actions = document.createElement('td');
          const view = document.createElement('button'); view.className='link'; view.textContent='View';
          view.addEventListener('click', ()=>{ qId.value = u.id; qGet.click(); });
          const del = document.createElement('button'); del.className='link danger'; del.textContent='Delete';
          del.addEventListener('click', async ()=>{
            if(!confirm('Delete user '+u.id+'?')) return;
            try{ await apiDeleteUser(u.id); showMessage(listCard,'Deleted user '+u.id, true); tr.remove(); }catch(er){ showMessage(listCard,'Delete failed: '+(er && er.message ? er.message : JSON.stringify(er)), false) }
          });
          actions.appendChild(view); actions.appendChild(del);
          tr.appendChild(actions);
          tb.appendChild(tr);
        });
        table.appendChild(tb);
        usersDiv.appendChild(table);
      }catch(er){ usersDiv.innerHTML = 'Load failed: '+(er && er.message ? er.message : JSON.stringify(er)); }
    });

    qGet.addEventListener('click', async ()=>{
      const id = qId.value.trim(); if(!id) return showMessage(quickCard,'Enter an id', false);
      qRes.textContent = 'Loading...';
      try{ const u = await apiGetUser(id); qRes.textContent = JSON.stringify(u, null, 2); showMessage(quickCard,'User loaded', true); }catch(er){ qRes.textContent=''; showMessage(quickCard,'Get failed: '+(er && er.message ? er.message : JSON.stringify(er)), false) }
    });

    qDel.addEventListener('click', async ()=>{
      const id = qId.value.trim(); if(!id) return showMessage(quickCard,'Enter an id', false);
      if(!confirm('Delete user '+id+'?')) return;
      try{ await apiDeleteUser(id); showMessage(quickCard,'User deleted', true); }catch(er){ showMessage(quickCard,'Delete failed: '+(er && er.message ? er.message : JSON.stringify(er)), false) }
    });
  }

  window.ServeyAdmin = { renderAdminPage };
})();
