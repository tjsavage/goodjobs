var PI = Math.PI;
var DIST = 40;
var NODE_R = 30;
var NODE_X_OFFSET = 50;
var ARC_OPTIONS = {
        stroke: '#0076a0',
        'stroke-width': 10,
        'stroke-opacity': 0.8,
        'stroke-linecap': 'round'
    };
var NODE_OPTIONS = {
    stroke: 'black',
}

var WIDTH;
var HEIGHT;
var PHOTO_X_OFFSET = -200
var PHOTO_Y_OFFSET = -150;
var HILL_X_OFFSET = -300;
var HILL_Y_OFFSET = -50;

var myPath;

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

    drawPath: function(pathString, options) {
        if (options === undefined) {
            options = ARC_OPTIONS;
        }
        return this.paper.path( pathString ).attr( options );
    },

    animateDrawPath: function(pathstr, duration, delay, callback )
    {
        var attr = ARC_OPTIONS;
        var canvas = this.paper;
        var guide_path = canvas.path( pathstr ).attr( { stroke: "none", fill: "none" } );
        var path = canvas.path( guide_path.getSubpath(0, 1) ).attr( {stroke: "none", fill: "none"} );
        var total_length = guide_path.getTotalLength( guide_path );
        var last_point = guide_path.getPointAtLength( 0 );
        var start_time = new Date().getTime();
        var interval_length = 4;
        var result = path;
        var attr = $.extend({}, attr);     

        var delay_id = setTimeout(function() {
            path.attr(attr);
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
                    if ( callback !== undefined ) callback();
                    guide_path.remove();
                }                                       
            }, interval_length ); 
        }, delay);
        
        return result;
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
    },

    drawText: function(x, y, text) {
        return this.paper.text(x, y, text);
    }
};

Ark.Node = Backbone.Model.extend({
    defaults: {
        type: "default"
    },

    initialize: function() {
    },

    x: function(){return this.get("coords").x; },
    y: function(){return this.get("coords").y; },

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
    },

    getAt: function(i) {
        if (i < 0) i += this.length;
        return this.at(i);
    }
});

Ark.Path = Backbone.Model.extend({
    initialize: function() {
        this.set("nodes", new Ark.NodeList());

        this.get("nodes").on("remove", this.changedNodes, this);

        this.on("change", this.change, this);
        this.on("change:nodes", this.changedNodes, this);
        this.on("change:coords", this.recalculateNodeCoords, this);

        this.on("add:blankNode", this.addBlankNode, this);
        this.on("remove:lastNode", this.removeLastNode, this);

        this.addedNodes = 0;
    },

    x: function(){return this.get("coords").x; },
    y: function(){return this.get("coords").y; },

    sync: function(method, model, options) {
        if (method == 'read') {
            this.trigger("request");
            var T = this;
            $.getJSON(this.url(), function(data, status, jqXHR) {
                var nodes = new Ark.NodeList(data.experiences);
                T.set("nodes", nodes);
                T.set(data);

                T.trigger("sync");
            });
        }
    },

    getLastNode: function() {
        return this.get("nodes").at(this.get("nodes").length - 1);
    },

    getNodeAt: function(i) {
        return this.get("nodes").getAt(i);
    },

    change: function() {
        
    },

    changedNodes: function() {
        this.recalculateNodeCoords();
    },

    recalculateNodeCoords: function() {
        var rootY = this.get("coords").y;
        var rootX = this.get("coords").x;

        for(var i = 0; i < this.get("nodes").length; i++) {
            var node = this.get("nodes").at(i);
            node.moveTo({x: rootX + Math.pow(-1, i) * NODE_X_OFFSET, y: rootY - DIST * i});
            node.trigger("change:coords");
        }
    },

    nextNodeCoords: function() {
        var lastNodeCoords = this.getLastNode().get("coords");
        var i = this.get("nodes").length;

        return {x: this.get("coords").x + Math.pow(-1, i) * NODE_X_OFFSET, y: this.get("coords").y - DIST * i};
    },

    addNode: function(node) {
        var oldNode = node;
        if (!(node instanceof Ark.Node)) {
            node = new Ark.Node(node);
        }

        var beforeLength = this.get("nodes").length;

        var addReturn = this.get("nodes").add(node);

        var afterLength = addReturn.length;
        if (beforeLength == afterLength) {
            oldNode.trigger("shake");
            return;
        }
        this.addedNodes++;


        this.move({x: 0, y: DIST});
        this.trigger("add:node", {node: node});
        this.trigger("change:nodes");
    },

    includeNode: function(node) {
        if (this.get("nodes").indexOf(node) != -1) {
            var nodeIndex = this.get("nodes").indexOf(node);
            this.trigger("shake:node", nodeIndex);
            console.log("Already in!");
            return;
        }

        console.log(this.get("nodes").indexOf(node));

        var newNode = new Ark.Node(node.toJSON());
        newNode.set("coords", this.nextNodeCoords());
        newNode.set("type", "potential");
        console.log(newNode);
        this.addNode(newNode);
    },

    addBlankNode: function() {
        this.addNode({"type": "blank"});
    },

    removeLastNode: function() {
        var lastNode = this.get("nodes").pop();
        this.move({x: 0, y: 0-DIST});

        this.addedNodes--;

        this.trigger("remove:node", {node: lastNode});
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
        if (d.x === undefined) {
            d.x = 0;
        }
        if (d.y === undefined) {
            d.y = 0;
        }

        var newCoords = {x: this.get("coords").x + d.x,
                         y: this.get("coords").y + d.y};

        this.moveTo(newCoords);
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

    remove: function() {
        console.log("REMOVE THE PATH");
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
        this.model.on("remove:node", this.removeNode, this);
        this.model.on("add:node", this.addNode, this);
        this.model.on("sync", this.renderAll, this);
        this.model.on("shake:node", this.shakeNode, this)
        this.on("slideOut", this.slideOut, this);
        this.nodeViews = {};
        if (this.model.get("owner") != "me") {
            this.personalOffset = 300;
        } else {
            this.personalOffset = 0;
        }
    },

    events: {
        'click': 'onClick'
    },

    onClick: function() {
        this.move({x: 30, y: 0});
    },

    onChangeCoords: function() {
        this.renderPath();

        if (this.photo) {
            this.photo.animate({x: this.model.x() + PHOTO_X_OFFSET + this.personalOffset, y: HEIGHT + PHOTO_Y_OFFSET}, 400, "linear");
        }

        this.hill.animate({"path": this.getHillPathString()}, 400, "linear");
        this.hill.toBack();
        
    },

    slideOut: function(callback) {
        this.model.get("nodes").forEach(function(node) {
            node.trigger("slideOut");
        });

        this.model.move({x: 500})
        callback();
    },

    shakeNode: function(index) {
        var node = this.get("nodes").at(index);
        node.trigger("shake");
    },

    addNode: function(options) {
        var node = options.node;
        this.nodeViews[options.node] = new Ark.NodeView({"model": node});
        this.renderPath();
        node.trigger("animate:in", {from: {x: this.model.getNodeAt(-2).x(), y: this.model.getNodeAt(-2).y()}});
    },

    removeNode: function(options) {
        var node = options.node;
        node.trigger("destroy");
        delete this.nodeViews[node];

        this.renderPath();
    },

    renderAll: function() {
        for(var i = 0; i < this.model.get("nodes").length; i++) {
            var node = this.model.get("nodes").at(i);
            var nodeView = new Ark.NodeView({"model": node});
            this.nodeViews[node] = nodeView;
            node.trigger("animate:in", {"from": {x: this.model.x(), y: this.model.y()}});
        }

        console.log(this.model.get("picture_url"));
        if (this.model.get("picture_url")) {
            this.photo = Ark.drawImage(this.model.get("picture_url"), this.model.x() + this.personalOffset + PHOTO_X_OFFSET, HEIGHT + PHOTO_Y_OFFSET, 100, 100);
        }

        this.hill = Ark.drawPath(this.getHillPathString(), {"fill": "green"});

        this.renderPath();
        this.hill.toBack();

        this.renderControls();
    },

    renderPath: function() {
        if (this.robj) this.robj.remove();
        if (this.model.get("nodes").length < 2) return;

        var path = Ark.animateDrawPath(this.getPathString(), 700, 200);
        path.toBack();
        this.path = path;
        this.element = path.node;
        this.robj = path;
        this.setElement(this.element);
    },

    renderControls: function() {
        if (this.controlsView) this.controlsView.trigger("remove");

        this.controlsView = new Ark.PathControlsView({"model": this.model});
    },

    getPathString: function() {
        var root = this.model.get("nodes").at(0).get("coords");

        var str = [];
        str.push("M", root.x, root.y);
        str.push(["R"]);
        for(var i = 0; i < this.model.get("nodes").length; i++) {
            var node = this.model.get("nodes").at(i).get("coords");
            str.push([node.x, node.y]);
        }
        return str;
    },

    getHillPathString: function() {
        var root = {x: this.model.x() + this.personalOffset + HILL_X_OFFSET, y: HEIGHT};

        var str = []
        str.push("M", root.x, root.y);
        str.push(["T"]);
        str.push([root.x + 30, root.y - 70]);
        str.push([root.x + 120, root.y - 90]);
        str.push([root.x + 190, root.y - 90]);
        str.push([root.x + 250, root.y]);
        str.push("Z");
        return str;
    }
});

Ark.InfoView = Backbone.View.extend({
    initialize: function(options) {
        this.parent = options.parent;

        this.render();

        $("#info-container").append(this.el);

        this.parent.model.on("change:coords", this.onMove, this);
        this.on("show", this.show, this);
        this.on("hide", this.hide, this);
    },

    render: function() {
        if (this.parent.model.get("type") == "experience") {
            var dict = this.parent.model.toJSON();
            dict["id"] = this.parent.cid;
            this.html = _.template($("#info-template").html(), dict, {variable: "data"});        
        }
    },

    show: function() {
        if (this.parent.model.get("type") == "experience") {        
            $("#info-container").html(this.html).fadeIn(100);
        }
    },

    hide: function() {
        $("#info-container").hide();
    },

    onMove: function() {
    }
});

Ark.NodeView = Backbone.View.extend({
    initialize: function() {
        this.render();

        this.model.on('change:coords', this.onChangeCoords, this);
        this.model.on("change", this.render, this);
        this.model.on("destroy", this.onDestroy, this);
        this.model.on("animate:in", this.animateIn, this);
        this.model.on("shake", this.shake, this);

        this.infoView = new Ark.InfoView({parent: this});
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
            'stroke-width': 5
        },
        "potential": {
            'stroke': 'black',
            'stroke-dasharray': '-',
            'fill': 'green',
            'stroke-width': 5
        },
        "blank": {
            'stroke': 'black',
            'stroke-dasharray': '-',
            'stroke-width': 5,
            'fill': 'grey'
        },
        "default": {
            'stroke': 'black',
            'fill': 'orange',
            'stroke-width': 5
        }

    },

    onChangeCoords: function() {
        this.robj.animate({"cx": this.model.x(),
                            "cy": this.model.y()}, 300, "<>");
            },

    onDestroy: function() {
        this.robj.animate({"r": 0}, 50, "<", function() {this.remove();});
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
        myPath.includeNode(this.model);
    },

    onHover: function() {
        this.robj.animate({fill: "#00ff00"}, 100, "linear");
        this.infoView.trigger("show");
    },

    offHover: function() {
        this.robj.animate(this.attrs[this.model.get("type")], 100, "linear");
        this.infoView.trigger("hide");
    },

    animateIn: function(options) {
        this.robj.attr({cx: options.from.x, cy: options.from.y});
        this.robj.animate({cx: this.model.x(), cy: this.model.y()}, 1000, "elastic");
    },

    shake: function() {
        this.animateIn({from: {x: this.model.x() + 5, y: this.model.y()}})
    }
});

Ark.ControlsButtonView = Backbone.View.extend({
    initialize: function(options) {
        this.RADIUS = 20;

        this.controls = options.controls;
        this.offset = options.offset;
        this.attrs = options.attrs;
        this.hover = options.hover;
        this.text = options.text;
        
        var circle = Ark.drawNode(this.controls.coords.x + this.offset.x,
                                    this.controls.coords.y + this.offset.y,
                                    this.RADIUS,
                                    this.attrs);

        this.element = circle.node;
        this.robj = circle;
        this.setElement(this.element);

        if (options.text) {
            this.textObj = Ark.drawText(this.controls.coords.x + this.offset.x,
                                        this.controls.coords.y + this.offset.y,
                                        options.text);
        }

        this.controls.on("change:coords", this.updateCoords, this);
        this.controls.on("remove", this.remove, this);
        this.controls.on("hide", this.onHide, this);
        this.controls.on("show", this.onShow, this);
        this.controls.on("disappear", this.onDisappear, this);
    },

    events: {
        "click": "onClick",
        "mouseover": "onMouseOver",
        "mouseout": "onMouseOut"
    },

    updateCoords: function() {
        this.robj.animate({cx: this.controls.coords.x + this.offset.x,
                        cy: this.controls.coords.y + this.offset.y},
                        400,
                        ">");
        this.textObj.animate({x: this.controls.coords.x + this.offset.x,
                        y: this.controls.coords.y + this.offset.y},
                        400,
                        ">");
        this.robj.toFront();
        this.textObj.toFront();
    },

    onClick: function() {
        this.trigger("click");
    },

    onMouseOver: function() {
        this.robj.animate({"fill": this.hover}, 100, "linear");
    },

    onMouseOut: function() {
        this.robj.animate({"fill": this.attrs.fill}, 100, "linear");
    },

    onHide: function() {
        var T = this;
        this.robj.animate({"r": 0}, 200, "linear", function() { T.robj.hide(); T.textObj && T.textObj.hide() });
    },

    onShow: function() {
        var T = this;
        console.log("show");
        this.robj.show();
        this.robj.animate({"r": this.RADIUS}, 200, "linear", function() { T.textObj && T.textObj.show();});
    },

    onDisappear: function() {
        this.robj.hide();
        if (this.textObj) {
            this.textObj.hide();
        }
    },

    remove: function() {
        this.robj.remove();
    }
});

Ark.PathControlsView = Backbone.View.extend({

    initialize: function(options) {
        this.coords = this.model.getNodeAt(-1).get("coords");

        /*this.addButton = new Ark.ControlsButtonView({controls: this,
                                    offset: {x: 120, y: -120},
                                    attrs: {
                                            "fill": "#66e275",
                                            "stroke": "none",
                                            "opacity": ""
                                    },
                                    hover: "#00c618"});*/

        this.removeButton = new Ark.ControlsButtonView({controls: this,
                                    offset: {x: 28, y: -28},
                                    attrs: {
                                        "fill": "#ddd",
                                        "stroke-width": "3px",
                                        "stroke-fill": "black",
                                        "opacity": "",
                                        "r": 17
                                    },
                                    hover: "#ff0d00",
                                    text: "x"});
        

        this.on("remove", this.remove, this);
        this.model.on("add:node", this.checkShow, this);
        this.model.on("add:node", this.updateCoords, this);
        this.model.on("remove:node", this.checkShow, this);
        this.model.on("remove:node", this.updateCoords, this);
        this.model.on("change:coords", this.updateCoords, this);

        this.trigger("disappear");

        //this.addButton.on("click", function(){ this.model.trigger("add:blankNode"); }, this);
        this.removeButton.on("click", function(){ this.model.trigger("remove:lastNode"); }, this);
    },

    remove: function() {
        this.trigger("remove");
    },

    checkShow: function() {
        console.log(this.model.addedNodes);
        if (this.model.addedNodes == 1) {
            this.trigger("show");
        }

        if (this.model.addedNodes == 0) {
            this.trigger("hide");
        }
    },

    updateCoords: function() {
        this.coords = this.model.getNodeAt(-1).get("coords");

        this.trigger("change:coords");
    }

});

Ark.ButtonView = Backbone.View.extend({
    initialize: function(options) {
        this.setElement($("#next-button"));

        this.clickCallback = options.clickCallback;

        this.on("show", this.show, this);
        this.on("hide", this.hide, this);
    },

    events: {
        "click": "onClick",
        "mouseover": "onMouseOver",
        "mouseOut": "onMouseOut"
    },

    onClick: function() {
        console.log("clicked");
        if (this.clickCallback) {
            this.clickCallback();
        }
    },

    show: function() {
        this.el.show();
    },

    hide: function() {
        this.el.hide();
    },

    onMove: function() {
    }
});

var otherPathView;
var otherPath;
function nextPath() {
    console.log("nextPath");
    function loadNewPath() {
        setTimeout(function() {
            otherPath = new Ark.Path({"url": "/api/path/suggestions/",
                                    "coords": {x: WIDTH * 3.0 / 4, y: HEIGHT - NODE_R}});

            otherPathView = new Ark.PathView({"model": otherPath});
        }, 500);
        
    }
    otherPathView.trigger("slideOut", loadNewPath);
}


$(document).ready(function() {
    WIDTH = $("#canvas-container").width();
    HEIGHT = $("#canvas-container").height();
    var paper = new Raphael('canvas-container', WIDTH, HEIGHT);

    var pathLoaded = function(tree) {
        
    };

    $(window).resize(function() {
        HEIGHT = $("#canvas-container").height();
        WIDTH = $("#canvas-container").width();
        paper = new Raphael('canvas-container', WIDTH, HEIGHT);
    });

    Ark.setPaper(paper);
    
    myPath = new Ark.Path({"url": "/api/path/",
                            "coords": {x: WIDTH / 2.0, y: HEIGHT - NODE_R}});
    myPath.set("owner", "me");
    var myPathView = new Ark.PathView({"model": myPath});

    var nextButton = new Ark.ButtonView({clickCallback: nextPath});

    setTimeout(function() {
        myPathView.model.moveTo({x: 300});
        otherPath = new Ark.Path({"url": "/api/path/2/",
                                    "coords": {x: WIDTH * 3.0 / 4, y: HEIGHT - NODE_R}});
        otherPathView = new Ark.PathView({"model": otherPath});
    }, 1000);
});
