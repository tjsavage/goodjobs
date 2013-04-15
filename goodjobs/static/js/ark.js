var PI = Math.PI;
var DIST = 100;

var Ark = {
    setPaper: function(paper) {
        this.paper = paper;
    },

    loadPath: function(rootX, rootY, callback) {
        var path = this.paper.set();

        $.getJSON('/api/path/', function(data, status, jqXHR) {
            var rootData = data[0];
            rootData["x"] = rootX;
            rootData["y"] = rootY;
            var root = new Ark.Node(rootData);
            var prevNode = root;
            for(var i = 1; i < data.length; i++) {
                var nodeData = data[i];
                nodeData["parent"] = prevNode;
                var node = new Ark.Node(nodeData);
                prevNode.addChild(node);
                var nodeView = new Ark.NodeView({"model": node});
                console.log(node.get("y"));
                path.push(nodeView);
            }
            callback(node);
        });
    },

    drawNode: function(model) {
        var el = this.paper.circle(model.get("x"),model.get("y"),40);
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
        children: [],
        parent: null,
        potentialChildren: [],
        locked: false,
        x: 0,
        y: 0
    },

    initialize: function() {
        this.set({"children": []})
        this.on('change', this.render, this);
    },

    addChild: function(node) {
        var children = this.get("children");
        children.push(node);
        this.set({"children": children});
    },

    render: function() {
        var startAngle = PI;
        var angleDelta = PI * 1.0 / (this.get("children").length + 1);
        console.log("changed");
        $.each(this.get("children"), function(i, child) {
            var angle = startAngle + angleDelta * (i+1);
            console.log("Setting angle: " + angle);
            child.set({"x": this.get("x") + Math.cos(angle) * DIST,
                        "y": this.get("y") + Math.sin(angle) * DIST});
        });
    },

    description: function() {
        return this.get("organization") + " - " + this.get("position");
    }
});

Ark.NodeView = Backbone.View.extend({
    initialize: function() {
        this.element = Ark.drawNode(this.model);
        this.robj = this.element;
        this.setElement(this.element.node);
        this.model.on('change', this.render, this);
    },
    events: {
        'click': 'bounce',
        'hover': 'onHover',
        'mouseover': 'onHover',
        'mouseout': 'onEndHover'
    },

    render: function() {
        this.element.attr({"cx": this.model.get("x"),
                            "cy": this.model.get("y")});
    },

    bounce: function() {
        this.element.animate({"r": 50}, 1000, "bounce");
    },

    onHover: function() {
        this.element.attr({"fill": "green"});

    },

    onEndHover: function() {
        this.element.attr({"fill": "blue"});
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
