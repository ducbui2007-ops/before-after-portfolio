export interface ComparisonOptions {
  before: string;
  after: string;
  beforeFilter?: string;
  afterFilter?: string;
  alt: string;
  label?: string;
  initial?: number;
  priority?: boolean;
}

export interface ComparisonController {
  destroy(): void;
  getValue(): number;
}

/**
 * Two full-frame images, revealed with a clip rather than resized on drag.
 * Percentage always describes the visible Before area, on the left.
 */
export function mountComparison(
  host: HTMLElement,
  options: ComparisonOptions,
): ComparisonController {
  const abort = new AbortController();
  const { signal } = abort;
  const initial = options.initial ?? 30;
  let value = Number.isFinite(initial)
    ? Math.max(0, Math.min(100, initial))
    : 30;
  let activePointer: number | null = null;
  let startX = 0;
  let startY = 0;
  let pendingTouch = false;
  let dragging = false;

  host.classList.add("comparison");
  host.setAttribute("role", "group");
  host.setAttribute("aria-label", options.label ?? `So sánh: ${options.alt}`);

  function makeImage(kind: "before" | "after", src: string, filter?: string) {
    const img = document.createElement("img");
    img.className = `comparison__image comparison__image--${kind}`;
    img.src = src;
    img.alt = `${options.alt} — ${kind === "before" ? "trước" : "sau"} chỉnh sửa`;
    img.draggable = false;
    img.loading = options.priority ? "eager" : "lazy";
    img.decoding = "async";
    if (options.priority) img.fetchPriority = "high";
    if (filter) img.style.filter = filter;
    return img;
  }

  const before = makeImage("before", options.before, options.beforeFilter);
  const after = makeImage("after", options.after, options.afterFilter);
  const beforeLabel = document.createElement("span");
  beforeLabel.className = "comparison__label comparison__label--before";
  beforeLabel.textContent = "Before";
  beforeLabel.setAttribute("aria-hidden", "true");
  const afterLabel = document.createElement("span");
  afterLabel.className = "comparison__label comparison__label--after";
  afterLabel.textContent = "After";
  afterLabel.setAttribute("aria-hidden", "true");

  const divider = document.createElement("div");
  divider.className = "comparison__divider";
  const handle = document.createElement("div");
  handle.className = "comparison__handle";
  handle.tabIndex = 0;
  handle.setAttribute("role", "slider");
  handle.setAttribute(
    "aria-label",
    options.label ?? `So sánh trước và sau: ${options.alt}`,
  );
  handle.setAttribute("aria-valuemin", "0");
  handle.setAttribute("aria-valuemax", "100");
  handle.setAttribute("aria-orientation", "horizontal");

  const svgNS = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(svgNS, "svg");
  icon.classList.add("comparison__icon");
  icon.setAttribute("viewBox", "-16 -16 32 32");
  icon.setAttribute("width", "32");
  icon.setAttribute("height", "32");
  icon.setAttribute("aria-hidden", "true");
  const arrow = document.createElementNS(svgNS, "path");
  arrow.setAttribute("fill", "none");
  arrow.setAttribute("stroke", "currentColor");
  arrow.setAttribute("stroke-width", "2.2");
  arrow.setAttribute("stroke-linecap", "round");
  arrow.setAttribute("stroke-linejoin", "round");
  // This stable dot also guarantees the fully collapsed path is visible.
  const dot = document.createElementNS(svgNS, "circle");
  dot.setAttribute("cx", "0");
  dot.setAttribute("cy", "0");
  dot.setAttribute("r", "1.1");
  dot.setAttribute("fill", "currentColor");
  icon.append(arrow, dot);
  handle.append(icon);
  divider.append(handle);
  host.replaceChildren(before, after, beforeLabel, afterLabel, divider);

  function render() {
    host.style.setProperty("--position", `${value}%`);
    handle.setAttribute("aria-valuenow", String(Math.round(value)));
    handle.setAttribute(
      "aria-valuetext",
      `${Math.round(value)}% ảnh Before, ${Math.round(100 - value)}% ảnh After`,
    );

    // Keep the full circular target inside the image at either endpoint while
    // the divider continues to follow the true 0–100% reveal position.
    const width = host.getBoundingClientRect().width;
    const radius = handle.offsetWidth / 2 || 27;
    const x = (width * value) / 100;
    const correction =
      Math.max(0, radius - x) - Math.max(0, radius - (width - x));
    handle.style.marginLeft = `${correction}px`;

    // Signed distance from the centre determines direction, never drag history.
    // All path coordinates converge continuously to (0,0) at exactly 50%.
    const distance = Math.sin(((1 - value / 50) * Math.PI) / 2);
    const shaft = 10 * distance;
    const shoulder = 4 * distance;
    const head = 6 * Math.abs(distance);
    arrow.setAttribute(
      "d",
      `M ${-shaft} 0 L ${shaft} 0 M ${shoulder} ${-head} L ${shaft} 0 L ${shoulder} ${head}`,
    );
  }

  function interact() {
    host.classList.add("comparison--interacted");
  }

  function updateFromPointer(clientX: number) {
    const rect = host.getBoundingClientRect();
    if (rect.width <= 0) return;
    value = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100),
    );
    render();
  }

  function releasePointer() {
    const pointer = activePointer;
    activePointer = null;
    dragging = false;
    pendingTouch = false;
    host.classList.remove("comparison--dragging");
    if (pointer !== null && host.hasPointerCapture(pointer)) {
      host.releasePointerCapture(pointer);
    }
  }

  host.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.isPrimary || event.button !== 0 || activePointer !== null)
        return;
      interact();
      activePointer = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      pendingTouch = event.pointerType === "touch";
      dragging = !pendingTouch;
      host.setPointerCapture(event.pointerId);
      handle.focus({ preventScroll: true });
      if (dragging) {
        host.classList.add("comparison--dragging");
        updateFromPointer(event.clientX);
        event.preventDefault();
      }
      event.stopPropagation();
    },
    { signal },
  );

  host.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerId !== activePointer) return;
      if (pendingTouch) {
        const dx = Math.abs(event.clientX - startX);
        const dy = Math.abs(event.clientY - startY);
        if (dy > 6 && dy > dx) {
          releasePointer();
          return;
        }
        if (dx < 6 || dx <= dy * 1.15) return;
        pendingTouch = false;
        dragging = true;
        host.classList.add("comparison--dragging");
      }
      if (dragging) {
        if (event.cancelable) event.preventDefault();
        updateFromPointer(event.clientX);
        event.stopPropagation();
      }
    },
    { signal },
  );

  host.addEventListener(
    "pointerup",
    (event) => {
      if (event.pointerId !== activePointer) return;
      if (dragging) updateFromPointer(event.clientX);
      releasePointer();
      event.stopPropagation();
    },
    { signal },
  );

  host.addEventListener(
    "pointercancel",
    (event) => {
      if (event.pointerId === activePointer) releasePointer();
    },
    { signal },
  );

  host.addEventListener(
    "lostpointercapture",
    (event) => {
      if (event.pointerId === activePointer) releasePointer();
    },
    { signal },
  );

  // A comparison interaction must never bubble into a gallery-open action.
  host.addEventListener("click", (event) => event.stopPropagation(), {
    signal,
  });
  host.addEventListener("dragstart", (event) => event.preventDefault(), {
    signal,
  });

  // Tabbing to the slider is also the start of an intentional interaction.
  handle.addEventListener("focus", interact, { signal });

  handle.addEventListener(
    "keydown",
    (event) => {
      const step = event.shiftKey ? 10 : 1;
      let next = value;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          next += step;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next -= step;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = 100;
          break;
        default:
          return;
      }
      event.preventDefault();
      event.stopPropagation();
      interact();
      value = Math.max(0, Math.min(100, next));
      render();
    },
    { signal },
  );

  render();
  // Dialogs may be mounted before they are displayed, and responsive layouts
  // change width. Recompute only handle inset; the reveal percentage persists.
  const resizeObserver = new ResizeObserver(render);
  resizeObserver.observe(host);

  return {
    getValue: () => value,
    destroy() {
      releasePointer();
      resizeObserver.disconnect();
      abort.abort();
      host.replaceChildren();
      host.classList.remove(
        "comparison",
        "comparison--interacted",
        "comparison--dragging",
      );
      host.style.removeProperty("--position");
      host.removeAttribute("role");
      host.removeAttribute("aria-label");
    },
  };
}
