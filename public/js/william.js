// Delete Book Logic

// receives request + sends response from backend API
async function deleteBook(title) {
  try {
    if (!title) {
      alert("missing parameter: title");
      return;
    }

    // call backend API asynchronously
    const res = await fetch(`/delete-book?title=${encodeURIComponent(title)}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!data.success) {
      // handle error cases
      alert(data.message);
      return;
    }

    // success case
    alert(data.message);
    // optional: refresh UI after deletion
    location.reload();

  } catch (err) {
    // log unexpected errors
    console.error("deleteBook frontend error:", err);
    alert("something went wrong — try again later");
  }
}
