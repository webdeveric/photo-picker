(function(factory) {
    "use strict";

    if (typeof define === "function" && define.amd) {
        define([ "jquery", "ContentProvider", "AjaxContentProvider" ], factory);
    } else {
        factory(jQuery, ContentProvider);
    }

}(function( $, ContentProvider, AjaxContentProvider ) {
    "use strict";

    function Lightbox( template, contentProvider, options )
    {
        this.template = $(template);
        this.setContentProvider( contentProvider );
        this.options = $.extend({
            closeOnESC: true,
            htmlClass: "lightbox-open",
            openClass: "open",
            closeSelector: ".lightbox-close-action",
            titleSelector: ".lightbox-title",
            extraClass: ""
        }, options );
    }

    Lightbox.open       = false;
    Lightbox.current    = null;
    Lightbox.queue      = [];
    Lightbox.queueDelay = 250;

    Lightbox.close = function() {
        if ( Lightbox.current ) {
            Lightbox.current.close();
        }
        return Lightbox;
    }

    Lightbox.prototype.trigger = function( event_name, parameters ) {
        $(document.documentElement).trigger( event_name, parameters );
    };

    Lightbox.prototype.setContentProvider = function( contentProvider )
    {
        this.contentProvider = contentProvider instanceof ContentProvider ? contentProvider : new ContentProvider;
    };

    Lightbox.prototype.renderContent = function()
    {
        this.template.addClass("loading");

        this.contentProvider.unbindEvents();

        var contentFrame = this.template.find(".lightbox-content").empty(),
            self = this;

        this.contentProvider.getContent( function( content, contentProvider ) {
            contentFrame.append( content );
            contentProvider.bindEvents();
            self.template.removeClass("loading");            
        });        
    };

    Lightbox.prototype.option = function( option_name, default_value )
    {
        return this.options[ option_name ] || default_value || "";
    }

    Lightbox.prototype.open = function()
    {
        if ( Lightbox.open ) {
            Lightbox.queue.unshift( this );
            return;
        }

        this.bindEvents();
        Lightbox.current = this;
        Lightbox.open = true;

        this.addClasses();

        this.setTitle();
        this.renderContent();

        this.trigger("open.lightbox", [ this ] );
        return this;
    }

    Lightbox.prototype.addClasses = function()
    {
        $(document.documentElement).addClass( this.option("htmlClass") );
        this.template.addClass( this.option("openClass" ) ).addClass( this.option("extraClass") );
    }

    Lightbox.prototype.removeClasses = function()
    {
        $(document.documentElement).removeClass( this.option("htmlClass") );
        this.template.removeClass( this.option("openClass" ) ).removeClass( this.option("extraClass") );
    }

    Lightbox.prototype.setTitle = function( title ) {
        title = title || this.option("title", "");
        this.template.find( this.option("titleSelector") ).text( title );
    }

    Lightbox.prototype.close = function( event )
    {
        if (event) {
            if (event.target != event.currentTarget) {
                return;
            }

            if ( !$(event.currentTarget).data("allow-default") ) {
                event.preventDefault();
                event.stopPropagation();
            }
        }

        this.unbindEvents();
        Lightbox.current = null;
        Lightbox.open = false;

        this.removeClasses();

        this.checkQueue();
        this.trigger("close.lightbox", [ this ] );
        return this;
    }

    Lightbox.prototype.checkQueue = function()
    {
        if ( Lightbox.queue.length ) {
            var next = Lightbox.queue.pop();
            setTimeout( function() {
                next.open();
            }, Lightbox.queueDelay || 250 );
        }
    }

    Lightbox.prototype.checkESC = function(event)
    {
        if (event.keyCode == 27 && this.option("closeOnESC", true) ) {
            this.close();
        }
    }

    Lightbox.prototype.bindEvents = function()
    {
        $(document.documentElement).on("keyup.lightbox", $.proxy( this.checkESC, this ) );
        this.template.on("click.lightbox", this.option("closeSelector"), $.proxy( this.close, this ) );
    }

    Lightbox.prototype.unbindEvents = function()
    {
        $(document.documentElement).off("keyup.lightbox");
        this.template.off("click.lightbox", this.option("closeSelector") );
    }

    $.fn.lightbox = function(template, options) {

        var settings    = $.extend({}, $.fn.lightbox.defaults, options),
            lbtpl       = template || ".default-lightbox",
            handleClick = function( event ) {
                event.preventDefault();
                event.stopPropagation();

                var provider   = null,
                    target     = $(event.currentTarget),
                    href       = target.data("lightbox-href") || target.attr("href") || false,
                    content    = target.data("lightbox-content") || false,                
                    template   = target.data("lightbox-template") || false,
                    title      = target.data("lightbox-title") || "",
                    extraClass = target.data("lightbox-class") || "";

                switch (true) {
                    case href !== false:
                        provider = new AjaxContentProvider( href, settings.provider );
                        break;
                    case content !== false:
                        provider = new ContentProvider( content );
                        break;
                    case template !== false:
                        // TODO: Make this class.
                        // provider = new TemplateProvider( template );
                        break;
                }

                var lightbox = new Lightbox(
                    lbtpl,
                    provider,
                    {
                        title: title,
                        extraClass: extraClass
                    }
                );           

                lightbox.open();

            };

        this.on("click", settings.descendantSelector, handleClick);

        return this;
    };

    $.fn.lightbox.defaults = {
        descendantSelector: null,
        provider: {
            ajaxOptions: {},
            processData: function( data, textStatus, jqXHR ) {
                var ct = jqXHR.getResponseHeader("content-type") || "";

                if (ct.indexOf("json") > -1) {
                    return data.content;
                }

                return data;
            }
        }
    };

    return Lightbox;
}));
