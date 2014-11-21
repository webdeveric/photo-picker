define( [
    "jquery",
    "facebook",
    "FacebookPicker",
    "InstagramPicker",
    "Lightbox"
], function( $, FB, FacebookPicker, InstagramPicker ) {
    "use strict";

    var facebookPicker,
        instagramPicker;

    FB.init({
        appId: "741643222570603",
        status: true,
        xfbml: false,
        version: "v2.2"
    });

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

        facebookPicker  = new FacebookPicker(
            "#faceboook-picker"
        );
        facebookPicker.init();

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

        $("#facebook-picker-button").on("click", $.proxy( facebookPicker.open, facebookPicker ) );
        $("#instagram-picker-button").on("click", $.proxy( instagramPicker.open, instagramPicker ) );

        $(document.documentElement).on("selected.photopicker", function( e, url ) {
            if ( url ) {
                var img = new Image();
                img.src = url;
                $("#preview").empty().append( img );
            }
        });

        $("#lightbox-demo").lightbox( ".default-lightbox", {
            descendantSelector: ".item"
        });

    });

});
