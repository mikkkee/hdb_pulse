var settings = {
    minHeight: 768,
    minWidth: 1000,
    point_duration: 1500,
    month_duration: 5000,
    point_radius: 5,
    map_json: 'data/sg_map.json',
    map_center: [103.85, 1.32],
    map_scale: 130000,

    data_file_prefix: "data/",
    data_file_suffix: "_geo_price_colors.json",
    play_year: 2015,
    color_map: 'jet',

    map_selector: "#map",
    date_container_selector: "#current-date",
    date_paragraph_selector: "#current-date p",
    date_month_selector: "#current-date p .large",
    date_year_selector: "#current-date p .small",
    region_note_selector: ".region_note",

    alert_style: false,
};

var tools = {
    projection: null,
};

function resize() {
    console.log("Resize");
}

function plotAlert(lng, lat, color) {
    const svg = d3.select(settings.map_selector);

    var ring = svg.append("circle")
        .attr("class", "ring")
        .attr("transform", function(d) {
            return "translate(" + tools.projection([
                lng,
                lat
            ]) + ")"
        })
        .attr("r", 6)
        .style("stroke-width", 2)
        .style("stroke", color)
        .style("stroke-opacity", .5)
        .transition()
        .ease("linear")
        .duration(1800)
        .style("stroke-opacity", 1e-6)
        .style("stroke-width", 1e-3)
        .attr("r", 55)
        .remove();
}

// Starts to plot a data point at (lng, lat) with color after delay.
function plotPoint(lng, lat, color, delay) {
    const svg = d3.select(settings.map_selector);

    setTimeout(function() {
        var circle = svg.append("circle")
            .attr("fill", color)
            .attr("r", settings.point_radius)
            .attr("transform", function(d) {
                return "translate(" + tools.projection([
                    lng,
                    lat
                ]) + ")"
            })
            .style("filter", "url(#glow)");

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
                };
            })
            .remove();

        // Use alert style.
        if (settings.alert_style) {
            plotAlert(lng, lat, color)
        };
    }, delay);
}

// Starts a plot for data points in a month after delay.
// All data points shall be plotted within duration.
function plotMonth(month, locs, delay, duration) {
    var date_container = d3.select(settings.date_container_selector);
    var date_month = d3.select(settings.date_month_selector);
    var date_year = d3.select(settings.date_year_selector);

    setTimeout(function() {
        date_container.attr("class", "date blue glow")
        setTimeout(function() {
            date_container.transition()
                .attr("class", "date blue");
        }, 600);

        const mm = month.split("-")[1];
        const yyyy = month.split("-")[0];

        date_month.text(mm);
        date_year.text(yyyy);


        var len = locs.length;
        var each_delay = duration / (len - 1);
        for (var i = 0; i < len; i++) {
            var lat = locs[i]['lat'];
            var lng = locs[i]['lng'];
            var color = locs[i][settings.color_map];
            plotPoint(lng, lat, color, each_delay * i);
        }
    }, delay);
}

function hidePlayBtn() {
    const play_btn = d3.select(".play_btn");
    const date_paragraph = d3.select(settings.date_paragraph_selector);
    date_paragraph.attr("class", "");
    play_btn.attr("class", "play_btn hide");
}

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
        const keys = []
        for (month in hdb) {
            if (hdb.hasOwnProperty(month)) {
                keys.push(month);
            }
        }
        keys.sort()
        len = keys.length;

        for (var i = 0; i < len; i++) {
            var month_delay = settings.month_duration * i;
            plotMonth(keys[i], hdb[keys[i]], month_delay, settings.month_duration);
            if (i == len - 1) {
                setTimeout(resetPlayBtn, settings.month_duration + month_delay);
            };
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

    const feGaussianBlur = glow.append("feGaussianBlur")
        .attr("stdDeviation", 5)
        .attr("result", "coloredBlur");

    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
}

function updateRigonNote(content) {
    d3.select(settings.region_note_selector)
        .text(content);
}

function updateSpan(element) {
    console.log(element);
}

function bindOptions() {
    $("#year-selector li").click(function() {
        $("#year-choice").text($(this).attr("data-value"));
        settings.play_year = $(this).attr("data-value");
    });

    $("#color-selector li").click(function() {
        $("#color-choice").text($(this).text());
        settings.color_map = $(this).attr("data-value");
    });

    $("#alert-selector li").click(function() {
        $("#alert-choice").text($(this).text());
        if ($(this).attr("data-value") === "OFF") {
            settings.alert_style = false;
        } else {
            settings.alert_style = true;
        }
    });
}

// Set up canvas and tools.
function init() {
    // Add listeners for options.
    bindOptions();
    // Responsive monitor.
    d3.select(window).on("resize", resize);

    const canvas = d3.select("#canvas");
    const bbox = canvas.node().getBoundingClientRect();

    const width = bbox['width'] > settings.minWidth ? bbox['width'] : settings.minWidth;
    const height = bbox['height'] > settings.minHeight ? bbox['height'] : settings.minHeight;

    // Setup SVG element.
    const svg = d3.select("#canvas").append("svg")
        .attr("id", "map")
        .attr("class", "canvas")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#fff");
    addGlowEffect("#canvas svg");

    // Load topo json file.
    d3.json(settings.map_json, function(error, sg) {
        if (error) throw error;

        var subunits = topojson.feature(sg, sg.objects.SG_planning_area);

        var projection = d3.geo.mercator()
            .center(settings.map_center)
            .scale(settings.map_scale)
            .translate([width / 2, height / 2]);

        tools.projection = projection;

        var path = d3.geo.path().projection(projection);

        svg.selectAll("path")
            .data(subunits.features)
            .enter()
            .append("path")
            .attr("class", "graticule")
            .attr("d", path)
            .attr("name", function(d) {
                return d["properties"]["name"];
            })
            .on("mouseover", function(d) {
                d3.select(this).attr("class", "graticule hover");
                updateRigonNote(d["properties"]["name"]);
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("class", "graticule");
                updateRigonNote("");
            });
    });

}

function main() {
    init();
    resetPlayBtn();
    // play(2015, settings.month_duration);
}

window.onload = main;
