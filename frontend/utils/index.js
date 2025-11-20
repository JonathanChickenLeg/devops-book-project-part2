let currentUser = null;
let books = [];
let editIndex = null;

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const librarySection = document.getElementById("library-section");
const userDisplay = document.getElementById("current-user");
const logoutBtn = document.getElementById("logout-btn");
const addBookBtn = document.getElementById("add-book-btn");
const bookList = document.getElementById("book-list");

// Book modal
const bookModal = document.getElementById("book-modal");
const modalTitle = document.getElementById("modal-title");
const bookTitleInput = document.getElementById("book-title");
const bookAuthorInput = document.getElementById("book-author");
const bookContentInput = document.getElementById("book-content");
const saveBookBtn = document.getElementById("save-book-btn");
const cancelBtn = document.getElementById("cancel-btn");

// Read modal
const readModal = document.getElementById("read-modal");
const readTitle = document.getElementById("read-title");
const readContent = document.getElementById("read-content");
const closeReadBtn = document.getElementById("close-read-btn");


// -----------------
// LOGIN / REGISTER
// -----------------

// login logic
document.getElementById("login-btn").addEventListener("click", async () => {
  const username = document.getElementById("lgn-username").value.trim();
  const password = document.getElementById("lgn-password").value.trim();
  if (!username) return alert("Enter a username");
  if (!password) return alert("Enter a password");

  try {
    const res = await fetch("http://localhost:3000/api/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let data = await res.json();

    const user = data.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) return alert("Incorrect username or password");

    currentUser = username;
    localStorage.setItem("currentUser", currentUser);
    showLibrary();

  } catch (err) {
    console.error("Failed to fetch users:", err);
  }
});


// register logic
document.getElementById("register-btn").addEventListener("click", async () => {
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  if (!username) return alert("Enter a username");
  if (!password) return alert("Enter a password");

  try {
    const res = await fetch("http://localhost:3000/api/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let checkData = await res.json();

    const existingUser = checkData.find((u) => u.username === username);
    if (existingUser) return alert("Username already taken");

    await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    showLogin();

  } catch (err) {
    console.error("Failed to register:", err);
  }
});

// switch tabs
document.getElementById("register-nav").addEventListener("click", showRegister);
document.getElementById("login-nav").addEventListener("click", showLogin);

// LOGOUT
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("currentUser");
  showLogin();
});


// -----------------
// SHOW / RENDER UI
// -----------------
function showLogin() {
  loginSection.classList.remove("hidden");
  registerSection.classList.add("hidden");
  librarySection.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  userDisplay.textContent = "";
}

function showRegister() {
  loginSection.classList.add("hidden");
  registerSection.classList.remove("hidden");
  librarySection.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  userDisplay.textContent = "";
}

async function showLibrary() {
  loginSection.classList.add("hidden");
  registerSection.classList.add("hidden");
  librarySection.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  userDisplay.textContent = `Hello, ${currentUser}`;

  try {
    const res = await fetch("http://localhost:3000/api/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let data = await res.json();
    const checkRole = data.find(
      (u) => u.username === currentUser && u.role === "user"
    );

    if (checkRole) {
      addBookBtn.classList.add("hidden");
      document.getElementById("action-column").classList.add("hidden");
    } else {
      addBookBtn.classList.remove("hidden");
      document.getElementById("action-column").classList.remove("hidden");
    }

  } catch (err) {
    console.error("Failed to check user role:", err);
  }

  await fetchBooks();
  renderBooks();
}


// -----------------
// FETCH BOOKS
// -----------------
async function fetchBooks() {
  const res = await fetch(`http://localhost:3000/api/books/${currentUser}`);
  books = await res.json();
}


// -----------------
// RENDER BOOKS
// -----------------
function renderBooks() {
  bookList.innerHTML = "";

  books.forEach((book, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>
        <button onclick="readBook(${index})">Read</button>
        <button onclick="editBook(${index})">Edit</button>
        <button onclick="deleteBook(${index})">Delete</button>
      </td>
    `;

    bookList.appendChild(row);
  });
}


// -----------------
// ADD / EDIT BOOK
// -----------------

addBookBtn.addEventListener("click", () => {
  modalTitle.textContent = "Add Book";
  editIndex = null;
  bookTitleInput.value = "";
  bookAuthorInput.value = "";
  bookContentInput.value = "";
  bookModal.classList.remove("hidden");
});

saveBookBtn.addEventListener("click", async () => {
  const title = bookTitleInput.value.trim();
  const author = bookAuthorInput.value.trim();
  const content = bookContentInput.value.trim();
  if (!title || !author || !content)
    return alert("Please fill all fields");

  const body = {
    user: currentUser,
    title,
    author,
    content,
    editIndex,
  };

  await fetch("http://localhost:3000/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  bookModal.classList.add("hidden");
  await showLibrary();
});


// -----------------
// EDIT BOOK
// -----------------
window.editBook = (index) => {
  const book = books[index];
  editIndex = index;

  modalTitle.textContent = "Edit Book";
  bookTitleInput.value = book.title;
  bookAuthorInput.value = book.author;
  bookContentInput.value = book.content;

  bookModal.classList.remove("hidden");
}; 


// -----------------
// DELETE BOOK
// -----------------
window.deleteBook = async (index) => {
  if (!confirm("Are you sure you want to delete this book?")) return;

  const book = books[index];

  await fetch(
    `http://localhost:3000/api/books/${currentUser}/${encodeURIComponent(
      book.title
    )}`,
    { method: "DELETE" }
  );

  await showLibrary();
};


// -----------------
// READ BOOK
// -----------------
window.readBook = (index) => {
  const book = books[index];
  readTitle.textContent = book.title;
  readContent.textContent = book.content;
  readModal.classList.remove("hidden");
};


// -----------------
// CLOSE MODALS
// -----------------
cancelBtn.addEventListener("click", () => bookModal.classList.add("hidden"));
closeReadBtn.addEventListener("click", () => readModal.classList.add("hidden"));


// -----------------
// INIT
// -----------------
currentUser = localStorage.getItem("currentUser") || null;
if (currentUser) showLibrary();
else showLogin();
