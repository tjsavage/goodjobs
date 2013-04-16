var PI = Math.PI;
var DIST = 120;
var NODE_R = 50;
var NODE_OFFSET = 50;
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

    drawNode: function(x, y, r, options, animation) {
        var el = this.paper.circle(x, y, r);
        el.attr(options);
        if (animation) {
            el.animate(animation);
        }
        return el;
    },

    drawImage: function(src, x, y, width, height, animation) {
        var el = this.paper.image(src, x, y, width, height);
        if (animation) {
            el.animate(animation);
        }
        return el;
    },

    drawInfo: function(model) {
        var set = this.paper.set();

        var el = this.paper.text(model.get("coord").x, model.get("coord").y, model.get("organization"));
        el.attr({"font-size": 24});

        set.push(el);
        return set;
    },

    drawPath: function(pathString) {
        return this.paper.path( pathString ).attr( ARC_OPTIONS );
    },

    drawArc: function(start, end) {
        var pathString = [["M", start.x, start.y], ["R"], [end.x, end.y], ["z"]];
        return this.paper.path(pathString).attr(ARC_OPTIONS).attr({'opacity': 0}).animate({'opacity': 1}, 1000);
    },

    animateDrawArc: function (start, end, callback ) {
        var pathString = [["M", start.x, start.y], ["R"], [end.x, end.y], ["z"]];
        return this.paper.path(["M", start.x, start.y], ["R"], [start.x, start.y], ["z"]).animate({ path: pathString, stroke:"blue", fill: "blue"}, 5000, "linear");

    },

    drawSet: function() {
        return this.paper.set();
    }
}

Ark.Node = Backbone.Model.extend({
    defaults: {
        type: "default"
    },

    initialize: function() {
    },

    x: function(){return this.get("coords").x},
    y: function(){return this.get("coords").y},

    move: function(d) {
        this.set("oldCoords", this.get("coords"));
        this.moveTo({x: this.get("coords").x + d.x, y: this.get("coords").y + d.y});
    },

    moveTo: function(l) {
        this.set("oldCoords", this.get("coords"));
        var newCoords = this.get("coords") || {x: 0, y: 0};
        if (l.x !== undefined) { newCoords.x = l.x; }
        if (l.y !== undefined) { newCoords.y = l.y; }
        this.set("coords", newCoords);
    },

    description: function() {
        return this.get("organization") + " - " + this.get("coord");
    }
});

Ark.NodeList = Backbone.Collection.extend({
    model: Ark.Node,
    initialize: function() {
    }
});

Ark.Path = Backbone.Model.extend({
    initialize: function() {
        this.set("nodes", new Ark.NodeList());

        this.get("nodes").on("remove", this.changedNodes, this);

        this.on("change", this.change, this);
        this.on("change:nodes", this.changedNodes, this);
        this.on("change:coords", this.recalculateNodeCoords, this);
    },

    sync: function(method, model, options) {
        if (method == 'read') {
            this.trigger("request");
            var T = this;
            $.getJSON(this.url(), function(data, status, jqXHR) {
                var nodes = new Ark.NodeList(data.nodes);
                T.set("nodes", nodes);
                
                T.trigger("sync");
            });
        }
    },

    change: function() {
        
    },

    changedNodes: function() {
        this.recalculateNodeCoords();
        console.log("changed");
    },

    recalculateNodeCoords: function() {
        console.log("Path: recalculateNodeCoords");
        var rootY = this.get("coords").y;
        var rootX = this.get("coords").x;

        for(var i = 0; i < this.get("nodes").length; i++) {
            var node = this.get("nodes").at(i);
            node.moveTo({x: rootX + Math.pow(-1, i) * NODE_OFFSET, y: rootY - DIST * i});
            node.trigger("change:coords");
        }
    },

    addNode: function(node) {
        if (!(node instanceof Ark.Node)) {
            node = new Ark.Node(node);
        }
        this.get("nodes").add(node);
        this.trigger("change:nodes");
        this.trigger("add:node", {node: node});
    },

    root: function() {
        return this.nodes[0];
    },

    url: function() {
        if (this.get("url")) {
            return this.get("url");
        }
    },

    moveTo: function(l) {
        this.set("oldCoords", this.get("coords"));
        var newCoords = this.get("coords");
        if (l.y !== undefined) {
            newCoords.y = l.y;
        }
        if (l.x !== undefined) {
            newCoords.x = l.x;
        }
        this.set("coords", newCoords);
        this.trigger("change:coords");
    },

    description: function() {
        return this.get("firstName") + " " + this.get("lastName");
    }
});

Ark.PathList = Backbone.Collection.extend({
    model: Ark.Path,

    initialize: function(models, options) {
        if (options.url) {
            this.url = options.url;
        }
    },

    url: function() {
        if (this.url) {
            return this.url;
        }
    }
});

Ark.PathView = Backbone.View.extend({
    initialize: function() {
        //this.element = Ark.drawArc(this.start.model.get("coord"), this.end.model.get("coord"));
        //this.robj = this.element;
        //this.setElement(this.element.node);

        this.model.fetch();
        this.model.on("reset:nodes", this.render, this);
        this.model.on("change:coords", this.onChangeCoords, this);
        this.model.on("add:node", this.addNode, this);
        this.model.on("sync", this.renderAll, this);
        this.nodeViews = {};
    },

    events: {
        'click': 'onClick'
    },

    onClick: function() {
        this.move({x: 30, y: 0});
    },

    onChangeCoords: function() {
        console.log("PathView onChangeCoords");
        this.renderPath();
    },

    addNode: function(options) {
        console.log(options.node);
        this.nodeViews[options.node] = new Ark.NodeView({"model": options.node});
        this.renderPath();
    },

    renderAll: function() {
        for(var i = 0; i < this.model.get("nodes").length; i++) {
            var node = this.model.get("nodes").at(i);
            var nodeView = new Ark.NodeView({"model": node});
        }

        this.renderPath();
    },

    renderPath: function() {
        if (this.robj) this.robj.remove();

        var path = Ark.drawPath(this.getPathString());
        path.toBack();

        this.element = path.node;
        this.robj = path;
        this.setElement(this.element);
    },

    getPathString: function() {
        var root = this.model.get("nodes").at(0).get("coords");

        var str = [["M", root.x, root.y]];
        str.push(["T"]);
        for(var i = 0; i < this.model.get("nodes").length; i++) {
            var node = this.model.get("nodes").at(i).get("coords")
            str.push([node.x, node.y]);
        }
        console.log(str);
        return str;
    }
})

Ark.InfoView = Backbone.View.extend({
    initialize: function(options) {
        this.parent = options.parent;

        this.element = Ark.drawInfo(this.parent.model);
        this.robj = this.element;
        this.setElement(this.element.node);

        this.on("fadeIn", this.fadeIn, this);
        this.on("fadeOut", this.fadeOut, this);
        this.on("hide", this.hide, this);
        this.parent.model.on("change:coord", this.onMove, this);
    },

    fadeIn: function() {
        this.element.animate({'opacity': 1}, 200, 'linear');
    },

    fadeOut: function() {
        this.element.animate({'opacity': 0}, 200, 'linear');
    },

    hide: function() {
        this.element.attr({'opacity': 0});
    },

    onMove: function() {
        this.element.attr({'x': this.parent.model.x(), 'y': this.parent.model.y()});
    }
})

Ark.NodeView = Backbone.View.extend({
    initialize: function() {
        this.render();

        this.model.on('change:coords', this.onChangeCoords, this);
        this.model.on("change", this.render, this);
        this.model.on("destroy", this.onDestroy, this)
    },

    events: {
        'click': 'onClick',
        'hover': 'onHover',
        'mouseover': 'onHover',
        'mouseout': 'offHover'
    },

    attrs: {
        "experience": {
            'stroke': 'black',
            'fill': 'orange',
            'stroke-width': 20
        },
        "potential": {
            'stroke': 'black',
            'stroke-dasharray': '-',
            'stroke-width': 20,
            'fill': 'grey'
        },
        "default": {
            'stroke': 'black',
            'fill': 'orange',
            'stroke-width': 20
        }

    },

    onChangeCoords: function() {
        this.robj.animate({"cx": this.model.x(),
                            "cy": this.model.y()}, 2000, "elastic");
        console.log("nodeView onChangeCoords");
    },

    onDestroy: function() {
        this.robj.remove();
    },

    render: function() {
        if (this.robj) this.robj.remove();

        var circle = Ark.drawNode(this.model.get("coords").x,
                                    this.model.get("coords").y,
                                    NODE_R,
                                    this.attrs[this.model.get("type")]);

        this.element = circle.node;   
        
        //this.rSet.transform("S0.8");
        //this.rSet.animate({transform: "S1"}, 1000, "elastic");
        this.robj = circle;
        this.setElement(this.element);
    },

    onClick: function() {
    },

    onHover: function() {
        this.robj.animate({transform: "s1.25"}, 500, "elastic");
        console.log("onHover");
        //this.infoView.trigger("fadeIn");
    },

    offHover: function() {
        this.robj.animate({transform: "s1"}, 500, "elastic");
        //this.infoView.trigger("fadeOut");
    } 
});


$(document).ready(function() {
    var WIDTH = $("#canvas-container").width();
    var HEIGHT = $("#canvas-container").height();
    var paper = new Raphael('canvas-container', WIDTH, HEIGHT);

    var pathLoaded = function(tree) {
        
    }

    $(window).resize(function() {
        HEIGHT = $("#canvas-container").height();
        WIDTH = $("#canvas-container").width();
        paper = new Raphael('canvas-container', WIDTH, HEIGHT);
    });

    Ark.setPaper(paper);
    
    var path = new Ark.Path({"url": "/api/path/",
                            "coords": {x: WIDTH / 2.0, y: HEIGHT - NODE_R}})
    var pathView = new Ark.PathView({"model": path});

    setTimeout(function() {
        path.addNode({"type": "potential"});
    }, 2000);

    setTimeout(function() {
        pathView.model.moveTo({x: 0});
    }, 3000)
});
