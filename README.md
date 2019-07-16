# /data

There are two types of CSV files:

1. Regular type -- Very intuitive, the columns are properly labeled.
2. Grid type -- There is a column named Latitude, the rest of the column names represented the Longitude. For the cells to the right of the Latitude column and under the Longitude column names, each cell value represents the value at the grid specified by the latitude and longitude.

Notes:
* district_to_grid_map.csv -- Maps the districts to the grids by minimizing euclidean distance.
* gadm36_IND_2_simplified.json -- The geojson for the district-level map of India. The resolution is reduced for faster visualizations.

# /src

Contains the source codes.

# Visualization (Version 2)
<a href="https://bl.ocks.org/yaoc1996/raw/f73a4b0e52def2aacf67a73f38dee65d/" >Visualization</a>

## Create your own gist visualization
* Create a github gist with index.js, index.html, and index.css from one of the versions. 
* The link to your github gist will look something like "https://gist.github.com/{your_username}/{random_string}"
* Visualize it through "https://bl.ocks.org/{your_username}/{random_string}"
