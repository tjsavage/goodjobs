$(function() {
    var $container = $("#container");

    $container.masonry({
        itemSelector: ".myTag",
        columnWidth: 1,
    });

    var tagsList = new Tags.TagList();
    var tagListView = new Tags.TagListView({"model": tagsList});

    tagsList.trigger("load:suggestions");

    $(window).scroll(function() {
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
            tagsList.trigger("load:suggestions");
        }
    })
});

var Tags = {

}

Tags.Tag = Backbone.Model.extend({
    initialize: function() {
        this.on("selected", this.onSelected, this);
        this.on("unselected", this.onUnSelected, this);
    },

    onSelected: function() {
        // Send a post to the server!
        this.set("selected", true);
    },

    onUnSelected: function() {
        this.set("selected", false);
    }
});

Tags.TagList = Backbone.Collection.extend({
    model: Tags.Tag,
    initialize: function() {
        this.on("load:suggestions", this.loadSuggestions, this);
    },

    loadSuggestions: function() {
        var T = this;
        $.getJSON("/api/tags/suggestions/", {"tags": JSON.stringify(this)}, function(data, status, jqXHR) {
            $.each(data, function(i, tagData) {
                console.log(tagData);
                var tag = new Tags.Tag(tagData);
                T.add(tag);
                T.trigger("add:tag", tag);
            });
        });
    }
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

        this.$el.fadeIn();
    }
});

Tags.TagListView = Backbone.View.extend({
    initialize: function() {
        this.model.on("add:tag", this.addTag, this);
        this.el = $('#container');
    },

    addTag: function(tag) {
        var tagView = new Tags.TagView({"model": tag});
        this.el.append(tagView.el).masonry('appended', tagView.$el);
    }
})

