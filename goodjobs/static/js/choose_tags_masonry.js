$(function() {
    var $container = $("#container");

    $container.masonry({
        itemSelector: ".myTag",
        columnWidth: 100
    });

    $container.infinitescroll({
            itemSelector: '.myTag',
            nextSelector: '#page-nav a',
            navSelector: '#page-nav',
            loading: {
                img: '/static/img/loading.gif'
            }
        },
        function(newElements) {
            var $newElems = $( newElements );
            $container.masonry('appended', $newElems);
        }
    );

    var tagsList = new Tags.TagList();
    var tagListView = new Tags.TagListView({"model": tagsList});

    tagsList.add({"name": "Dentist", "id": 1});

});

var Tags = {

}

Tags.Tag = Backbone.Model.extend({
    initialize: function() {
    },
});

Tags.TagList = Backbone.Collection.extend({
    model: Tags.Tag
});

Tags.TagView = Backbone.View.extend({
    initialize: function() {
        this.render();
    },
    events: {
        "click": "onClick",
        "mouseover": "onMouseOver",
        "mouseout": "onMouseOut"
    },
    onClick: function() {
        if (!this.model.get("selected")) {
            this.model.trigger("selected");
            this.$el.addClass("selected");
        } else {
            this.model.trigger("unselected");
            this.$el.removeClass("selected");
        }

        
    },
    render: function() {
        var variables = { id: this.model.get("id"),
                        name: this.model.get("name")};
        var template = _.template('<span class="myTag" id="tag_<%= id %>"><span><%= name %></span></span>');
        var html = template(variables);
        this.setElement(html);
    }
});

Tags.TagListView = Backbone.View.extend({
    initialize: function() {
        this.model.on("add", this.addTag, this);
        this.el = $('#container');
    },

    addTag: function(tag) {
        var tagView = new Tags.TagView({"model": tag});
        this.el.append(tagView.el).masonry('appended', tagView.$el);
    }
})

