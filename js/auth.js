// Auth helpers: register and login using provided API endpoints
(function () {
    const API = 'http://localhost:3000/auth';

    async function registerUser({ name, email, password }) {
        const res = await fetch(API + '/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ name, email, password }) });
        const body = await res.json();
        if (!res.ok) throw body;
        return body;
    }

    async function loginUser({ email, password }) {
        const res = await fetch(API + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email, password }) });
        const body = await res.json();
        if (!res.ok) throw body;
        // body: {token, user}
        if (body.token && body.user) {
            ServeyState.set(body.user, body.token);
        }
        return body;
    }

    window.ServeyAuth = { registerUser, loginUser };
})();
