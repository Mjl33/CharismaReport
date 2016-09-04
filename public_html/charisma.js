var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var stack = d3.stack();

d3.csv("./data/data.csv", type, function (error, data) {
    if (error)
        throw error;

    // x.domain(mindate, maxdate)
    x.domain([d3.min(data, function (d) {
        return d.date;
    }), d3.max(data, function (d) {
        return d.date;
    })]);
    //y.domain(0, maxSumTcCount)
    y.domain([0, d3.max(data, function (d) {
        return d.total;
    })]).nice();
    //map z ranges to distinct epics
    z.domain(data.columns.slice(1));

    //construct stacked bar
    // g.selectAll(".serie")
    //         .data(stack.keys(data.columns.slice(1))(data))
    //         .enter().append("g")
    //         .attr("class", "serie")
    //         .attr("fill", function (d) {
    //             return z(d.key);
    //         })
    //         .selectAll("rect")
    //         .data(function (d) {
    //             return d;
    //         })
    //         .enter().append("rect")
    //         .attr("x", function (d) {
    //             return x(d.data.date);
    //         })
    //         .attr("y", function (d) {
    //             return y(d[1]);
    //         })
    //         .attr("height", function (d) {
    //             return y(d[0]) - y(d[1]);
    //         })
    //         .attr("width", 15);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)));
    //
    // g.append("g")
    //         .attr("class", "axis axis--y")
    //         .call(d3.axisLeft(y).ticks(10, "s"))
    //         .append("text")
    //         .attr("x", 2)
    //         .attr("y", y(y.ticks(10).pop()))
    //         .attr("dy", "0.35em")
    //         .attr("text-anchor", "start")
    //         .attr("fill", "#000")
    //         .text("Test Cases");
    //
    // var legend = g.selectAll(".legend")
    //         .data(data.columns.slice(1).reverse())
    //         .enter().append("g")
    //         .attr("class", "legend")
    //         .attr("transform", function (d, i) {
    //             return "translate(0," + i * 20 + ")";
    //         })
    //         .style("font", "10px sans-serif");
    //
    // legend.append("rect")
    //         .attr("x", width - 18)
    //         .attr("width", 18)
    //         .attr("height", 18)
    //         .attr("fill", z);

});

function type(d, i, columns) {
    parseDate = d3.timeParse("%d/%m/%Y");
    d.date = parseDate(d.date);
    for (i = 1, t = 0; i < columns.length; ++i)
        t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}

