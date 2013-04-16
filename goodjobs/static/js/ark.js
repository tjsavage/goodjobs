var PI = Math.PI;
var DIST = 180;
var NODE_R = 30;
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

    loadPath: function(rootX, rootY, callback) {
        $.getJSON('/api/path/', function(data, status, jqXHR) {
            var root = new Ark.Node(data[0]);
            root.set("coord", {x: rootX, y: rootY});

            var rootView = new Ark.NodeView({"model": root});
            var prevNodeView = rootView;
            for(var i = 1; i < data.length; i++) {
                var nodeView = new Ark.NodeView({"model": new Ark.Node(data[i])});
                prevNodeView.addChild(nodeView);
                prevNodeView = nodeView;
            }
            callback(new Ark.Tree({"root": root}));
        });
    },

    drawNode: function(model) {
        var el = this.paper.circle(model.get("coords").x,model.get("coords").y, 0);
        el.attr({fill: "red"});
        el.animate({"r": NODE_R}, 600, "elastic");
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

Ark.REST = {
    getChild: function(parent, callback, scope) {
        $.getJSON('/api/path/child/', function(data, status, jqXHR) {
            data["coord"] = parent.get("coord");
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
            points.push(node.get("coord"));
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
        coord: {x: 0, y:0},
        size: 60, 
        maxChildren: 3
    },

    initialize: function() {
        this.children = new Ark.NodeList();
        this.potentialChildren = new Ark.NodeList();
        this.on("change:children", this.childrenChangeHandler, this);
        this.on("change:coord", this.childrenChangeHandler, this);
    },

    x: function(){return this.get("coord").x},
    y: function(){return this.get("coord").y},

    addChild: function(node) {
        this.children.add(node);
        this.trigger("change:children");
        return node;
    },

    childrenChangeHandler: function() {
        var startAngle = PI;
        var angleDelta = PI * 1.0 / (this.children.length + 1);
        var i = 0;
        this.children.each(function(child) {
            var angle = startAngle + angleDelta * (i+1);

            child.set("coord", {x: this.get("coord").x + Math.cos(angle) * DIST,
                                y: this.get("coord").y + Math.sin(angle) * DIST});
            i++;
        }, this);
    },

    move: function(d) {
        this.set("coord", {x: this.get("coord").x + d.x, y: this.get("coord").y + d.y});
        this.trigger("change:children");
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
        this.on("change", this.change, this);
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

    root: function() {
        return this.nodes[0];
    },

    url: function() {
        if (this.get("url")) {
            return this.get("url");
        }
    },

    move: function(d) {
        this.set("coords", {x: this.get("coords").x + d.x,
                            y: this.get("coords").y + dy});
        for(var i = 0; i < this.get("nodes").size; i++) {
            this.get("nodes")
        }
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
        this.model.on("change", this.render, this);
        this.model.on("change:coords", this.render, this);
    },

    events: {
        'click': 'onClick'
    },

    onClick: function() {
        this.move({x: 30, y: 0});
    },

    move: function(d) {
        this.model.move(d);
    },

    render: function() {
        this.element = Ark.drawSet();

        var rootY = this.model.get("coords").y;
        var rootX = this.model.get("coords").x;

        for(var i = 0; i < this.model.get("nodes").length; i++) {
            var node = this.model.get("nodes").at(i);
            node.set("coords", {x: rootX + Math.pow(-1, i) * NODE_OFFSET, y: rootY - DIST * i});
            var nodeView = new Ark.NodeView({"model": node});
            this.element.push(nodeView.element);
            console.log(i);
        }

        this.path = Ark.drawPath(this.getPathString());
        this.path.toBack();
        this.element.push(this.path);
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

Ark.ArcView = Backbone.View.extend({
    initialize: function(options) {
        this.start = options.start;
        this.end = options.end;

        this.element = Ark.drawArc(this.start.model.get("coord"), this.end.model.get("coord"));
        this.robj = this.element;
        this.setElement(this.element.node);

        this.element.toBack();

        this.start.on("change:coord", this.changeCoord, this);
        this.end.on("change:coord", this.changeCoord, this);
    },

    changeCoord: function() {
        this.element.attr({"path": this.getPathStr()});
    },

    getPathStr: function() {
        return [["M", this.start.model.x(), this.start.model.y()], ["R"], [this.end.model.x(), this.end.model.y()], ["z"]];
    }
});

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
        this.element = Ark.drawNode(this.model);
        this.robj = this.element;
        this.setElement(this.element.node);
        this.model.on('change:coord', this.render, this);

        this.infoView = new Ark.InfoView({"parent": this});
        this.infoView.trigger("hide");
    },

    events: {
        'click': 'onClick',
        'hover': 'onHover',
        'mouseover': 'onHover',
        'mouseout': 'offHover'
    },

    render: function() {
        this.element.animate({"cx": this.model.get("coord").x, "cy": this.model.get("coord").y}, 500, "elastic");
        
    },

    onClick: function() {
    },

    addChild: function(child) {
        this.model.addChild(child.model);
        new Ark.ArcView({"start": this, "end": child});
    },

    onHover: function() {
        this.element.animate({"r": NODE_R + 50}, 500, "elastic");
        this.infoView.trigger("fadeIn");
    },

    offHover: function() {
        this.element.animate({"r": NODE_R}, 500, "elastic");
        this.infoView.trigger("fadeOut");
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
    
    var pathView = new Ark.PathView({"model": new Ark.Path({"url": "/api/path/",
                                                            "coords": {x: WIDTH / 2.0, y: HEIGHT - NODE_R}})});


});
