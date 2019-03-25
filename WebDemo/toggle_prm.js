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

Graph.prototype.draw = function() {
    var canvas = document.getElementById('workspace');
    var ctx = canvas.getContext('2d');
    for (var i = 0; i < this.vertex.length; i++) {
        p = this.vertex[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
        ctx.strokeStyle="black";
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
            ctx.lineWidth=1;
            ctx.stroke();
        }
    }
}
// Connector

// settings
var k = 3; // k nearest neighbors
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
    for (var i = 0; i < graph.vertex.length; i++) {
        knearest = this.knearest(graph, i);
        if(graph.edges[i] == null) 
            graph.edges[i] = [];
        for (var j = 0; j < knearest.length; j++) 
            if (!graph.edges.includes(knearest[j]))
                graph.edges[i].push(knearest[j]);
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
var scenario = new Scenario();
var q = new Queue();
var done = false;

for (var i = 0; i < 15; i++) {
    var p = sampler.sample();
    Gfree.addVertex(p);
}


/*
while (!done) {
    var p = sampler.sample();
    q.add(p);
    console.log(p);
    while (!done && !q.empty()) {
        var node = q.pop();
        if (scenario.valid(node)) {
            Gfree.push(node);
            collisionNodes = scenario.connect(Gobst);
            for (n in collisionNodes) {
                q.add(n);
            }
        } else {

        }
    }
    break;
}
*/