// Get key from session storage
const ADMIN_KEY = sessionStorage.getItem('ADMIN_KEY');
const BASE_URL = '/admin';

if(!ADMIN_KEY){
  // Redirect to login if key not entered
  window.location.href = 'login.html';
}

async function fetchUsers() {
  const res = await fetch(`${BASE_URL}/users`, { headers: { 'x-admin-key': ADMIN_KEY } });
  if(res.status === 403){
    alert('Invalid Admin Key');
    window.location.href = 'login.html';
    return;
  }
  const data = await res.json();
  document.getElementById('users-list').innerHTML = data.map(u => `<li>${u.name} (${u.email})</li>`).join('');
}

async function fetchBackends() {
  const res = await fetch(`${BASE_URL}/backends`, { headers: { 'x-admin-key': ADMIN_KEY } });
  const data = await res.json();
  document.getElementById('backends-list').innerHTML = data.map(b => `<li>${b.backend_name} - ${b.base_url}</li>`).join('');
}

async function fetchUsage() {
  const res = await fetch(`${BASE_URL}/usage`, { headers: { 'x-admin-key': ADMIN_KEY } });
  const data = await res.json();
  document.getElementById('usage-list').innerHTML = data.map(u => `<li>UserID: ${u.user_id} Requests: ${u.requests_made} Storage: ${u.storage_used_bytes} bytes</li>`).join('');
}