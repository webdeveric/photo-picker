(function(factory) {
    "use strict";

    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else {
        factory(jQuery);
    }

}(function($) {
    "use strict";

    $.fn.lightbox = function(options) {

        var settings = $.extend({}, $.fn.lightbox.defaults, options),
            data = $.fn.lightbox.data;

        function checkESC(event)
        {
            if (event.keyCode == 27 && settings.closeOnESC) {
                close();
            }
        }

        function listenforESC()
        {
            $(document).on("keyup.lightbox", checkESC);
        }

        function dontlistenforESC()
        {
            $(document).unbind("keyup.lightbox");
        }

        function toggle(state)
        {
            state = state || false;

            data.container = $(settings.container);

            if ( !state ) {
                clearContents();
            } else {
                // Reset scroll
                data.container.scrollTop( 0 );
            }

            if (settings.className) {
                data.container.toggleClass(settings.className, state);
            }

            data.container.toggleClass(settings.isOpenClass, state);
            $(document).trigger("lightbox-state-change", [ state, settings ] );

        }

        function close(event)
        {
            if (event) {
                if (event.target != event.currentTarget) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
            }

            toggle(false);

            if (data.currentTarget) {
                data.currentTarget.removeClass(settings.activeClass).trigger("lightbox-closed");
            }

            if ( data.container && data.extraClassName !== "" ) {
                data.container.removeClass( data.extraClassName );
            }

            dontlistenforESC();
        }

        function clearContents()
        {
            return $(settings.content).empty();
        }

        function load(content)
        {
            clearContents().append(content);
        }

        function fetch(url)
        {
            $.ajax(url, {}).done(function(data, textStatus, jqXHR) {
                if (settings.processAjaxResponse) {
                    data = settings.processAjaxResponse(data, textStatus, jqXHR);
                }
                load(data);
                toggle(true);
            });
        }

        function render(template) {
            clearContents().append($(template).html());
        }

        function handleClick(event)
        {
            listenforESC();

            var container = $(settings.container);

            if (data.currentTarget) {
                data.currentTarget.removeClass(settings.activeClass);
            }

            if (data.className && (settings.className && data.className != settings.className) || !settings.className) {
                container.removeClass(data.className);
            }

            if (settings.className) {
                container.addClass(data.className = settings.className);
            }

            data.currentTarget = $(event.currentTarget);

            var dataContent = data.currentTarget.data("lightbox-content") || "",
                href = data.currentTarget.attr("href") || "",
                dataTemplate = data.currentTarget.data("lightbox-template") || "";

            if ( data.extraClassName !== "" ) {
                data.currentTarget.removeClass( data.extraClassName );
            }

            data.extraClassName = data.currentTarget.data("lightbox-class") || "";
            data.title = data.currentTarget.data("lightbox-title") || "";

            if ( data.title !== "" ) {
                $(settings.title).text(data.title);
            }

            if (dataContent !== "") {
                load(dataContent);
                toggle(true);
            } else if (href) {
                fetch(href);
            } else if (dataTemplate !== "") {
                render(dataTemplate);
                toggle(true);
            }

            data.container = container;

            data.currentTarget.addClass(settings.activeClass);
            data.container.addClass( data.extraClassName );

            return false;
        }

        if (settings.closeOnClick) {
            $(settings.closeOnClick).on("click.lightbox", close);
            // $(settings.container).unbind("click.lightbox");
        }

        $(document).on("lightbox-state-change", function(event, state /*, settings */) {
            $(document.documentElement).toggleClass("lightbox-open", state);
        });
        $(document).on("lightbox/close", function() {
            close();
        });

        this.on("click", settings.descendantSelector, handleClick);
        this.on("lightbox", function(e) {
            handleClick(e);
            toggle(true);
        });
        return this;
    };

    $.fn.lightbox.data = {};

    $.fn.lightbox.defaults = {
        container: ".lightbox",
        content: ".lightbox-content",
        title: ".lightbox-title",
        isOpenClass: "open",
        activeClass: "active",
        closeOnClick: ".lightbox-overlay, .lightbox-close, .lightbox-frame",
        closeOnESC: true,
        descendantSelector: null,
        processAjaxResponse: function(data, textStatus, jqXHR) {

            var ct = jqXHR.getResponseHeader("content-type") || "";

            if (ct.indexOf("json") > -1) {
                return data.content;
            }

            return data;
        }
    };

}));
