// Servey UI and API integration
(function(){
  const API_BASE = 'http://localhost:3000';

  function showMessage(container, text, ok=true){
    let el = container.querySelector('.servey-notice');
    if(!el){ el = document.createElement('div'); el.className='servey-notice'; container.insertBefore(el, container.firstChild); }
    el.textContent = text; el.style.color = ok ? '#065f46' : '#7f1d1d';
    setTimeout(()=>{ if(el) el.textContent = '' }, 4000);
  }

  async function api(path, opts){
    const res = await fetch(API_BASE + path, opts);
    if(!res.ok){ const txt = await res.text(); throw new Error(txt || res.statusText); }
    const contentType = res.headers.get('content-type') || '';
    if(contentType.includes('application/json')) return res.json();
    return res.text();
  }

  async function createServey(data){
    return api('/servey/create', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(data)});
  }

  async function updateServey(id,data){
    return api('/servey/' + encodeURIComponent(id), {method:'PUT', headers:{'content-type':'application/json'}, body:JSON.stringify(data)});
  }

  async function fetchAll(){ return api('/servey'); }
  async function fetchByUser(userId){ return api('/user/' + encodeURIComponent(userId) + '/servey'); }
  async function fetchById(id){ return api('/servey/' + encodeURIComponent(id)); }
  async function fetchUser(id){ return api('/user/' + encodeURIComponent(id)); }

  const userCache = new Map();
  async function getUserName(id){
    if(!id) return 'Unknown';
    if(userCache.has(id)) return userCache.get(id);
    try{
      const u = await fetchUser(id);
      const name = (u && u.name) || (u && u.email) || ('User#' + id);
      userCache.set(id, name);
      return name;
    }catch(e){ return 'User#' + id; }
  }

  function createListItem(s, onEdit){
    const li = document.createElement('div'); li.className='servey-item card';
    li.innerHTML = `<strong>#${s.id} ${escapeHtml(s.name || '')}</strong><div class="muted">${escapeHtml(s.discription || '')}</div><div class="meta">Creator: <span class="creator-${s.creator}">${s.creator}</span></div>`;
    if(onEdit){
      const edit = document.createElement('button'); edit.className='link'; edit.textContent='Edit'; edit.addEventListener('click', ()=> onEdit(s));
      li.appendChild(edit);
    }
    // replace creator id with name asynchronously
    (async()=>{
      const name = await getUserName(s.creator);
      const span = li.querySelector('.creator-' + s.creator);
      if(span) span.textContent = name;
    })();
    return li;
  }

  function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

  function renderServeyPage(root, mountHeader){
    root.innerHTML = '';
    mountHeader();
    const container = document.createElement('div'); container.className='servey-page';

    const layout = document.createElement('div'); layout.className='servey-layout';

    // left: separate create and update forms
    const left = document.createElement('div'); left.className='card servey-form-wrap';
    // Create form
    const createH = document.createElement('h3'); createH.textContent='Create Servey';
    const createForm = document.createElement('form'); createForm.className='servey-form';
    const createName = document.createElement('input'); createName.name='name'; createName.placeholder='Servey name'; createName.type='text';
    const createDesc = document.createElement('input'); createDesc.name='discription'; createDesc.placeholder='Short description'; createDesc.type='text';
    const createSubmit = document.createElement('button'); createSubmit.className='btn'; createSubmit.textContent='Create Servey';
    createForm.appendChild(createName); createForm.appendChild(createDesc); createForm.appendChild(createSubmit);
    left.appendChild(createH); left.appendChild(createForm);

    // Update form
    const updateH = document.createElement('h3'); updateH.textContent='Update Servey';
    const updateForm = document.createElement('form'); updateForm.className='servey-form';
    // select for choosing servey to update
    const updateSelect = document.createElement('select'); updateSelect.className='update-select';
    const updateDefault = document.createElement('option'); updateDefault.value=''; updateDefault.textContent='Select servey to edit...'; updateSelect.appendChild(updateDefault);
    const idUpdate = document.createElement('input'); idUpdate.type='hidden'; idUpdate.name='id';
    const nameUpdate = document.createElement('input'); nameUpdate.name='name'; nameUpdate.placeholder='Servey name'; nameUpdate.type='text';
    const descUpdate = document.createElement('input'); descUpdate.name='discription'; descUpdate.placeholder='Short description'; descUpdate.type='text';
    const updateSubmit = document.createElement('button'); updateSubmit.className='btn'; updateSubmit.textContent='Update Servey';
    const updateClear = document.createElement('button'); updateClear.type='button'; updateClear.className='btn secondary'; updateClear.textContent='Clear';
    updateForm.appendChild(idUpdate); updateForm.appendChild(nameUpdate); updateForm.appendChild(descUpdate); updateForm.appendChild(updateSubmit); updateForm.appendChild(updateClear);
    left.appendChild(updateH); left.appendChild(updateForm);

    // right: lists + search
    const right = document.createElement('div'); right.className='servey-side';
    const allCard = document.createElement('div'); allCard.className='card';
    allCard.innerHTML = '<h4>All Serveys</h4>';
    const allActions = document.createElement('div'); allActions.className='cta-row';
    const refreshAllBtn = document.createElement('button'); refreshAllBtn.className='btn secondary'; refreshAllBtn.textContent='Refresh All';
    allActions.appendChild(refreshAllBtn); allCard.appendChild(allActions);
    const allList = document.createElement('div'); allList.className='servey-list'; allCard.appendChild(allList);

    const mineCard = document.createElement('div'); mineCard.className='card'; mineCard.style.marginTop='12px'; mineCard.innerHTML = '<h4>My Serveys</h4>';
    const mineActions = document.createElement('div'); mineActions.className='cta-row';
    const refreshMineBtn = document.createElement('button'); refreshMineBtn.className='btn secondary'; refreshMineBtn.textContent='Refresh Mine';
    mineActions.appendChild(refreshMineBtn); mineCard.appendChild(mineActions);
    const mineList = document.createElement('div'); mineList.className='servey-list'; mineCard.appendChild(mineList);

    const findCard = document.createElement('div'); findCard.className='card'; findCard.style.marginTop='12px';
    findCard.innerHTML = '<h4>Find Servey</h4>';
    const findRow = document.createElement('div'); findRow.className='find-row';
    const findSelect = document.createElement('select'); findSelect.className='find-select';
    const defaultOpt = document.createElement('option'); defaultOpt.value=''; defaultOpt.textContent='Choose a servey...'; findSelect.appendChild(defaultOpt);
    const refreshFindBtn = document.createElement('button'); refreshFindBtn.className='btn secondary'; refreshFindBtn.textContent='Refresh List';
    findRow.appendChild(findSelect); findRow.appendChild(refreshFindBtn); findCard.appendChild(findRow);
    const found = document.createElement('div'); found.className='servey-found'; findCard.appendChild(found);

    right.appendChild(allCard); right.appendChild(mineCard); right.appendChild(findCard);

    layout.appendChild(left); layout.appendChild(right);
    container.appendChild(layout);
    root.appendChild(container);

    // refresh lists and populate select
    async function refreshAllLists(){
      allList.innerHTML = 'Loading...';
      try{
        const all = await fetchAll();
        allList.innerHTML = '';
        // reset find select
        findSelect.innerHTML = '';
        const defaultOpt = document.createElement('option'); defaultOpt.value=''; defaultOpt.textContent='Choose a servey...'; findSelect.appendChild(defaultOpt);
        (Array.isArray(all)?all:[]).forEach(s=>{
          // do not include edit button in All Serveys list
          allList.appendChild(createListItem(s));
          const opt = document.createElement('option'); opt.value = s.id; opt.textContent = `#${s.id} ${s.name || ''}`; findSelect.appendChild(opt);
        });
      }catch(er){ allList.innerHTML = 'Failed to load'; }
    }

    async function refreshMineList(){
      mineList.innerHTML = 'Loading...';
      try{
        const state = ServeyState.get();
        const uid = state && state.user && state.user.id;
        if(uid){
          const mine = await fetchByUser(uid);
          mineList.innerHTML = '';
          // populate update select with user's serveys
          if(updateSelect){
            updateSelect.innerHTML = '';
            const updDef = document.createElement('option'); updDef.value=''; updDef.textContent='Select servey to edit...'; updateSelect.appendChild(updDef);
          }
          (Array.isArray(mine)?mine:[]).forEach(s=>{
            mineList.appendChild(createListItem(s, loadIntoUpdateForm));
            if(updateSelect){
              const opt = document.createElement('option'); opt.value = s.id; opt.textContent = `#${s.id} ${s.name || ''}`; updateSelect.appendChild(opt);
            }
          });
        } else {
          mineList.innerHTML = '<div class="muted">Sign in to see your surveys</div>';
        }
      }catch(er){ mineList.innerHTML = 'Failed to load'; }
    }

    function loadIntoUpdateForm(s){ idUpdate.value = s.id; nameUpdate.value = s.name||''; descUpdate.value = s.discription||''; updateSubmit.textContent = 'Update Servey'; if(updateSelect){ updateSelect.value = s.id; } }

    // Create handler
    createForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const payload = { name: createName.value, discription: createDesc.value };
      const uid = ServeyState.get() && ServeyState.get().user && ServeyState.get().user.id;
      if(!uid){ showMessage(container, 'You must be signed in to create a servey', false); return }
      payload.creator = uid;
      try{
        await createServey(payload);
        showMessage(container, 'Servey created successfully');
        createName.value=''; createDesc.value='';
        await refreshAllLists(); await refreshMineList();
      }catch(er){ showMessage(container, 'Error: '+(er.message||er), false); }
    });

    // Update handler
    updateForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      if(!idUpdate.value){ showMessage(container, 'Select a servey to update', false); return }
      const payload = { name: nameUpdate.value, discription: descUpdate.value };
      const uid = ServeyState.get() && ServeyState.get().user && ServeyState.get().user.id;
      if(uid) payload.creator = uid;
      try{
        await updateServey(idUpdate.value, payload);
        showMessage(container, 'Servey updated successfully');
        idUpdate.value=''; nameUpdate.value=''; descUpdate.value=''; updateSubmit.textContent='Update Servey';
        await refreshAllLists(); await refreshMineList();
      }catch(er){ showMessage(container, 'Error: '+(er.message||er), false); }
    });

    updateClear.addEventListener('click', ()=>{ idUpdate.value=''; nameUpdate.value=''; descUpdate.value=''; updateSubmit.textContent='Update Servey'; });

    // update select handler
    updateSelect.addEventListener('change', async ()=>{
      const id = updateSelect.value;
      if(!id){ idUpdate.value=''; nameUpdate.value=''; descUpdate.value=''; return }
      try{ const s = await fetchById(id); loadIntoUpdateForm(s); }catch(er){ showMessage(container, 'Failed to load servey', false); }
    });

    // find select handler
    findSelect.addEventListener('change', async ()=>{
      const id = findSelect.value;
      if(!id){ found.innerHTML = ''; return }
      found.innerHTML = 'Loading...';
      try{
        const s = await fetchById(id);
        const creatorName = await getUserName(s.creator);
        found.innerHTML = '<div class="card">'+('<strong>#'+s.id+' '+escapeHtml(s.name)+'</strong><div class="muted">'+escapeHtml(s.discription||'')+'</div><div class="meta">Creator: '+escapeHtml(creatorName)+'</div>')+'</div>';
      }catch(er){ found.innerHTML = '<div class="muted">Not found</div>'; }
    });

    // refresh buttons
    refreshAllBtn.addEventListener('click', async ()=>{ await refreshAllLists(); });
    refreshMineBtn.addEventListener('click', async ()=>{ await refreshMineList(); });
    refreshFindBtn.addEventListener('click', async ()=>{ await refreshAllLists(); });

    // insert updateSelect into update form area (before hidden id)
    updateForm.insertBefore(updateSelect, idUpdate);

    // initial load
    refreshAllLists(); refreshMineList();
  }

  window.ServeyUI = { renderServeyPage };
})();
