/*
 * Valid and link functions for planners
 */

// TODO: we should store canvas pixel datas before we run prm (as pixels will get overwrited).
function Point(x, y) {
    this.x = x;
    this.y = y;
}

// computes squared distance between two points
function distsq(p, q) {
    return (p.x - q.x)*(p.x - q.x) + (p.y - q.y)*(p.y - q.y)
}

function Scenario() {
	var canvas = document.getElementById('workspace');
	this.width = canvas.width;
	this.height = canvas.height;
	this.ctx = canvas.getContext('2d');
}

Scenario.prototype.getRGBA = function(x, y) {
	var pixel = ctx.getImageData(x, y, 1, 1);
	var data = pixel.data;
	var rgba = new Array(data[0], data[1], data[2], data[3]);
	return rgba;
}

Scenario.prototype.valid = function(p) {
	var rgba = this.getRGBA(p.x, p.y);
	var r = rgba[0];
	var g = rgba[1];
	var b = rgba[2];
	return r == 0 && g == 0 && b == 0;
}

Scenario.prototype.link = function(p, q) {
	return true;
}