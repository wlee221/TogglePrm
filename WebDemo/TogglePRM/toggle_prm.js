/* 
 * Implementation of toggle prm
 *
 * Author: William Lee
 */

// Simple queue class
function Queue() {
    this.data = [];
}

Queue.prototype.add = function(data) {
    this.data.push(data);
}

Queue.prototype.pop = function() {
    var first = this.data[0];
    this.data.shift();
    return first;
}

Queue.prototype.empty = function() {
    return this.data.length == 0;
}

// Graph class:
// use adjacency lists to represent data
function Graph() {
    this.vertex = [];
    this.edges = [];
    this.cc = []; //connected components
}

Graph.prototype.addVertex = function(p) {
    this.vertex.push(p);
    this.edges[this.vertex.length - 1] = [];
    this.cc.push([this.vertex.length - 1]);
}

Graph.prototype.addEdge = function(i, j) {
    if (!this.edges[i].includes(j))
        this.edges[i].push(j);
    
    if (!this.edges[j].includes(i))
        this.edges[j].push(i);
    var component_i = this.getComponentIdx(i);
    var component_j = this.getComponentIdx(j);
    if (component_i != component_j){
        // combine components
        this.cc[component_i] = this.cc[component_i].concat(this.cc[component_j]);
        this.cc.splice(component_j, 1);
    }
    
}
Graph.prototype.getComponentIdx = function(i) {
    var component_i;
    for (component_i = 0; component_i < this.cc.length; component_i++) {
        if (this.cc[component_i].includes(i))
            return component_i;
    }    
    console.log("Error: Out of bounds");
}

Graph.prototype.draw = function(c) {
    var canvas = document.getElementById('workspace');
    var ctx = canvas.getContext('2d');

    for (var i = 0; i < this.vertex.length; i++) {
        p = this.vertex[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
        ctx.strokeStyle="rgb(160, 160, 160)";
        ctx.lineWidth=1;
        ctx.stroke();
    }

    for (var i = 0; i < this.edges.length; i++) {
        for (var j = 0; j < this.edges[i].length; j++) {
            var from = this.vertex[i];
            var to = this.vertex[this.edges[i][j]];
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.lineWidth=0.5;
            ctx.stroke();
        }
    }


    ctx.beginPath();
    ctx.arc(25, canvas.height - 25, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(canvas.width - 25, 25, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "green";
    ctx.fill();
}
// Connector

// settings
var k = 5; // k nearest neighbors
var n = 10; // number of samples per iteration

function Connector(scenario) {
    this.scenario = scenario;
}

function penalizedDist(graph, i, j) {
    var dist =  distsq(graph.vertex[i], graph.vertex[j]);
    if(graph.getComponentIdx(i) != graph.getComponentIdx(j))
        return dist/16;
    else 
        return dist;
}

// naive approach of k-nearest neighbor of vertex[idx], O(kn) using fixed size insertion sort
Connector.prototype.knearest = function(graph, idx) {
    arr = [];
    var pt = graph.vertex[idx];
    //console.log("finding k nearest neighbors for point", pt);
    //console.log(graph.vertex.length);

    for (var i = 0; i < graph.vertex.length; i++) {
        var p = graph.vertex[i];
        if (i == idx) continue; 
        //console.log("new distance is " + distsq(pt, p));

        if (arr.length < k) {
            arr.push(i);
        } else {
            arr[k] = i;
        }
        //console.log(arr);
        // sort arr using insertion sort
        for ( var j = arr.length - 1; j > 0; j--) {
            point_j = graph.vertex[arr[j]];
            point_jm1 = graph.vertex[arr[j-1]];
            if (penalizedDist(graph, idx, arr[j]) < penalizedDist(graph, idx, arr[j - 1])) {
                [arr[j-1], arr[j]] = [arr[j], arr[j-1]];
            } else {
                break;
            }
        }
/*
        var str ="[ ";
        for (var tmp = 0; tmp < arr.length; tmp++) {
            str = str + distsq(pt, graph.vertex[arr[tmp]]) + " ";
        }
        str = str + "]";
        console.log(str)
       */ 

    }
    return arr.slice(0, k);
}

Connector.prototype.connect = function(graph, toggle, witness) {
    for (var i = 0; i < graph.vertex.length; i++) {
        knearest = this.knearest(graph, i);
        for (var j = 0; j < knearest.length; j++) {
            var from = graph.vertex[i];
            var to = graph.vertex[knearest[j]];
            if (this.scenario.link(from, to, toggle, witness)){ 
                graph.addEdge(i, knearest[j]);
            }
        }
    }
}

// Uniform sampler
function UniformSampler() {
    var canvas = document.getElementById('workspace');
    var ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
}

UniformSampler.prototype.sample = function() {
    var x = Math.random() * (this.width + 1);
    var y = Math.random() * (this.height + 1);
    var p = new Point(x, y);
    return p;
}

// Initialize Roadmap Graph Gfree and Gobst.
var Gfree = new Graph();
var Gobst = new Graph();

var sampler = new UniformSampler();
//var q = new Queue();
var done = false;
var c = null;

function growRoadmap() {

    var canvas = document.getElementById('workspace');
    var ctx = canvas.getContext('2d');
    if (c != null) {
        s = c.scenario;
        ctx.putImageData(s.imageData, 0, 0);
    }

    if (c == null) {
        c = new Connector(new Scenario());
        Gfree.addVertex(new Point(25, 475));
        Gfree.addVertex(new Point(775, 25));
    }

    var toggle = false; // if toggle is false, explore free space. Else explore obst space.

    var q = new Queue();
    for (var i = 0; i < n; ++i) {
        q.add(sampler.sample());
    }

    for (var i = 0; i < 5*n; ++i) {

        if (q.empty()) break;

        var node = q.pop();
        if (c.scenario.valid(node, toggle)) {
            Gfree.addVertex(node);

            var collisionNodes = [];
            c.connect(Gfree, toggle, collisionNodes);
            //console.log(collisionNodes);
            for (var j = 0; j < collisionNodes.length; ++j)
                q.add(collisionNodes[j]);
        } else {
            toggle = !toggle;
            Gobst.addVertex(node);
            var validNodes = [];
            c.connect(Gobst, toggle, validNodes);
            for (var j = 0; j < validNodes.length; ++j) {
                q.add(validNodes[j]);
            }
            toggle = !toggle;
        }
    }
    
    Gfree.draw(c);
    Gobst.draw(c);
    shortestPath(Gfree);
}

function shortestPath(graph) {
    // https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
    var q = new Array(graph.vertex.length);
    var dist = new Array(graph.vertex.length);
    var prev = new Array(graph.vertex.length); 

    for (var i = 0; i < graph.vertex.length; i++) {
        q[i] = i;
        dist[i] = Number.POSITIVE_INFINITY;
        prev[i] = null;
    }

    dist[0] = 0;

    while (q.length > 0) {
        minDist = Number.POSITIVE_INFINITY;
        minIdx = -1;
        for (var i = 0; i < q.length; i++) {
            if (dist[q[i]] < minDist) {
                minIdx = q[i];
                minDist = dist[q[i]];
            }
        }

        var u = minIdx;
        q.splice(q.indexOf(u), 1); // remove u from q

        if (u == -1) 
            break;
        for (var i = 0; i < graph.edges[u].length; i++) {
            var v = graph.edges[u][i];
            var alt = dist[u] + distsq(graph.vertex[u], graph.vertex[v]);
            if (alt < dist[v]) {
                dist[v] = alt;
                prev[v] = u;
            }
        }
    }
    if (prev[1] == null){
        console.log("no path found.");
    }
    else {
        var PathCost = 0;
        var u = 1;
        var canvas = document.getElementById('workspace');
        var ctx = canvas.getContext('2d');
        ctx.beginPath();

        ctx.strokeStyle="rgb(255, 0, 0)";
        ctx.lineWidth=2;

        ctx.moveTo(graph.vertex[u].x, graph.vertex[u].y);        
        while (prev[u] != null) {
            PathCost = PathCost + distsq(graph.vertex[u], graph.vertex[prev[u]]);
            u = prev[u];
            ctx.lineTo(graph.vertex[u].x, graph.vertex[u].y);
            ctx.stroke();
        }
        console.log("Path cost = " + Math.sqrt(PathCost));
    }
}