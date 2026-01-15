// Admin UI and API helpers for user management
(function(){
  const API = 'http://localhost:3000/admin';
  const API_SERVEY = 'http://127.0.0.1:3000';
  const getAuthHeaders = (hasBody = false) => {
    const s = (window.ServeyState && ServeyState.get && ServeyState.get()) || null;
    const headers = {};
    if (hasBody) headers['Content-Type'] = 'application/json';
    if (s && s.token) headers['Authorization'] = 'Bearer ' + s.token;
    return headers;
  };

  async function apiCreateUser(data){
    const res = await fetch(API + '/user', {method:'POST', headers:getAuthHeaders(true), body:JSON.stringify(data)});
    const body = await res.json(); if(!res.ok) throw body; return body;
  }
  async function apiUpdateUser(id,data){
    const res = await fetch(API + '/user/'+encodeURIComponent(id), {method:'PUT', headers:getAuthHeaders(true), body:JSON.stringify(data)});
    const body = await res.json(); if(!res.ok) throw body; return body;
  }
  async function apiGetAllUsers(){
    const res = await fetch(API + '/users', {headers: getAuthHeaders(false)});
    const body = await res.json(); if(!res.ok) throw body; return body;
  }
  async function apiGetUser(id){
    const res = await fetch(API + '/user/'+encodeURIComponent(id), {headers: getAuthHeaders(false)});
    const body = await res.json(); if(!res.ok) throw body; return body;
  }
  async function apiDeleteUser(id){
    const res = await fetch(API + '/user/'+encodeURIComponent(id), {method:'DELETE', headers: getAuthHeaders(false)});
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

  function createModal(title){
    const overlay = document.createElement('div'); overlay.className = 'modal-overlay';
    const box = document.createElement('div'); box.className = 'modal';
    const header = document.createElement('div'); header.className = 'modal-header'; header.textContent = title;
    const closeBtn = document.createElement('button'); closeBtn.className = 'modal-close'; closeBtn.textContent = 'Close'; header.appendChild(closeBtn);
    const body = document.createElement('div'); body.className = 'modal-body';
    box.appendChild(header); box.appendChild(body); overlay.appendChild(box); document.body.appendChild(overlay);
    function close(){ try{ document.body.removeChild(overlay) }catch(e){} }
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click',(e)=>{ if(e.target===overlay) close(); });
    return {body, close, show: ()=> overlay.style.display = ''};
  }

  async function safeJson(res){ try{ return await res.json(); }catch(e){ return {message: res.statusText || 'no-json'} } }

  // Servey APIs
  async function apiGetAllServeys(){ const res = await fetch(API_SERVEY + '/servey', {headers: getAuthHeaders(false)}); const body = await safeJson(res); if(!res.ok) throw body; return body }
  async function apiGetServey(id){ const res = await fetch(API_SERVEY + '/servey/'+encodeURIComponent(id), {headers: getAuthHeaders(false)}); const body = await safeJson(res); if(!res.ok) throw body; return body }
  async function apiCreateServey(data){ const res = await fetch(API_SERVEY + '/servey', {method:'POST', headers: getAuthHeaders(true), body: JSON.stringify(data)}); const body = await safeJson(res); if(!res.ok) throw body; return body }
  async function apiUpdateServey(id,data){ const res = await fetch(API_SERVEY + '/servey/'+encodeURIComponent(id), {method:'PUT', headers: getAuthHeaders(true), body: JSON.stringify(data)}); const body = await safeJson(res); if(!res.ok) throw body; return body }

  // Questions & Answers for servey
  async function apiGetQuestions(sid){ const res = await fetch(API_SERVEY + '/servey/'+encodeURIComponent(sid) + '/question', {headers: getAuthHeaders(false)}); const body = await safeJson(res); if(!res.ok) throw body; return body }
  async function apiGetQuestion(sid,qid){ const res = await fetch(API_SERVEY + '/servey/'+encodeURIComponent(sid) + '/question/'+encodeURIComponent(qid), {headers: getAuthHeaders(false)}); const body = await safeJson(res); if(!res.ok) throw body; return body }
  async function apiCreateQuestion(sid,data){ const res = await fetch(API_SERVEY + '/servey/'+encodeURIComponent(sid) + '/question', {method:'POST', headers: getAuthHeaders(true), body: JSON.stringify(data)}); const body = await safeJson(res); if(!res.ok) throw body; return body }
  async function apiUpdateQuestion(sid,qid,data){ const res = await fetch(API_SERVEY + '/servey/'+encodeURIComponent(sid) + '/question/'+encodeURIComponent(qid), {method:'PUT', headers: getAuthHeaders(true), body: JSON.stringify(data)}); const body = await safeJson(res); if(!res.ok) throw body; return body }

  async function apiGetAnswers(sid){ const res = await fetch(API_SERVEY + '/servey/'+encodeURIComponent(sid) + '/answer', {headers: getAuthHeaders(false)}); const body = await safeJson(res); if(!res.ok) throw body; return body }
  async function apiGetAnswer(sid,aid){ const res = await fetch(API_SERVEY + '/servey/'+encodeURIComponent(sid) + '/answer/'+encodeURIComponent(aid), {headers: getAuthHeaders(false)}); const body = await safeJson(res); if(!res.ok) throw body; return body }
  async function apiCreateAnswer(sid,data){ const res = await fetch(API_SERVEY + '/servey/'+encodeURIComponent(sid) + '/answer', {method:'POST', headers: getAuthHeaders(true), body: JSON.stringify(data)}); const body = await safeJson(res); if(!res.ok) throw body; return body }
  async function apiUpdateAnswer(sid,aid,data){ const res = await fetch(API_SERVEY + '/servey/'+encodeURIComponent(sid) + '/answer/'+encodeURIComponent(aid), {method:'PUT', headers: getAuthHeaders(true), body: JSON.stringify(data)}); const body = await safeJson(res); if(!res.ok) throw body; return body }

  // Public user lookup (to show creator name)
  async function apiGetUserPublic(id){ const res = await fetch(API_SERVEY + '/user/'+encodeURIComponent(id), {headers: getAuthHeaders(false)}); const body = await safeJson(res); if(!res.ok) throw body; return body }

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

    // Serveys management
    const serveyCard = document.createElement('div'); serveyCard.className='card';
    const sh = document.createElement('h3'); sh.textContent = 'Serveys (Admin)'; serveyCard.appendChild(sh);
    const serveyControls = document.createElement('div'); serveyControls.className='servey-controls';
    const sSearch = makeInput('ssearch','Search serveys by name');
    const sSort = document.createElement('select'); sSort.innerHTML = '<option value="id">Sort: ID</option><option value="name">Name</option><option value="creator">Creator</option>';
    const sLoad = document.createElement('button'); sLoad.className='btn secondary'; sLoad.textContent='Load Serveys';
    serveyControls.appendChild(sSearch); serveyControls.appendChild(sSort); serveyControls.appendChild(sLoad);
    serveyCard.appendChild(serveyControls);

    const serveyCreateForm = document.createElement('form'); serveyCreateForm.className='servey-create';
    const sName = makeInput('name','Servey name');
    const sDesc = makeInput('description','Description');
    const sCreateBtn = document.createElement('button'); sCreateBtn.className='btn'; sCreateBtn.textContent='Create Servey';
    serveyCreateForm.appendChild(sName); serveyCreateForm.appendChild(sDesc); serveyCreateForm.appendChild(sCreateBtn);
    serveyCard.appendChild(serveyCreateForm);

    const serveysDiv = document.createElement('div'); serveysDiv.className='serveys-list'; serveyCard.appendChild(serveysDiv);
    wrap.appendChild(serveyCard);

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
          const view = document.createElement('button'); view.className='link'; view.textContent='Edit';
          view.addEventListener('click', ()=>{
            // populate the update form with this user's data for editing
            try{
              idIn.value = u.id;
              uName.value = u.name || '';
              uEmail.value = u.email || '';
              uPass.value = '';
              uRole.value = u.role || 'user';
              // bring update card into view
              updateCard.scrollIntoView({behavior:'smooth', block:'center'});
              showMessage(updateCard, 'Loaded user into edit form', true);
            }catch(e){ console.error(e) }
          });
          // also allow clicking the whole row to edit
          tr.addEventListener('click', (evt)=>{ if(evt.target===tr) view.click(); });
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

    // Servey handlers
    async function renderServeyList(rawList){
      serveysDiv.innerHTML = '';
      if(!rawList || rawList.length===0){ serveysDiv.textContent='No serveys'; return }
      // apply search
      const q = sSearch.value.trim().toLowerCase();
      let list = rawList.filter(s => !q || (s.name||'').toLowerCase().includes(q));
      // apply sort
      const sort = sSort.value;
      list.sort((a,b)=>{ if(sort==='name') return (a.name||'').localeCompare(b.name||''); if(sort==='creator') return (a.creator||'').toString().localeCompare((b.creator||'').toString()); return (''+a.id).localeCompare(''+b.id); });

      const table = document.createElement('table'); table.className='serveys-table';
      const thead = document.createElement('thead'); thead.innerHTML = '<tr><th>ID</th><th>Name</th><th>Description</th><th>Creator</th><th>Actions</th></tr>'; table.appendChild(thead);
      const tb = document.createElement('tbody');
      for(const s of list){
        const tr = document.createElement('tr');
        const idTd = document.createElement('td'); idTd.textContent = s.id;
        const nameTd = document.createElement('td'); nameTd.textContent = s.name;
        const descTd = document.createElement('td'); descTd.textContent = s.description || '';
        const creatorTd = document.createElement('td'); creatorTd.textContent = s.creator || '';
        // try to fetch creator name asynchronously
        (async ()=>{ try{ if(s.creator){ const uu = await apiGetUserPublic(s.creator); creatorTd.textContent = uu.name || s.creator } }catch(e){} })();
        const actionsTd = document.createElement('td');
        const view = document.createElement('button'); view.className='link'; view.textContent='View';
        view.addEventListener('click', async ()=>{
          const modal = createModal('Servey: '+(s.name||s.id));
          const b = modal.body; b.innerHTML = '';
          const info = document.createElement('div'); info.innerHTML = `<strong>ID:</strong> ${s.id}<br><strong>Name:</strong> ${s.name}<br><strong>Description:</strong> ${s.description||''}`;
          b.appendChild(info);
          const qh = document.createElement('h4'); qh.textContent = 'Questions'; b.appendChild(qh);
          const questionsDiv = document.createElement('div'); questionsDiv.className='questions-list'; b.appendChild(questionsDiv);
          const addQForm = document.createElement('form'); addQForm.className='add-question';
          const qText = makeInput('text','Question text'); const qType = makeInput('type','Type (text|select|radio)'); const qAdd = document.createElement('button'); qAdd.className='btn'; qAdd.textContent='Add Question';
          addQForm.appendChild(qText); addQForm.appendChild(qType); addQForm.appendChild(qAdd); b.appendChild(addQForm);

          async function loadQuestions(){ questionsDiv.textContent='Loading...'; try{ const qs = await apiGetQuestions(s.id); questionsDiv.innerHTML=''; if(!qs || qs.length===0){ questionsDiv.textContent='No questions'; return };
              const qtable = document.createElement('table'); qtable.className='questions-table'; qtable.innerHTML = '<thead><tr><th>ID</th><th>Text</th><th>Type</th><th>Actions</th></tr></thead>';
              const qtb = document.createElement('tbody');
              qs.forEach(q=>{ const qtr = document.createElement('tr'); qtr.innerHTML = `<td>${q.id}</td><td>${q.text}</td><td>${q.type}</td>`;
                const qActions = document.createElement('td'); const edit = document.createElement('button'); edit.className='link'; edit.textContent='Edit';
                edit.addEventListener('click', ()=>{
                  const em = createModal('Edit Question'); em.body.innerHTML = '';
                  const f = document.createElement('form'); const ti = makeInput('text','Question text', 'text', q.text); const ty = makeInput('type','Type','text', q.type); const submit = document.createElement('button'); submit.className='btn'; submit.textContent='Save';
                  f.appendChild(ti); f.appendChild(ty); f.appendChild(submit); em.body.appendChild(f);
                  f.addEventListener('submit', async (ev)=>{ ev.preventDefault(); try{ await apiUpdateQuestion(s.id, q.id, {text: ti.value, type: ty.value}); em.close(); loadQuestions(); }catch(er){ showMessage(em.body, 'Update failed: '+(er && er.message?er.message:JSON.stringify(er)), false) } });
                });
                const answers = document.createElement('button'); answers.className='link'; answers.textContent='Answers';
                answers.addEventListener('click', async ()=>{
                  const am = createModal('Answers for question '+q.id); am.body.innerHTML='';
                  const listA = document.createElement('div'); listA.className='answers-list'; am.body.appendChild(listA);
                  const addAForm = document.createElement('form'); const aText = makeInput('text','Answer text'); const aAdd = document.createElement('button'); aAdd.className='btn'; aAdd.textContent='Add Answer'; addAForm.appendChild(aText); addAForm.appendChild(aAdd); am.body.appendChild(addAForm);
                  async function loadAnswers(){ listA.textContent='Loading...'; try{ const as = await apiGetAnswers(s.id); listA.innerHTML=''; if(!as||as.length===0){ listA.textContent='No answers'; return };
                      const at = document.createElement('table'); at.innerHTML='<thead><tr><th>ID</th><th>Text</th><th>Actions</th></tr></thead>'; const atb=document.createElement('tbody'); as.forEach(a=>{ const atr=document.createElement('tr'); atr.innerHTML=`<td>${a.id}</td><td>${a.text}</td>`; const aAct=document.createElement('td'); const aEdit=document.createElement('button'); aEdit.className='link'; aEdit.textContent='Edit'; aEdit.addEventListener('click',()=>{ const am2=createModal('Edit Answer'); am2.body.innerHTML=''; const f=document.createElement('form'); const ti=makeInput('text','Answer text','text',a.text); const sbtn=document.createElement('button'); sbtn.className='btn'; sbtn.textContent='Save'; f.appendChild(ti); f.appendChild(sbtn); am2.body.appendChild(f); f.addEventListener('submit', async (ev)=>{ ev.preventDefault(); try{ await apiUpdateAnswer(s.id, a.id, {text:ti.value}); am2.close(); loadAnswers(); }catch(er){ showMessage(am2.body,'Update failed: '+(er && er.message?er.message:JSON.stringify(er)), false) } }); }); aAct.appendChild(aEdit); atr.appendChild(aAct); atb.appendChild(atr); }); at.appendChild(atb); listA.appendChild(at); }catch(e){ listA.textContent='Load answers failed' } }
                  addAForm.addEventListener('submit', async (ev)=>{ ev.preventDefault(); try{ await apiCreateAnswer(s.id, {text: aText.value, question: q.id}); aText.value=''; loadAnswers(); }catch(er){ showMessage(am.body,'Create answer failed: '+(er && er.message?er.message:JSON.stringify(er)), false) } });
                  loadAnswers();
                });
                qActions.appendChild(edit); qActions.appendChild(answers);
                qtr.appendChild(qActions); qtb.appendChild(qtr);
              }); qtable.appendChild(qtb); questionsDiv.appendChild(qtable);
          }catch(e){ questionsDiv.textContent='Load questions failed' } }

          addQForm.addEventListener('submit', async (ev)=>{ ev.preventDefault(); try{ await apiCreateQuestion(s.id, {text: qText.value, type: qType.value}); qText.value=''; qType.value=''; loadQuestions(); }catch(er){ showMessage(b,'Create question failed: '+(er && er.message?er.message:JSON.stringify(er)), false) } });
          loadQuestions();
          modal.show();
        });

        const del = document.createElement('button'); del.className='link danger'; del.textContent='Delete';
        del.addEventListener('click', async ()=>{ if(!confirm('Delete servey '+s.id+'?')) return; try{ await apiUpdateServey(s.id, {deleted: true}); showMessage(serveyCard,'Deleted servey '+s.id, true); tr.remove(); }catch(er){ showMessage(serveyCard,'Delete failed: '+(er && er.message?er.message:JSON.stringify(er)), false) } });

        actionsTd.appendChild(view); actionsTd.appendChild(del);
        tr.appendChild(idTd); tr.appendChild(nameTd); tr.appendChild(descTd); tr.appendChild(creatorTd); tr.appendChild(actionsTd);
        tb.appendChild(tr);
      }
      table.appendChild(tb); serveysDiv.appendChild(table);
    }

    sLoad.addEventListener('click', async ()=>{ serveysDiv.innerHTML='Loading...'; try{ const list = await apiGetAllServeys(); await renderServeyList(list); }catch(er){ serveysDiv.textContent='Load failed: '+(er && er.message?er.message:JSON.stringify(er)) } });

    serveyCreateForm.addEventListener('submit', async (ev)=>{ ev.preventDefault(); try{ const payload = {name: sName.value, description: sDesc.value}; const out = await apiCreateServey(payload); showMessage(serveyCard,'Servey created (id: '+(out.id||'?')+')', true); sName.value=''; sDesc.value=''; sLoad.click(); }catch(er){ showMessage(serveyCard,'Create failed: '+(er && er.message?er.message:JSON.stringify(er)), false) } });

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
