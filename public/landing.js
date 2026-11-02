document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  // --- login modal ---
  const modal = document.getElementById("modal");
  const open = () => {
    modal.hidden = false;
    modal.querySelector(".choice").focus();
  };
  const close = () => (modal.hidden = true);
  const loginBtn = document.getElementById("loginBtn");
  const heroLogin = document.getElementById("heroLogin");
  loginBtn.addEventListener("click", open);
  heroLogin.addEventListener("click", open);
  document.getElementById("mClose").addEventListener("click", close);
  modal.addEventListener("click", (e) => e.target === modal && close());
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());

  // Already signed in: the button goes straight to the right portal.
  fetch("/api/me")
    .then((r) => r.json())
    .then((me) => {
      if (!me.role) return;
      const portal = me.role === "student" ? "/student-portal.html" : "/home.html";
      loginBtn.textContent = "Open portal";
      heroLogin.textContent = "Open portal";
      [loginBtn, heroLogin].forEach((b) => {
        const fresh = b.cloneNode(true); // drops the modal listener
        fresh.addEventListener("click", () => (window.location.href = portal));
        b.replaceWith(fresh);
      });
    })
    .catch(() => {});

  // --- animated network background ---
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w, h, pts;

  const resize = () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    const n = Math.min(90, Math.floor((w * h) / 18000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * 0.7, h * 0.1, 0, w * 0.7, h * 0.1, w * 0.7);
    g.addColorStop(0, "rgba(139,92,246,0.22)");
    g.addColorStop(1, "rgba(5,6,15,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (const p of pts) {
      if (!reduce) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(34,211,238,0.85)";
      ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 140) {
          ctx.strokeStyle = `rgba(139,92,246,${0.35 * (1 - d / 140)})`;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    if (!reduce) requestAnimationFrame(draw);
  };

  addEventListener("resize", () => {
    resize();
    if (reduce) draw();
  });
  resize();
  draw();
});
