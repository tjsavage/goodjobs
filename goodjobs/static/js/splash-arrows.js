var PI = Math.PI;

function Path(root, initialAngle) {
    this.root = root;
    this.nodes = new Array();
    this.nodes.push(this.root);
    this.endpoint = root;
    this.angle = initialAngle;
    this.angles = new Array();
    this.angles.push(initialAngle);
}

Path.prototype.addNode = function(angleChange, distance) {
    this.angle += angleChange;
    var nextNode = {x: this.endpoint.x + distance * Math.cos(this.angle), 
                    y: this.endpoint.y + distance * Math.sin(this.angle)};
    this.nodes.push(nextNode);
    this.endpoint = nextNode;
    this.angles.push(this.angle);
}

Path.prototype.pathSequence = function() {
    var pathSequence = []
    pathSequence.push("M", this.root.x, this.root.y);
    pathSequence.push("R");
    for (var i = 1; i < this.nodes.length; i++) {
        pathSequence.push(this.nodes[i].x, this.nodes[i].y);
    }

    return pathSequence;
}

Path.prototype.getBranch = function() {
    var branch = new Path(this.root, this.angle);
    branch.nodes = new Array();
    $.each(this.nodes, function(i, node) {
        branch.nodes.push(node);
        branch.endpoint = node;
    });
    return branch;
}

function generateRandomPath(root, initialAngle, maxAngle, splitDistance, steps) {
    var path = new Path(root, initialAngle);
    for(var i = 0; i < steps; i++) {
        path.addNode((Math.random() * 2 - 1) * maxAngle, splitDistance);
    }
    return path;
}

function generateRelatedPath(basePath, sharedSteps, totalSteps, splitDistance, maxAngle) {
    var path = new Path(basePath.root, basePath.angles[sharedSteps - 1]);
    for(var i = 1; i < sharedSteps; i++) {
        var newNode = {x: basePath.nodes[i - 1].x, y: basePath.nodes[i - 1].y};
        path.nodes.push(newNode);
        path.angles.push(basePath.angles[i])
    }
    path.endpoint = path.nodes[path.nodes.length - 1];
    path.angle = basePath.angles[sharedSteps - 1];

    for(var i = sharedSteps; i < totalSteps; i++) {
        path.addNode((Math.random() * 2 - 1) * maxAngle, splitDistance);
    }

    return path;
}

function generateRandomTree(root, branches, splitDistance, initialAngle, maxAngle, branchProb) {
    var firstPath = new Path(root, initialAngle);
    var paths = new Array();
    paths.push(firstPath);
    for(var i = 0; i < branches; i++) {
        var newPaths = [];
        $.each(paths, function(i, path) {
            if (Math.random() < branchProb) {
                var childPath = path.getBranch();
                console.log(childPath);
                console.log(path);
                path.addNode(Math.random() * maxAngle, splitDistance);
                childPath.addNode((0 - Math.random()) * maxAngle, splitDistance);
                newPaths.push(childPath);
            }
        });
        paths = paths.concat(newPaths);
    }
    return paths;
}

function drawPath( canvas, pathstr, duration, attr, callback )
{
    var guide_path = canvas.path( pathstr ).attr( { stroke: "none", fill: "none" } );
    var path = canvas.path( guide_path.getSubpath(0, 1) ).attr( attr );
    var total_length = guide_path.getTotalLength( guide_path );
    var last_point = guide_path.getPointAtLength( 0 );
    var start_time = new Date().getTime();
    var interval_length = 20;
    var result = path;
    var attr = $.extend({}, attr);     

    var interval_id = setInterval( function()
    {
        var elapsed_time = new Date().getTime() - start_time;
        var this_length = elapsed_time / duration * total_length;
        var subpathstr = guide_path.getSubpath( 0, this_length );            
        attr.path = subpathstr;
        path.animate( attr, interval_length );
        if ( elapsed_time >= duration )
        {
            clearInterval( interval_id );
            if ( callback != undefined ) callback();
            guide_path.remove();
        }                                       
    }, interval_length ); 
    return result;
}

window.onload = function() {
    var HEIGHT = $("#canvas-container").height();
    var WIDTH = $("#canvas-container").width();
    console.log(WIDTH);
    var MAX_PATHS = 20
    var MAX_ANGLE = PI / 4.0;
    var SPLIT_DISTANCE = 180;
    var STEPS = 5;
    var MIN_SHARED = 3;
    var OPTIONS = {
        stroke: '#0076a0',
        'stroke-width': 30,
        'stroke-opacity': .8,
        'stroke-linecap': 'round'
    }
    var paper = new Raphael('canvas-container', $("#canvas-container").width(), $("#canvas-container").height());


    $(window).resize(function() {
        var HEIGHT = $("#canvas-container").height();
        var WIDTH = $("#canvas-container").width();
        paper = new Raphael('canvas-container', $("#canvas-container").width(), $("#canvas-container").height());
    });

    var thePath = generateRandomPath({x: WIDTH / 2.0, y:HEIGHT}, -PI / 2.0, PI / 6.0, SPLIT_DISTANCE, STEPS);
    
    var drawRoutine = function() {
        var ppath = thePath.pathSequence();
        var pathSet = paper.set();
        $.each(thePath.nodes, function(i, node) {
                var waypoint = paper.circle(node.x, node.y, 0);
                setTimeout(function() {
                    waypoint.animate({r: 20, 'stroke-width': 10}, 1000, "bounce");
                }, i*400);
                
                pathSet.push(waypoint);
        });
        pathSet.push(drawPath(paper, ppath, 4000, OPTIONS, function() {
            setTimeout( function() {
                thePath = generateRandomPath({x: WIDTH / 2, y:HEIGHT}, -PI / 2.0, PI / 6.0, SPLIT_DISTANCE, STEPS);
                pathSet.animate({ opacity: 0}, 10000, function() {
                    this.remove();
                });
                drawRoutine();
            }, 1000);
        }));
    }

    drawRoutine();
};