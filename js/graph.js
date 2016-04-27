var width = 2350, height = 1900;

var color = d3.scale.category20();

graphs=d3.select("body").append("div").attr("class","graphs");
var canvas = d3.select("div.graphs").append("canvas")
    .attr("width", width)
    .attr("height", height);
    <!-- .attr("pointer-events", "all") -->
    d3.select("div.graphs").call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom));

svg = d3.select("div.graphs")
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g');



svg.append('rect')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height);

var context = canvas.node().getContext("2d");

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(50)
    .charge(-120)
    .on("tick", tick)
    .start();

var node = svg.selectAll(".node")
    .data(force.nodes())
    .enter().append("g")
    .attr("class", "node")
    .style("fill", function(d) { return color(d.group); })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .call(force.drag);

var text = node.append("svg:text")
    .attr("class", "nodetext")
    .attr("fill", d3.lab("black"))
    .style("opacity", 0)
    .text(function(d) { return d.name });

var circle=node.append("circle")
    .attr("r", 6)
    .style("opacity", 0)
    .attr("transform", svg.transform);

function zoom() {
    context.save();
    context.clearRect(0, 0, width, height);
    context.translate(d3.event.translate[0], d3.event.translate[1]);
    context.scale(d3.event.scale, d3.event.scale);
    tick();
    context.restore();
    circle.attr('transform', svg.transform);
    text.attr('transform', svg.transform);
}

svg.transform =
    function(d) {
        return 'translate(' +  d3.event.translate[0]  + ',' +  d3.event.translate[1]  + ')'+ " scale(" + d3.event.scale + ")";
    };


    <!-- function redraw() { -->
                             <!-- vis.attr("transform", -->
                                           <!-- "translate(" + d3.event.translate + ")" -->
                                           <!-- + " scale(" + d3.event.scale + ")"); -->
                             <!-- } -->

    <!-- var link = vis.selectAll(".link") -->
    <!-- .data(force.links()) -->
    <!-- .enter().append("line") -->
    <!-- .attr("class", "link") -->
    <!-- .style("stroke-width", function(d) { return Math.sqrt(d.value); }); -->

    <!-- var node = vis.selectAll(".node") -->
    <!-- .data(force.nodes()) -->
    <!-- .enter().append("g") -->
    <!-- .attr("class", "node") -->
    <!-- .style("fill", function(d) { return color(d.group); }) -->
    <!-- .style("opacity", 1) -->
    <!-- .on("mouseover", mouseover) -->
    <!-- .on("mouseout", mouseout) -->
    <!-- .call(force.drag); -->

    <!-- node.append("circle") -->
    <!-- .attr("r", 6) -->

    <!-- node.append("svg:text") -->
    <!-- .attr("class", "nodetext") -->
    <!-- .attr("dx", 12) -->
    <!-- .attr("dy", ".35em") -->
    <!-- .text(function(d) { return d.name }); -->
    var input_search = false;
var selected = null;
function tick() {
    circle.attr("cx", function(d) { return d.x; });
    circle.attr("cy", function(d) { return d.y; });
    text.attr("x", function(d) { return d.x; });
    text.attr("y", function(d) { return d.y; });

    context.clearRect(0, 0, width, height);

    // draw links
    context.strokeStyle = "#ccc";
    context.beginPath();
    links.forEach(function(d) {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
    });
    context.stroke();

    // draw nodes
    nodes.forEach(function(d) {
        context.beginPath();
        if(input_search==false)      context.fillStyle = color(d.group);
        else {context.fillStyle = d3.lab("grey");}
        if(selected != null)
            if( selected.indexOf(d.name) > -1 ) context.fillStyle = color(d.group);;
        context.moveTo(d.x, d.y);
        context.arc(d.x, d.y, 4.5, 0, 2 * Math.PI);
        context.fill();
        context.font = "60px Open Sans";
        context.fillStyle = d3.lab("black");
        if(d.name==="emacs") context.fillText(d.name,d.x+4,d.y+4);
        if( d.name==="cl-lib"
           | d.name === "s" | d.name==="f" | d.name==="dash"| d.name===";none;"| d.name==="helm")      context.fillText(d.name,d.x+4,d.y+4);

    });
}
    <!-- node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; }); -->


    <!-- function mouseover() { -->
                                <!-- d3.select(this).select("circle").transition() -->
                                <!-- .duration(750) -->
                                <!-- .attr("r", 16); -->
                                <!-- d3.select(this).select("text").transition() -->
                                <!-- .duration(750) -->
                                <!-- .attr("x", 13) -->
                                <!-- .style("stroke-width", ".5px") -->
                                <!-- .style("font", "100px serif") -->
                                <!-- .style("opacity", 1); -->
                                <!-- } -->

    <!-- var k = 0; -->
    <!-- while ((force.alpha() > 1e-2) && (k < 150)) { -->
                                                       <!--     force.tick(), -->
                                                       <!--     k = k + 1; -->
                                                       <!-- } -->

while (force.alpha()) { force.tick(); }


function mouseover() {
    d3.select(this).select("circle").transition()
        .duration(7)
        .style("opacity", 1)
        .attr("r", 16);
    d3.select(this).select("text").transition()
        .duration(750)
        .style("stroke-width", ".5px")
        .style("font", "100px serif")
        .style("opacity", 1);
}

function mouseout() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .style("opacity", 0)
        .attr("r", 8);
}

var optArray = [];
for (var i = 0; i < nodes.length - 1; i++) {
    optArray.push(nodes[i].name);
}
optArray = optArray.sort();
$(function () {
    $("#search").autocomplete({
        source: optArray
    });
});
function searchNode() {
    //find the node
    var selectedVal = document.getElementById('search').value;
    var node = svg.selectAll(".node");
    if (selectedVal === "") {
        node.style("stroke", "white").style("stroke-width", "1");
        input_search = false;
        tick();
    } else {
        selected = node.filter(function (d, i) {
            return d.name != selectedVal;
        });
        input_search=true;
        selected.style("opacity", "0");
        selected = selectedVal;
        // var link = svg.selectAll(".link")
        // link.style("opacity", "0");
        // d3.selectAll(".node, .link").transition()
        //     .duration(5000)
        //     .style("opacity", 1);
        tick();
    }
}
      // window.open('data:application/json;charset=utf-8,' + JSON.stringify(links));
      // window.open('data:application/json;charset=utf-8,' + JSON.stringify(nodes));
