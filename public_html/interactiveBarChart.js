/**
 * Created by MJLee on 8/30/2016.
 */
margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("body")
    .append("div")
    .classed("chart", true)
    .attr("id", "chart")
    .append("svg")
    .classed("main chart", true)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//set ranges
var x = d3.scaleTime()
    .range([0, width]);
var y = d3.scaleLinear()
    .rangeRound([height, 0]);
var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

// navigation chart - width, height, plotArea, scaleRange
var navWidth = width,
    navHeight = 100 - margin.top - margin.bottom;
var navChart = d3.select("#chart")
    .append("svg")
    .classed("navigator", true)
    .attr("id", "navigator")
    .attr("width", navWidth + margin.left + margin.right)
    .attr("height", navHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var navXScale = d3.scaleTime()
        .range([0, navWidth]),
    navYScale = d3.scaleLinear()
        .rangeRound([navHeight, 0]);

var stack = d3.stack();

//Get data
d3.csv("./data/data.csv", type, function (error, data) {

    // Scale the range of the data
    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));  //todo - add 1 day
    y.domain([0, d3.max(data, function (d) {
        return d.total;
    })]).nice();

    // Add the X Axis
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)));

    // Add the Y Axis
    g.append("g")
        .call(d3.axisLeft(y).ticks(10));

    //construct stacked bar
    g.selectAll(".serie")
        .data(stack.keys(data.columns.slice(1))(data))
        .enter().append("g")
        .attr("class", "serie")
        .attr("fill", function (d) {
            return z(d.key);
        })
        .selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return x(d.data.date);
        })
        .attr("y", function (d) {
            return y(d[1]);
        })
        .attr("height", function (d) {
            return y(d[0]) - y(d[1]);
        })
        .attr("width", 15);

    // //navigation chart - domain
    navXScale.domain(d3.extent(data, function (d) {
        return d.date;
    })); //todo - add 1 day
    y.domain([0, d3.max(data, function (d) {
        return d.total;
    })]).nice();

    //navigation chart - X Axis
    navChart.append("g")
        .classed("axis axis--x")
        .attr("transform", "translate(0," + navHeight + ")")
        .call(d3.axisBottom(navXScale).ticks(d3.timeDay.every(1)));
});


function type(d, i, columns) {
    parseDate = d3.timeParse("%d/%m/%Y");
    d.date = parseDate(d.date);
    for (i = 1, t = 0; i < columns.length; ++i)
        t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}