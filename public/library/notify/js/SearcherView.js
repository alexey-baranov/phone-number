function SearcherView(model, parent) {
    var this2= this;
    this.parent = parent;

    this.$termView = $("#p_header_searcher_term").autocomplete({
        appendTo: $("#p_header_searcher"),
        //autoFocus: true,
        delay: 1000,
        //minLength: 4,
        source: function(request, response) {
            this2.model.search(request.term);
            var options = this2.model.elements;
            options.sort();
            if (options.length > 20) {
                options.length = 20;
            }
            response(options);
        },
        open: function(event, ui) {
        },
        close: function(event, ui) {
            event.stopPropagation();
            return false;
        },
        select: function(event, ui) {
//            this2.model.$termView.val(ui.item.value);
            this2.model.search(ui.item.value);
        }
    }).bind('paste', function(e) {
        $('#p_header_searcher_term').trigger('autocomplete');
    });
    this.$indexView = $("#p_header_searcher_index");
    this.$prevView = $("#p_header_searcher_prev")
            .button()
            .click(function(){
        this2.model.search(this2.$termView.val(), true);
    });
    this.$nextView = $("#p_header_searcher_next")
            .button()
            .click(function(){
        this2.model.search(this2.$termView.val());
    });
    this.$resetView = $("#p_header_searcher_reset")
            .button()
            .click(function(){
        this2.model.search("");
    });
    
    this.setModel(model);
}

SearcherView.prototype.invalidate = function() {
    var model = this.model;

    this.$termView.val(model.term);
    
    if (!model.term || !model.isExecuted) {
        this.$indexView.css("display","none");
    }
    else{
        this.$indexView.css("display","inline");
        if (model.result.length) {
            this.$indexView.text((model.RESULT + 1) + " из " + model.result.length);
            this.$indexView.removeClass("no_result");
        }
        else {
            this.$indexView.text("0 из 0");
            this.$indexView.addClass("no_result");
        }
    }
}

SearcherView.prototype.initialize = function() {
    var model= this.model;

    this.invalidate();
}

SearcherView.prototype.setModel = function(model) {
    this.model = model;
    this.model.searched.add(this, this.model_searched);

    this.initialize();
}

SearcherView.prototype.model_searched = function(sender, arg) {
    this.invalidate();
}