// william.js
// Admin-only actions: Edit/Update + Delete Books

// localStorage keys
const SPAM_LOCK_KEY = "deleteLockExpire";

// confirm delete popup
function openDeleteConfirm(bookTitle) {
    if (!confirm(`Delete "${bookTitle}"? This cannot be undone.`)) return;
    deleteBook(bookTitle); // call backend delete only
}

// delete book request
async function deleteBook(title) {
    try {
        if (!title) {
            alert("missing parameter: title");
            return;
        }

        const res = await fetch(`/delete-book?title=${encodeURIComponent(title)}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (!res.ok) {
            if (res.status === 429) {
                alert(data.message);
                const expireAt = Date.now() + 25_000; // 25s delete button lock
                localStorage.setItem(SPAM_LOCK_KEY, expireAt.toString());
                disableDeleteButtons(expireAt);
                return;
            }
            alert(data.message);
            return;
        }

        // spam lock from server
        if (res.status === 200 && data.message.includes("Do not spam, wat 25s")) {
            const expireAt = Date.now() + 10_000;
            localStorage.setItem(SPAM_LOCK_KEY, expireAt.toString());
            disableDeleteButtons(expireAt);
        }

        alert(data.message);
        loadBooks(); // refresh table
    } catch (err) {
        console.error("deleteBook frontend error:", err);
        alert("something went wrong — try again later");
    }
}

// disables delete buttons + countdown
function disableDeleteButtons(expireAt) {
    const buttons = document.querySelectorAll(".danger");
    buttons.forEach(btn => {
        btn.disabled = true;
        let span = btn.nextElementSibling;
        if (!span || !span.classList.contains("countdown")) {
            span = document.createElement("span");
            span.className = "countdown";
            span.style.color = "red";
            span.style.marginLeft = "8px";
            btn.parentNode.insertBefore(span, btn.nextSibling);
        }

        function updateCountdown() {
            const now = Date.now();
            const remaining = Math.ceil((expireAt - now) / 1000);
            if (remaining <= 0) {
                btn.disabled = false;
                span.textContent = "";
                localStorage.removeItem(SPAM_LOCK_KEY);
                clearInterval(interval);
            } else {
                span.textContent = `Time Remaining: ${remaining}s`;
            }
        }

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
    });
}

// Edit and Delete buttons for admin only
function attachAdminButtons(tr, book) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser || currentUser.role !== "admin") return;

    const tdActions = document.createElement("td");
    tdActions.style.whiteSpace = "nowrap";
    tdActions.setAttribute("data-title", book.title);

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn small edit";
    editBtn.addEventListener("click", () => openEditModal(book));
    tdActions.appendChild(editBtn);

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn small danger";
    delBtn.addEventListener("click", () => openDeleteConfirm(book.title));
    tdActions.appendChild(delBtn);

    tr.appendChild(tdActions);
}

// override loadBooks to attach admin buttons
const originalLoadBooks = window.loadBooks;
window.loadBooks = async function () {
    await originalLoadBooks();

    const tbody = document.querySelector("#book-list");
    const rows = tbody.querySelectorAll("tr");
    const books = window.books || [];

    rows.forEach(tr => {
        const titleCell = tr.querySelector("td:first-child a");
        if (!titleCell) return;

        const book = books.find(b => b.title === titleCell.textContent);
        if (book) attachAdminButtons(tr, book);
    });

    const expireAt = parseInt(localStorage.getItem(SPAM_LOCK_KEY), 10);
    if (expireAt && expireAt > Date.now()) disableDeleteButtons(expireAt);
};

// open edit modal
function openEditModal(book) {
    qs("modal-title").textContent = "Edit Book";
    // cancel add/edit book modal
    qs("cancel-btn").addEventListener("click", () => {
        hideEl(qs("book-modal"));   // just hide modal
    });
    qs("book-title").value = book.title;
    qs("book-author").value = book.author;
    qs("book-content").value = book.content;
    qs("save-book-btn").dataset.mode = "edit"; // mark mode for edit
    showEl(qs("book-modal"));

    window.editingOriginalTitle = book.title;
}

// save edited book (PUT only)
qs("save-book-btn").addEventListener("click", async () => {
    if (qs("save-book-btn").dataset.mode !== "edit") return; // ignore if not editing
    const title = qs("book-title").value.trim();
    const author = qs("book-author").value.trim();
    const content = qs("book-content").value.trim();
    if (!title || !author || !content) return alert("Please fill all fields");
    if (!window.editingOriginalTitle) return alert("Select a book to edit");

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) return alert("Not authenticated");

    try {
        const res = await fetch(
            `/books/${encodeURIComponent(window.editingOriginalTitle)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, author, content }),
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to update book");
        }

        alert("Book updated");
        hideEl(qs("book-modal"));
        window.editingOriginalTitle = null;
        loadBooks();
    } catch (err) {
        console.error(err);
        alert(err.message || "Save failed");
    }
});
