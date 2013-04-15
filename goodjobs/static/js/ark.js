var PI = Math.PI;

var Ark = {
    setPaper: function(paper) {
        this.paper = paper;
    },

    loadPath: function(callback) {
        var path = new Ark.Path();
        $.getJSON('/api/path/', function(data, status, jqXHR) {
            for(var i = 0; i < data.length; i++) {
                node = data[i];
                path.addNode(new Ark.Node(node));
            }
            callback(path);
        });
    },

    drawNode: function(x, y, model) {
        var el = this.paper.circle(x,y,40);
        el.attr({fill: "red"});

        return el;
    },

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
}

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

Ark.Node = Backbone.Model.extend({
    defaults: {
        children: [],
        parent: null,
        potentialChildren: [],
        locked: false
    },

    initialize: function() {
        this.set({"children": []})
    },

    addChild: function(node) {
        var children = this.get("children");
        children.push(node);
        this.set({"children": children});
    },

    description: function() {
        return this.get("organization") + " - " + this.get("position");
    }
});

Ark.NodeView = Backbone.View.extend({
    initialize: function() {
        var x = this.options.x;
        var y = this.options.y;
        this.model.set({x: x, y: y});
        this.element = Ark.drawNode(x, y, this.model);
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

$(document).ready(function() {
    var WIDTH = $("#canvas-container").width();
    var HEIGHT = $("#canvas-container").height();
    var paper = new Raphael('canvas-container', WIDTH, HEIGHT);

    var pathLoaded = function(path) {
        console.log(path.description());

        var pathView = new Ark.PathView({rootX: WIDTH / 2.0, rootY: HEIGHT, model: path});
    }

    $(window).resize(function() {
        HEIGHT = $("#canvas-container").height();
        WIDTH = $("#canvas-container").width();
        paper = new Raphael('canvas-container', WIDTH, HEIGHT);
    });

    Ark.setPaper(paper);
    Ark.loadPath(pathLoaded);
});