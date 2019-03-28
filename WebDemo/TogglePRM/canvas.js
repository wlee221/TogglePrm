/*
 * Author: William Lee
 */

var fillPath = true;
var canvas = document.getElementById('workspace');
var ctx = canvas.getContext('2d');

startCanvas();

var mouse = {x : 0, y : 0};
var start = {x : 0, y : 0};

canvas.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
}, false);

canvas.addEventListener('mousedown', function(e){
    // console.log(mouse.x, mouse.y);
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
    start.x = mouse.x;
    start.y = mouse.y;
    canvas.addEventListener('mousemove', onPaint, false);
}, false);

canvas.addEventListener('mouseup', function() {
    if (fillPath) {
        ctx.lineWidth = 3;
        ctx.lineTo(start.x, start.y);
        ctx.fillStyle = 'rgb(25, 25, 25)';
        ctx.fill();
    }
    canvas.removeEventListener('mousemove', onPaint, false);
}, false);

var onPaint = function() {
    ctx.strokeStyle = "rgb(25, 25, 25)";
    ctx.lineWidth = 2;
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
};

function startCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(25, canvas.height - 25, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(canvas.width - 25, 25, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "green";
    ctx.fill();
}

function clearCanvas() {
    Gfree = new Graph();
    Gobst = new Graph();
    c = null;
    startCanvas();
}

function fillPathCheckbox() {
    var checkBox = document.getElementById("fill");
    var el = document.getElementById("fill")
    if (checkBox.checked)
        fillPath = true;
    else
        fillPath = false;
}

