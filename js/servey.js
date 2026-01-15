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

  // Question & Answer APIs
  async function fetchQuestions(serveyId){ return api('/servey/' + encodeURIComponent(serveyId) + '/question'); }
  async function fetchQuestionById(serveyId, qid){ return api('/servey/' + encodeURIComponent(serveyId) + '/question/' + encodeURIComponent(qid)); }
  async function createQuestion(serveyId, payload){ return api('/servey/' + encodeURIComponent(serveyId) + '/question', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(payload)}); }
  async function updateQuestion(serveyId, qid, payload){ return api('/servey/' + encodeURIComponent(serveyId) + '/question/' + encodeURIComponent(qid), {method:'PUT', headers:{'content-type':'application/json'}, body:JSON.stringify(payload)}); }

  async function fetchAnswers(serveyId){ return api('/servey/' + encodeURIComponent(serveyId) + '/answer'); }
  async function fetchAnswerById(serveyId, aid){ return api('/servey/' + encodeURIComponent(serveyId) + '/answer/' + encodeURIComponent(aid)); }
  async function createAnswer(serveyId, payload){ return api('/servey/' + encodeURIComponent(serveyId) + '/answer', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(payload)}); }
  async function updateAnswer(serveyId, aid, payload){ return api('/servey/' + encodeURIComponent(serveyId) + '/answer/' + encodeURIComponent(aid), {method:'PUT', headers:{'content-type':'application/json'}, body:JSON.stringify(payload)}); }

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

    // Questions management (appears when editing / managing a servey)
    const questionsCard = document.createElement('div'); questionsCard.className='card'; questionsCard.style.marginTop='12px';
    questionsCard.innerHTML = '<h4>Questions</h4>';
    const questionsArea = document.createElement('div'); questionsArea.className='servey-questions';
    // add question form
    const qForm = document.createElement('form'); qForm.className='question-form';
    const qText = document.createElement('input'); qText.name='question'; qText.placeholder='Question text'; qText.type='text'; qText.style.width='100%';
    const qType = document.createElement('select'); qType.name='type';
    ['text','multiple','boolean'].forEach(t=>{ const o=document.createElement('option'); o.value=t; o.textContent=t; qType.appendChild(o); });
    const qSubmit = document.createElement('button'); qSubmit.className='btn'; qSubmit.type='submit'; qSubmit.textContent='Add Question';
    qForm.appendChild(qText); qForm.appendChild(qType); qForm.appendChild(qSubmit);
    questionsCard.appendChild(qForm); questionsCard.appendChild(questionsArea);
    left.appendChild(questionsCard);

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

    function loadIntoUpdateForm(s){ idUpdate.value = s.id; nameUpdate.value = s.name||''; descUpdate.value = s.discription||''; updateSubmit.textContent = 'Update Servey'; if(updateSelect){ updateSelect.value = s.id; } if(s && s.id){ refreshQuestions(s.id); } }

    // Create handler
    createForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const payload = { name: createName.value, discription: createDesc.value };
      const uid = ServeyState.get() && ServeyState.get().user && ServeyState.get().user.id;
      if(!uid){ showMessage(container, 'You must be signed in to create a servey', false); return }
      payload.creator = uid;
      try{
        const res = await createServey(payload);
        showMessage(container, 'Servey created successfully');
        createName.value=''; createDesc.value='';
        await refreshAllLists(); await refreshMineList();
        // if server returned id, load into update form for immediate question management
        if(res && (res.id || res.insertId)){ const sid = res.id || res.insertId; idUpdate.value = sid; nameUpdate.value = payload.name||''; descUpdate.value = payload.discription||''; updateSubmit.textContent='Update Servey'; if(updateSelect) updateSelect.value = sid; refreshQuestions(sid); }
      }catch(er){ showMessage(container, 'Error: '+(er.message||er), false); }
    });

    // Update handler
    updateForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      if(!idUpdate.value){ showMessage(container, 'Select a servey to update', false); return }
      const sid = idUpdate.value;
      const payload = { name: nameUpdate.value, discription: descUpdate.value };
      const uid = ServeyState.get() && ServeyState.get().user && ServeyState.get().user.id;
      if(uid) payload.creator = uid;
      try{
        await updateServey(sid, payload);
        showMessage(container, 'Servey updated successfully');
        await refreshAllLists(); await refreshMineList();
        // refresh questions for the updated servey
        refreshQuestions(sid);
        idUpdate.value=''; nameUpdate.value=''; descUpdate.value=''; updateSubmit.textContent='Update Servey';
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

    // Questions refresh / render helpers
    async function refreshQuestions(serveyId){
      if(!questionsArea) return;
      if(!serveyId){ questionsArea.innerHTML = '<div class="muted">Select a servey to manage questions</div>'; return; }
      questionsArea.innerHTML = 'Loading...';
      try{
        const qs = await fetchQuestions(serveyId);
        questionsArea.innerHTML = '';
        const list = document.createElement('div'); list.className='questions-list';
        (Array.isArray(qs)?qs:[]).forEach(q=> list.appendChild(renderQuestionItem(q, serveyId)) );
        if(list.children.length === 0) questionsArea.innerHTML = '<div class="muted">No questions yet</div>';
        if(list.children.length > 0) questionsArea.appendChild(list);
      }catch(e){ questionsArea.innerHTML = '<div class="muted">Failed to load questions</div>'; }
    }

    function renderQuestionItem(q, serveyId){
      const div = document.createElement('div'); div.className='question-item card';
      div.innerHTML = `<strong>#${q.id} ${escapeHtml(q.question||'')}</strong><div class="muted">type: ${escapeHtml(q.type||'')}</div>`;
      const edit = document.createElement('button'); edit.className='link'; edit.textContent='Edit';
      edit.addEventListener('click', ()=>{ qText.value = q.question||''; qType.value = q.type||'text'; qSubmit.textContent='Save Question'; qSubmit.dataset.editing = q.id; });
      const manage = document.createElement('button'); manage.className='link'; manage.textContent='Manage Answers';
      div.appendChild(edit); div.appendChild(manage);

      const answersArea = document.createElement('div'); answersArea.className='answers-area'; answersArea.style.display='none'; answersArea.style.marginTop='8px';
      manage.addEventListener('click', async ()=>{
        if(answersArea.style.display === 'none'){
          answersArea.style.display = 'block'; answersArea.innerHTML = 'Loading...';
          try{
            const allAnswers = await fetchAnswers(serveyId);
            const qAnswers = (Array.isArray(allAnswers)?allAnswers:[]).filter(a=> String(a.question_id) === String(q.id));
            renderAnswersList(qAnswers, answersArea, serveyId, q.id, q.type);
          }catch(e){ answersArea.innerHTML = '<div class="muted">Failed to load answers</div>'; }
        } else { answersArea.style.display = 'none'; }
      });
      div.appendChild(answersArea);
      return div;
    }

    function renderAnswersList(qAnswers, container, serveyId, qid, qType){
      container.innerHTML = '';
      const list = document.createElement('div'); list.className = 'answers-list';
      (Array.isArray(qAnswers)?qAnswers:[]).forEach(a=>{
        const it = document.createElement('div'); it.className='answer-item'; it.textContent = a.answer || '';
        const edit = document.createElement('button'); edit.className='link'; edit.textContent='Edit';
        edit.addEventListener('click', async ()=>{
          const val = prompt('Edit answer', a.answer || ''); if(val == null) return;
          try{ await updateAnswer(serveyId, a.id, { question_id: qid, answer: val }); showMessage(container, 'Answer updated'); const all = await fetchAnswers(serveyId); renderAnswersList((Array.isArray(all)?all:[]).filter(x=>String(x.question_id)===String(qid)), container, serveyId, qid, qType); }catch(e){ showMessage(container, 'Failed to update answer', false); }
        });
        it.appendChild(edit); list.appendChild(it);
      });
      container.appendChild(list);

      // If question type is 'text' do not allow answers
      if(qType === 'text'){
        const note = document.createElement('div'); note.className='muted'; note.textContent = 'This is a text question — answers are freeform responses and not managed here.';
        container.appendChild(note);
        return;
      }

      // add new answer form
      const af = document.createElement('form'); af.className='answer-form'; af.style.marginTop='6px';
      const ai = document.createElement('input'); ai.placeholder='Answer text'; ai.type='text'; ai.style.width='70%';
      const ab = document.createElement('button'); ab.className='btn'; ab.type='submit'; ab.textContent='Add Answer';
      af.appendChild(ai); af.appendChild(ab);

      // For boolean questions limit to 2 answers
      if(qType === 'boolean'){
        if((Array.isArray(qAnswers)?qAnswers:[]).length >= 2){
          const note = document.createElement('div'); note.className='muted'; note.textContent = 'Boolean questions can only have two answers.';
          container.appendChild(note);
          return;
        }
      }

      af.addEventListener('submit', async (e)=>{ e.preventDefault(); try{ await createAnswer(serveyId, { question_id: qid, answer: ai.value }); showMessage(container, 'Answer added'); ai.value=''; const all = await fetchAnswers(serveyId); renderAnswersList((Array.isArray(all)?all:[]).filter(x=>String(x.question_id)===String(qid)), container, serveyId, qid, qType); }catch(e){ showMessage(container, 'Failed to add answer', false); } });
      container.appendChild(af);
    }

    // question form submit handler
    qForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const sid = idUpdate.value;
      if(!sid){ showMessage(container, 'Select or create a servey first', false); return; }
      const payload = { servey_id: sid, question: qText.value, type: qType.value };
      try{
        if(qSubmit.dataset.editing){ const qid = qSubmit.dataset.editing; await updateQuestion(sid, qid, payload); showMessage(container, 'Question updated'); delete qSubmit.dataset.editing; qSubmit.textContent='Add Question'; }
        else { await createQuestion(sid, payload); showMessage(container, 'Question added'); }
        qText.value=''; qType.value='text';
        refreshQuestions(sid);
      }catch(err){ showMessage(container, 'Failed to save question', false); }
    });

    // initial load
    refreshAllLists(); refreshMineList();
  }

  window.ServeyUI = { renderServeyPage };
})();
