async function loginUser() {
    const username = document.getElementById("lgn-username").value.trim();
    const password = document.getElementById("lgn-password").value.trim();
    if (!username) return alert("Enter a username");
    if (!password) return alert("Enter a password");

    // call backend to get users
    try {
        const response = await fetch('/retrieve-users', { 
            method: 'GET', 
            headers: { 'Content-Type': 'application/json' } 
        });
        if (!response.ok) {
            return alert('Failed to retrieve users');
        }

        const body = await response.json();
        const users = Array.isArray(body?.users) ? body.users : [];

        // find matching user credentials
        const user = users.find(u => u && typeof u === 'object' && u.username === username && u.password === password);

        if (!user) {
            return alert('Incorrect username or password');
        }

        // successful login, store username, role and show library section
        const currentUser = { username: user.username, role: user.role};
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showLib(currentUser);

    } catch (err) {
        console.error('Error fetching users:', err);
        alert('Unable to reach server');
    }
};

// show library and check if user or admin
function showLib(user) {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("register-section").classList.add("hidden");
    document.getElementById("library-section").classList.remove("hidden");

    if (user.role === 'user') {
        document.getElementById("add-book-btn").classList.add("hidden");
        document.getElementById("action-column").classList.add("hidden")
    }
};
