const url = "https://raw.githubusercontent.com/yaoc1996/india-maxt/master/data";
const rawDir = "/raw_by_district";

const files = [
  "/MaxT_ALL.csv", "/MaxT_average.csv", "/MaxT_median.csv",
  "/MinT_ALL.csv", "/MinT_average.csv", "/MinT_median.csv",
  // "mk_maxT_p.csv", "sens_maxT_slope.csv",
  // "mk_minT_p.csv", "sens_minT_slope.csv",
  // "mk_over90_p.csv", "sens_over90_slope.csv",
  // "mk_over95_p.csv", "sens_over95_slope.csv",
  // "mk_under10_p.csv", "sens_under10_slope.csv",
  // "mk_under05_p.csv", "sens_under05_slope.csv",
  // "mk_hottest_day_p.csv", "sens_hottest_day_slope.csv",
  // "mk_coldest_day_p.csv", "sens_coldest_day_slope.csv",
  "/over90.csv", "/over95.csv",
  "/under10.csv", "/under05.csv",
  "/HottestDayOccurrence.csv", "/ColdestDayOccurrence.csv",
  "/district_to_grid_map.csv",
]

const INDGeojsonFile = "/gadm36_IND_2_simplified.json";
const MAP_HEIGHT = window.innerHeight-150,
      MAP_WIDTH = Math.min(window.innerHeight-150, 512);

const TMAX_ABSOLUTE = "TMax (Absolute)",
  TMAX_AVERAGE = "TMax (Average)",
  TMAX_MEDIAN = "TMax (Median)",
  TMIN_ABSOLUTE = "TMin (Absolute)",
  TMIN_AVERAGE = "TMin (Average)",
  TMIN_MEDIAN = "TMin (Median)",
  // MK_MAXT = "Mann Kendall Pvalue (Annual Maximum Temperature)",
  // SENS_MAXT = "Sen's Estimator Slope (Annual Maximum Temperature)",
  // MK_MINT = "Mann Kendall Pvalue (Annual Minimum Temperature)",
  // SENS_MINT = "Sen's Estimator Slope (Annual Minimum Temperature)",
  // MK_OVER90 = "Mann Kendall Pvalue (Number of Days over the 90th Percentile)",
  // SENS_OVER90 = "Sen's Estimator Slope (Number of Days over the 90th Percentile)",
  // MK_OVER95 = "Mann Kendall Pvalue (Number of Days over the 95th Percentile)",
  // SENS_OVER95 = "Sen's Estimator Slope (Number of Days over the 95th Percentile)",
  // MK_UNDER10 = "Mann Kendall Pvalue (Number of Days under the 10th Percentile)",
  // SENS_UNDER10 = "Sen's Estimator Slope (Number of Days under the 10th Percentile)",
  // MK_UNDER05 = "Mann Kendall Pvalue (Number of Days under the 5th Percentile)",
  // SENS_UNDER05 = "Sen's Estimator Slope (Number of Days under the 5th Percentile)",
  // MK_HOTTESTDAY = "Mann Kendall Pvalue (Hottest Day Occurrence from Jan. 1st)",
  // SENS_HOTTESTDAY = "Sen's Estimator Slope (Hottest Day Occurrence from Jan. 1st)",
  // MK_COLDESTDAY = "Mann Kendall Pvalue (Coldest Day Occurrence from Jan. 1st)",
  // SENS_COLDESTDAY = "Sen's Estimator Slope (Coldest Day Occurrence from Jan. 1st)",
  SEPARATOR = "─────";

const INDICATORS = [
  TMAX_MEDIAN,
  TMAX_AVERAGE,
  TMAX_ABSOLUTE,
  SEPARATOR,
  TMIN_MEDIAN,
  TMIN_AVERAGE,
  TMIN_ABSOLUTE,
  // SEPARATOR,
  // MK_MAXT,
  // SENS_MAXT,
  // SEPARATOR,
  // MK_MINT,
  // SENS_MINT,
  // SEPARATOR,
  // MK_OVER90,
  // SENS_OVER90,
  // SEPARATOR,
  // MK_OVER95,
  // SENS_OVER95,
  // SEPARATOR,
  // MK_UNDER10,
  // SENS_UNDER10,
  // SEPARATOR,
  // MK_UNDER05,
  // SENS_UNDER05,
  // SEPARATOR,
  // MK_HOTTESTDAY,
  // SENS_HOTTESTDAY,
  // SEPARATOR,
  // MK_COLDESTDAY,
  // SENS_COLDESTDAY,
]

const NROW = 1;
const ROWS = [...Array(NROW).keys()].map((d, i) => {
  const row = d3.select("#main")
    .append("div")
    .attr("id", `row-${i}`)
    .attr("class", "row")
  // .style("width", `${MAP_WIDTH}px`)
  return row;
})

ROWS.forEach((row, i) => {
  const div = row.append("div")
    .style("display", "inline-block")

  const dd1 = div.append("div")
    .style("display", "block")
    .style("width", `${MAP_WIDTH}px`)
    .style("margin-bottom", "10px")

  const dd11 = dd1.append("div")
    .attr("class", "form-group")
    .style("width", `${MAP_WIDTH / 2 - 10}px`)
    .style("margin", "5px")
    .style("display", "inline-block")

  dd11.append("label")
    .attr("for", `dropdown-${i}-vistype`)
    .attr("class", "select-label")
    .text("Vis Type")

  dd11.append("select")
    .attr("id", `dropdown-${i}-vistype`)
    .attr("class", "form-control")
    .selectAll()
    .data(["District"])
    .enter()
    .append("option")
    .text(d => d)

  const dd12 = dd1.append("div")
    .attr("class", "form-group")
    .style("width", `${MAP_WIDTH / 2 - 10}px`)
    .style("margin", "5px")
    .style("display", "inline-block")

  dd12.append("label")
    .attr("for", `dropdown-${i}-indicator`)
    .attr("class", "select-label")
    .text("Indicator")

  dd12.append("select")
    .attr("id", `dropdown-${i}-indicator`)
    .attr("class", "form-control")
    .selectAll()
    .data(INDICATORS)
    .enter()
    .append("option")
    .attr("class", d => (d == SEPARATOR && "select-separator"))
    .text(d => d)

  dd12.selectAll(".select-separator")
    .attr("disabled", "disabled")

  div.append("div")
    .attr("id", `district-map-${i}`)
    .attr("class", `svg-wrapper map-${i}`)
    .append("svg")

  // row.append("div")
  //    .attr("id", `plot-description-${i}`)
  //    .attr("class", "text-box")
  //    .style("width", MAP_WIDTH)
  //    .style("height", "95px")
  //    .style("margin-top", "5px")
  //    .style("background", "white")

  const lineDIV = div.append("div")
    .attr("id", `line-charts-${i}`)
    .attr("class", "svg-wrapper")
    .style("margin-left", "10px")
    .style("margin-right", "10px")
    .style('height', `${MAP_HEIGHT}px`)
    .style('overflow-y', 'auto')

  lineDIV.append("div")
    .append("svg")
    .attr("id", `over90-line-${i}`)
    .attr("class", "dependent-plot")
    .attr("width", "0")
    .attr("height", "0")

  lineDIV.append("div")
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

  lineDIV.append("div")
    .attr('class', 'form-group')
    .style('display', 'inline-block')
    .style('width', '100px')
    .style('margin', '6px')
    .style('margin-top', '12px')
    .append("select")
    .attr("id", `dropdown-${i}-year-select`)
    .attr("class", "form-control")
    .style('opacity', 0)
    .selectAll()
    .data([...Array(30).keys()].map(d => d+1985))
    .enter()
    .append("option")
    .text(d => d)

  lineDIV.append("div")
    .append("svg")
    .attr("id", `dailytemp-line-${i}`)
    .attr("class", "dependent-plot")
    .attr("width", "0")
    .attr("height", "0")
})

Promise.all([
  d3.json(url + INDGeojsonFile),
  ...files.map(file => d3.csv(url + file)),
])
  .then(callback)

function callback(data) {
  const [
    INDGeojson,
    maxT, maxTAverage, maxTMedian,
    minT, minTAverage, minTMedian,
    // mkMaxTP, sensMaxTSlope, 
    // mkMinTP, sensMinTSlope, 
    // mkOver90P, sensOver90Slope, 
    // mkOver95P, sensOver95Slope, 
    // mkUnder10P, sensUnder10Slope, 
    // mkUnder05P, sensUnder05Slope, 
    // mkHottestDayP, sensHottestDaySlope, 
    // mkColdestDayP, sensColdestDaySlope, 
    over90, over95,
    under10, under05,
    hottestDay, coldestDay,
    districtGrids,
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

  function addIndicatorOption(name, gridData, colorInterpolation, clickable, description = "") {
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

  addIndicatorOption(TMAX_MEDIAN, maxTMedian, d => d3.interpolateYlOrRd(d * 0.8 + 0.2), true,
    "Median annual maximum temperatures from 1985 to 2014. The highest temperatures are concentrated on the central part of India.");
  addIndicatorOption(TMAX_AVERAGE, maxTAverage, d => d3.interpolateYlOrRd(d * 0.8 + 0.2), true,
    "Average annual maximum temperatures from 1985 to 2014. The highest temperatures are concentrated on the central part of India.");
  addIndicatorOption(TMAX_ABSOLUTE, maxT, d => d3.interpolateYlOrRd(d * 0.8 + 0.2), true,
    "Absolute annual maximum temperatures from 1985 to 2014. The highest temperatures are concentrated on the central part of India.");
  addIndicatorOption(TMIN_MEDIAN, minTMedian, d => d3.interpolateBlues((1 - d) * 0.8 + 0.2), false,
    "Median annual minimum temperatures from 1985 to 2014. The coldest temperatures are concentrated on the northern part of India.");
  addIndicatorOption(TMIN_AVERAGE, minTAverage, d => d3.interpolateBlues((1 - d) * 0.8 + 0.2), false,
    "Average annual minimum temperatures from 1985 to 2014. The coldest temperatures are concentrated on the northern part of India.");
  addIndicatorOption(TMIN_ABSOLUTE, minT, d => d3.interpolateBlues((1 - d) * 0.8 + 0.2), false,
    "Absolute annual minimum temperatures from 1985 to 2014. The coldest temperatures are concentrated on the northern part of India.");

  const lngIdx = lngs.reduce(reduceByValue, {});
  const latIdx = lats.reduce(reduceByValue, {});

  const districtToGrid = districtGrids.reduce((a, b) => {
    a[b["District Name"]] = [
      b["Grid Centroid Lng."],
      b["Grid Centroid Lat."],
      b["District Centroid Lng."],
      b["District Centroid Lat."]
    ].map(parseFloat);
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
    Array(NROW).map(() => null),
  ]

  function renderDistrictMap(svgs, id) {
    var locked = false;
    var lockTarget = "";

    const mapPlotTooltip = {
      width: 200,
      height: 125,
    }

    const tooltipItems = ["State", "District", "Lng", "Lat", "Value"];

    function mouseenter(d) {
      if (locked) return;

      const districtKey = d["properties"]["NAME_1"] + d["properties"]["NAME_2"];

      const tooltipItemValues = [
        d["properties"]["NAME_1"],
        d["properties"]["NAME_2"],
        districtToGrid[districtKey][2],
        districtToGrid[districtKey][3],
        d.cScaleValue,
      ];

      svgs[0].select(`#tooltip-${id}`)
        .style("opacity", 1)
        .selectAll(".tooltip-elem")
        .remove()

      const items = svgs[0].select(`#tooltip-${id}`)
        .selectAll(".tooltip-elem")
        .data(zip(tooltipItems, tooltipItemValues))
        .enter()

      items.append("g")
        .attr("class", "tooltip-elem")
        .attr("transform", (d, i) => `translate(0, ${i * 25 + 18})`)
        .selectAll(".text-contents")
        .data(d => d)
        .enter()
        .append("text")
        .attr("class", "text-contents")
        .attr("x", (d, i) => 10 + i * 70)
        .attr("fill", "black")
        .style("white-space", "pre")
        .style("font-size", "12px")
        .style("font-family", "Roboto,\"Helvetica Neue\",Helvetica,Arial,sans-serif")
        .style("font-weight", (d, i) => i == 0 ? "bold" : "normal")
        .text(d => isNaN(d) ? d : parseFloat(d).toFixed(2))

      items.append("line")
        .attr("x1", 63)
        .attr("x2", 63)
        .attr("y1", 0)
        .attr("y2", mapPlotTooltip.height)
        .attr("stroke", "white")
        .attr("stroke-width", "1px")

      items.append("line")
        .attr("x1", 0)
        .attr("x2", mapPlotTooltip.width)
        .attr("y1", (d, i) => mapPlotTooltip.height / tooltipItems.length * i)
        .attr("y2", (d, i) => mapPlotTooltip.height / tooltipItems.length * i)
        .attr("stroke", "white")
        .attr("stroke-width", "1px")
        .style("opacity", (d, i) => i == 0 ? 0 : 1)

    }

    function resetClick() {
      locked = false;
      lockTarget = "";
      resetHighlight(`.feature-${id}`)
      svgs[0].select(`.chart-tooltip`)
        .style("opacity", 0);

      for (var i = 0; i < svgs[1].length; i++) {
        svgs[1][i].selectAll("*").remove();
        svgs[1][i].attr("width", "0")
          .attr("height", "0")
        linePlots[i][id] = null;
      }

      d3.select(`#dropdown-${id}-year-select`)
        .style('opacity', 0)

      reAdjustLinePlots();
    }

    function reAdjustLinePlots() {
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


    function clickedDistrict(d) {
      const NAME1 = d["properties"]["NAME_1"],
        NAME2 = d["properties"]["NAME_2"],
        grid = districtToGrid[NAME1 + NAME2],
        cleanName = (NAME1 + NAME2).replace(/\s/g, '');

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
          width: 1024,
          height: 256,
          paddingLeft: 50,
          paddingRight: 50,
          paddingTop: 40,
          paddingBottom: 50,
          lineColor: "lightsteelblue",
          pointColor: "steelblue",
          bgColor: '#fff',
          plotBgColor: "#fff",
          xLabel: "Year",
          yLabel: "Number of Days",
          lineWidth: 1,
          pointRadius: 2,
          tooltipWidth: 100,
          tooltipHeight: 25,
          tooltipBgColor: 'black',
          tooltipBorderWidth: '0px',
          tooltipCornerRadius: 2,
          collisionRadius: 8,
        }

        const indicator = d3.select(`#dropdown-${id}-indicator`).node().value;

        if (indicator == TMAX_ABSOLUTE || indicator == TMAX_AVERAGE || indicator == TMAX_MEDIAN) {
          linePlots[0][id] = linePlot(svgs[1][0], years, over90dict[label].counts, {
            ...plotOptions,
            id: 'tmax-over-90-' + cleanName,
            title: `Number of Days over the 90th Percentile ( ${parseFloat(over90dict[label].percentileValue).toFixed(2)} °C )`,
            mouseEnterPlotPoint: displayPointInfoCount('tmax-over-90-' + cleanName, d => d[0], d => d[1]),
            mouseLeavePlotPoint: hideTooltip.bind(null, 'tmax-over-90-' + cleanName),
          })

          linePlots[1][id] = linePlot(svgs[1][1], years, over95dict[label].counts, {
            ...plotOptions,
            id: 'tmax-over-95-' + cleanName,
            title: `Number of Days over the 95th Percentile ( ${parseFloat(over95dict[label].percentileValue).toFixed(2)} °C )`,
            mouseEnterPlotPoint: displayPointInfoCount('tmax-over-95-' + cleanName, d => d[0], d => d[1]),
            mouseLeavePlotPoint: hideTooltip.bind(null, 'tmax-over-95-' + cleanName),
          })

          linePlots[2][id] = linePlot(svgs[1][2], years, hottestDayDict[label].counts, {
            ...plotOptions,
            line: false,
            id: 'tmax-hottest-' + cleanName,
            title: `Hottest Day Occurrence (Days offset from Jan. 1st )`,
            mouseEnterPlotPoint: displayPointInfoDate('tmax-hottest-' + cleanName, d => d[0], d => d[1]),
            mouseLeavePlotPoint: hideTooltip.bind(null, 'tmax-hottest-' + cleanName),
          })
        }

        if (indicator == TMIN_ABSOLUTE || indicator == TMIN_AVERAGE || indicator == TMIN_MEDIAN) {
          linePlots[0][id] = linePlot(svgs[1][0], years, under10dict[label].counts, {
            ...plotOptions,
            id: 'tmin-over-90-' + cleanName,
            title: `Number of Days under the 10th Percentile ( ${under10dict[label].percentileValue} °C )`,
            mouseEnterPlotPoint: displayPointInfoCount('tmin-over-90-' + cleanName, d => d[0], d => d[1]),
            mouseLeavePlotPoint: hideTooltip.bind(null, 'tmin-over-90-' + cleanName),
          })

          linePlots[1][id] = linePlot(svgs[1][1], years, under05dict[label].counts, {
            ...plotOptions,
            id: 'tmin-over-95-' + cleanName,
            title: `Number of Days under the 5th Percentile ( ${under05dict[label].percentileValue} °C )`,
            mouseEnterPlotPoint: displayPointInfoCount('tmin-over-95-' + cleanName, d => d[0], d => d[1]),
            mouseLeavePlotPoint: hideTooltip.bind(null, 'tmin-over-95-' + cleanName),
          })

          linePlots[2][id] = linePlot(svgs[1][2], years, coldestDayDict[label].counts, {
            ...plotOptions,
            line: false,
            id: 'tmin-coldest-' + cleanName,
            title: `Coldest Day Occurrence (Days offset from Jan. 1st )`,
            mouseEnterPlotPoint: displayPointInfoDate('tmin-coldest-' + cleanName, d => d[0], d => d[1]),
            mouseLeavePlotPoint: hideTooltip.bind(null, 'tmin-coldest-' + cleanName),
          })
        }

        var isMin = indicator == TMIN_ABSOLUTE || indicator == TMIN_AVERAGE || indicator == TMIN_MEDIAN;

        d3.json(url+rawDir+`/${cleanName}_raw.json`)
          .then(json => {
            const dd = d3.select(`#dropdown-${id}-year-select`)

            const newPO = {
              ...plotOptions,
              height: 384,
              collisionRadius: 2,
              id: 'dailytemp-'+cleanName,
              title: 'Daily Maximum Temperature',
              xLabel: "Day of the Year",
              yLabel: "Temperature",
              mouseEnterPlotPoint: displayPointInfoDate('dailytemp-' + cleanName, d => dd.node().value, d => d[0], d => `, T=${parseFloat(d[1]).toFixed(2)}`),
              mouseLeavePlotPoint: hideTooltip.bind(null, 'dailytemp-' + cleanName),
            }

            dd.on('change', d => {
              drawDailyTempLineChart(json[NAME1+NAME2], dd.node().value, newPO, isMin, 
                (isMin) ? under10dict[label].percentileValue : over90dict[label].percentileValue,
                (isMin) ? under05dict[label].percentileValue : over95dict[label].percentileValue
              );
            });
            
            drawDailyTempLineChart(json[NAME1+NAME2], dd.node().value, newPO, isMin, 
              (isMin) ? under10dict[label].percentileValue : over90dict[label].percentileValue,
              (isMin) ? under05dict[label].percentileValue : over95dict[label].percentileValue
            );

            dd.style('opacity', 1)
          });


        reAdjustLinePlots();
      }

      function drawDailyTempLineChart(data, year, plotOptions, isMin, firstPV, secondPV) {
        const numDays = (year % 4 == 0) ? 366 : 365;
        const days = [...Array(numDays).keys()].map(d => d+1);

        const baseYear = 1985;

        linePlots[3][id] = linePlot(svgs[1][3], days, data[year-baseYear], plotOptions);

        var labels = null;
        var colors = null;
        var xOffset = null;
        var yOffsets = null;

        if (!isMin) {
          labels = ['90th', '95th'];
          colors = ['lightsalmon', 'red'];
          xOffset = 5;
          yOffsets = [15, -5];
        } else {
          labels = ['10th', '5th'];
          colors = ['royalblue', 'cornflowerblue'];
          xOffset = 300
          yOffsets = [-5, 15];
        }

        svgs[1][3].insert('line', 'polyline')
          .attr('x1', linePlots[3][id].xscale.range()[0])
          .attr('x2', linePlots[3][id].xscale.range()[1])
          .attr('y1', linePlots[3][id].yscale(parseFloat(firstPV)))
          .attr('y2', linePlots[3][id].yscale(parseFloat(firstPV)))
          .attr('stroke-width', '1px')
          .attr('stroke', colors[0])

        svgs[1][3].insert('line', 'polyline')
          .attr('x1', linePlots[3][id].xscale.range()[0])
          .attr('x2', linePlots[3][id].xscale.range()[1])
          .attr('y1', linePlots[3][id].yscale(parseFloat(secondPV)))
          .attr('y2', linePlots[3][id].yscale(parseFloat(secondPV)))
          .attr('stroke-width', '1px')
          .attr('stroke', colors[1])

        svgs[1][3].append('text')
          .attr('x', linePlots[3][id].xscale.range()[0]+xOffset)
          .attr('y', linePlots[3][id].yscale(parseFloat(firstPV))+yOffsets[0])
          .style('font-size', 10)
          .style('fill', colors[0])
          .text(`${labels[0]} Percentile: ${parseFloat(firstPV).toFixed(2)}`)

        svgs[1][3].append('text')
          .attr('x', linePlots[3][id].xscale.range()[0]+xOffset)
          .attr('y', linePlots[3][id].yscale(parseFloat(secondPV))+yOffsets[1])
          .style('font-size', 10)
          .style('fill', colors[1])
          .text(`${labels[1]} Percentile: ${parseFloat(secondPV).toFixed(2)}`)
      }

      function displayPointInfoDate(id, getYear, getDay, additionalInfo=d=>'') {
        return function (d) {
          const dayOfYear = parseInt(getDay(d));
          const date = new Date(getYear(d), 0, dayOfYear);

          d3.select('#tooltip-' + id)
            .attr('transform', `translate(${d3.event.offsetX+10}, ${d3.event.offsetY-35})`)
            .style('opacity', 1)
            .selectAll('text')
            .remove()

          const text = d3.select('#tooltip-' + id)
            .append('text')
            .attr('x', 5)
            .attr('y', 15.5)
            .style('font-size', '10px')
            .style('fill', 'white')
            .text(date.toDateString()+additionalInfo(d))

          const bbox = text.node().getBBox();

          d3.select('#tooltip-' + id)
            .select('rect')
            .attr('width', bbox.width+10)
            .attr('height', bbox.height+10)
        }
      }

      function displayPointInfoCount(id) {
        return function(d) {
          d3.select('#tooltip-' + id)
            .attr('transform', `translate(${d3.event.offsetX+10}, ${d3.event.offsetY-35})`)
            .style('opacity', 1)
            .selectAll('text')
            .remove()

          const text = d3.select('#tooltip-' + id)
            .append('text')
            .attr('x', 5)
            .attr('y', 15.5)
            .style('font-size', '10px')
            .style('fill', 'white')
            .text(d[1])

          const bbox = text.node().getBBox();

          d3.select('#tooltip-' + id)
            .select('rect')
            .attr('width', bbox.width+10)
            .attr('height', bbox.height+10)
          
        }
      }

      function hideTooltip(id) {
        d3.select('#tooltip-' + id)
          .attr('transform', '')
          .style('opacity', 0)
      }
    }

    const plot = geojsonPlot(svgs[0], deepClone(INDGeojson), {
      id: id,
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 10,
      paddingBottom: 10,
      title: "",
      tooltipWidth: mapPlotTooltip.width,
      tooltipHeight: mapPlotTooltip.height,
      tooltipTransform: `translate(${MAP_WIDTH - mapPlotTooltip.width - 10}, ${MAP_HEIGHT - mapPlotTooltip.height - 10})`,
      tooltipBgColor: "lightsteelblue",
      tooltipBorderWidth: "0px",
      tooltipCornerRadius: "4px",
      pathStroke: "white",
      pathStrokeWidth: "1px",
      showColorScale: true,
      mouseEnterFeature: mouseenter,
      clicksvg: resetClick,
      clickFeature: clickedDistrict,
      mouseScrolled: scrolled,
    });

    function scrolled() {
      return;
      // hidden zooming functionality
      if (d3.event.wheelDelta > 0) {
        plot.zoomIn(d3.event.offsetX, d3.event.offsetY);
      }
      if (d3.event.wheelDelta < 0) {
        plot.zoomOut(d3.event.offsetX, d3.event.offsetY);
      }
    }


    return {
      ...plot,
      resetClick: resetClick,
    }
  }


  function updateRow(rowID, maps) {
    d3.selectAll(`.map-${rowID}`)
      .style("display", "none")

    const visType = d3.select(`#dropdown-${rowID}-vistype`).node().value,
      indicator = d3.select(`#dropdown-${rowID}-indicator`).node().value,
      map = maps[visType];

    function extractForDistrictMap(target) {
      return INDGeojson.features.map(d => {
        const NAME1 = d["properties"]["NAME_1"],
          NAME2 = d["properties"]["NAME_2"],
          grid = districtToGrid[NAME1 + NAME2],
          i = lngIdx[grid[0]],
          j = latIdx[grid[1]];

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

    switch (visType) {
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
    const dmap = d3.select(`#district-map-${i} svg`),
      gcent = d3.select(`#grid-centroid-map-${i} svg`),
      over90 = d3.select(`#over90-line-${i}`),
      over95 = d3.select(`#over95-line-${i}`),
      hottestDay = d3.select(`#hottestday-line-${i}`),
      dailytemp = d3.select(`#dailytemp-line-${i}`);

    const districtMap = renderDistrictMap([dmap, [over90, over95, hottestDay, dailytemp]], i);

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
    .on('wheel', options.mouseScrolled || identityFunction)

  svg.append("rect")
    .attr("width", options.width - options.paddingLeft - options.paddingRight)
    .attr("height", options.height - options.paddingTop - options.paddingBottom)
    .attr("fill", options.plotBgColor)
    .attr("transform", `translate(${options.paddingLeft}, ${options.paddingTop})`)
    .on('click', options.clicksvg || identityFunction)
    .on('wheel', options.mouseScrolled || identityFunction)

  if (options.title != "") {
    svg.append("rect")
      .attr("width", `${options.width}px`)
      .attr("height", options.headerHeight)
      .attr("fill", options.headerBgColor);

    svg.append("text")
      .attr("x", 10)
      .attr("y", 16)
      .attr("fill", "black")
      .style("white-space", "pre")
      .style("font-size", options.titleFontSize)
      .style("font-weight", `${options.titleFontWeight}`)
      .style("font-family", options.titleFontFamily)
      .text(options.title)
  }
}

function linePlot(svg, x, y, options = {}) {
  options = {
    ...defaultLinePlotOptions(),
    ...options,
  }

  defaultPlot(svg, options);

  const minX = Math.min(...x),
    maxX = Math.max(...x),
    minY = Math.min(...y),
    maxY = Math.max(...y) * 1.1;

  const xscale = d3.scaleLinear()
    .domain([minX - 1, maxX + 1])
    .range([options.paddingLeft, options.width - options.paddingRight])

  const yscale = d3.scaleLinear()
    .domain([minY, maxY])
    .range([options.height - options.paddingBottom, options.paddingTop])

  var plottedLine = null;
  var plottedPoints = null;
  var plottedPointsCollisionField = null;

  var pointData;

  if (options.pointInfo == null) {
    pointData = zip(x, y);
  } else {
    pointData = zip(x, y, options.pointInfo);
  }


  if (options.line) {
    plottedLine = svg.append("polyline")
      .attr("points", pointData.map(d => `${xscale(d[0])}, ${yscale(d[1])}`).join(" "))
      .attr("stroke-width", options.lineWidth)
      .attr("stroke", options.lineColor)
      .attr("fill", "none")
  }

  plottedPoints = svg.selectAll("points")
    .data(pointData)
    .enter()
    .append("circle")
    .attr("r", options.pointRadius)
    .attr("cx", d => xscale(d[0]))
    .attr("cy", d => yscale(d[1]))
    .attr("fill", options.pointColor)

  plottedPointsCollisionField = svg.selectAll("points-collisions")
    .data(pointData)
    .enter()
    .append("circle")
    .attr("r", options.collisionRadius)
    .attr("cx", d => xscale(d[0]))
    .attr("cy", d => yscale(d[1]))
    .attr("fill", "transparent")
    .on("mouseenter", options.mouseEnterPlotPoint)
    .on("mouseleave", options.mouseLeavePlotPoint)


  // X axis rendering
  svg.append("g")
    .attr("class", 'grid')
    .attr("transform", `translate(0, ${options.height - options.paddingLeft})`)
    .call(d3.axisBottom()
      .scale(xscale)
      .ticks(Math.min(x.length, 35) + 2)
      .tickSize(-options.height + options.paddingTop + options.paddingBottom)
      .tickFormat(""))

  svg.append("g")
    .attr("transform", `translate(0, ${options.height - options.paddingLeft})`)
    .call(d3.axisBottom()
      .scale(xscale)
      .ticks(Math.min(x.length, 35) + 2))
    .selectAll("text")
    .attr("dx", "-18px")
    .attr("dy", "6px")
    .attr("transform", "rotate(-45)");

  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(${options.width / 2}, ${options.height - 5})`)
    .text(options.xLabel)

  // Y axis rendering
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${options.paddingBottom}, 0)`)
    .call(d3.axisLeft()
      .scale(yscale)
      .ticks(6)
      .tickSize(-options.width + options.paddingLeft + options.paddingRight)
      .tickFormat(""))

  const yAxis = svg.append("g")
    .attr("transform", `translate(${options.paddingBottom}, 0)`)

  yAxis.call(d3.axisLeft()
    .scale(yscale)
    .ticks(6))

  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", `rotate(-90, ${15}, ${options.height / 2}) translate(${15}, ${options.height / 2})`)
    .text(options.yLabel)

  attachTooltip(svg, options);

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
        .range([options.height - options.paddingBottom, options.paddingTop]);

      if (options.line) {
        plottedLine.attr("points", pointData.map(d => `${xscale(d[0])}, ${newYScale(d[1])}`).join(" "));
        plottedPoints.attr("cy", d => newYScale(d[1]));
        plottedPointsCollisionField.attr("cy", d => newYScale(d[1]));
      } else {
        plottedPoints.attr("cy", d => newYScale(d[1]));
        plottedPointsCollisionField.attr("cy", d => newYScale(d[1]));
      }

      yAxis.selectAll("*").remove()
      yAxis.call(d3.axisLeft()
        .scale(newYScale)
        .ticks(6))
    },
    xscale,
    yscale,
  }
}

function geojsonPlot(svg, geojson, options) {
  options = {
    ...defaultGeojsonOptions(),
    ...options,
  }

  defaultPlot(svg, options);

  const proj = d3.geoMercator()
    .fitSize([options.width - (options.paddingLeft + options.paddingRight), options.height - (options.paddingTop + options.paddingBottom)], geojson),
    path = d3.geoPath()
      .projection(proj);

  const map = svg.append("g")
    .attr("transform", `translate(${options.paddingLeft}, ${options.paddingTop})`)

  map.selectAll(`.feature-${options.id}`)
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("class", `feature-${options.id}`)
    .attr("d", path)
    .attr("stroke", options.pathStroke)
    .attr("stroke-width", options.pathStrokeWidth)
    .attr("fill", d => d.cScaleValue ? options.cScale(d.cScaleValue) : "transparent")
    .on("mouseenter", options.mouseEnterFeature)
    .on("mouseleave", options.mouseLeaveFeature)
    .on("wheel", options.mouseScrolled)
    .on("click", options.clickFeature)

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

  var zoom = 1;
  var xOffset = options.paddingLeft;
  var yOffset = options.paddingTop;

  return {
    recolor: color,
    updateScale: colorScale.update,
    disableClick: function () {
      svg.selectAll(`.feature-${options.id}`)
        .on("click", null)
    },
    enableClick: function () {
      svg.selectAll(`.feature-${options.id}`)
        .on("click", options.clickFeature)
    },
    zoomIn: function (x, y) {
      if (zoom >= 3.0) return;

      xOffset -= (x - xOffset) * 0.1 / zoom;
      yOffset -= (y - yOffset) * 0.1 / zoom;

      zoom += 0.1;
      map.attr("transform", `translate(${xOffset}, ${yOffset}) scale(${zoom})`)
    },
    zoomOut: function (x, y) {
      if (zoom <= 0.5) return;

      xOffset += (x - xOffset) * 0.1 / zoom;
      yOffset += (y - yOffset) * 0.1 / zoom;

      zoom -= 0.1;
      map.attr("transform", `translate(${xOffset}, ${yOffset}) scale(${zoom})`)
    },
  }
}

function attachColorScale(svg, options) {
  const gradientID = "color-scale-gradient-" + `${options.id}`;
  const gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", gradientID)

  const colorLegend = svg.append('g')
    .attr("transform", `translate(${options.width - options.paddingRight - 150}, 20)`)

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

  function update(scale) {
    var stops = svg.select(`#${gradientID}`)
      .selectAll("stop")
      .data(scale.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: scale(t) })))

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
  const tooltip = svg.append("g")
    .attr("id", `tooltip-${options.id}`)
    .attr("class", "chart-tooltip")
    .attr("width", `${options.tooltipWidth}px`)
    .attr("height", `${options.tooltipHeight}px`)
    .attr("transform", options.tooltipTransform)
    .style("opacity", 0)

  tooltip.append("rect")
    .attr("width", `${options.tooltipWidth}px`)
    .attr("height", `${options.tooltipHeight}px`)
    .attr("rx", options.tooltipCornerRadius)
    .attr("fill", options.tooltipBgColor)
    .attr("stroke-width", options.tooltipBorderWidth)
    .attr("stroke", "#333")
}

function defaultPlotOptions() {
  return {
    id: null,
    bgColor: "white",
    plotBgColor: "transparent",
    borderColor: "white",
    borderWidth: 1,
    width: 300,
    height: 300,
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 50,
    paddingBottom: 50,
    title: "",
    titleFontSize: 12,
    titleFontWeight: "bold",
    titleFontFamily: "Roboto,\"Helvetica Neue\",Helvetica,Arial,sans-serif",
    headerBgColor: "lightsteelblue",
    headerHeight: 24,
    clearAll: true,
  }
}

function defaultLinePlotOptions() {
  return {
    ...defaultPlotOptions(),
    line: true,
    lineColor: "#333",
    lineWidth: 1,
    mouseEnterPlotPoint: identityFunction,
    mouseLeavePlotPoint: identityFunction,
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
    mouseEnterFeature: identityFunction,
    mouseLeaveFeature: identityFunction,
    mouseScrolled: identityFunction,
    clickFeature: identityFunction,
  }
}

function defaultTooltipOptions() {
  return {
    tooltipWidth: 100,
    tooltipHeight: 100,
    tooltipBgColor: "#ccc",
    tooltipTransform: "",
    tooltipBorderWidth: "1px",
    tooltipCornerRadius: "0px",
  }
}

function zip(...arrs) {
  return arrs[0].map((val, i) => arrs.map(e => e[i]));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function identityFunction() { }