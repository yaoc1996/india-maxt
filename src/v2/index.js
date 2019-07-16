const MAIN_FONT = "Roboto,\"Helvetica Neue\",Helvetica,Arial,sans-serif";

const url = "https://raw.githubusercontent.com/yaoc1996/india-maxt/master/data";
const rawDir = "/raw_by_district";

const files = [
  "/MaxT_ALL.csv", 
  "/over90.csv", "/over95.csv",
  "/under10.csv", "/under05.csv",
  "/HottestDayOccurrence.csv", "/ColdestDayOccurrence.csv",
  "/district_to_grid_map.csv",
]

const INDGeojsonFile = "/gadm36_IND_2_simplified.json";
const MAP_HEIGHT = 512,
      MAP_WIDTH = 512,
      LINE_WIDTH = Math.max(1366, window.innerWidth)-MAP_WIDTH-50;

const DAILY_MAX_TEMP = "Daily Maximum Temperature",
  NUM_DAYS_OVER_90 = "Number of Days over the 90th Percentile",
  NUM_DAYS_OVER_95 = "Number of Days over the 95th Percentile",
  HOTTEST_OCCUR = "Hottest Day Occurrence";

const INDICATORS = [
  DAILY_MAX_TEMP,
  NUM_DAYS_OVER_90,
  NUM_DAYS_OVER_95,
  HOTTEST_OCCUR,
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

d3.select('body')
  .style('margin-top', `${(window.innerHeight - 650)/2}px`)

function insertDropDown(svg, id, label, width, options) {
  const dd = svg.append("div")
    .attr("id", id)
    .attr("class", "form-group dropdowns")
    .style("width", `${width}px`)
    .style('height', '100px')
    .style("margin", "5px")
    .style("display", "inline-block")
    .style('opacity', 0)

  dd.append("label")
    .attr("for", id+'-select')
    .attr("class", "select-label")
    .text(label)

  dd.append("select")
    .attr("id", id+'-select')
    .attr("class", "form-control")
    .style('font-size', '14px')
    .selectAll()
    .data(options)
    .enter()
    .append("option")
    .style('font-size', '14px')
    .text(d => d)
}

ROWS.forEach((row, i) => {
  const div = row.append("div")
    .style("display", "inline-block")

  const mapDiv = div.append("div")
    .attr("id", `dropdown-map-div-${i}`)
    .style("display", "inline-block")
    .style("width", `${MAP_WIDTH}px`)
    .style("margin-bottom", "10px")
    .style("white-space", "normal")

  const dd1 = mapDiv.append("div")
    .attr("class", "form-group")
    .style("width", `${MAP_WIDTH}px`)
    .style('height', '85px')
    .style("margin", "5px")
    .style("display", "inline-block")

  dd1.append("div")
    .style('display', 'inline-block')
    .style('margin-top', '20px')
    .style('font-family', MAIN_FONT)
    .style('font-size', '24px')
    .style('font-weight', '100')
    .text("Select a District to Visualize")


  mapDiv.append("div")
    .attr("id", `district-map-${i}`)
    .attr("class", `svg-wrapper map-${i}`)
    .append("svg")

  const indDiv = div.append("div")
    .attr("id", `dropdown-plot-div-${i}`)
    .style("display", "inline-block")
    .style("margin-bottom", "10px")
    .style("white-space", "normal")
    .style('vertical-align', 'top')

  const dd2 = indDiv.append("div")
    .attr("class", "form-group")
    .style('height', '85px')
    .style("margin", "5px")
    .style("display", "block")

  insertDropDown(dd2, `dropdown-${i}-indicator`, 'Indicator', 300, INDICATORS);
  insertDropDown(dd2, `dropdown-${i}-year`, 'Year', 300, [...Array(30).keys()].map(d => d+1985))

  const lineDIV = indDiv.append("div")
    .attr("id", `line-charts-${i}`)
    .attr("class", "svg-wrapper")
    .style("margin-left", "10px")
    .style("margin-right", "10px")
    .style('height', `${MAP_HEIGHT}px`)
    .style('overflow-y', 'auto')

  lineDIV.append("div")
    .append("svg")
    .attr("id", `indicator-line-chart-${i}`)
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
    maxT,
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

  ROWS.forEach((row, i) => {
    const dmap = d3.select(`#district-map-${i} svg`),
      lineChart = row.select(`#indicator-line-chart-${i}`);

    const map = renderDistrictMap([dmap, [lineChart]], i);

    const cVals = INDGeojson.features.map(d => {
      const NAME1 = d["properties"]["NAME_1"],
        NAME2 = d["properties"]["NAME_2"],
        grid = districtToGrid[NAME1 + NAME2],
        i = lngIdx[grid[0]],
        j = latIdx[grid[1]];

      if (maxT[j][columnNames[i]] == "")
        return null;
      else
        return parseFloat(maxT[j][columnNames[i]]);
    });

    var weights = [];
    for (var i = 0; i < gridHeight; i++) {
      for (var j = 0; j < gridWidth; j++) {
        if (maxT[i][columnNames[j]] != "") {
          weights.push(parseFloat(maxT[i][columnNames[j]]))
        }
      }
    }

    const scale = d3.scaleSequential(d => d3.interpolateYlOrRd(d * 0.8 + 0.2))
      .domain([Math.min(...weights), Math.max(...weights)]);

    map.recolor(cVals, scale);
    map.updateScale(scale);
  })


  const linePlots = [
    Array(NROW).map(() => null),
  ]

  function renderDistrictMap(svgs, id) {
    var locked = false;
    var lockTarget = "";

    const mapPlotTooltip = {
      width: 225,
      height: 75,
    }

    const tooltipItems = ["State", "District", "Absolute Max-T"];

    function mouseenter(d) {
      if (locked) return;

      const tooltipItemValues = [
        d["properties"]["NAME_1"],
        d["properties"]["NAME_2"],
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
        .attr("x", (d, i) => 10 + i * 105)
        .attr("fill", "black")
        .style("white-space", "pre")
        .style("font-size", "12px")
        .style("font-family", MAIN_FONT)
        .style("font-weight", (d, i) => i == 0 ? "bold" : "normal")
        .text(d => isNaN(d) ? d : parseFloat(d).toFixed(2))

      items.append("line")
        .attr("x1", 107)
        .attr("x2", 107)
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

      d3.select(`#dropdown-${id}-indicator`)
        .style('opacity', 0)
      d3.select(`#dropdown-${id}-year`)
        .style('opacity', 0)

      for (var i = 0; i < svgs[1].length; i++) {
        svgs[1][i].selectAll("*").remove();
        svgs[1][i].attr("width", "0")
          .attr("height", "0")
        linePlots[i][id] = null;
      }

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
      d3.select(`#dropdown-${id}-indicator`)
        .style('opacity', 1)

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
          width: LINE_WIDTH,
          height: 512,
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

        const indicator = d3.select(`#dropdown-${id}-indicator select`)
          .on('change', drawAppropriateIndicator);

        drawAppropriateIndicator();

        function drawAppropriateIndicator() {
          d3.select(`#dropdown-${id}-year`)
            .style('opacity', 0);

          switch(indicator.node().value) {
            case DAILY_MAX_TEMP:
              drawDailyMapTempLineChart();
              break;
            case NUM_DAYS_OVER_90:
              drawOver90PercentileLineChart();
              break;
            case NUM_DAYS_OVER_95:
              drawOver95PercentileLineChart();
              break;
            case HOTTEST_OCCUR:
              drawHottestOccurrentLineChart();
              break;
            default:
              break;
          }
        }

        function drawDailyMapTempLineChart() {
          d3.json(url+rawDir+`/${cleanName}_raw.json`)
            .then(json => {
              d3.select(`#dropdown-${id}-year`)
                .style('opacity', 1);

              const dd = d3.select(`#dropdown-${id}-year-select`)

              const data = json[NAME1+NAME2];
              const firstPV = over90dict[label].percentileValue;
              const secondPV = over95dict[label].percentileValue;

              function drawDailyTempLineChart() {
                const baseYear = 1985;
                const year = dd.node().value;
                const numDays = (year % 4 == 0) ? 366 : 365;
                const days = [...Array(numDays).keys()].map(d => d+1);

                const svg = svgs[1][0];

                const plot = linePlot(svg, days, data[year-baseYear], {
                  ...plotOptions,
                  collisionRadius: 2,
                  id: 'dailytemp-'+cleanName,
                  title: `Daily Maximum Temperatures for ${year}`,
                  xLabel: "Day of the Year",
                  yLabel: "Temperature",
                  mouseEnterPlotPoint: displayPointInfoDate('dailytemp-' + cleanName, d => dd.node().value, d => d[0], d => ` - ${parseFloat(d[1]).toFixed(2)} °C`),
                  mouseLeavePlotPoint: hideTooltip.bind(null, 'dailytemp-' + cleanName),
                });

                linePlots[0][id] = plot;

                const labels = ['90th', '95th'];
                const colors = ['lightsalmon', 'red'];
                const xOffset = 5;
                const yOffsets = [15, -5];

                svg.insert('line', 'polyline')
                  .attr('x1', plot.xscale.range()[0])
                  .attr('x2', plot.xscale.range()[1])
                  .attr('y1', plot.yscale(parseFloat(firstPV)))
                  .attr('y2', plot.yscale(parseFloat(firstPV)))
                  .attr('stroke-width', '1px')
                  .attr('stroke', colors[0])

                svg.insert('line', 'polyline')
                  .attr('x1', plot.xscale.range()[0])
                  .attr('x2', plot.xscale.range()[1])
                  .attr('y1', plot.yscale(parseFloat(secondPV)))
                  .attr('y2', plot.yscale(parseFloat(secondPV)))
                  .attr('stroke-width', '1px')
                  .attr('stroke', colors[1])

                svg.append('text')
                  .attr('x', plot.xscale.range()[0]+xOffset)
                  .attr('y', plot.yscale(parseFloat(firstPV))+yOffsets[0])
                  .style('font-size', 10)
                  .style('fill', colors[0])
                  .text(`${labels[0]} Percentile: ${parseFloat(firstPV).toFixed(2)} °C`)

                svg.append('text')
                  .attr('x', plot.xscale.range()[0]+xOffset)
                  .attr('y', plot.yscale(parseFloat(secondPV))+yOffsets[1])
                  .style('font-size', 10)
                  .style('fill', colors[1])
                  .text(`${labels[1]} Percentile: ${parseFloat(secondPV).toFixed(2)} °C`)
              }

              dd.on('change', drawDailyTempLineChart);
              
              drawDailyTempLineChart();
            });

        }

        function drawOver90PercentileLineChart() {
          linePlots[0][id] = linePlot(svgs[1][0], years, over90dict[label].counts, {
            ...plotOptions,
            id: 'tmax-over-90-' + cleanName,
            title: `Number of Days over the 90th Percentile ( ${parseFloat(over90dict[label].percentileValue).toFixed(2)} °C )`,
            mouseEnterPlotPoint: displayPointInfoCount('tmax-over-90-' + cleanName, d => d[0], d => d[1]),
            mouseLeavePlotPoint: hideTooltip.bind(null, 'tmax-over-90-' + cleanName),
          })
        }

        function drawHottestOccurrentLineChart() {
          linePlots[0][id] = linePlot(svgs[1][0], years, hottestDayDict[label].counts, {
            ...plotOptions,
            line: false,
            id: 'tmax-hottest-' + cleanName,
            title: `Annual Hottest Day Occurrence`,
            mouseEnterPlotPoint: displayPointInfoDate('tmax-hottest-' + cleanName, d => d[0], d => d[1]),
            mouseLeavePlotPoint: hideTooltip.bind(null, 'tmax-hottest-' + cleanName),
            pointRadius: 3,
            pointColor: 'red',
            yLabel: 'Number of Days from Jan. 1st'
          })
        }

        function drawOver95PercentileLineChart() {
          linePlots[0][id] = linePlot(svgs[1][0], years, over95dict[label].counts, {
            ...plotOptions,
            id: 'tmax-over-95-' + cleanName,
            title: `Number of Days over the 95th Percentile ( ${parseFloat(over95dict[label].percentileValue).toFixed(2)} °C )`,
            mouseEnterPlotPoint: displayPointInfoCount('tmax-over-95-' + cleanName, d => d[0], d => d[1]),
            mouseLeavePlotPoint: hideTooltip.bind(null, 'tmax-over-95-' + cleanName),
          })
        }

        reAdjustLinePlots();
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
      paddingTop: 30,
      paddingBottom: 10,
      title: "Absolute Max-T from 1985 - 2014",
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
    .attr("transform", `translate(${options.width - options.paddingRight - 150}, 40)`)

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