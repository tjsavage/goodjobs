var PI = Math.PI;
var DIST = 120;
var NODE_R = 40;
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

    x: function(){return this.get("coord").x},
    y: function(){return this.get("coord").y},

    move: function(d) {
        this.set("coord", {x: this.get("coord").x + d.x, y: this.get("coord").y + d.y});
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

    addNode: function(node) {
        this.get("nodes").add(node);
        this.trigger("change:nodes");
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
                            y: this.get("coords").y + d.y});
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
        this.model.on("change:nodes", this.render, this);
        this.model.on("change:coords", this.moved, this);
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

    moved: function() {
        this.element.animate({"x": this.model.get("coords").x,
                            "y": this.model.get("coords").y});
    },

    render: function() {
        if (this.element) {
            this.element.remove();
        }
        this.element = Ark.drawSet();

        var rootY = this.model.get("coords").y;
        var rootX = this.model.get("coords").x;

        for(var i = 0; i < this.model.get("nodes").length; i++) {
            var node = this.model.get("nodes").at(i);
            node.set("coords", {x: rootX + Math.pow(-1, i) * NODE_OFFSET, y: rootY - DIST * i});
            var nodeView = new Ark.NodeView({"model": node});
            this.element.push(nodeView.element);
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

        this.model.on('change:coords', this.render, this);
        this.model.on("change", this.render, this);
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
            'stroke-width': 15
        },
        "potential": {
            'stroke': 'black',
            'stroke-dasharray': '-',
            'stroke-width': 15,
            'fill': 'grey'
        },
        "default": {
            'stroke': 'black',
            'fill': 'orange',
            'stroke-width': 15
        }

    },

    render: function() {
        if (this.element) {
            this.element.remove();
        }
        
        this.element = Ark.drawNode(this.model.get("coords").x,
                                    this.model.get("coords").y,
                                    0,
                                    this.attrs[this.model.get("type")],
                                    Raphael.animation({"r": NODE_R}, 1000, "elastic"));
        
        this.robj = this.element;
        this.setElement(this.element.node);

        if (this.model.get("image")) {
            console.log("drawing image");
            if (this.image) {
                this.image.remove();
            }
            this.image = Ark.drawImage(this.model.get("image"), 
                                    this.model.get("coords").x - NODE_R + 5, 
                                    this.model.get("coords").y - NODE_R + 5,
                                    2 * NODE_R - 10,
                                    2 * NODE_R - 10,
                                    Raphael.animation({"opacity": 1}, 1000, "linear"));
            this.element.toFront();
            this.element.attr({"fill-opacity": 0});
        }
    },

    onClick: function() {
    },

    onHover: function() {
        this.element.animate({"r": NODE_R + 10}, 500, "elastic");
        //this.infoView.trigger("fadeIn");
    },

    offHover: function() {
        this.element.animate({"r": NODE_R}, 500, "elastic");
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
        path.get("nodes").at(3).set({"type": "experience"});
    }, 3000);

    setTimeout(function() {
        path.addNode({"type": "potential"});
    }, 4000)

    setTimeout(function() {
        pathView.model.move({x: -200, y:0});
    }, 6000)
});
