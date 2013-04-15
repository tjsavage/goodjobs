var PI = Math.PI;
var DIST = 100;

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
            callback(node);
        });
    },

    drawNode: function(model) {
        var el = this.paper.circle(model.get("position").x,model.get("position").y,40);
        console.log("Drawing at (" + model.get("position").x + ", " + model.get("position").y + ")");
        el.attr({fill: "red"});

        return el;
    }
}

Ark.Node = Backbone.Model.extend({
    defaults: {
        parent: null,
        locked: false,
        position: {x: 0, y:0},
        size: 60
    },

    initialize: function() {
        this.children = new Ark.NodeList();
        this.potentialChildren = new Ark.NodeList();
        this.set("position", {x: 0, y: 0});
        this.on("change:children", this.childrenChangeHandler, this);
        this.on("change:position", this.childrenChangeHandler, this);
    },

    addChild: function(node) {
        this.children.add(node);
        this.trigger("change:children");
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
    model: Node,
    initialize: function(models, options) {
    }
})

Ark.NodeView = Backbone.View.extend({
    initialize: function() {
        this.element = Ark.drawNode(this.model);
        this.robj = this.element;
        this.setElement(this.element.node);
        this.model.on('change:position', this.render, this);
    },
    events: {
        'click': 'onClick',
        'hover': 'onHover',
        'mouseover': 'onHover',
        'mouseout': 'onEndHover'
    },

    render: function() {
        this.element.animate({"cx": this.model.get("position").x, "cy": this.model.get("position").y}, 500, "elastic");
    },

    onClick: function() {
        this.model.move({x: 30, y: 0});
    }
});

$(document).ready(function() {
    var WIDTH = $("#canvas-container").width();
    var HEIGHT = $("#canvas-container").height();
    var paper = new Raphael('canvas-container', WIDTH, HEIGHT);

    var pathLoaded = function(root) {
        console.log(root.description());
    }

    $(window).resize(function() {
        HEIGHT = $("#canvas-container").height();
        WIDTH = $("#canvas-container").width();
        paper = new Raphael('canvas-container', WIDTH, HEIGHT);
    });

    Ark.setPaper(paper);
    Ark.loadPath(WIDTH / 2.0, HEIGHT, pathLoaded);
});
