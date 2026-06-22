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

  const setOpen = (next) => {
    open = next;
    toggleBtn.classList.toggle("open", open);
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
    menu.classList.toggle("open", open);

    if (open) {
      menu.hidden = false;
    }
  };

  // Hide element after close transition ends.
  menu.addEventListener("transitionend", () => {
    if (!open) menu.hidden = true;
  });

  // Toggle on button click.
  toggleBtn.addEventListener("click", () => setOpen(!open));

  // Close on link click or backdrop click.
  menu.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest("a") || e.target === menu) setOpen(false);
  });

  // Close on ESC.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) setOpen(false);
  });
}
