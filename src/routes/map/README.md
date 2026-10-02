# Map + search template

A choropleth map styled to match the maps on [Explore Local Statistics (ELS)](https://www.ons.gov.uk/explore-local-statistics/), with search by area name or postcode. One area can be selected at a time, by searching or by clicking the map. Use the clear button in the search box to clear the selection.

## Files

- `+page.svelte`: loads the data and shares the selected area between the search and the map.
- `AreaSearch.svelte`: a wrapper around `AccessibleSelect` for finding one area by name or postcode. It binds `selected` (an area code), and its clear button clears the selection.
- `ChoroplethMap.svelte`: the map. It is adapted from ELS's [`Map.svelte`](https://github.com/ONSdigital/explore-local-statistics-app/blob/develop/src/lib/components/charts/Map.svelte).
- `MapLegend.svelte`: the colour key. It shows markers for the selected and hovered areas.
- `config.js`: the indicator settings (CSV path, label and number format), the geography level, the map bounds and the colours.
- `map-utils.js`: helpers for loading data, calculating breaks, assigning colours and looking up postcodes.

## Data

- **Indicator data:** `static/data/median-age.csv` has the columns `areacd,areanm,period,value`. It comes from the ELS API: `https://www.ons.gov.uk/explore-local-statistics/api/v1/data/median-age.csv?geo=ltla&time=latest`. To map another indicator, download its CSV from the same API and update `indicator` in `config.js`.
- **Boundaries:** these come from the `ltla` layer of `static/master-topo.json`. Only areas that have a row in the CSV are drawn and searchable. This leaves out the old district boundaries in the TopoJSON that overlap current ones.
- **Basemap:** `static/data/mapstyle.json`, copied from ELS.
- **Postcodes:** postcode autocomplete and lookup use [postcodes.io](https://postcodes.io/). A postcode resolves to the mapped area containing it.

## Styling (as ELS)

- **Classes and colours:** values are split into 5 classes using ckmeans natural breaks (`simple-statistics`), with the ELS sequential palette at 80% opacity.
- **Area outlines:** white lines separate areas. The hovered area gets an orange outline (`#f56927`) and the selected area a black outline (`#000000`).
