var tooltipList: any[] = [];

document.addEventListener("registerTooltip", (event) => {
  if (event.target !== null && event.target instanceof Element) {
    tooltipList.push(new bootstrap.Tooltip(event.target));
  }
}, { capture: true });