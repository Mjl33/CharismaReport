/**
 * Created by MJLee on 9/19/2016.
 */
var width = 960;
var height = 600;

var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height),
    focusMargin = {top: 20, right: 20, bottom: 180, left: 40},
    focusWidth = width - focusMargin.left - focusMargin.right,
    focusHeight = height - focusMargin.top - focusMargin.bottom,
    navMargin = {top: 500, right: 20, bottom: 30, left: 40},
    navWidth = focusWidth,
    navHeight = height - navMargin.top - navMargin.bottom;

var parseDate = d3.timeParse("%d/%m/%Y");
var formatDate = d3.timeFormat("%d/%m/%Y");

var navX = d3.scaleTime().range([0, navWidth]),
    navY = d3.scaleLinear().range([navHeight, 0]),
    focusY = d3.scaleLinear().range([focusHeight, 0]),
    focusZ = d3.scaleOrdinal().range(d3.schemeCategory20);

var navXAxis = d3.axisBottom(navX),
    focusYAxis = d3.axisLeft(focusY);

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function (d) {
        return navX(d.date);
    })
    .y0(navHeight)
    .y1(function (d) {
        return navY(d.total);
    });

var nav = svg.append("g")
    .classed("nav", true)
    .attr("transform", "translate(" + navMargin.left + "," + navMargin.top + ")");

d3.csv("./data/data.csv", type, function (error, data) {
    if (error)
        throw error;

    focusY.domain([0, d3.max(data, function(d){return d.total;})]);
    navX.domain(d3.extent(data, function(d){return d.date;}));
    navY.domain(focusY.domain());

    nav.append("g")
        .classed("axis axis--x", true)
        .attr("transform", "translate(0," + navHeight + ")")
        .call(navXAxis);

    nav.append("path")
        .datum(data)
        .classed("area", true)
        .attr("d", area);

});

function type(d, i, columns) {
    d.date = parseDate(d.date);
    d.dateString = formatDate(d.date);
    for (i = 1, t = 0; i < columns.length; ++i)
        t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}