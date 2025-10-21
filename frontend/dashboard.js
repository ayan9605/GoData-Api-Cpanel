const ADMIN_KEY = '@12345678'; // replace with your admin key
const BASE_URL = 'https://godata-api-cpanel.onrender.com/admin';

async function fetchUsers() {
  const res = await fetch(`${BASE_URL}/users`, { headers: { 'x-admin-key': ADMIN_KEY } });
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