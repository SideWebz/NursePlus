// Mark the active nav link based on the current pathname.
const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
document.querySelectorAll(".nav-link").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPath) {
    link.classList.add("nav-link--active");
    link.setAttribute("aria-current", "page");
  }
});

const toggleBtn = document.getElementById("nav-toggle");
const menu = document.getElementById("mobile-menu");

if (toggleBtn && menu) {
  let open = false;
  let closeTimer = null;

  const setOpen = (next) => {
    open = next;
    toggleBtn.classList.toggle("open", open);
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");

    if (open) {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }

      menu.hidden = false;
      menu.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      document.documentElement.classList.add("menu-open");

      requestAnimationFrame(() => {
        menu.classList.add("open");
      });

      menu.querySelectorAll(".nav-list--mobile li").forEach((item, index) => {
        item.style.setProperty("--item-index", String(index));
      });
    } else {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      document.documentElement.classList.remove("menu-open");

      closeTimer = window.setTimeout(() => {
        menu.hidden = true;
      }, 260);
    }
  };

  toggleBtn.addEventListener("click", () => setOpen(!open));

  menu.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target === menu || event.target.closest("a")) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      setOpen(false);
    }
  });
}