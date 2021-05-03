// get chart components
import {
	Chart,
	Legend,
	Tooltip,
	Filler,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	LineController,
  BarElement,
  BarController,
  ArcElement,
  DoughnutController
} from "chart.js";

// register chart components
Chart.register(
	Legend,
	Tooltip,
	Filler,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	LineController,
  BarElement,
  BarController,
  ArcElement,
  DoughnutController
);

// set global configuration
Chart.defaults.color = "#8a8a97";
Chart.defaults.plugins.legend.display = false;
Chart.defaults.plugins.tooltip.mode = "index";
Chart.defaults.plugins.tooltip.intersect = false;
Chart.defaults.plugins.tooltip.multiKeyBackground = "#000";
Chart.defaults.plugins.tooltip.titleMarginBottom = 10;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 2;
Chart.defaults.hover.mode = "index";

// provide transparent gradient coloring based on one single color
const transparentGradient = (ctx, chartArea, hexColor, horizontal=false) => {
	const gradient = horizontal
		? ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
		: ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
	gradient.addColorStop(0, hexColor.slice(0, 7) + '00');
	gradient.addColorStop(1, hexColor.slice(0, 7) + '77');
  return gradient;
}

export {
  Chart,
	transparentGradient
}
