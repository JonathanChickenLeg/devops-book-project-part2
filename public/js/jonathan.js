// Register Logic
function navRegister() {
    document.getElementById("register-section").classList.remove("hidden");
    document.getElementById("login-section").classList.add("hidden");
}

function navLogin() {
    document.getElementById("login-section").classList.remove("hidden");
    document.getElementById("register-section").classList.add("hidden");
}

async function addUser() {
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    if (!username) return alert("Enter a username");
    if (!password) return alert("Enter a password");

    try {
        const res = await fetch("/retrieve-users", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        let checkBody;
        checkBody = await res.json();
        checkData = Array.isArray(checkBody?.users) ? checkBody.users : [];

        // check if user already exists
        const existingUser = checkData.find((u) => u.username === username);
        if (existingUser) {
            return alert("Username already taken");
        }
        else
            console.log("Username available");

        // call backend to add user (include role)
        const newUser = { username, password, role: 'user' };
        const createRes = await fetch("/add-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
        });

        if (!createRes.ok) {
            const err = await createRes.json().catch(() => ({}));
            return alert(err.error || err.message || 'Failed to create user');
        }

        // navigate to login page after successful registration
        navLogin();

    } catch (err) {
        console.error("Failed to retrieve and check users:", err);
    }
};