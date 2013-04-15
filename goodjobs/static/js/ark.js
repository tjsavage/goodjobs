var PI = Math.PI;
var DIST = 130;
var ARC_OPTIONS = {
        stroke: '#0076a0',
        'stroke-width': 30,
        'stroke-opacity': .8,
        'stroke-linecap': 'round'
    }

var Ark = {
    setPaper: function(paper) {
        this.paper = paper;
    },

    loadPath: function(rootX, rootY, callback) {
        $.getJSON('/api/path/', function(data, status, jqXHR) {
            var root = new Ark.Node(data[0]);
            root.set("position", {x: rootX, y: rootY});
            var prevNode = root;
            for(var i = 1; i < data.length; i++) {
                var node = new Ark.Node(data[i]);
                prevNode.addChild(node);
                prevNode = node;
                var nodeView = new Ark.NodeView({"model": node});
            }
            callback(new Ark.Tree({"root": root}));
        });
    },

    drawNode: function(model) {
        var el = this.paper.circle(model.get("position").x,model.get("position").y,40);
        el.attr({fill: "red"});

        return el;
    },

    drawPath: function(pathString) {
        return this.paper.path( pathString ).attr( { stroke: "blue", fill: "blue" } );
    },

    drawArc: function(start, end) {
        var pathString = [["M", start.x, start.y], ["R"], [end.x, end.y], ["z"]];
        return this.paper.path(pathString).attr(ARC_OPTIONS);
    },

    animateDrawArc: function (start, end, callback ) {
        var pathString = [["M", start.x, start.y], ["R"], [end.x, end.y], ["z"]];
        return this.paper.path(["M", start.x, start.y], ["R"], [start.x, start.y], ["z"]).animate({ path: pathString, stroke:"blue", fill: "blue"}, 5000, "linear");

    },

    drawSet: function() {
        return this.paper.set();
    }
}

Ark.REST = {
    getChild: function(parent, callback, scope) {
        $.getJSON('/api/path/child/', function(data, status, jqXHR) {
            data["position"] = parent.get("position");
            callback.call(scope, new Ark.Node(data));
        });
    }
}

Ark.Tree = Backbone.Model.extend({
    initialize: function() {

    },

    getPath: function() {
        var node = this.get("root");
        var points = new Array();
        while(node) {
            points.push(node.get("position"));
            if (!node.children.size) break;
            node = node.children.at(0);
        }
        return points;
    }
});

Ark.Node = Backbone.Model.extend({
    defaults: {
        parent: null,
        locked: false,
        position: {x: 0, y:0},
        size: 60, 
        maxChildren: 3
    },

    initialize: function() {
        this.children = new Ark.NodeList();
        this.potentialChildren = new Ark.NodeList();
        this.on("change:children", this.childrenChangeHandler, this);
        this.on("change:position", this.childrenChangeHandler, this);
    },

    x: function(){return this.get("position").x},
    y: function(){return this.get("position").y},

    addChild: function(node) {
        this.children.add(node);
        this.trigger("change:children");
    },

    fetchChild: function() {
        Ark.REST.getChild(this, function(child) {
            new Ark.NodeView({model: child});
            this.addChild(child);
        }, this);
    },

    childrenChangeHandler: function() {
        var startAngle = PI;
        var angleDelta = PI * 1.0 / (this.children.length + 1);
        var i = 0;
        this.children.each(function(child) {
            var angle = startAngle + angleDelta * (i+1);

            child.set("position", {x: this.get("position").x + Math.cos(angle) * DIST,
                                y: this.get("position").y + Math.sin(angle) * DIST});
            i++;
        }, this);
    },

    move: function(d) {
        this.set("position", {x: this.get("position").x + d.x, y: this.get("position").y + d.y});
        this.trigger("change:children");
    },

    description: function() {
        return this.get("organization") + " - " + this.get("position");
    }
});

Ark.NodeList = Backbone.Collection.extend({
    model: Ark.Node,
    initialize: function(models, options) {
    }
});

Ark.ArcView = Backbone.View.extend({
    initialize: function() {
        this.element = Ark.drawArc(this.get("start").get("position"), this.get("end").get("position"));
        this.robj = this.element;
        this.setElement(this.element.node);
    }
})

Ark.NodeView = Backbone.View.extend({
    initialize: function() {
        this.element = Ark.drawNode(this.model);
        this.robj = this.element;
        this.setElement(this.element.node);
        this.model.on('change:position', this.render, this);
        this.model.on('change:children', this.updateArcs, this);
        this.model.on('change:position', this.updateArcs, this);
        this.arcs = Ark.drawSet();
    },
    events: {
        'click': 'onClick',
        'hover': 'onHover',
        'mouseover': 'onHover',
        'mouseout': 'onEndHover'
    },

    updateArcs: function() {
        this.arcs.remove();

        this.arcs = Ark.drawSet();

        for(var i = 0; i < this.model.children.length; i++) {
            this.arcs.push(Ark.drawArc(this.model.get("position"), this.model.children.at(i).get("position")));
        }

        this.arcs.toBack();
    },

    render: function() {
        this.element.animate({"cx": this.model.get("position").x, "cy": this.model.get("position").y}, 500, "elastic");
        
    },

    onClick: function() {
        this.model.fetchChild();
    }
});

Ark.TreeView = Backbone.View.extend({
    initialize: function() {
        this.element = Ark.drawPath(this.pathString());
        this.robj = this.element;
        this.setElement(this.element.node);
    },

    pathString: function() {
        var pathString = []
        var pathPoints = this.model.getPath();

        pathString.push("M", pathPoints[0].x, pathPoints[0].y);
        pathString.push("R");
        for (var i = 1; i < pathPoints.length; i++) {
            pathString.push(pathPoints[i].x, pathPoints[i].y);
        }

        return pathString;
    }
});

$(document).ready(function() {
    var WIDTH = $("#canvas-container").width();
    var HEIGHT = $("#canvas-container").height();
    var paper = new Raphael('canvas-container', WIDTH, HEIGHT);

    var pathLoaded = function(tree) {
        $.each(tree.getPath(), function(i, point) {
            console.log(point);
        });
    }

    $(window).resize(function() {
        HEIGHT = $("#canvas-container").height();
        WIDTH = $("#canvas-container").width();
        paper = new Raphael('canvas-container', WIDTH, HEIGHT);
    });

    Ark.setPaper(paper);
    Ark.loadPath(WIDTH / 2.0, HEIGHT, pathLoaded);
});
