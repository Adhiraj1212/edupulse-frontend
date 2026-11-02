// Shared by the signed-in pages: Logout link, role-aware navbar, and
// redirect to login if the session expires.
document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll("nav ul").forEach((ul) => {
    if (ul.classList.contains("sidebar")) {
      ul.insertAdjacentHTML(
        "beforeend",
        '<li><a href="#" class="logout-link">Logout</a></li>'
      );
    } else {
      const menu = ul.querySelector(".menu-button");
      if (menu) {
        menu.insertAdjacentHTML(
          "beforebegin",
          '<li class="hideOnMobile"><a href="#" class="logout-link">Logout</a></li>'
        );
      }
    }
  });

  document.querySelectorAll(".logout-link").forEach((a) =>
    a.addEventListener("click", async (e) => {
      e.preventDefault();
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/";
    })
  );

  if (window.jQuery) {
    window.jQuery(document).ajaxError((_e, xhr) => {
      if (xhr.status === 401) window.location.href = "/login.html";
    });
  }

  // Students are read-only: hide teacher-only links and point Home at their portal.
  try {
    const me = await (await fetch("/api/me")).json();
    if (me.role === "student") {
      document
        .querySelectorAll('nav a[href="reg.html"], nav a[href="studdetails.html"]')
        .forEach((a) => a.closest("li").remove());
      document
        .querySelectorAll('nav a[href="home.html"]')
        .forEach((a) => (a.href = "student-portal.html"));
    }
  } catch (e) {
    /* navbar stays as-is */
  }
});
