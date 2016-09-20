/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

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
var formatDate = d3.timeFormat("%d/%m/%Y");

var stack = d3.stack();

var focusX = d3.scaleBand().rangeRound([0, focusWidth]).padding(0.1).align(0.1),
        focusY = d3.scaleLinear().rangeRound([focusHeight, 0]),
        focusZ = d3.scaleOrdinal().range(d3.schemeCategory20);

var focusXAxis = d3.axisBottom(focusX),
        focusYAxis = d3.axisLeft(focusY);

var focus = svg.append("g")
        .classed("focus", true)
        .attr("transform", "translate(" + focusMargin.left + "," + focusMargin.top + ")");

d3.csv("./data/data.csv", type, function (error, data) {
    if (error)
        throw error;
    var layers = stack.keys(data.columns.slice(1));
    
    focusX.domain(data.map(function(d){return d.date;}));
    focusY.domain([0, d3.max(data, function(d){return d.total;})]);
    focusZ.domain(layers);
    
    var bars = focus.selectAll(".series")
            .data(layers(data))
            .enter().append("g")
            .classed("series", true)
            .attr("fill", function(d){return focusZ(d.key);})
            .selectAll("rect")
            .data(function(d){return d;})
            .enter().append("rect")
            .attr("x", function(d){return focusX(d.data.date);})
            .attr("y", function(d){return focusY(d[1]);})
            .attr("height", function(d){return focusY(d[0])- focusY(d[1]);})
            .attr("width", focusX.bandwidth);
    
    focus.append("g")
            .classed("axis axis--x", true)
            .attr("transform", "translate(0," + focusHeight + ")")
            .call(focusXAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 40)
            .attr("dy", ".35em")
            .attr("transform", "rotate(70)");    
    
    focus.append("g")
            .classed("axis axis--y", true)
            .call(focusYAxis);      
});

function type(d, i, columns) {
    d.date = parseDate(d.date);
    d.date = formatDate(d.date);
    for (i = 1, t = 0; i < columns.length; ++i)
        t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}
