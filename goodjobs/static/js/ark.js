var Ark = {
    setPaper: function(paper) {
        this.paper = paper;
    },

    loadPath: function(callback) {
        var path = new Ark.Path();
        $.getJSON('/api/path/', function(data, status, jqXHR) {
            $.each(data, function(i, node) {
                path.addNode(new Ark.Node(node));
            });
            callback(path);
        });
    },

    drawNode: function(x, y, model) {
        var el = this.paper.circle(x,y,40);
        el.attr({fill: "red"});

        return el;
    },

    drawPath: function(rootX, rootY, pathModel) {
        var node = pathModel.get('root');
        var x = rootX;
        var y = rootY;
        var path = this.paper.set();
        while (node) {
            var nodeView = new Ark.NodeView({x: x, y: y, model: node});
            path.push(nodeView.robj);
            y -= 100;
            node = node.get("child");
        }

        return path;
    }
}

Ark.Path = Backbone.Model.extend({
    defaults: {
        root: null,
        terminus: null,
    },

    addNode: function(node) {
        if (!this.get("root")) {
            this.set({"root": node});
        }
        if (this.get("terminus")) {
            this.get("terminus").set({"child": node});
        }
        node.set({"parent": this.get("terminus")});
        this.set({"terminus": node});
    }
});

Ark.Node = Backbone.Model.extend({
    defaults: {
        child: null,
        parent: null,
        locked: false
    },

    initialize: function() {

    },

    children: function() {

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
        console.log(path.get("root").get("child").get("organization"));

        var pathView = new Ark.PathView({rootX: WIDTH / 2.0, rootY: HEIGHT, model: path});
        pathView.goBlue();
    }

    $(window).resize(function() {
        HEIGHT = $("#canvas-container").height();
        WIDTH = $("#canvas-container").width();
        paper = new Raphael('canvas-container', WIDTH, HEIGHT);
    });

    Ark.setPaper(paper);
    Ark.loadPath(pathLoaded);
});