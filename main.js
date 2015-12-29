var settings = {
    minHeight: 768,
    minWidth: 1000,
    point_duration: 1500,
    month_duration: 5000,
    point_radius: 5,
};

var tools = {
    projection: null,
};

// Starts to plot a data point at (lng, lat) with color after delay.
function plot_addr(lng, lat, color, delay) {

    const svg = d3.select("svg");
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
    }, delay);
}

// Starts a plot for data points in a month after delay.
// All data points shall be plotted within duration.
function plot_month(month, locs, delay, duration) {
    var text = d3.select("text");
    // Shuffle the locs to be plotted.
    // locs = shuffle(locs)
    setTimeout(function() {
        text.style("font-size", 20)
            .transition()
            .style("font-size", 25)
            .text(month)
            .transition()
            .style("font-size", 20);
        var len = locs.length;
        var each_delay = duration / (len - 1);
        for (var i = 0; i < len; i++) {
            var lat = locs[i]['lat'];
            var lng = locs[i]['lng'];
            var color = locs[i]['color'];
            plot_addr(lng, lat, color, each_delay * i)
        }
    }, delay);
}

function play(year, month_duration) {
    console.log("play");
    const data_file = "data/" + year + ".json";

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
            plot_month(keys[i], hdb[keys[i]], month_delay, month_duration);
        }
    });
}

function main() {
    var minHeight = 768;
    var minWidth = 1000;
    var canvas = d3.select("#canvas");
    var bbox = canvas.node().getBoundingClientRect();

    var width = bbox['width'] > minWidth ? bbox['width'] : minWidth,
        height = bbox['height'] > minHeight ? bbox['height'] : minHeight;

    var point_duration = 1500;
    var month_duration = 5000;
    var point_radius = 5;

    const svg = d3.select("#canvas").append("svg")
        .attr("class", "canvas")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#fff");

    /* Defines glowing effect filter. */
    var defs = svg.append("defs");

    var glow = defs.append("filter")
        .attr("id", "glow")
        .attr("height", "2000%")
        .attr("width", "2000%")
        .attr("x", -10)
        .attr("y", -10);

    var feGaussianBlur = glow.append("feGaussianBlur")
        .attr("stdDeviation", 5)
        .attr("result", "coloredBlur");

    var feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

    // Load topo json file.
    d3.json("data/sg_map.json", function(error, sg) {
        if (error) throw error;

        var subunits = topojson.feature(sg, sg.objects.SG_planning_area);

        var projection = d3.geo.mercator()
            .center([103.85, 1.32])
            .scale(130000)
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
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("class", "graticule");
            });

        var text = svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class", "month")
            .attr("x", width / 2)
            .attr("y", height - 40);

        var caption = svg.append("text")
            .attr("text-anchor", "middle")
            .text("Singapore HDB Flat Resale Pulse")
            .attr("class", "month caption")
            .attr("x", width / 2)
            .attr("y", height - 10);



        play(2015, month_duration);



    });
}

window.onload = main;
