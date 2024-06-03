var tooltipList: any[] = [];

document.addEventListener("registerTooltip", (event) => {
  console.log("registerTooltip1");
  if (event.target !== null && event.target instanceof Element) {
    console.log("registerTooltip2");
    tooltipList.push(new bootstrap.Tooltip(event.target));
  }
}, { capture: true });