(function () {
  function getCurrentUser() {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : null;
    } catch (err) {
      console.error("Failed to parse currentUser from localStorage", err);
      return null;
    }
  }

  function initUserOnPageLoad() {
    const user = getCurrentUser();
    const currentUserEl = document.getElementById("current-user");
    const logoutBtn = document.getElementById("logout-btn");
    const librarySection = document.getElementById("library-section");
    const loginSection = document.getElementById("login-section");

    // show/hide header & library
    if (user) {
      if (currentUserEl) currentUserEl.textContent = `Hello, ${user.username}`;
      if (logoutBtn) logoutBtn.classList.remove("hidden");
      if (librarySection) librarySection.classList.remove("hidden");
      if (loginSection) loginSection.classList.add("hidden");

      // show/hide admin-only elements based on role
      const addBookBtn = document.getElementById("add-book-btn");
      const actionColumn = document.getElementById("action-column");
      const actionsBox = document.querySelector(".actions");

      if (user.role !== "admin") {
        if (addBookBtn) addBookBtn.classList.add("hidden");
        if (actionColumn) actionColumn.classList.add("hidden");
        if (actionsBox) actionsBox.classList.add("hidden");
      } else {
        if (addBookBtn) addBookBtn.classList.remove("hidden");
        if (actionColumn) actionColumn.classList.remove("hidden");
        if (actionsBox) actionsBox.classList.remove("hidden");
      }
    } else {
      if (currentUserEl) currentUserEl.textContent = "";
      if (logoutBtn) logoutBtn.classList.add("hidden");
      if (librarySection) librarySection.classList.add("hidden");
      if (loginSection) loginSection.classList.remove("hidden");
    }

    // logout handler
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        document.getElementById("current-user").textContent = "";
        document.getElementById("library-section").classList.add("hidden");
        document.getElementById("login-section").classList.remove("hidden");

        // hide admin-only elements
        const addBookBtn = document.getElementById("add-book-btn");
        const actionColumn = document.getElementById("action-column");
        const actionsBox = document.querySelector(".actions");
        if (addBookBtn) addBookBtn.classList.add("hidden");
        if (actionColumn) actionColumn.classList.add("hidden");
        if (actionsBox) actionsBox.classList.add("hidden");
      });
    }
  }

  // expose globally
  window.getCurrentUser = getCurrentUser;
  window.initUserOnPageLoad = initUserOnPageLoad;
})();
