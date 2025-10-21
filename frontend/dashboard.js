const ADMIN_KEY = sessionStorage.getItem('ADMIN_KEY');
const BASE_URL = '/admin'; // Works on live server

if(!ADMIN_KEY){
  window.location.href = 'login.html';
}

// Helpers
async function fetchJSON(url, options = {}) {
  options.headers = { ...options.headers, 'x-admin-key': ADMIN_KEY };
  const res = await fetch(url, options);
  if(res.status === 403) {
    alert('Invalid Admin Key');
    sessionStorage.removeItem('ADMIN_KEY');
    window.location.href = 'login.html';
    return null;
  }
  return res.json();
}

// --- Backend Management ---
async function loadBackends(){
  const backends = await fetchJSON(`${BASE_URL}/backends`);
  if(!backends) return;
  const list = document.getElementById('backends-list');
  const select = document.getElementById('user-backend');
  list.innerHTML = '';
  select.innerHTML = '';
  backends.forEach(b => {
    list.innerHTML += `<li>${b.backend_name} - ${b.base_url} <button onclick="deleteBackend('${b._id}')">Delete</button></li>`;
    select.innerHTML += `<option value="${b.backend_name}">${b.backend_name}</option>`;
  });
}

document.getElementById('create-backend-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('backend-name').value;
  const url = document.getElementById('backend-url').value;
  await fetchJSON(`${BASE_URL}/backends`, {
    method: 'POST',
    body: JSON.stringify({ backend_name: name, base_url: url }),
    headers: { 'Content-Type': 'application/json' }
  });
  document.getElementById('backend-name').value = '';
  document.getElementById('backend-url').value = '';
  loadBackends();
});

async function deleteBackend(id){
  await fetchJSON(`${BASE_URL}/backends/${id}`, { method: 'DELETE' });
  loadBackends();
}

// --- User Management ---
async function loadUsers(){
  const users = await fetchJSON(`${BASE_URL}/users`);
  if(!users) return;
  const list = document.getElementById('users-list');
  list.innerHTML = '';
  users.forEach(u => {
    list.innerHTML += `<li>${u.name} (${u.email}) - Key: ${u.api_key} - Backend: ${u.assigned_backend} <button onclick="deleteUser('${u._id}')">Delete</button></li>`;
  });
}

document.getElementById('create-user-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('user-name').value;
  const email = document.getElementById('user-email').value;
  const backend = document.getElementById('user-backend').value;

  await fetchJSON(`${BASE_URL}/users`, {
    method: 'POST',
    body: JSON.stringify({ name, email, assigned_backend: backend }),
    headers: { 'Content-Type': 'application/json' }
  });

  document.getElementById('user-name').value = '';
  document.getElementById('user-email').value = '';
  loadUsers();
});

// Delete user
async function deleteUser(id){
  await fetchJSON(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
  loadUsers();
}

// --- Usage ---
async function loadUsage(){
  const usage = await fetchJSON(`${BASE_URL}/usage`);
  if(!usage) return;
  const list = document.getElementById('usage-list');
  list.innerHTML = '';
  usage.forEach(u => {
    list.innerHTML += `<li>UserID: ${u.user_id} | Requests: ${u.requests_made} | Storage: ${u.storage_used_bytes} bytes</li>`;
  });
}

// Initial load
loadBackends();
loadUsers();
loadUsage();