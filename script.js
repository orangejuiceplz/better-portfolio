const links = document.querySelectorAll(".top nav a");
const sections = [...links].map((link) => document.querySelector(link.hash));

const highlight = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        for (const link of links) {
          link.toggleAttribute("aria-current", link.hash === `#${entry.target.id}`);
        }
      }
    }
  },
  { rootMargin: "-40% 0px -55% 0px" },
);

for (const section of sections) {
  highlight.observe(section);
}
