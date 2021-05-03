// initialize Chart.js with global configuration
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

Chart.defaults.color = "#8a8a97";
Chart.defaults.plugins.legend.display = false;
Chart.defaults.plugins.tooltip.mode = "index";
Chart.defaults.plugins.tooltip.intersect = false;
Chart.defaults.plugins.tooltip.multiKeyBackground = "#000";
Chart.defaults.plugins.tooltip.titleMarginBottom = 10;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 2;
Chart.defaults.hover.mode = "index";

export {
  Chart
}
