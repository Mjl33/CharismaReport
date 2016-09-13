var width = 960;
var height = 500;

var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height),
    focusMargin = {top: 20, right: 20, bottom: 110, left: 40},
    focusWidth = width - focusMargin.left - focusMargin.right,
    focusHeight = height - focusMargin.top - focusMargin.bottom,
    navMargin = {top: 430, right: 20, bottom: 30, left: 40},
    navWidth = focusWidth,
    navHeight = height - navMargin.top - navMargin.bottom;

var parseDate = d3.timeParse("%d/%m/%Y");

var focusX = d3.scaleTime().range([0, focusWidth]),
    navX = d3.scaleTime().range([0, navWidth]),
    focusY = d3.scaleLinear().range([focusHeight, 0]),
    navY = d3.scaleLinear().range([navHeight, 0]),
    focusZ = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var focusXAxis = d3.axisBottom(focusX),
    navXAxis = d3.axisBottom(navX),
    focusYAxis = d3.axisLeft(focusY);

var brush = d3.brushX()
    .extent([[0, 0], [navWidth, navHeight]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [focusWidth, focusHeight]])
    .extent([[0, 0], [focusWidth, focusHeight]])
    .on("zoom", zoomed);

var stack = d3.stack();

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function (d) {
        return navX(d.date);
    })
    .y0(navHeight)
    .y1(function (d) {
        return navY(d.total);
    });

var focus = svg.append("g")
    .classed("focus", true)
    .attr("transform", "translate(" + focusMargin.left + "," + focusMargin.top + ")");
var nav = svg.append("g")
    .classed("nav", true)
    .attr("transform", "translate(" + navMargin.left + "," + navMargin.top + ")");

d3.csv("./data/data.csv", type, function (error, data) {
    if (error) throw error;
    focusX.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    focusY.domain([0, d3.max(data, function (d) {
        return d.total;
    })]).nice();
    navX.domain(focusX.domain());
    navY.domain(focusY.domain());

    var bar = focus.selectAll(".series")
        .data(stack.keys(data.columns.slice(1))(data))
        .enter().append("g")
        .classed("series", true)
        .attr("fill", function (d) {
            return focusZ(d.key);
        })
        .selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return focusX(d.data.date);
        })
        .attr("y", function (d) {
            return focusY(d[1]);
        })
        .attr("height", function (d) {
            return focusY(d[0]) - focusY(d[1]);
        })
        .attr("width", 15)  //TODO make the width dynamic

    focus.append("g")
        .classed("axis axis--x", true)
        .attr("transform", "translate( 0, " + focusHeight + ")")
        .call(focusXAxis);

    focus.append("g")
        .classed("axis axis--y", true)
        .call(focusYAxis);

    nav.append("path")
        .datum(data)
        .classed("area", true)
        .attr("d", area);

    nav.append("g")
        .classed("axis axis--x", true)
        .attr("transform", "translate(0 ," + navHeight + ")")
        .call(navXAxis);

    nav.append("g")
        .classed("brush", true)
        .call(brush)
        .call(brush.move, focusX.range());

    svg.append("rect")
        .classed("zoom", true)
        .attr("width", focusWidth)
        .attr("height", focusHeight)
        .attr("transform", "translate(" + focusMargin.left + "," + focusMargin.top + ")")
        .call(zoom);
});

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type == "zoom") return;
    var s = d3.event.selection || navX.range();
    focusX.domain(s.map(navX.invert, navX));
    // focus.select(".series").attr("d", bar); //todo hv to redirect this data to the stacked bar
    focus.selectAll(".series rect").attr("tranform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ",1");
    focus.select(".axis--x").call(focusXAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(focusWidth / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type == "brush") return;
    var t = d3.event.transform;
    focusX.domain(t.rescaleX(navX).domain());
    // focus.select(".series").attr("d", bar); //todo hv to redirect this data to the stacked bar
    focus.selectAll(".series rect").attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ",1)");
    focus.select(".axis--x").call(focusXAxis);
    nav.select(".brush").call(brush.move, focusX.range().map(t.invertX, t));
}

function type(d, i, columns) {
    d.date = parseDate(d.date);
    for (i = 1, t = 0; i < columns.length; ++i)
        t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}
