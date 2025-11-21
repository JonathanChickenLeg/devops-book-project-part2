async function loginUser() {
  const username = document.getElementById("lgn-username").value.trim();
  const password = document.getElementById("lgn-password").value.trim();
  if (!username) return alert("Enter a username");
  if (!password) return alert("Enter a password");

  try {
    const response = await fetch("/retrieve-users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      return alert("Failed to retrieve users");
    }

    const body = await response.json();
    const users = Array.isArray(body?.users) ? body.users : [];

    const user = users.find(
      (u) =>
        u &&
        typeof u === "object" &&
        u.username === username &&
        u.password === password
    );

    if (!user) {
      return alert("Incorrect username or password");
    }

    const currentUser = { username: user.username, role: user.role };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    showLib(currentUser);
  } catch (err) {
    console.error("Error fetching users:", err);
    alert("Unable to reach server");
  }
}

function showLib(user) {
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  const librarySection = document.getElementById("library-section");
  const currentUserEl = document.getElementById("current-user");
  const logoutBtn = document.getElementById("logout-btn");
  const addBookBtn = document.getElementById("add-book-btn");
  const actionColumn = document.getElementById("action-column");
  const actionsBox = document.querySelector(".actions");

  loginSection.classList.add("hidden");
  registerSection.classList.add("hidden");
  librarySection.classList.remove("hidden");

  if (currentUserEl) currentUserEl.textContent = `Hello, ${user.username}`;
  if (logoutBtn) logoutBtn.classList.remove("hidden");

  if (user.role !== "admin") {
    if (addBookBtn) addBookBtn.classList.add("hidden");
    if (actionColumn) actionColumn.classList.add("hidden");
    if (actionsBox) actionsBox.classList.add("hidden"); 
  } else {
    if (addBookBtn) addBookBtn.classList.remove("hidden");
    if (actionColumn) actionColumn.classList.remove("hidden");
    if (actionsBox) actionsBox.classList.remove("hidden");
  }

  // load books
  loadBooks();
}

document.addEventListener("DOMContentLoaded", () => {
  initUserOnPageLoad();
  loadBooks();
});
