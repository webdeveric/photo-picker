(function(factory) {
    "use strict";

    if (typeof define === "function" && define.amd) {
        define([ "jquery", "Lightbox", "InstagramPicker", "ContentProvider", "AjaxContentProvider" ], factory);
    } else {
        factory(jQuery);
    }

}(function($, Lightbox, InstagramPicker, ContentProvider, AjaxContentProvider) {
    "use strict";

    var instagramPicker;

    /*
    https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage

    IE8/9 do NOT support postMessage between windows.
    They only supports it between frame and iframe.

    Here is a simple way of passing the token back to this page from a popup.
    See callback.html for details.
    */
    window.receiveInstagramToken = function( token )
    {
        instagramPicker.setAccessToken( token ).open();
    };

    $(function() {
        instagramPicker = new InstagramPicker(
            "#instragram-picker",
            "e63a8cb495e94cdebf6c7c16b1b55e20",
            "http://photopicker.dev/callback.html"
        );
        // instagramPicker = new InstagramPicker(
        //     "#instragram-picker",
        //     "8f9ed714eaff481995467237175e5dfa",
        //     "https://photopicker.webdeveric.com/callback.html"
        // );

        instagramPicker.init();

        var button = $("#instagram-picker-button").on("click", $.proxy( instagramPicker.open, instagramPicker ) );

        var preview = $("#preview");

        $(document.documentElement).on("selected.photopicker", function( e, url, pickertype ) {
            if ( url ) {
                var img = new Image();
                    img.src = url;
                preview.empty().append( img );
            }
        });
        // .on("open.lightbox", function( e, lightbox ) {
        //     console.log( lightbox );
        // }).on("close.lightbox", function( e, lightbox ) {
        //     console.log( lightbox );
        // });

        // var staticContent = new ContentProvider("Get photos from Facebook here.");
        // var ajaxContent   = new AjaxContentProvider("content.html");

        // ajaxContent.getContent( function( content ) {
        //     console.log( content );
        // });

        // var ajaxLightbox = new Lightbox(
        //     ".default-lightbox",
        //     ajaxContent,
        //     {
        //         title: "Ajax Content",
        //         extraClass: "notice"
        //     }
        // );
        // ajaxLightbox.open();

        $("#lightbox-demo").lightbox( ".default-lightbox", {
            descendantSelector: ".item"
        }); //.find(".item").click();

    });

}));
