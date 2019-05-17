There are two types of CSV files:

1. Regular type -- Very intuitive, the columns are properly labeled.
2. Grid type -- There is a column named Latitude, the rest of the column names represented the Longitude. For the cells to the right of the Latitude column and under the Longitude column names, each cell value represents the value at the grid specified by the latitude and longitude.

Notes:
* district_to_grid_map.csv -- Maps the districts to the grids by minimizing euclidean distance.
* gadm36_IND_2_simplified.json -- The geojson for the district-level map of India. The resolution is reduced for faster visualizations.
