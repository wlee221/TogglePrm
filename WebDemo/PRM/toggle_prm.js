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
}

Graph.prototype.addVertex = function(p) {
    this.vertex.push(p);
}

Graph.prototype.draw = function(c) {
    var canvas = document.getElementById('workspace');
    var ctx = canvas.getContext('2d');
    if (c != null) {
        s = c.scenario;
        ctx.putImageData(s.imageData, 0, 0);
    }
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

// naive approach of k-nearest neighbor of vertex[idx], O(kn) using fixed size insertion sort
Connector.prototype.knearest = function(graph, idx) {
    arr = [];
    //console.log("finding k nearest neighbors for point", pt);
    var pt = graph.vertex[idx];

    for (var i = 0; i < graph.vertex.length; i++) {
        var p = graph.vertex[i];
        if (i == idx) continue; 
        //console.log("new distance is " + distsq(pt, p));

        if (arr.length < k) {
            arr.push(i);
        } else {
            arr[k] = i;
        }

        // sort arr using insertion sort
        for ( var j = arr.length - 1; j > 0; j--) {
            point_j = graph.vertex[arr[j]];
            point_jm1 = graph.vertex[arr[j-1]];
            if (distsq(pt, point_j) < distsq(pt, point_jm1)) {
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

Connector.prototype.connect = function(graph, toggle) {
    for (var i = 0; i < graph.vertex.length; i++) 
        if (graph.edges[i] == null) 
            graph.edges[i] = [];
    for (var i = 0; i < graph.vertex.length; i++) {
        knearest = this.knearest(graph, i);
        for (var j = 0; j < knearest.length; j++) {
            var from = graph.vertex[i];
            var to = graph.vertex[knearest[j]];
            if (this.scenario.link(from, to)){ 
                if (!graph.edges[i].includes(knearest[j])){
                    graph.edges[i].push(knearest[j]);
                }                
                if (!graph.edges[knearest[j]].includes(i)){
                    graph.edges[knearest[j]].push(i);
                }
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
    if (c == null) {
        c = new Connector(new Scenario());
        Gfree.addVertex(new Point(25, 475));
        Gfree.addVertex(new Point(775, 25));
    }
    toggle = false; // if toggle is false, explore free space. Else explore obst space.
    for (var i = 0; i < 15; ++i) {
        var node = sampler.sample();
        if (c.scenario.valid(node)) {
            Gfree.addVertex(node);
        }
    }
    c.connect(Gfree)
    Gfree.draw(c);
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