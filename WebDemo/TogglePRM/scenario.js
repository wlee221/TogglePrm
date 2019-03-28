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
    var ctx = canvas.getContext('2d');
    this.imageData = ctx.getImageData(0, 0, this.width, this.height);
}

Scenario.prototype.getRGBA = function(x, y) {
    var pixels = this.imageData.data;
    var idx = (y * (this.width * 4)) + (x * 4)
    var rgba = new Array(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]);
    return rgba;
}

Scenario.prototype.valid = function(p, toggle = false) {
    var rgba = this.getRGBA(Math.round(p.x), Math.round(p.y));
    var r = rgba[0];
    var g = rgba[1];
    var b = rgba[2];
    var valid = !(Math.abs(r - 25) < 5 && Math.abs(g - 25) < 5 && Math.abs(b - 25) < 5); // test for approximate values to account for antialiasing
    if (toggle)
        return !valid;
    else
        return valid;
}

Scenario.prototype.link = function(p, q, toggle = false) {
    if (!this.valid(p, toggle) || !this.valid(q, toggle))
        return false;
    return this.bisect(p, q);
}

Scenario.prototype.bisect = function(p, q) {
    var mid = new Point((p.x + q.x) / 2, (p.y + q.y) / 2);
    var distSquared = distsq(p, q)
    var tol = 0.5;
    if (distSquared < tol * tol)
        return true;
    if (!this.valid(mid))
        return false;
    if (!this.bisect(p, mid))
        return false;
    return this.bisect(mid, q);
}