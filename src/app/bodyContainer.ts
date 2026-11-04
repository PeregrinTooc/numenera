/** The element with `id` under <body>, created on first use. */
export function ensureBodyContainer(id: string): HTMLElement {
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement("div");
    container.id = id;
    document.body.appendChild(container);
  }
  return container;
}
