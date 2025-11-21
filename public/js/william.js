// william.js
// Delete Book Logic + confirm popup ONLY from William

// localStorage keys
const SPAM_LOCK_KEY = "deleteLockExpire";

// confirm message
function openDeleteConfirm(bookTitle) {
  if (!confirm(`Delete "${bookTitle}"? This cannot be undone.`)) return;
  deleteBook(bookTitle); // YOUR logic ONLY
}

// receives request + sends response from backend API
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

        const expireAt = Date.now() + 20_000; // 20s lock
        localStorage.setItem(SPAM_LOCK_KEY, expireAt.toString());
        attachDeleteButtons(); // ensure buttons exist
        disableDeleteButtons(expireAt);
        return;
      }

      alert(data.message);
      return;
    }

    // success: check if server triggered spam lock
    if (res.status === 200 && data.message.includes("Do not spam")) {
      const expireAt = Date.now() + 10_000;
      localStorage.setItem(SPAM_LOCK_KEY, expireAt.toString());
      attachDeleteButtons(); // ensure buttons exist
      disableDeleteButtons(expireAt);
    }

    alert(data.message);
    // instead of location.reload(), just reload books to keep countdown
    loadBooks();
  } catch (err) {
    console.error("deleteBook frontend error:", err);
    alert("something went wrong — try again later");
  }
}

// disables delete buttons + shows countdown
function disableDeleteButtons(expireAt) {
  const buttons = document.querySelectorAll(".danger");
  buttons.forEach(btn => {
    btn.disabled = true;

    // create or reuse countdown span
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

// attach delete buttons for admin
function attachDeleteButtons() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser || currentUser.role !== "admin") return; // only admins

  document.querySelectorAll('td[data-title]').forEach(cell => {
    // only append delete button if it doesn't already exist
    if (!cell.querySelector(".danger")) {
      const bookTitle = cell.getAttribute("data-title");
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "btn small danger";
      delBtn.addEventListener("click", () => openDeleteConfirm(bookTitle));
      cell.appendChild(delBtn);
    }
  });

  // restore countdown if lock is active
  const expireAt = parseInt(localStorage.getItem(SPAM_LOCK_KEY), 10);
  if (expireAt && expireAt > Date.now()) {
    disableDeleteButtons(expireAt);
  }
}

// override loadBooks to attach buttons
const originalLoadBooks = window.loadBooks;
window.loadBooks = async function () {
  await originalLoadBooks();
  attachDeleteButtons();
};
