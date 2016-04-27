var width = 1600, height = 1000;

var color = d3.scale.category20();

graphs=d3.select("body").append("div").attr("class","graphs");
var canvas = d3.select("div.graphs").append("canvas")
    .attr("width", width)
    .attr("height", height);
    <!-- .attr("pointer-events", "all") -->
var zoom1=    d3.select("div.graphs").call(d3.behavior.zoom().scaleExtent([0.5, 8]).on("zoom", zoom));

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

for(n in nodes){
    nodes[n].fixed = true;
}

var force = d3.layout.force()
    .size([width, height])
//    .linkDistance(50)
    .on("tick", tick);

force.nodes(nodes)
    .links(links)
    .friction(0.01)
    //.linkDistance(function (l) { return l.distance; })
    .start();


var node = svg.selectAll(".node")
    .data(force.nodes())
    .enter().append("g")
    .attr("class", "node")
    .style("fill", function(d) { return color(d.group); })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);
// drag ?

var text = node.append("svg:text")
    .attr("class", "nodetext")
    .attr("fill", d3.lab("black"))
    .style("opacity", 0)
    .text(function(d) { return d.name });

var circle=node.append("circle")
    .attr("r", 6)
    ;

var transX=0,
    transY=0,
    gscale=1;
function redraw(){
    context.save();
    context.clearRect(0, 0, width, height);
    context.translate(transX, transY);
    context.scale(gscale, gscale);
    tick();
    context.restore();
    svg.attr('transform', svg.transform);
}

function zoom() {
    transX = d3.event.translate[0];
    transY = d3.event.translate[1];
    gscale = d3.event.scale;
    redraw();
}

svg.transform =
    function(d) {
        return 'translate(' +  transX  + ',' +  transY  + ')'+ " scale(" + gscale + ")";
    };


var input_search = false;
var selected = "";
var diam_orig = 4.5;
var diam = diam_orig;

function tick() {
    if(force.alpha()>=0.001) return;

    if(d3.event != null)
    {
        if(d3.event.hasOwnProperty("scale"))
            diam = diam_orig / (Math.abs(Math.pow(d3.event.scale,0.9)-0.8)+0.8);
        }
    else diam = diam_orig;

    circle.attr("cx", function(d) { return d.x; });
    circle.attr("cy", function(d) { return d.y; });
    text.attr("x", function(d) { return d.x; });
    text.attr("y", function(d) { return d.y; });

    context.clearRect(0, 0, width, height);

    // draw links
    context.strokeStyle = "#ccc";
    context.lineWidth = diam/diam_orig;
    context.beginPath();

    links.forEach(function(d) {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
        d.distance=Math.sqrt(Math.pow(links[0].source.x-links[0].target.x,2)+Math.pow(links[0].source.y-links[0].target.y,2));
    });
    context.stroke();

    // draw nodes
    nodes.forEach(function(d) {
        context.beginPath();
        if(input_search==false)
            context.fillStyle = color(Math.pow(d.group,2));
        else {
            context.fillStyle = d3.lab("grey");
        }
        if( selected != "")
            if( selected.split(" ").some(function(sel){return(d.name.indexOf(sel)>-1);})  )
                context.fillStyle = color(Math.pow(d.group,2));
        context.moveTo(d.x, d.y);

        context.arc(d.x, d.y, diam, 0, 2 * Math.PI);

        context.fill();
        context.font = (60*Math.pow(diam/diam_orig,1.2))+"px Open Sans";
        context.fillStyle = d3.lab("black");
        if(d.name==="emacs") context.fillText("emacs24",d.x+4,d.y+4);
        if( d.name==="cl-lib"
           | d.name === "s" | d.name==="f" | d.name==="dash"| d.name===";none;"| d.name==="helm")      context.fillText(d.name,d.x+4,d.y+4);

    });
}

force.alpha(0);
//while (force.alpha()) { force.tick(); }
force.tick();
transX= 100;
redraw();


function mouseover() {
    d3.select(this).select("circle").transition()
        .duration(7)
        .style("opacity", 1)
        .attr("r", 16*diam/diam_orig);
    d3.select(this).select("text").transition()
        .duration(750)
        .style("stroke-width", ".2px")
        .style("font", (100*Math.pow(diam/diam_orig,1.2))+"px serif")
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
    $("#search").keypress(function(e) {
        if(e.keyCode == 13)
        {
            e.preventDefault();
            searchNode();
            $(this).autocomplete('close');
        }
    });
});
function searchNode() {
    //find the node
    var selectedVal = document.getElementById('search').value;
    var node = svg.selectAll(".node");
    if (selectedVal === "") {
        node.style("stroke", "white").style("stroke-width", "1");
        input_search = false;
        redraw();
    } else {
        // selected = node.filter(function (d, i) {
        //     return d.name != selectedVal;
        // });
        input_search=true;
        //selected.style("opacity", "1");
        selected = selectedVal;
        // var link = svg.selectAll(".link")
        // link.style("opacity", "0");
        // d3.selectAll(".node, .link").transition()
        //     .duration(5000)
        //     .style("opacity", 1);
        redraw();
    }
}

      //window.open('data:application/json;charset=utf-8,' + JSON.stringify(nodes));
