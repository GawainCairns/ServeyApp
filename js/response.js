// response.js
// Fetches a servey by s_code (query param) and renders its questions

async function init() {
	const params = new URLSearchParams(window.location.search);
	const s_code = params.get('s_code');
	const errorEl = document.getElementById('error');
	const nameEl = document.getElementById('servey-name');
	const descEl = document.getElementById('servey-desc');
	const questionsEl = document.getElementById('questions');

	if (!s_code) {
		errorEl.textContent = 'Missing s_code in URL. Append ?s_code=...';
		nameEl.textContent = 'No servey';
		return;
	}

	try {
		// 1) Get servey by s_code (assume endpoint accepts s_code as :id)
		const serveyRes = await fetch(`http://localhost:3000/servey/code/${encodeURIComponent(s_code)}`);
		if (!serveyRes.ok) throw new Error('Failed to fetch servey');
		const servey = await serveyRes.json();

		// server should return the servey object containing numeric id
		const serveyId = servey.id ?? serveyIdFromBody(servey);
		nameEl.textContent = servey.name || 'Untitled Servey';
		descEl.textContent = servey.discription || '';

		if (!serveyId) {
			errorEl.textContent = 'Server response missing servey id';
			return;
		}

		// 2) Fetch questions and answers in parallel
		const [questionsRes, answersRes] = await Promise.all([
			fetch(`http://127.0.0.1:3000/servey/${serveyId}/question`),
			fetch(`http://127.0.0.1:3000/servey/${serveyId}/answer`),
		]);

		if (!questionsRes.ok) throw new Error('Failed to fetch questions');
		if (!answersRes.ok) throw new Error('Failed to fetch answers');

		const questions = await questionsRes.json();
		const answers = await answersRes.json();

		renderQuestions(questions, answers, questionsEl);

		// wire up submit to collect responses (does not POST by default)
		const form = document.getElementById('response-form');
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const payload = collectResponses(questions);
			console.log('Collected responses:', payload);
			alert('Responses collected in console (not sent).');
		});

	} catch (err) {
		console.error(err);
		errorEl.textContent = err.message || String(err);
		nameEl.textContent = 'Error loading servey';
	}
}

function serveyIdFromBody(body) {
	// Try common fields if server returned nested payload
	if (body && typeof body === 'object') {
		if (body.data && body.data.id) return body.data.id;
		if (body.result && body.result.id) return body.result.id;
	}
	return null;
}

function renderQuestions(questions, answers, container) {
	container.innerHTML = '';
	if (!Array.isArray(questions) || questions.length === 0) {
		container.innerHTML = '<p>No questions found for this servey.</p>';
		return;
	}

	questions.forEach((q) => {
		const qWrap = document.createElement('div');
		qWrap.className = 'question';

		const label = document.createElement('label');
		label.textContent = q.question;
		label.htmlFor = `q-${q.id}`;
		qWrap.appendChild(label);

		if (q.type === 'text') {
			const ta = document.createElement('textarea');
			ta.id = `q-${q.id}`;
			ta.name = `q-${q.id}`;
			ta.rows = 4;
			ta.style.width = '100%';
			qWrap.appendChild(ta);
		} else if (q.type === 'multiple' || q.type === 'Boolean' || q.type === 'boolean') {
			const group = document.createElement('div');
			group.className = 'radio-group';

			// find answers for this question
			const opts = (Array.isArray(answers) ? answers : []).filter(a => Number(a.question_id) === Number(q.id));
			// If no options returned, attempt to fall back to typical boolean options
			if (opts.length === 0 && (q.type === 'Boolean' || q.type === 'boolean')) {
				opts.push({id: 'yes', answer: 'Yes'});
				opts.push({id: 'no', answer: 'No'});
			}

			opts.forEach((opt) => {
				const rid = `q-${q.id}-a-${opt.id}`;
				const wrapper = document.createElement('div');
				wrapper.className = 'radio-item';
				const input = document.createElement('input');
				input.type = 'radio';
				input.name = `q-${q.id}`;
				input.id = rid;
				input.value = opt.answer;

				const lbl = document.createElement('label');
				lbl.htmlFor = rid;
				lbl.textContent = opt.answer;

				wrapper.appendChild(input);
				wrapper.appendChild(lbl);
				group.appendChild(wrapper);
			});

			qWrap.appendChild(group);
		} else {
			// unknown type - show as readonly text
			const p = document.createElement('p');
			p.textContent = `Unsupported question type: ${q.type}`;
			qWrap.appendChild(p);
		}

		container.appendChild(qWrap);
	});
}

function collectResponses(questions) {
	const result = [];
	(questions || []).forEach(q => {
		const id = q.id;
		const name = `q-${id}`;
		if (q.type === 'text') {
			const val = document.querySelector(`#q-${id}`)?.value ?? '';
			result.push({question_id: id, answer: val});
		} else {
			const checked = document.querySelector(`input[name="${name}"]:checked`);
			result.push({question_id: id, answer: checked ? checked.value : null});
		}
	});
	return result;
}

window.addEventListener('DOMContentLoaded', init);

