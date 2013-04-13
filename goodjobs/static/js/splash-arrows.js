var colors = {
    'blue': '#77DDED'
};

var PI = Math.PI;
var ROOT = {x: 100, y:0};
var SPEED = 0.1;

var pathLayer, paths, pathSplines, stage;


function RandomPath (root, maxAngle) {
    this.root = root;
    this.points = new Array();
    this.points.push(root);
    this.endpoint = {x: root.x, y: root.y};
    this.angle = PI / 2.0;
    this.maxAngle = maxAngle;
    this.distanceSinceTurn = 0;
}

RandomPath.prototype.grow = function(distance) {
    this.endpoint = {x: this.endpoint.x + distance * Math.cos(this.angle),
                    y: this.endpoint.y + distance * Math.sin(this.angle)};
    this.distanceSinceTurn += distance;
}

RandomPath.prototype.turn = function() {
    this.points.push(this.endpoint);
    this.endpoint = {x: this.endpoint.x, y: this.endpoint.y};
    this.angle = this.angle + (Math.random() * 2 - 1) * this.maxAngle;
}

RandomPath.prototype.allPoints = function() {
    return this.points.concat(this.endpoint);
}

