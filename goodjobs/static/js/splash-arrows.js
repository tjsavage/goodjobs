var PathMaker = {
    drawNode: function(x,y,size) {
        var el = this.paper.circle(x,y,size);

        el.attr({fill: 'blue'});
        return el;
    },
    drawPath: function(pathstring) {
        var p = this.paper.path(pathstring);

        return p;
    }
}

PathMaker.Node = Backbone.Model.extend({
    initialize: function() {

    },
    x: function() { return this.get('x'); },
    y: function() { return this.get('y'); },
    size: function() { return 5; }
});

PathMaker.Path = Backbone.Collection.extend({
    model: Node,
    pathstring: function() {
        var path = "M" + this.first().x() + "," + this.first().y();
        this.each(function(node) {
            path += "C" + node.x() + "," + node.y();
        });
        return path;
    }
});

PathMaker.NodeView = Backbone.View.extend({
    layout: null,
    initialize: function() {
        this.element = PathMaker.drawNode(this.model.x(),
                        this.model.y(),
                        this.model.size());
        this.setElement(this.element.node);
    },
    render: function() {
        this.element.attr('cx', this.model.x());
        this.element.attr('cy', this.model.y());
    }
});

PathMaker.PathView = Backbone.View.extend({
    layout: null,
    initialize: function() {
        this.element = PathMaker.drawPath(this.model.pathstring());
        this.setElement(this.element.node);
    },
    render: function() {
        this.model.each(function(node) {
            var nodeView = new PathMaker.NodeView({model: node});
            nodeView.render();
            console.log(node.x());
            console.log(node.y());
        });
    },
    animate: function(time) {
        var p = 1;
    }
});



function generateRandomPath(x, y, dx, dy, steps) {
    var prev_x = x;
    var prev_y = y;
    var path = new PathMaker.Path([]);
    for(var i = 0; i < steps; i++) {
        var direction = (Math.round(Math.random()) * 2) - 1;
        prev_x += dx * direction;
        prev_y += dy;
        var node = new PathMaker.Node({x: prev_x,
                            y: prev_y});
        path.add(node);
    }
    return path;
}

$(function() {
    var paper = new Raphael($('#canvas-container'), 500, 500);
    var path = generateRandomPath(100, 0, 0, 40, 10);
    PathMaker.paper = paper;
    var pathView = new PathMaker.PathView({model: path});
    pathView.render();
});