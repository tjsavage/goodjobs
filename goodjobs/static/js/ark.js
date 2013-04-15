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
    /*
    drawPath: function(rootX, rootY, pathModel) {
        var root = pathModel.get('root');
        var path = this.paper.set();
        var DIST = 100;

        function drawPathFromRoot(node, x, y) {
            var nodeView = new Ark.NodeView({x: x, y: y, model: node});
            path.push(nodeView.robj);

            var numChildren = node.get("children").length;
            console.log(numChildren);
            if (!numChildren) {
                return;
            }


            var startAngle = PI;
            var angleDelta = PI * 1.0 / (numChildren + 1);

            for(var i = 0; i < numChildren; i++) {
                var child = node.get("children")[i];
                var angle = startAngle + angleDelta * (i+1);
                drawPathFromRoot(child, x + Math.cos(angle) * DIST, y + Math.sin(angle) * DIST);
            }
        }
        
        drawPathFromRoot(root, rootX, rootY);

        return path;
    }
    */
}

/*
Ark.Path = Backbone.Model.extend({
    defaults: {
        root: null,
        terminus: null
    },

    addNode: function(node) {
        if (!this.get("root")) {
            this.set({"root": node});
        }
        if (this.get("terminus")) {
            this.get("terminus").addChild(node);
        }
        node.set({"parent": this.get("terminus")});
        this.set({"terminus": node});
    },

    description: function() {
        var str = ""
        var node = this.get("root");
        while(node) {
            str += node.get("organization") + " -> ";

            if (node.get("children").length) {
                node = node.get("children")[0];
            } else {
                break;
            }
        }
        
        return str;
    }
});
*/

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
        'click': 'bounce',
        'hover': 'onHover',
        'mouseover': 'onHover',
        'mouseout': 'onEndHover'
    },

    render: function() {
        this.element.attr("cx", this.model.get("position").x);
        this.element.attr("cy", this.model.get("position").y);
    }
});

/*
Ark.PathView = Backbone.View.extend({
    initialize: function() {
        var x = this.options.rootX;
        var y = this.options.rootY;
        this.element = Ark.drawPath(x, y, this.model);
        this.setElement(this.element.node);
        this.model.on('change', this.render, this);
    },

    goBlue: function() {
        this.element.animate({"fill": "blue"}, 3000, "elastic", function() {
        });
    }
});
*/

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
