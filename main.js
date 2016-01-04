/* globals d3, topojson, setTimeout, $ */
"use strict";

var settings = {
  // Map layout.
  base_height: 219,
  base_width: 333,
  map_width: 0,
  map_height: 0,
  map_center: [103.82, 1.32],
  map_scale: 130000,
  map_scale_min: 38000,

  // Files and Data.
  map_json: "data/sg_map.json",
  map_data: null,
  gradients_json: "data/color_gradient.json",
  gradients: null,
  data_file_prefix: "data/",
  data_file_suffix: "_geo_price_colors.json",

  // Visualization options.
  // Interactive options.
  play_year: 2015,
  colormap: "jet",
  alert_style: false,
  colorbar: false,

  // Visualization options.
  // Fixed options.
  point_duration: 1500,
  month_duration: 5000,
  point_radius: 5,

  // DOM selectors.
  map_selector: "#map",
  date_container_selector: "#current-date",
  date_paragraph_selector: "#current-date p",
  date_month_selector: "#current-date p .large",
  date_year_selector: "#current-date p .small",
  region_note_selector: ".region_note",
};

var tools = {
  projection: null,
};

// Plots alert style circle at (lng, lat) with color.
function plotAlert(lng, lat, color) {
  const map = d3.select(settings.map_selector);

  map.append("circle").attr("class", "ring")
    .attr("transform", function() {
      return "translate(" + tools.projection([
        lng,
        lat
      ]) + ")";
    })
    .attr("r", 6)
    .style("stroke-width", 2)
    .style("stroke", color)
    .style("stroke-opacity", 0.5)
    .transition()
    .ease("linear")
    .duration(1800)
    .style("stroke-opacity", 1e-6)
    .style("stroke-width", 1e-3)
    .attr("r", 55)
    .remove();
}

// Plots a data point at (lng, lat) with color after delay.
function plotPoint(lng, lat, color, delay) {
  const map = d3.select(settings.map_selector);

  setTimeout(function() {
    const circle = map.append("circle")
      .style("filter", "url(#glow)")
      .attr("fill", color)
      .attr("r", settings.point_radius)
      .attr("transform", function() {
        return "translate(" + tools.projection([lng, lat]) + ")";
      });

    // Apply transition.
    circle.style("opacity", 0)
      .transition()
      .style("opacity", 1)
      .duration(settings.point_duration)
      .ease(function(t) {
        if (t <= 0.2) {
          return t * 5;
        } else {
          return -1.25 * t + 1.25;
        }
      })
      .remove();

    // Use alert style.
    if (settings.alert_style) plotAlert(lng, lat, color);
  }, delay);
}

// Plots for data points in a month after delay.
// All data points shall be plotted within duration.
function plotMonth(month, locs, delay, duration) {
  const date_container = d3.select(settings.date_container_selector);
  const date_month = d3.select(settings.date_month_selector);
  const date_year = d3.select(settings.date_year_selector);

  setTimeout(function() {
    date_container.attr("class", "date blue glow");
    setTimeout(function() {
      date_container.transition().attr("class", "date blue");
    }, 600);

    const mm = month.split("-")[1];
    const yyyy = month.split("-")[0];

    date_month.text(mm);
    date_year.text(yyyy);

    const len = locs.length;
    const each_delay = duration / (len - 1);
    for (var i = 0; i < len; i++) {
      const lat = locs[i].lat;
      const lng = locs[i].lng;
      const color = locs[i][settings.colormap];
      plotPoint(lng, lat, color, each_delay * i);
    }
  }, delay);
}

// Hides play button and shows current date: MM YYYY.
function hidePlayBtn() {
  const play_btn = d3.select(".play_btn");
  const date_paragraph = d3.select(settings.date_paragraph_selector);
  date_paragraph.attr("class", "");
  play_btn.attr("class", "play_btn hide");
}

// Shows play button and hides current date section.
function resetPlayBtn() {
  const play_btn = d3.select(".play_btn");
  const date_paragraph = d3.select(settings.date_paragraph_selector);
  date_paragraph.attr("class", "hide");
  play_btn.attr("class", "play_btn")
    .on("click", play);
}

function play(year) {
  const yyyy = year ? year : settings.play_year;
  const data_file = settings.data_file_prefix + yyyy + settings.data_file_suffix;

  hidePlayBtn();

  d3.json(data_file, function(error, hdb) {
    if (error) return console.warn(error);
    // Sort months.
    const keys = [];
    for (var month in hdb) {
      if (hdb.hasOwnProperty(month)) {
        keys.push(month);
      }
    }
    keys.sort();
    const len = keys.length;

    for (var i = 0; i < len; i++) {
      var month_delay = settings.month_duration * i;
      plotMonth(keys[i], hdb[keys[i]], month_delay, settings.month_duration);
      // Resets play button when reaching end of data.
      if (i == len - 1) setTimeout(resetPlayBtn, settings.month_duration + month_delay);
    }
  });
}

// Add a glow effect for svg determined by svg_selector.
function addGlowEffect(svg_selector) {
  const svg = d3.select(svg_selector);
  const defs = svg.append("defs");

  const glow = defs.append("filter")
    .attr("id", "glow")
    .attr("height", "2000%")
    .attr("width", "2000%")
    .attr("x", -10)
    .attr("y", -10);

  glow.append("feGaussianBlur")
    .attr("stdDeviation", 5)
    .attr("result", "coloredBlur");

  const feMerge = glow.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");
}

// Update contents of Region note to show region name.
function updateRegionNote(content) {
  d3.select(settings.region_note_selector)
    .text(content);
}

function updateSpan(element) {
  console.log(element);
}

function updateColorbar() {
  const colorbar = $("#colorbar");
  const left = colorbar.children()[0];
  const right = colorbar.children()[1];

  if (settings.colorbar) {
    colorbar.removeClass("hide");
  } else {
    colorbar.addClass("hide");
  }

  const grad = settings.gradients[settings.play_year][settings.colormap];
  const limit = settings.gradients[settings.play_year]['limit'];
  const low = (limit[0] / 1000).toFixed(1) + "k";
  const high = (limit[1] / 1000).toFixed(1) + "k";

  $(left).text(low);
  $(right).text(high);

  colorbar.css({
    "background" : "-webkit-linear-gradient(left, " + grad + ")",
  });
}

function bindUI() {
  $("#year-selector li").click(function() {
    $("#year-choice").text($(this).attr("data-value"));
    settings.play_year = $(this).attr("data-value");
    updateColorbar();
  });

  $("#color-selector li").click(function() {
    $("#color-choice").text($(this).text());
    settings.colormap = $(this).attr("data-value");
    updateColorbar();
  });

  $("#alert-selector li").click(function() {
    $("#alert-choice").text($(this).text());
    if ($(this).attr("data-value") === "OFF") {
      settings.alert_style = false;
    } else {
      settings.alert_style = true;
    }
  });

  $("#colorbar-selector li").click(function() {
    $("#colorbar-choice").text($(this).text());
    if ($(this).attr("data-value") === "OFF") {
      settings.colorbar = false;
      updateColorbar();
    } else {
      settings.colorbar = true;
      updateColorbar();
    }
  });
}

// Do not reload map_json if already existing.
function getMapJSON(func) {
  if (settings.map_data) {
    func();
  } else {
    d3.json(settings.map_json, function(error, sg) {
      if (error) throw error;
      settings.map_data = sg;
      func();
    });
  }
}

function getGradientJSON(func) {
  if (settings.gradients) {
    func();
  } else {
    d3.json(settings.gradients_json, function(error, grad) {
      if (error) throw error;
      settings.gradients = grad;
      func();
    });
  }
}

function resetCanvas() {
  $("#map").remove();
}

function drawMap() {
  // Setup SVG element.
  const svg = d3.select("#canvas").append("svg")
    .attr("id", "map")
    .attr("class", "canvas")
    .attr("width", settings.map_width)
    .attr("height", settings.map_height)
    .attr("fill", "#fff");

  addGlowEffect(settings.map_selector);

  const sg = settings.map_data;
  const subunits = topojson.feature(sg, sg.objects.SG_planning_area);
  tools.projection = d3.geo.mercator()
    .center(settings.map_center)
    .scale(settings.map_scale)
    .translate([settings.map_width / 2, settings.map_height / 2]);

  const path = d3.geo.path().projection(tools.projection);

  svg.selectAll("path")
    .data(subunits.features)
    .enter()
    .append("path")
    .attr("class", "graticule")
    .attr("d", path)
    .attr("name", function(d) {
      return d.properties.name;
    })
    .on("mouseover", function(d) {
      d3.select(this).attr("class", "graticule hover");
      updateRegionNote(d.properties.name);
    })
    .on("mouseout", function() {
      d3.select(this).attr("class", "graticule");
      updateRegionNote("");
    });
}

// Set up canvas and tools.
function init() {
  // Removes existing map (needed when resizing window).
  resetCanvas();
  // Add listeners for interactive options.
  bindUI();
  // Re-init on window resize.
  d3.select(window).on("resize", init);

  // Sets map scale to adapt window size.
  settings.map_height = $(window).height();
  settings.map_width = $(window).width();
  const h_ratio = settings.map_height / settings.base_height;
  const w_ratio = settings.map_width / settings.base_width;
  let ratio = h_ratio < w_ratio ? h_ratio : w_ratio;
  settings.map_scale = settings.map_scale_min * ratio;

  getMapJSON(drawMap);
  getGradientJSON(updateColorbar);
}

function main() {
  init();
  resetPlayBtn();
}

window.onload = main;
