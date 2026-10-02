// MAP CONFIG
// Styling matches the choropleth maps on Explore Local Statistics (ELS)

// Indicator to display (CSV with columns areacd, areanm, period, value)
export const indicator = {
	label: "Median age",
	unit: "years",
	source: "Office for National Statistics",
	dataPath: "/data/median-age.csv",
	decimalPlaces: 0,
	prefix: "",
	suffix: ""
};

// Geography layer from master-topo.json to draw (only areas present in the CSV are shown)
export const geoLevel = "ltla";

export const mapStylePath = "/data/mapstyle.json";
export const topoPath = "/master-topo.json";

// [west, south, east, north]
export const ukBounds = [-8.65, 49.867, 1.761, 60.856];
export const maxBounds = [-22, 48, 17, 62];

export const colors = {
	hovered: "#f56927", // Hovered area outline, legend marker and label (ONS orange)
	selected: "#000000", // Selected area outline, legend marker and label
	// ELS sequential choropleth palette (80% opacity so basemap labels show through)
	sequential: ["#eaecb1cc", "#a9d891cc", "#00a7bacc", "#004ea6cc", "#000d54cc"]
};
