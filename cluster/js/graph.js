var diameter = 1600,
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    //.nodeSize([0.2, innerRadius/3])
    .sort(null)
    .separation(function separation(a, b) {
        return 10;//(a.parent == b.parent ? 1 :1) / a.depth;
})
    .value(function(d) { return d.size/d.size; });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.1)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

var link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node");
var data;
d3.json("data/packages.json", function(error, data) {
    if (error) throw error;
    var packages = data.nodes;
    var json_nodes ={};
    var json_nodesp = {"name":"",children:[]};
    var json_links =[];

    // function find(name, data){
    //     var node = packages[name][0];
    //     var child = d3.entries(node["children"]);

    //     if(Object.keys(child).length != []) {
    //         node.children=[];
    //         child.forEach(function(d){return find(d, packages);});
    //     }

    //     return node;
    // }
    function find_node(pname){
        if(json_nodesp.children.some(function(d) {return (d.name === pname);}))
            return json_nodesp.children.filter(function(d) {return (d.name === pname);})[0];
        if (packages.hasOwnProperty(pname)) {
            var node ={};
            node.name=pname;
            node.parent=json_nodesp;
            var child = d3.entries(packages[pname]["children"]);

            if(Object.keys(child).length != 0) {
                node.children=child;;
            }
            return(node);
        }
        console.log("Error 1: " + pname);
    }
    var test={};
    for (var package in packages) {
        json_nodesp.children.push(find_node(package));
    }
    // for (var i=0; i<  json_nodesp.children.length; i++){
    //     if(json_nodesp.children[i].hasOwnProperty("children")){
    //         var childs=[];
    //         json_nodesp.children[i].children.forEach(
    //             function(d){ var a= find_node(d.value);
    //                          if(typeof a === "undefined"){
    //                              console.log ("Error 3: " + d.value +" -- " + json_nodesp.children[i].name );
    //                              console.log (a);
    //                          }
    //                          if(Object.keys(a).length ===0 )
    //                              console.log("Error 2: " + d.value);
    //                          childs.push(a);});
    //         json_nodesp.children[i].children=childs;
    //     }
    //}
    // for (var package in packages) {
    //     if (packages.hasOwnProperty(package)) {
    //         json_nodes[package]={};
    //         json_nodes[package].name=package;
    //         json_nodes[package].parent=json_nodesp;
    //         var child = d3.entries(packages[package]["children"]);

    //         if(Object.keys(child).length != []) {
    //             json_nodes[package].children=[];
    //             child.forEach(function(d){return json_nodes[package].children.push(find_node(d.value));});
    //         }
    //         json_nodesp.children.push(json_nodes[package]);
    //     }
    // }

    // d3.entries(packages)
    //     .forEach(
    //         function(d){
    //             json_nodes.push({"parent":d.value['name'][0], "children":d.value['children']});});
    // for ( package in json_nodes) {
    //     if( Object.keys(packages[package].children).length != 0) {
    //         json_nodes[package].children.forEach(function(dep){
    //             json_links.push({"source":json_nodes[package],"target": dep});
    //         });
    //     };
    // };

    var plinks = data.links;
    plinks.forEach(function(l){
        json_links.push({"source":find_node(l.source),"target":find_node(l.target)});
    });

    var nodes = cluster.nodes(json_nodesp);//.slice(0,json_nodesp.children.length),
    var tempy=nodes[40].y;
    nodes = nodes.map(function(d){d.y=tempy;return (d);});
    var links = json_links;


    node = node
        .data(nodes.filter(function(n) { return ( !(n.name==="")); }))
        //.data(nodes)
        .enter().append("text")
        .attr("class", "node")
        .attr("dy", ".31em")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
        .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .text(function(d) { return d.name; })
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted);

    link = link
        .data(bundle(links))//.filter(function(n) { return ( ((n.target.name==="s") | (n.source.name==="s"))  ); })))
        .enter().append("path")
        .each(function(d) { d.source = d[0], d.target = d[d.length -1]; })
        .attr("class", "link")
        .attr("d", line);

function mouseovered(d) {
  node
      .each(function(n) { n.target = n.source = false; });

  link
      .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
      .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
    .filter(function(l) { return l.target === d || l.source === d; })
      .each(function() { this.parentNode.appendChild(this); });

  node
      .classed("node--target", function(n) { return n.target; })
      .classed("node--source", function(n) { return n.source; });
}

function mouseouted(d) {
  link
      .classed("link--target", false)
      .classed("link--source", false);

  node
      .classed("node--target", false)
      .classed("node--source", false);
}
});
