import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/latin-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-500.css";
import "@fontsource/be-vietnam-pro/latin-500.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/latin-600.css";
import "@fontsource/newsreader/vietnamese-400.css";
import "@fontsource/newsreader/latin-400.css";
import "@fontsource/newsreader/vietnamese-400-italic.css";
import "@fontsource/newsreader/latin-400-italic.css";
import "./style.css";
import { categories, projects, site, type Project } from "./config";
import { mountComparison } from "./comparison";

const arrow =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const expand =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/></svg>';
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
const hero =
  projects.find((project) => project.id === site.heroProjectId) ?? projects[0];
document.title = `${site.companyName} — Một góc nhìn mới`;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <a class="skip-link" href="#portfolio">Đến bộ sưu tập</a>
  <header class="header shell">
    <a class="brand" href="#" aria-label="${escape(site.companyName)} — đầu trang">
      ${site.logo ? `<img class="brand__logo" src="${escape(site.logo)}" alt=""/>` : '<span class="brand__symbol" aria-hidden="true"><i></i></span>'}
      <span>${escape(site.companyName)}<span class="brand__period">.</span></span>
      ${site.demo ? '<span class="demo-brand">STUDIO DEMO</span>' : ""}
    </a>
    <nav aria-label="Điều hướng chính"><a href="#portfolio">Portfolio</a><a class="nav-contact" href="#contact">Contact <span aria-hidden="true">↗</span></a></nav>
  </header>
  <main>
    <section class="hero shell" aria-labelledby="hero-title">
      <div class="hero__intro">
        <div><p class="eyebrow"><span class="status-dot"></span> CHỈNH SỬA ẢNH KIẾN TRÚC & BẤT ĐỘNG SẢN</p>
        <h1 id="hero-title">Mọi không gian.<br/><em>Một góc nhìn mới.</em></h1></div>
        <div class="hero__aside"><p>Tôn lên ánh sáng, chất liệu và cảm xúc.<br/>Để mỗi khung hình kể trọn câu chuyện<br class="desktop-break"/> của một không gian.</p><a class="text-link" href="#portfolio">Khám phá bộ sưu tập <span class="round-arrow">${arrow}</span></a></div>
      </div>
      <div class="hero__image-wrap"><div class="hero__comparison" id="hero-comparison"></div>${hero.demo ? '<span class="image-demo">ẢNH MINH HỌA · DEMO</span>' : ""}<button class="expand-button hero__expand" type="button" aria-label="Xem lớn: ${escape(hero.title)}">${expand}</button></div>
      <div class="hero__caption"><span class="drag-hint"><svg viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="m5 4-4 4 4 4m14-8 4 4-4 4M1 8h22"/></svg> Kéo để khám phá sự khác biệt</span><span class="hero__image-name">${escape(hero.title)} <span> / 01</span></span></div>
      <div class="service-line" aria-label="Nhóm dịch vụ"><span>Ánh sáng & màu sắc</span><span class="service-star" aria-hidden="true">✳</span><span>Không gian nội thất</span><span class="service-star" aria-hidden="true">✳</span><span>Kiến trúc ngoại thất</span><span class="service-star" aria-hidden="true">✳</span><span>Từng chi tiết, trọn cảm xúc</span></div>
    </section>
    <section class="portfolio shell" id="portfolio" aria-labelledby="portfolio-title">
      <div class="section-heading"><div><p class="eyebrow">01 / GÓC NHÌN ĐƯỢC CHỌN</p><h2 id="portfolio-title">Chi tiết nhỏ.<br/><em>Khác biệt lớn.</em></h2></div><p class="section-description">Một không gian, hai cách cảm nhận.<br/>Kéo để so sánh. Mở ảnh để nhìn gần hơn.</p></div>
      <div class="portfolio__toolbar"><div class="filters" role="group" aria-label="Lọc theo nhóm dịch vụ">${categories.map((category) => `<button type="button" data-filter="${category.id}" class="filter${category.id === "all" ? " is-active" : ""}" aria-pressed="${category.id === "all"}">${category.label}</button>`).join("")}</div><p class="project-count" role="status" aria-live="polite"><span id="result-count">04</span> KHUNG HÌNH</p></div>
      <div class="project-grid"></div>
      ${projects.some((project) => project.demo) ? '<p class="demo-note"><span aria-hidden="true">ⓘ</span> Các hình ảnh gắn nhãn Demo mô phỏng sáng/màu từ cùng một ảnh mẫu, không phải dự án khách hàng.</p>' : ""}
    </section>
    <section class="contact" id="contact" aria-labelledby="contact-title"><div class="shell contact__inner"><div><p class="eyebrow">02 / CÙNG TẠO NÊN KHUNG HÌNH ĐẸP</p><h2 id="contact-title">Không gian của bạn.<br/><em>Góc nhìn tiếp theo.</em></h2><p>Bắt đầu từ những bức ảnh của bạn.<br/>Cùng tìm cách thể hiện không gian trọn vẹn hơn.</p></div><div class="contact__details"></div></div></section>
  </main>
  <footer class="footer shell"><a class="brand brand--footer" href="#">${escape(site.companyName)}<span class="brand__period">.</span></a><p>${site.demo ? escape(site.companyNote) : "Chỉnh sửa ảnh kiến trúc & bất động sản"}</p><a href="#">Về đầu trang <span aria-hidden="true">↑</span></a></footer>
  <dialog class="lightbox" aria-labelledby="lightbox-title" aria-describedby="lightbox-description"><div class="lightbox__inner"><div class="lightbox__heading"><div><p class="eyebrow" id="lightbox-category"></p><h2 id="lightbox-title"></h2></div><button class="lightbox__close" type="button" aria-label="Đóng ảnh (Escape)"><svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div><div class="lightbox__image"></div><div class="lightbox__footer"><p id="lightbox-description"></p><span class="lightbox__tip">← → để so sánh · Esc để đóng</span></div></div></dialog>
`;

function comparisonOptions(project: Project, priority = false) {
  return {
    before: project.before,
    after: project.after,
    beforeFilter: project.beforeFilter,
    afterFilter: project.afterFilter,
    alt: project.alt,
    label: `So sánh ${project.title}`,
    initial: 30,
    priority,
  };
}
const heroComparison = mountComparison(
  document.querySelector<HTMLElement>("#hero-comparison")!,
  comparisonOptions(hero, true),
);
document
  .querySelector(".hero__expand")!
  .addEventListener("click", () =>
    openProject(hero, heroComparison.getValue()),
  );

let comparisons: ReturnType<typeof mountComparison>[] = [];
function renderProjects(category = "all") {
  comparisons.forEach((comparison) => comparison.destroy());
  const visible = projects.filter(
    (project) => category === "all" || project.category === category,
  );
  const grid = document.querySelector<HTMLElement>(".project-grid")!;
  grid.innerHTML = visible
    .map(
      (project) =>
        `<article class="project" data-project="${project.id}"><div class="project__image-wrap"><div class="project__comparison"></div>${project.demo ? '<span class="image-demo">DEMO</span>' : ""}<button class="expand-button" type="button" data-open="${project.id}" aria-label="Xem lớn: ${escape(project.title)}">${expand}</button></div><div class="project__details"><div><p class="project__category">${escape(project.service)}</p><h3><button type="button" data-open="${project.id}">${escape(project.title)} <span aria-hidden="true">↗</span></button></h3></div><span class="project__number" aria-hidden="true">${String(projects.indexOf(project) + 1).padStart(2, "0")}</span></div></article>`,
    )
    .join("");
  comparisons = visible.map((project) =>
    mountComparison(
      grid.querySelector<HTMLElement>(
        `[data-project="${project.id}"] .project__comparison`,
      )!,
      comparisonOptions(project),
    ),
  );
  grid.querySelectorAll<HTMLButtonElement>("[data-open]").forEach((button) =>
    button.addEventListener("click", () => {
      const index = visible.findIndex(
        (project) => project.id === button.dataset.open,
      );
      openProject(visible[index], comparisons[index].getValue());
    }),
  );
  document.querySelector("#result-count")!.textContent = String(
    visible.length,
  ).padStart(2, "0");
}
renderProjects();
document
  .querySelectorAll<HTMLButtonElement>("[data-filter]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      document
        .querySelectorAll<HTMLButtonElement>("[data-filter]")
        .forEach((filter) => {
          const active = filter === button;
          filter.classList.toggle("is-active", active);
          filter.setAttribute("aria-pressed", String(active));
        });
      renderProjects(button.dataset.filter);
    }),
  );

const dialog = document.querySelector<HTMLDialogElement>(".lightbox")!;
let modalComparison: ReturnType<typeof mountComparison> | undefined;
let previousFocus: HTMLElement | null = null;
function openProject(project: Project, initial = 30) {
  previousFocus = document.activeElement as HTMLElement;
  document.querySelector("#lightbox-title")!.textContent = project.title;
  document.querySelector("#lightbox-category")!.textContent =
    `${project.demo ? "DEMO / " : ""}${project.service}`;
  document.querySelector("#lightbox-description")!.textContent =
    project.description;
  modalComparison?.destroy();
  modalComparison = mountComparison(
    document.querySelector<HTMLElement>(".lightbox__image")!,
    { ...comparisonOptions(project, true), initial },
  );
  dialog.showModal();
  document.documentElement.classList.add("modal-open");
  document.querySelector<HTMLButtonElement>(".lightbox__close")!.focus();
}
function closeProject() {
  dialog.close();
}
dialog
  .querySelector(".lightbox__close")!
  .addEventListener("click", closeProject);
dialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const controls = [
    ...dialog.querySelectorAll<HTMLElement>('button, [tabindex="0"]'),
  ];
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});
let backdropDown = false;
dialog.addEventListener("pointerdown", (event) => {
  backdropDown = event.target === dialog;
});
dialog.addEventListener("pointerup", (event) => {
  if (backdropDown && event.target === dialog) closeProject();
  backdropDown = false;
});
dialog.addEventListener("close", () => {
  document.documentElement.classList.remove("modal-open");
  modalComparison?.destroy();
  modalComparison = undefined;
  previousFocus?.focus();
});

const contact = document.querySelector<HTMLElement>(".contact__details")!;
const links: string[] = [];
if (site.email)
  links.push(
    `<a class="contact__link" href="mailto:${escape(site.email)}">${escape(site.email)} ${arrow}</a>`,
  );
if (site.phone)
  links.push(
    `<a class="contact__link" href="tel:${escape(site.phone.replace(/[^+\d]/g, ""))}">${escape(site.phone)} ${arrow}</a>`,
  );
if (site.contactUrl && /^https:\/\//.test(site.contactUrl))
  links.push(
    `<a class="contact__link" href="${escape(site.contactUrl)}" target="_blank" rel="noopener noreferrer">Gửi ảnh & trao đổi ${arrow}</a>`,
  );
contact.innerHTML = links.length
  ? `<p class="eyebrow">KẾT NỐI VỚI CHÚNG TÔI</p>${links.join("")}${site.location ? `<p>${escape(site.location)}</p>` : ""}`
  : `<div class="contact__placeholder"><p class="eyebrow">SẮP KẾT NỐI</p><p>Thông tin liên hệ đang được cập nhật.</p><span>Bản demo chưa nhận ảnh hay yêu cầu dịch vụ.</span></div>`;
