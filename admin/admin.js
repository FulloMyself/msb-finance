const ADMIN_API_URL = 'https://msb-finance.onrender.com/api';

// -------------------------
// Auth helpers
// -------------------------
function getToken() {
    return localStorage.getItem('token'); // Use same token as frontend
}

function getRole() {
    return localStorage.getItem('role');
}

function getCurrentUser() {
    const u = localStorage.getItem('currentUser');
    return u ? JSON.parse(u) : null;
}

function requireAdmin() {
    const token = getToken();
    const role = getRole();
    const user = getCurrentUser();

    if (!token || !user || role !== 'admin') {
        return false; // Don't redirect here; login screen will show
    }
    return true;
}

// -------------------------
// Screens
// -------------------------
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboardScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    const user = getCurrentUser();
    document.getElementById('adminName')?.textContent = user?.name || 'Admin';
}

// -------------------------
// API Calls
// -------------------------
async function adminLogin(email, password) {
    const res = await fetch(`${ADMIN_API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await res.json();
}

async function apiGetUsers() {
    const res = await fetch(`${ADMIN_API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.status === 401) {
        adminLogout();
        throw new Error("Unauthorized - please log in again.");
    }
    return await res.json();
}

async function apiGetLoans() {
    const res = await fetch(`${ADMIN_API_URL}/admin/loans`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await res.json();
}

async function apiUpdateLoanStatus(loanId, status) {
    const res = await fetch(`${ADMIN_API_URL}/admin/loans/${loanId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status })
    });
    return await res.json();
}

async function apiGetDocuments() {
    const res = await fetch(`${ADMIN_API_URL}/admin/docs`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await res.json();
}

// -------------------------
// Event Handlers
// -------------------------
document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const errorEl = document.getElementById('adminLoginError');
    errorEl.textContent = '';

    try {
        const res = await adminLogin(email, password);
        if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', 'admin');
            localStorage.setItem('currentUser', JSON.stringify(res.user));

            await loadAdminDashboard();
            showDashboardScreen();
        } else {
            errorEl.textContent = res.message || 'Login failed';
        }
    } catch (err) {
        errorEl.textContent = err.message || JSON.stringify(err);
    }
});

// -------------------------
// Dashboard Loading
// -------------------------
async function loadAdminDashboard() {
    if (!requireAdmin()) return;

    await loadUsers();
    await loadLoans();
    await loadDocs();
}

async function loadUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = 'Loading...';
    try {
        const res = await apiGetUsers();
        const users = res.users || [];
        if (!users.length) {
            tbody.innerHTML = '<tr><td colspan="3">No users found</td></tr>';
            return;
        }
        tbody.innerHTML = users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td></tr>`).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="3">Failed to load users</td></tr>';
        console.error(err);
    }
}

async function loadLoans() {
    const tbody = document.querySelector('#loansTable tbody');
    tbody.innerHTML = 'Loading...';
    try {
        const res = await apiGetLoans();
        const loans = res.loans || [];
        if (!loans.length) {
            tbody.innerHTML = '<tr><td colspan="5">No loans found</td></tr>';
            return;
        }
        tbody.innerHTML = loans.map(l => {
            const statusClass = l.status === 'approved' ? 'status-approved' : l.status === 'rejected' ? 'status-rejected' : 'status-pending';
            return `<tr>
                <td>${l.user.name}</td>
                <td>R${Number(l.amount).toLocaleString()}</td>
                <td>${l.termMonths || 1}</td>
                <td class="${statusClass}">${l.status.toUpperCase()}</td>
                <td>
                    ${l.status === 'pending' ? `
                        <button class="btn-approve" onclick="updateLoan('${l._id}','approved')">Approve</button>
                        <button class="btn-reject" onclick="updateLoan('${l._id}','rejected')">Reject</button>
                    ` : ''}
                </td>
            </tr>`;
        }).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5">Failed to load loans</td></tr>';
        console.error(err);
    }
}

async function updateLoan(loanId, status) {
    try {
        const res = await apiUpdateLoanStatus(loanId, status);
        if (res.loan) {
            await loadLoans();
        } else {
            alert(res.message || 'Update failed');
        }
    } catch (err) {
        alert(err.message || JSON.stringify(err));
    }
}

async function loadDocs() {
    const tbody = document.querySelector('#docsTable tbody');
    tbody.innerHTML = 'Loading...';
    try {
        const res = await apiGetDocuments();
        const docs = res.docs || [];
        if (!docs.length) {
            tbody.innerHTML = '<tr><td colspan="3">No documents found</td></tr>';
            return;
        }
        tbody.innerHTML = docs.map(d => `<tr>
            <td>${d.user.name}</td>
            <td>${d.filename}</td>
            <td>${new Date(d.uploadedAt).toLocaleDateString()}</td>
        </tr>`).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="3">Failed to load documents</td></tr>';
        console.error(err);
    }
}

// -------------------------
// Logout
// -------------------------
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
});

// -------------------------
// Init
// -------------------------
document.addEventListener('DOMContentLoaded', async () => {
    if (requireAdmin()) {
        showDashboardScreen();
        await loadAdminDashboard();
    } else {
        showLoginScreen();
    }
});
