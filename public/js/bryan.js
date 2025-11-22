// public/js/bryan.js
// utility functions
function qs(id) { return document.getElementById(id); }
function showEl(el) { el.classList.remove("hidden"); }
function hideEl(el) { el.classList.add("hidden"); }

// load books (read-only, no editing)
async function loadBooks() {
    try {
        const res = await fetch("/books");
        if (!res.ok) throw new Error("Failed to load books");
        const body = await res.json();
        const books = Array.isArray(body.books) ? body.books : [];
        renderBookTable(books);
        window.books = books; // for william.js to use for edit/delete
    } catch (err) {
        console.error(err);
        alert("Failed to load books");
    }
}

// render books table
function renderBookTable(books) {
    const tbody = qs("book-list");
    tbody.innerHTML = "";
    books.forEach((b) => {
        const tr = document.createElement("tr");
        const tdTitle = document.createElement("td");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = b.title;
        a.addEventListener("click", e => {
            e.preventDefault();
            openReadModal(b.title, b.content, b.author, b.user);
        });
        tdTitle.appendChild(a);

        const tdAuthor = document.createElement("td");
        tdAuthor.textContent = b.author || "";

        tr.appendChild(tdTitle);
        tr.appendChild(tdAuthor);
        tbody.appendChild(tr);
    });
}

// open read modal
function openReadModal(t, c, a, u) {
    qs("read-title").innerHTML = `<strong>Title:</strong> ${t}`;
    qs("read-content").innerHTML = `
    <p><strong>Author:</strong> ${a}</p>
    <p><strong>Owner:</strong> ${u}</p>
    <hr />
    <p>${c}</p>
  `;
    showEl(qs("read-modal"));
}

// Add Book button
const addBookBtn = qs("add-book-btn");
if (addBookBtn) {
    addBookBtn.addEventListener("click", () => {
        qs("modal-title").textContent = "Add Book";
        qs("book-title").value = "";
        qs("book-author").value = "";
        qs("book-content").value = "";
        qs("save-book-btn").dataset.mode = "add"; // mark mode
        showEl(qs("book-modal"));
    });
}

// Save book (only for add mode)
qs("save-book-btn").addEventListener("click", async () => {
    const mode = qs("save-book-btn").dataset.mode;
    if (mode !== "add") return; // ignore if not adding

    const title = qs("book-title").value.trim();
    const author = qs("book-author").value.trim();
    const content = qs("book-content").value.trim();
    if (!title || !author || !content) return alert("Please fill all fields");

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) return alert("Not authenticated");

    try {
        const res = await fetch("/books", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: currentUser.username, title, author, content })
        });

        if (!res.ok) throw new Error("Failed to add book");

        alert("Book added");
        hideEl(qs("book-modal"));
        loadBooks();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});

window.loadBooks = loadBooks;
window.openReadModal = openReadModal;

qs("cancel-btn").addEventListener("click", () => {
    hideEl(qs("book-modal"));   // just hide modal
});
