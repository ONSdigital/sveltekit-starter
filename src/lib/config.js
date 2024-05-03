// ANALYTICS CONFIG
export const analyticsId = "GTM-MBCBVQS";

export const analyticsProps = {
	"contentTitle": "Product title", // Insert the title of the product here
	"releaseDate": "YYYYMMDD",
	"contentType": "content-type", // Optional: eg. scrollytelling, exploratory, edutainment?
	"outputSeries": "url-slug-for-output-series" // Should match the slug for the release on CMS
};

// CORE CONFIG
export const themes = {
  'light': {
    'text': '#222',
    'muted': '#777',
    'pale': '#f0f0f0',
    'background': '#fff'
  },
  'dark': {
    'text': '#fff',
    'muted': '#bbb',
    'pale': '#333',
    'background': '#222'
  },
  'lightblue': {
    'text': '#206095',
    'muted': '#707070',
    'pale': '#f0f0f0',
    'background': 'rgb(188, 207, 222)'
  }
}

// DEMO-SPECIFIC CONFIG

export const regions = [
  {cd: "E12000001", nm: "North East"},
  {cd: "E12000002", nm: "North West"},
  {cd: "E12000003", nm: "Yorkshire and The Humber"},
  {cd: "E12000004", nm: "East Midlands"},
  {cd: "E12000005", nm: "West Midlands"},
  {cd: "E12000006", nm: "East of England"},
  {cd: "E12000007", nm: "London"},
  {cd: "E12000008", nm: "South East"},
  {cd: "E12000009", nm: "South West"},
  {cd: "W92000004", nm: "Wales"}
];

export const colors = {
  seq: ['rgb(234, 236, 177)', 'rgb(169, 216, 145)', 'rgb(0, 167, 186)', 'rgb(0, 78, 166)', 'rgb(0, 13, 84)'],
  cat: ['#206095', '#A8BD3A', '#003C57', '#27A0CC', '#118C7B', '#F66068', '#746CB1', '#22D0B6', 'lightgrey']
};

export const units = {
  'density': 'sq.km',
  'age_med': 'years'
};