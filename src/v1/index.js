const url = "https://raw.githubusercontent.com/yaoc1996/india-maxt/master/";

const files = [
  "MaxT_ALL.csv", "MaxT_average.csv", "MaxT_median.csv",
  "MinT_ALL.csv", "MinT_average.csv", "MinT_median.csv",
  "mk_maxT_p.csv", "sens_maxT_slope.csv",
  "mk_minT_p.csv", "sens_minT_slope.csv",
  "mk_over90_p.csv", "sens_over90_slope.csv",
  "mk_over95_p.csv", "sens_over95_slope.csv",
  "mk_under10_p.csv", "sens_under10_slope.csv",
  "mk_under05_p.csv", "sens_under05_slope.csv",
  "mk_hottest_day_p.csv", "sens_hottest_day_slope.csv",
  "mk_coldest_day_p.csv", "sens_coldest_day_slope.csv",
  "over90.csv", "over95.csv",
  "under10.csv", "under05.csv",
  "HottestDayOccurrence.csv", "ColdestDayOccurrence.csv",
  "district_to_grid_map.csv",
]

const INDGeojsonFile  = "gadm36_IND_2_simplified.json";
const MAP_WIDTH       = 500,
      MAP_HEIGHT      = 500;

const TMAX_ABSOLUTE   = "TMax (Absolute)",
      TMAX_AVERAGE    = "TMax (Average)",
      TMAX_MEDIAN     = "TMax (Median)",
      TMIN_ABSOLUTE   = "TMin (Absolute)",
      TMIN_AVERAGE    = "TMin (Average)",
      TMIN_MEDIAN     = "TMin (Median)",
      MK_MAXT         = "Mann Kendall Pvalue (Annual Maximum Temperature)",
      SENS_MAXT       = "Sen's Estimator Slope (Annual Maximum Temperature)",
      MK_MINT         = "Mann Kendall Pvalue (Annual Minimum Temperature)",
      SENS_MINT       = "Sen's Estimator Slope (Annual Minimum Temperature)",
      MK_OVER90       = "Mann Kendall Pvalue (Number of Days over the 90th Percentile)"
      SENS_OVER90     = "Sen's Estimator Slope (Number of Days over the 90th Percentile)",
      MK_OVER95       = "Mann Kendall Pvalue (Number of Days over the 95th Percentile)"
      SENS_OVER95     = "Sen's Estimator Slope (Number of Days over the 95th Percentile)",
      MK_UNDER10      = "Mann Kendall Pvalue (Number of Days under the 10th Percentile)"
      SENS_UNDER10    = "Sen's Estimator Slope (Number of Days under the 10th Percentile)",
      MK_UNDER05      = "Mann Kendall Pvalue (Number of Days under the 5th Percentile)"
      SENS_UNDER05    = "Sen's Estimator Slope (Number of Days under the 5th Percentile)",
      MK_HOTTESTDAY   = "Mann Kendall Pvalue (Hottest Day Occurrence from Jan. 1st)"
      SENS_HOTTESTDAY = "Sen's Estimator Slope (Hottest Day Occurrence from Jan. 1st)",
      MK_COLDESTDAY   = "Mann Kendall Pvalue (Coldest Day Occurrence from Jan. 1st)"
      SENS_COLDESTDAY = "Sen's Estimator Slope (Coldest Day Occurrence from Jan. 1st)",
      SEPARATOR       = "────────────────────────────────────────"

const INDICATORS = [
  TMAX_MEDIAN,
  TMAX_AVERAGE,
  TMAX_ABSOLUTE,
  SEPARATOR,
  TMIN_MEDIAN,
  TMIN_AVERAGE,
  TMIN_ABSOLUTE,
  SEPARATOR,
  MK_MAXT,
  SENS_MAXT,
  SEPARATOR,
  MK_MINT,
  SENS_MINT,
  SEPARATOR,
  MK_OVER90,
  SENS_OVER90,
  SEPARATOR,
  MK_OVER95,
  SENS_OVER95,
  SEPARATOR,
  MK_UNDER10,
  SENS_UNDER10,
  SEPARATOR,
  MK_UNDER05,
  SENS_UNDER05,
  SEPARATOR,
  MK_HOTTESTDAY,
  SENS_HOTTESTDAY,
  SEPARATOR,
  MK_COLDESTDAY,
  SENS_COLDESTDAY,
]

const NROW = 2;
const ROWS = [...Array(NROW).keys()].map((d, i) => {
  const row = d3.select("#main")
                .append("div")
                .attr("id", `row-${i}`)
                .attr("class", "row")
                .style("width", `${MAP_WIDTH}px`)
  return row;
})

ROWS.forEach((row, i) => {
  const div = row.append("div");
  const dd1 = div.append("div")
                 .attr("class", "form-group")
                 .style("width", `${MAP_WIDTH/2-10}px`)
                 .style("margin", "5px")
                 .style("display", "inline-block")

  dd1.append("label")
     .attr("for", `dropdown-${i}-vistype`)
     .attr("class", "select-label")
     .text("Vis Type")

  dd1.append("select")
     .attr("id", `dropdown-${i}-vistype`)
     .attr("class", "form-control")
     .selectAll()
     .data(["District"])
     .enter()
     .append("option")
     .text(d => d)

  const dd2 = div.append("div")
                 .attr("class", "form-group")
                 .style("width", `${MAP_WIDTH/2-10}px`)
                 .style("margin", "5px")
                 .style("display", "inline-block")

  dd2.append("label")
     .attr("for", `dropdown-${i}-indicator`)
     .attr("class", "select-label")
     .text("Indicator")

  dd2.append("select")
     .attr("id", `dropdown-${i}-indicator`)
     .attr("class", "form-control")
     .selectAll()
     .data(INDICATORS)
     .enter()
     .append("option")
     .attr("class", d=> (d == SEPARATOR && "select-separator"))
     .text(d => d)

  dd2.selectAll(".select-separator")
     .attr("disabled", "disabled")

  row.append("div")
     .attr("id", `district-map-${i}`)
     .attr("class", `svg-wrapper map-${i}`)
     .append("svg")

  row.append("div")
     .attr("id", `plot-description-${i}`)
     .attr("class", "text-box")
     .style("width", MAP_WIDTH)
     .style("height", "95px")
     .style("margin-top", "5px")
     .style("background", "white")

  const lineDIV = row.append("div")
                     .attr("id", `line-charts-${i}`)
                     .attr("class", "svg-wrapper")
                     .style("margin-top", "10px")

  lineDIV.append("div")
         .style("margin-bottom", "10px")
         .append("svg")
         .attr("id", `over90-line-${i}`)
         .attr("class", "dependent-plot")
         .attr("width", "0")
         .attr("height", "0")

  lineDIV.append("div")
         .style("margin-bottom", "10px")
         .append("svg")
         .attr("id", `over95-line-${i}`)
         .attr("class", "dependent-plot")
         .attr("width", "0")
         .attr("height", "0")

  lineDIV.append("div")
         .append("svg")
         .attr("id", `hottestday-line-${i}`)
         .attr("class", "dependent-plot")
         .attr("width", "0")
         .attr("height", "0")
})

Promise.all([
  ...files.map(file => d3.csv(url+file)),
  d3.json(url+INDGeojsonFile)
])
  .then(callback)

function callback(data) {
  const [
    maxT, maxTAverage, maxTMedian,
    minT, minTAverage, minTMedian,
    mkMaxTP, sensMaxTSlope, 
    mkMinTP, sensMinTSlope, 
    mkOver90P, sensOver90Slope, 
    mkOver95P, sensOver95Slope, 
    mkUnder10P, sensUnder10Slope, 
    mkUnder05P, sensUnder05Slope, 
    mkHottestDayP, sensHottestDaySlope, 
    mkColdestDayP, sensColdestDaySlope, 
    over90, over95, 
    under10, under05,
    hottestDay, coldestDay,
    districtGrids, INDGeojson
  ] = data;

  const columnNames = maxT.columns;
  columnNames.splice(0, 2);

  const reduceByValue = (a, b, i) => {
    a[b] = i;
    return a;
  }

  const lngs = columnNames.map(d => parseFloat(d)),
        lats = maxT.map(d => d.Latitude);
  const gridHeight = maxT.length,
        gridWidth = columnNames.length;

  var x = [],
      y = [];

  for (var i = 0; i < gridHeight; i++) {
    for (var j = 0; j < gridWidth; j++) {
      if (maxT[i][columnNames[j]] != "") {
        x.push(lngs[j]);
        y.push(lats[i]);
      }
    }
  }

  var nIndicators = 0;
  var indicatorOptionNames = [];
  var indicatorGridDatas = [];
  var indicatorCScales = [];
  var indicatorClickable = [];
  var indicatorDescription = [];

  function addIndicatorOption(name, gridData, colorInterpolation, clickable, description="") {
    var weights = [];
    for (var i = 0; i < gridHeight; i++) {
      for (var j = 0; j < gridWidth; j++) {
        if (gridData[i][columnNames[j]] != "") {
          weights.push(parseFloat(gridData[i][columnNames[j]]))
        }
      }
    }

    const cScale = d3.scaleSequential(colorInterpolation)
                         .domain([Math.min(...weights), Math.max(...weights)]);
    
    nIndicators++;
    indicatorOptionNames.push(name);
    indicatorGridDatas.push(gridData);
    indicatorCScales.push(cScale);
    indicatorClickable.push(clickable);
    indicatorDescription.push(description);
  }

  function addSelectSeparator() {

  }

  addIndicatorOption(TMAX_MEDIAN, maxTMedian, d => d3.interpolateYlOrRd(d*0.8+0.2), true,
    "Median annual maximum temperatures from 1985 to 2014. The highest temperatures are concentrated on the central part of India.");
  addIndicatorOption(TMAX_AVERAGE, maxTAverage, d => d3.interpolateYlOrRd(d*0.8+0.2), true,
    "Average annual maximum temperatures from 1985 to 2014. The highest temperatures are concentrated on the central part of India.");
  addIndicatorOption(TMAX_ABSOLUTE, maxT, d => d3.interpolateYlOrRd(d*0.8+0.2), true,
    "Absolute annual maximum temperatures from 1985 to 2014. The highest temperatures are concentrated on the central part of India.");
  addIndicatorOption(TMIN_MEDIAN, minTMedian, d => d3.interpolateBlues((1-d)*0.8+0.2), false,
    "Median annual minimum temperatures from 1985 to 2014. The coldest temperatures are concentrated on the northern part of India.");
  addIndicatorOption(TMIN_AVERAGE, minTAverage, d => d3.interpolateBlues((1-d)*0.8+0.2), false,
    "Average annual minimum temperatures from 1985 to 2014. The coldest temperatures are concentrated on the northern part of India.");
  addIndicatorOption(TMIN_ABSOLUTE, minT, d => d3.interpolateBlues((1-d)*0.8+0.2), false,
    "Absolute annual minimum temperatures from 1985 to 2014. The coldest temperatures are concentrated on the northern part of India.");
  addIndicatorOption(MK_MAXT, mkMaxTP, d => d3.interpolateGreys(d*0.8+0.2), false,
    "P-value of the Mann Kendall test for the annual maximum temperature from 1985 to 2014. The north-eastern districts returned positve to the trend test.");
  addIndicatorOption(SENS_MAXT, sensMaxTSlope, d => d3.interpolateRdYlGn(d), false,
    "This plot corresponds to the annual maximum temperature Mann Kendall test. The slopes are calculated for districts with p-value < 0.05.");
  addIndicatorOption(MK_MINT, mkMinTP, d => d3.interpolateGreys(d*0.8+0.2), false,
    "P-value of the Mann Kendall test for the annual minimum temperature from 1985 to 2014. There isn't any visible trend in any district according to the test.");
  addIndicatorOption(SENS_MINT, sensMinTSlope, d => d3.interpolateRdYlGn(d), false,
    "There aren't any districts with p-value < 0.05, so there isn't any slope calculations.");
  addIndicatorOption(MK_OVER90, mkOver90P, d => d3.interpolateGreys(d*0.8+0.2), false,
    "P-value of the Mann Kendall test for the total number of days above the 90th percentile temperature annually from 1985 to 2014. The results are synonymous ");
  addIndicatorOption(SENS_OVER90, sensOver90Slope, d => d3.interpolateRdYlGn(d), false,
    "The Theil Sens slopes for the MK test over the total number of days above the 90th percentile temperature. The results are synonymous to the trend test for annual maximum temperature. The north-eastern part shows heavy positive trend. In addition to that, this trend test also shows some positive trend over some coastal districts of India, signifying that the number of hot days are increasing.");
  addIndicatorOption(MK_OVER95, mkOver95P, d => d3.interpolateGreys(d*0.8+0.2), false,
    "P-value of the Mann Kendall test for the total number of days above the 95th percentile temperature annually from 1985 to 2014.");
  addIndicatorOption(SENS_OVER95, sensOver95Slope, d => d3.interpolateRdYlGn(d), false,
    "The Theil Sens slopes for the MK test over the total number of days above the 95th percentile temperature. This shows similar trends to the 90th percentile trend test, further confirming that there are increasing number of extreme heat days.");
  addIndicatorOption(MK_UNDER10, mkUnder10P, d => d3.interpolateGreys(d*0.8+0.2), false,
    "P-value of the Mann Kendall test for the total number of days under the 10th percentile temperature annually from 1985 to 2014.");
  addIndicatorOption(SENS_UNDER10, sensUnder10Slope, d => d3.interpolateRdYlGn(d), false,
    "The Theil Sens slopes for the MK test over the total number of days under the 10th percentile temperature. It shows that there is a positive trend in the central districts, with the eastern ones having a higher magnitude. The negative trends occur in the southern part of India.");
  addIndicatorOption(MK_UNDER05, mkUnder05P, d => d3.interpolateGreys(d*0.8+0.2), false,
    "P-value of the Mann Kendall test for the total number of days under the 5th percentile temperature annually from 1985 to 2014.");
  addIndicatorOption(SENS_UNDER05, sensUnder05Slope, d => d3.interpolateRdYlGn(d), false, 
    "The Theil Sens slopes for the MK test over the total number of days under the 10th percentile temperature. The results are similar to the trend test under the 10th percentile temperature.");
  addIndicatorOption(MK_HOTTESTDAY, mkHottestDayP, d => d3.interpolateGreys(d*0.8+0.2), false,
    "P-value of the Mann Kendall test for the annual occurrence of the hottest day from 1985 to 2014.");
  addIndicatorOption(SENS_HOTTESTDAY, sensHottestDaySlope, d => d3.interpolateRdYlGn(d), false,
    "The Theil Sens slopes for the MK test over the annual occurrence of the hottest day from 1985 to 2014. The plot shows negative trends over the northern, western, and eastern tip of India, and positive trend in the south-eastern coast.");
  addIndicatorOption(MK_COLDESTDAY, mkColdestDayP, d => d3.interpolateGreys(d*0.8+0.2), false,
    "P-value of the Mann Kendall test for the annual occurrence of the coldest day from 1985 to 2014.");
  addIndicatorOption(SENS_COLDESTDAY, sensColdestDaySlope, d => d3.interpolateRdYlGn(d), false,
    "The Theil Sens slopes for the MK test over the annual occurrence of the hottest day from 1985 to 2014. There aren't any trends according to the MK test.");

  const lngIdx  = lngs.reduce(reduceByValue, {}),
        latIdx  = lats.reduce(reduceByValue, {});
  const districtToGrid = districtGrids.reduce((a, b) => {
    a[b["District Name"]] = [b["Grid Centroid Lng."], 
                             b["Grid Centroid Lat."],
                             b["District Centroid Lng."],
                             b["District Centroid Lat."]].map(parseFloat);
    return a;
  }, {});

  const yearStrs = over90.columns.slice(3, over90.columns.length);
  const years = yearStrs.map(d => parseInt(d));
  const reduceByGridCoord = (a, b) => {
    a[b["Grid Coordinates"]] = {
      percentileValue: b.Value,
      counts: yearStrs.map(d => b[d])
    };
    return a;
  };

  const over90dict = over90.reduce(reduceByGridCoord, {});
  const over95dict = over95.reduce(reduceByGridCoord, {});
  const under10dict = under10.reduce(reduceByGridCoord, {});
  const under05dict = under05.reduce(reduceByGridCoord, {});
  const hottestDayDict = hottestDay.reduce(reduceByGridCoord, {});
  const coldestDayDict = coldestDay.reduce(reduceByGridCoord, {});

  const linePlots = [
    Array(NROW).map(() => null),
    Array(NROW).map(() => null),
    Array(NROW).map(() => null),
  ]

  function renderDistrictMap(svgs, id) {
    var locked = false;
    var lockTarget = "";

    function mouseenter(d) {
      if (locked) return;

      const NAME1 = d["properties"]["NAME_1"],
            NAME2 = d["properties"]["NAME_2"],
            grid  = districtToGrid[NAME1+NAME2];

      const elems = svgs[0].select(`#tooltip-${id}`)
                           .selectAll(".tooltip-elem")

      elems.data(zip(["State", "Distr", "Lng", "Lat", "Value"], 
                [NAME1, NAME2, grid[2].toFixed(2), grid[3].toFixed(2), d.cScaleValue]))
           .enter()
           .append("text")
           .attr("class", "tooltip-elem")
           .attr("x", "12px")
           .attr("fill", "black")
           .style("white-space", "pre")
           .style("font-size", "12px")
           .style("font-family", "Courier New, Courier, monospace")
           .style("font-maxT_weight", "bold")
           .merge(elems)
           .attr("y", (d, i) => `${i*24+16}px`)
           .text(d => `${d[0].padEnd(7, " ")} ${d[1]}`)

      elems.exit()
          .remove()
    }

    function resetClick() {
      locked = false;
      lockTarget = "";
      resetHighlight(`.feature-${id}`)
      svgs[0].select(`.chart-tooltip`)
             .selectAll("*").remove();
      
      for (var i = 0; i < svgs[1].length; i++) {
        svgs[1][i].selectAll("*").remove();
        svgs[1][i].attr("width", "0")
                  .attr("height", "0")
        linePlots[i][id] = null;
      }

      readjustLinePlots();
    }

    function readjustLinePlots() {
      for (var i = 0; i < linePlots.length; i++) {
        var min = null, 
            max = null;
        for (var j = 0; j < linePlots[i].length; j++) {
          if (linePlots[i][j] != null) {
            if (min == null) {
              min = linePlots[i][j].minY();
              max = linePlots[i][j].maxY();
            } else {
              min = Math.min(min, linePlots[i][j].minY());
              max = Math.max(max, linePlots[i][j].maxY());
            }
          }
        }

        if (min != null && max != null)
          linePlots[i].forEach(d => (d != null) && d.updateYScale(min, max));
      }
    }

    const tooltip = {
      width: 250,
      height: 125,
    }

    const plot = geojsonPlot(svgs[0], deepClone(INDGeojson), {
      id: id,
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      padding: 10,
      title: "",
      tooltipWidth: tooltip.width,
      tooltipHeight: tooltip.height,
      tooltipTransform: `translate(${MAP_WIDTH-tooltip.width}, ${MAP_HEIGHT-tooltip.height})`,
      tooltipBgColor: "white", 
      pathStroke: "white",
      pathStrokeWidth: "1px",
      showColorScale: true,
      mouseenterfeature: mouseenter,
      clicksvg: resetClick,
      clickfeature: function(d) {
        const NAME1 = d["properties"]["NAME_1"],
              NAME2 = d["properties"]["NAME_2"],
              grid  = districtToGrid[NAME1+NAME2];

        const label = `(${grid[1]}, ${grid[0]})`;
        if (locked && lockTarget == label) {
          resetClick();
        } else {
          locked = false;
          mouseenter.bind(this)(d);
          locked = true;
          lockTarget = label
          highlight.bind(this)(`.feature-${id}`);

          const plotOptions = {
            width: MAP_WIDTH,
            height: 215,
            padding: 50,
            lineColor: "steelblue",
            plotBgColor: "#eee",
            xLabel: "Year",
            yLabel: "Number of Days"
          }

          const indicator = d3.select(`#dropdown-${id}-indicator`).node().value;

          if (indicator == TMAX_ABSOLUTE || indicator == TMAX_AVERAGE || indicator == TMAX_MEDIAN) {
            linePlots[0][id] = linePlot(svgs[1][0], years, over90dict[label].counts, {
              ...plotOptions,
              title: `Number of Days over the 90th Percentile ( ${over90dict[label].percentileValue} °C )`,
            })

            linePlots[1][id] = linePlot(svgs[1][1], years, over95dict[label].counts, {
              ...plotOptions,
              title: `Number of Days over the 95th Percentile ( ${over95dict[label].percentileValue} °C )`,
            })

            linePlots[2][id] = linePlot(svgs[1][2], years, hottestDayDict[label].counts, {
              ...plotOptions,
              line: false,
              title: `Hottest Day Occurrence (Days offset from Jan. 1st )`,
            })
          }

          if (indicator == TMIN_ABSOLUTE || indicator == TMIN_AVERAGE || indicator == TMIN_MEDIAN) {
            linePlots[0][id] = linePlot(svgs[1][0], years, under10dict[label].counts, {
              ...plotOptions,
              title: `Number of Days under the 10th Percentile ( ${under10dict[label].percentileValue} °C )`,
            })

            linePlots[1][id] = linePlot(svgs[1][1], years, under05dict[label].counts, {
              ...plotOptions,
              title: `Number of Days under the 5th Percentile ( ${under05dict[label].percentileValue} °C )`,
            })

            linePlots[2][id] = linePlot(svgs[1][2], years, coldestDayDict[label].counts, {
              ...plotOptions,
              line: false,
              title: `Coldest Day Occurrence (Days offset from Jan. 1st )`,
            })
          }

          readjustLinePlots();
        }
      },
    });

    return {
      ...plot,
      resetClick: resetClick,
    }
  }

  function updateRow(rowID, maps) {
    d3.selectAll(`.map-${rowID}`)
      .style("display", "none")

    const visType   = d3.select(`#dropdown-${rowID}-vistype`).node().value,
          indicator = d3.select(`#dropdown-${rowID}-indicator`).node().value,
          map       = maps[visType];

    function extractForDistrictMap(target) {
      return INDGeojson.features.map(d => {
        const NAME1 = d["properties"]["NAME_1"],
              NAME2 = d["properties"]["NAME_2"],
              grid  = districtToGrid[NAME1+NAME2],
              i     = lngIdx[grid[0]],
              j     = latIdx[grid[1]];
            
        if (target[j][columnNames[i]] == "")
          return null;
        else
          return parseFloat(target[j][columnNames[i]]);
      });
    }

    function extractForGridCentroidMap(target) {
      var data = [];
      for (var i = 0; i < target.length; i++) {
        for (var j = 0; j < columnNames.length; j++) {
          if (maxT[i][columnNames[j]] != "") {
            data.push(parseFloat(target[i][columnNames[j]]));
          }
        }
      }
      return data;
    }

    var extractTarget,
        extractFunction,
        scale;

    switch(visType) {
      case "District":
        d3.select(`#district-map-${rowID}`)
          .style("display", "inline-block");
        extractFunction = extractForDistrictMap;
        break;
      case "Grid Centroid":
        d3.select(`#grid-centroid-map-${rowID}`)
          .style("display", "inline-block");
        extractFunction = extractForGridCentroidMap;
        break;
      default:
        break;
    }

    for (var i = 0; i < nIndicators; i++) {
      if (indicator == indicatorOptionNames[i]) {
        extractTarget = indicatorGridDatas[i];
        scale = indicatorCScales[i];

        map.resetClick();
        break;
      }
    }

    map.recolor(extractFunction(extractTarget), scale);
    map.updateScale(scale);

    d3.select(`#plot-description-${rowID}`)
      .text(indicatorDescription[i])
  }

  ROWS.forEach((row, i) => {
    const dmap    = d3.select(`#district-map-${i} svg`),
          gcent   = d3.select(`#grid-centroid-map-${i} svg`),
          over90  = d3.select(`#over90-line-${i}`),
          over95  = d3.select(`#over95-line-${i}`),
          hottestDay = d3.select(`#hottestday-line-${i}`);

    const districtMap = renderDistrictMap([dmap, [over90, over95, hottestDay]], i);

    const maps = {
      "District": districtMap,
    }

    updateRow(i, maps);

    row.selectAll(`select`)
       .on("change", updateRow.bind(null, i, maps))

    updateRow(i, maps);
  })
}

function resetHighlight(selector) {
  d3.selectAll(selector)
    .transition("reset-highlight")
    .duration(300)
    .style("opacity", 1)
}

function highlight(selector) {
  d3.selectAll(selector)
    .transition("dimming")
    .duration(300)
    .style("opacity", 0.2)
  
  d3.select(this)
    .interrupt("dimming")
    .style("opacity", 1)
    .transition()
    .duration(300)
}


function defaultPlot(svg, options) {
  svg.attr("width", `${options.width}px`)
     .attr("height", `${options.height}px`)

  if (options.clearAll) {
    svg.selectAll("*")
       .remove()
  }

  svg.append("rect")
     .attr("class", "background")
     .attr("fill", options.bgColor)
     .attr("stroke-width", options.borderWidth)
     .attr("stroke", options.borderColor)
     .on('click', options.clicksvg || identityFunction)

  svg.append("rect")
     .attr("width", options.width-options.padding*2)
     .attr("height", options.height-options.padding*2)
     .attr("fill", options.plotBgColor)
     .attr("transform", `translate(${options.padding}, ${options.padding})`)
     .on('click', options.clicksvg || identityFunction)

  svg.append("text")
     .attr("x", 10)
     .attr("y", 20)
     .style("white-space", "pre")
     .style("font-size", "14px")
     .style("font-family", "arial")
     .text(options.title)
}

function scatterPlot(svg, x, y, weight, options={}) {
  options = {
    ...defaultScatterPlotOptions(),
    ...options,
  }

  defaultPlot(svg, options);

  if (options.xScale == identityFunction) {
    options.xScale = d3.scaleLinear()
                       .domain([Math.min(...x), Math.max(...x)])
                       .range([options.padding, options.width-options.padding])
  }

  if (options.yScale == identityFunction) {
    options.yScale = d3.scaleLinear()
                       .domain([Math.max(...y), Math.min(...y)])
                       .range([options.padding, options.width-options.padding])
  }

  var data;
  if (weight != null) {
    data = zip(x, y, weight);
  } else {
    data = zip(x, y);
  }

  svg.selectAll()
     .data(data)
     .enter()
     .append("circle")
     .attr("class", `point-${options.id}`)
     .attr("cx", d => options.xScale(d[0]))
     .attr("cy", d => options.yScale(d[1]))
     .attr("r", `${options.pointRadius}px`)
     .attr("fill", d => (d[2] != "") ? options.cScale(d[2]) : options.pointColor)
     .on("mouseenter", options.mouseenterpoint)
     .on("mouseleave", options.mouseleavepoint)
     .on("click", options.clickpoint)

  function color(newData, newScale) {
    svg.selectAll(`.point-${options.id}`)
       .data(zip(x, y, newData))
       .transition()
       .duration(300)
       .attr("fill", d => (d[2] != "") ? newScale(d[2]) : options.pointColor)
  }

  color(data, options.cScale);

  var colorScale = {
    update: identityFunction,
  };

  if (options.showColorScale) {
    colorScale = attachColorScale(svg, options);
  }

  attachTooltip(svg, options);

  return {
    recolor: color,
    updateScale: colorScale.update,
    disableClick: function() {
      svg.selectAll(`.point-${options.id}`)
         .on("click", null)
    },
    enableClick: function() {
      svg.selectAll(`.point-${options.id}`)
         .on("click", options.clickpoint)
    }
  }
}

function linePlot(svg, x, y, options={}) {
  options = {
    ...defaultLinePlotOptions(),
    ...options,
  }

  defaultPlot(svg, options);

  const minX = Math.min(...x),
        maxX = Math.max(...x),
        minY = Math.min(...y),
        maxY = Math.max(...y);

  const xscale = d3.scaleLinear()
                   .domain([minX, maxX])
                   .range([options.padding+5, options.width-options.padding-5])

  const yscale = d3.scaleLinear()
                   .domain([minY, maxY])
                   .range([options.height-options.padding-5, options.padding+5])

  var plotteddata;
  if (options.line) {
    plotteddata = svg.append("polyline")
                     .attr("points", zip(x, y).map(d => `${xscale(d[0])}, ${yscale(d[1])}`).join(" "))
                     .attr("stroke-width", options.lineWidth)
                     .attr("stroke", options.lineColor)
                     .attr("fill", "none")
  } else {
    plotteddata = svg.selectAll("points")
                     .data(zip(x, y))
                     .enter()
                     .append("circle")
                     .attr("r", options.lineWidth)
                     .attr("cx", d => xscale(d[0]))
                     .attr("cy", d => yscale(d[1]))
                     .attr("stroke", options.lineColor)
  }

  const xAxis = svg.append("g")
                   .attr("transform", `translate(0, ${options.height-options.padding})`)

  xAxis.call(d3.axisBottom()
               .scale(xscale)
               .ticks(x.length))
       .selectAll("text")
       .attr("dx", "-18px")
       .attr("dy", "6px")
       .attr("transform", "rotate(-45)");

  svg.append("text")
     .attr("class", "axis-label")
     .attr("transform", `translate(${options.width/2}, ${options.height-5})`)
     .text(options.xLabel)

  const yAxis = svg.append("g")
                   .attr("transform", `translate(${options.padding}, 0)`)
                  
  yAxis.call(d3.axisLeft()
       .scale(yscale)
       .ticks(6))

  svg.append("text")
     .attr("class", "axis-label")
     .attr("transform", `rotate(-90, ${15}, ${options.height/2}) translate(${15}, ${options.height/2})`)
     .text(options.yLabel)

  return {
    minY() {
      return minY;
    },
    maxY() {
      return maxY;
    },
    updateYScale(updateMinY, updateMaxY) {
      const newMinY = Math.min(minY, updateMinY),
            newMaxY = Math.max(maxY, updateMaxY);

      const newYScale = d3.scaleLinear()
                          .domain([newMinY, newMaxY])
                          .range([options.height-options.padding-5, options.padding+5]);

      if (options.line) {
        plotteddata.attr("points", zip(x, y).map(d => `${xscale(d[0])}, ${newYScale(d[1])}`).join(" "));
      } else {
        plotteddata.attr("cy", d => newYScale(d[1]));
      }
                          
      yAxis.selectAll("*").remove()
      yAxis.call(d3.axisLeft()
                   .scale(newYScale)
                   .ticks(6))
    }
  }
}

function geojsonPlot(svg, geojson, options) {
  options = {
    ...defaultGeojsonOptions(),
    ...options,
  }

  defaultPlot(svg, options);

  const proj = d3.geoMercator()
                 .fitSize([options.width-(2*options.padding), options.height-(2*options.padding)], geojson),
        path = d3.geoPath()
                 .projection(proj);

  svg.append("g")
     .selectAll(`.feature-${options.id}`)
     .data(geojson.features)
     .enter()
     .append("path")
     .attr("class", `feature-${options.id}`)
     .attr("d", path)
     .attr("stroke", options.pathStroke)
     .attr("stroke-width", options.pathStrokeWidth)
     .attr("transform", `translate(${options.padding}, ${options.padding+20})`)
     .attr("fill", d => d.cScaleValue ? options.cScale(d.cScaleValue) : "transparent")
     .on("mouseenter", options.mouseenterfeature)
     .on("mouseleave", options.mouseleavefeature)
     .on("click", options.clickfeature)

  function color(newData, newScale) {
    geojson.features.forEach((feature, i) => {
      feature.cScaleValue = newData[i];
    })

    svg.selectAll(`.feature-${options.id}`)
       .data(geojson.features)
       .transition()
       .duration(300)
       .attr("fill", d => d.cScaleValue ? newScale(d.cScaleValue) : "transparent")
  }

  var colorScale = {
    update: identityFunction,
  };

  if (options.showColorScale) {
    colorScale = attachColorScale(svg, options);
  }

  attachTooltip(svg, options);

  return {
    recolor: color,
    updateScale: colorScale.update,
    disableClick: function() {
      svg.selectAll(`.feature-${options.id}`)
         .on("click", null)
    },
    enableClick: function() {
      svg.selectAll(`.feature-${options.id}`)
         .on("click", options.clickfeature)
    }
  }
}

function attachColorScale(svg, options) {
  const gradientID = "color-scale-gradient-" + `${options.id}`;
  const gradient = svg.append("defs")
                      .append("linearGradient")
                      .attr("id", gradientID)

  const colorLegend = svg.append('g')
                          .attr("transform", `translate(${options.width-options.padding-150}, 20)`)

  colorLegend.append("rect")
              .attr("width", 150)
              .attr("height", 10)
              .style("fill", `url(#${gradientID})`);

  const axis = colorLegend.append("g")
                          .attr("transform", "translate(0, 10)")

  axis.selectAll("path")
      .style("display", "none")
  axis.selectAll("line")
      .style("stroke", "#333")

  function update (scale) {
    var stops = svg.select(`#${gradientID}`)
                    .selectAll("stop")
                    .data(scale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: scale(t) })))

    stops.enter()
          .append("stop")
          .merge(stops)
          .attr("offset", d => d.offset)
          .attr("stop-color", d => d.color);
        
    stops.exit()
          .remove()

    axis.call(d3.axisBottom()
                .scale(d3.scaleLinear()
                          .domain(scale.domain())
                          .range([0, 150]))
                .ticks(4)
                .tickSize(-10))

    axis.selectAll("path")
        .style("display", "none")
    axis.selectAll("line")
        .style("stroke", "#333")
  }
                    
  if (options.cScale != identityFunction) {
    update(options.cScale);
  }

  return {
    update: update,
  }
}

function attachTooltip(svg, options) {
  svg.append("rect")
     .attr("width", `${options.tooltipWidth}px`)
     .attr("height", `${options.tooltipHeight}px`)
     .attr("transform", options.tooltipTransform)
     .attr("fill", options.tooltipBgColor)
     .attr("stroke-width", "1px")
     .attr("stroke", "#333")

  const tooltip = svg.append("g")
                     .attr("id", `tooltip-${options.id}`) 
                     .attr("class", "chart-tooltip")
                     .attr("width", `${options.tooltipWidth}px`)
                     .attr("height", `${options.tooltipHeight}px`)
                     .attr("transform", options.tooltipTransform)
}

function defaultPlotOptions() {
  return {
    id: null,
    bgColor: "#fafafa",
    plotBgColor: "transparent",
    borderColor: "#ccc",
    borderWidth: 1,
    width: 300,
    height: 300,
    padding: 50,
    title: "",
    clearAll: true,
  }
}

function defaultScatterPlotOptions() {
  return {
    ...defaultPlotOptions(),
    ...defaultTooltipOptions(),
    pointColor: "transparent",
    pointRadius: 3,
    showColorScale: false,
    xScale: identityFunction,
    yScale: identityFunction,
    cScale: identityFunction,
    mouseenterpoint: identityFunction,
    mouseleavepoint: identityFunction,
    clickpoint: identityFunction,
  }
}

function defaultLinePlotOptions() {
  return {
    ...defaultPlotOptions(),
    line: true,
    lineColor: "#333",
    lineWidth: 1,
  }
}

function defaultGeojsonOptions() {
  return {
    ...defaultPlotOptions(),
    ...defaultTooltipOptions(),
    pathStroke: "transparent",
    pathStrokeWidth: "1",
    cScale: identityFunction,
    showColorScale: false,
    mouseenterfeature: identityFunction,
    mouseleavefeature: identityFunction,
    clickfeature: identityFunction,
  }
}

function defaultTooltipOptions() {
  return {
    tooltipWidth: 100,
    tooltipHeight: 100,
    tooltipBgColor: "#ccc",
    tooltipTransform: "",
  }
}

function zip(...arrs) {
  return arrs[0].map((val, i) => arrs.map(e => e[i]));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function identityFunction() {}