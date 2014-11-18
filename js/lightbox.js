(function(factory) {
    "use strict";

    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else {
        factory(jQuery);
    }

}(function($) {
    "use strict";

    function ContentProvider( content, options )
    {
        this.content = content || "";
        this.options = $.extend({}, options );
    };

    ContentProvider.prototype.bindEvents = function()
    {
    };

    ContentProvider.prototype.unbindEvents = function()
    {
    };

    ContentProvider.prototype.getContent = function( callback )
    {
        if ( callback ) {
            return callback.call(callback, this.content, this );
        } else {
            return this.content;
        }
    };

    ContentProvider.prototype.setContent = function( content )
    {
        this.content = content;
        return this;
    };

    function AjaxContentProvider( url, options )
    {
        ContentProvider.call(this, null, options);
        this.url = url;
        this.options = $.extend(
            this.options,
            {
                ajaxOptions: {},
                processData: function( data, textStatus, jqXHR ) {
                    return data;
                }
            },
            options
        );
    };

    extendClass( AjaxContentProvider, ContentProvider );

    AjaxContentProvider.prototype.fetchContent = function( callback )
    {
        var self = this;
        return $.ajax( this.url, this.options.ajaxOptions ).done( function(data, textStatus, jqXHR) {
            if ( self.options.processData ) {
                self.setContent( self.options.processData.call( self, data, textStatus, jqXHR ) );
            }
            if ( callback ) {
                callback.call(callback, self.content);
            }
        });
    };

    AjaxContentProvider.prototype.getContent = function( callback )
    {
        if ( !this.content ) {
            this.fetchContent( callback );
            return;
        }

        if ( callback ) {
            return callback.call(callback, this.content);
        } else {
            return this.content;    
        }        
    };

    window.ContentProvider = ContentProvider;
    window.AjaxContentProvider = AjaxContentProvider;

    function Lightbox( template, contentProvider, options )
    {
        this.template = $(template);
        this.setContentProvider( contentProvider );
        this.options = $.extend({
            closeOnESC: true,
            htmlClass: "lightbox-open",
            closeSelector: ".lightbox-close-action",
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

        console.log("Lightbox opened");
        return this;
    }

    Lightbox.prototype.addClasses = function()
    {
        $(document.documentElement).addClass( this.option("htmlClass") );
        this.template.addClass("open").addClass( this.option("extraClass") );
    }

    Lightbox.prototype.removeClasses = function()
    {
        $(document.documentElement).removeClass( this.option("htmlClass") );
        this.template.removeClass("open").removeClass( this.option("extraClass") );
    }

    Lightbox.prototype.setTitle = function( title ) {
        title = title || this.option("title", "");
        this.template.find(".lightbox-title").text( title );
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
        console.log("Lightbox closed");
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
        $(document).on("keyup.lightbox", $.proxy( this.checkESC, this ) );
        this.template.on("click.lightbox", this.option("closeSelector"), $.proxy( this.close, this ) );
    }

    Lightbox.prototype.unbindEvents = function()
    {
        $(document).off("keyup.lightbox");
        this.template.off("click.lightbox", this.option("closeSelector") );
    }

    window.Lightbox = Lightbox;

    return Lightbox;

}));
