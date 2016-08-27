/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//var width = 420,
//        barHeight = 20;
//
//var x = d3.scaleLinear()
//        .range([0, width]);
//
//var chart = d3.select(".chart")
//        .attr("width", width);
//
//var data = d3.tsv("./data/data.tsv", type, function (error, data) {
//    x.domain([0, d3.max(data, function (d) {
//            return d.value;
//        })]);
//
//    chart.attr("height", barHeight * data.length);
//
//    var bar = chart.selectAll("g")
//            .data(data)
//            .enter().append("g")
//            .attr("transform", function (d, i) {
//                return "translate(0," + i * barHeight + ")";
//            });
//
//    bar.append("rect")
//            .attr("width", function (d) {
//                return x(d.value);
//            })
//            .attr("height", barHeight - 1);
//
//    bar.append("text")
//            .attr("x", function (d) {
//                return x(d.value) - 3;
//            })
//            .attr("y", barHeight / 2)
//            .attr("dy", ".35em")
//            .text(function (d) {
//                return d.value;
//            });
//});
//
//function type(d) {
//    d.value = +d.value; // coerce to number
//    return d;
//}

var m = [20, 20, 30, 20],
        w = 960 - m[1] - m[3],
        h = 500 - m[0] - m[2];

var x,
        y,
        duration = 1500,
        delay = 500;

var svg = d3.select("body").append("svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

var dates,
        epics;

d3.csv("./data/data.csv", function (data) {
    var parseTime = d3.timeParse("%d/%e/%Y");

    //nest data values by date
    byDates = d3.nest()
            .key(function (d) {
                return d.date;
            })
            .sortKeys(d3.ascending)
            .entries(data);

    //parse dates and numbers
    //compute maximum numbers per date, needed for y-domain
    byDates.forEach(function (s) {
        s.values.forEach(function (d) {
            d.date = parseTime(d.date);
            d.tcCount = +d.tcCount;
        });
        s.maxValue = d3.max(s.values, function (d) {
            return d.value;
        });
        s.sumValue = d3.sum(s.values, function (d) {
            return d.value;
        });
    });

    //insert by dates
    var g = svg.selectAll("g")
            .data(dates)
            .enter().append("g")
            .attr("class", "date");

    //generate the stackedBar
//    setTimeout(stackedBar, duration);
    stackedBar();
});

function stackedBar() {
    x = d3.scaleBand()
            .range([0, w - 60])
            .round(.1);

    var stack = d3.stack()
            .keys(function (d) {
                return d.values;
            })
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

    var g = svg.selectAll(".date");
    stack(dates);

    y.domain([0, d3.max(dates[0].values.map(function (d) {
            return d.value + d.value0;
        }))])
            .range([h, 0]);
    var t = g.transition()
            .duration(duration / 2);

    t.select("text")
            .delay(dates[0].values.length * 10)
            .attr("transform", function (d) {
                d = d.values[d.values.length - 1];
                return "translate(" + (w - 60) + "," + y(d.value / 2 + d.value0) + ")";
            });

    t.selectAll("rect")
            .delay(function (d, i) {
                return i * 10;
            })
            .attr("y", function (d) {
                return y(d.value0 + d.value);
            })
            .attr("height", function (d) {
                return h - y(d.value);
            })
            .each("end", function () {
                d3.select(this)
                        .style("stroke", "#fff")
                        .style("stroke-opacity", 1e-6)
                        .transition()
                        .duration(duration / 2)
                        .attr("x", function (d) {
                            return x(d.date);
                        })
                        .attr("width", x.rangeBand())
                        .style("stroke-opacity", 1);
            });

}
