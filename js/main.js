define( [
    "jquery",
    "facebook",
    "Lightbox",
    "PhotoPicker",
    "FacebookPhotoProvider",
    "InstagramPhotoProvider"
], function( $, FB, Lightbox, PhotoPicker, FacebookPhotoProvider, InstagramPhotoProvider ) {
    "use strict";

    FB.init({
        appId: "741643222570603",
        status: true,
        xfbml: false,
        version: "v2.2"
    });

    $(function() {

        $(".no-js").removeClass("no-js").addClass("js");

        // Handle selected photo
        $(document.documentElement).on("selected.photopicker", function( e, url ) {
            if ( url ) {
                var img = new Image();
                img.src = url;
                $("#preview").empty().append( img );
            }
        }).on("error.photopicker", function( e, error /* , photopicker */ ) {
            console.log( error.message );
        });

        // Lightbox demo
        $("#lightbox-demo").lightbox( ".default-lightbox", {
            descendantSelector: ".item"
        });

        // var instagramPhotoProvider = new InstagramPhotoProvider(
        //     "8f9ed714eaff481995467237175e5dfa",
        //     "https://photopicker.webdeveric.com/callback.html"
        // );

        var facebookPhotoProvider = new FacebookPhotoProvider(),
            instagramPhotoProvider = new InstagramPhotoProvider(
                "e63a8cb495e94cdebf6c7c16b1b55e20",
                "http://photopicker.dev/callback.html"
            ),
            facebookPicker = new PhotoPicker( "#photo-picker", facebookPhotoProvider, { lightbox: { title: "Facebook Photos", extraClass: "facebook-picker-lightbox", titleSelector: ".lightbox-title-text" } } ),
            instagramPicker = new PhotoPicker( "#photo-picker", instagramPhotoProvider, { lightbox: { title: "Instagram Photos", extraClass: "instagram-picker-lightbox", titleSelector: ".lightbox-title-text" } } );

        $("#facebook-picker-button").on("click", $.proxy( facebookPicker.open, facebookPicker ) );
        $("#instagram-picker-button").on("click", $.proxy( instagramPicker.open, instagramPicker ) );

    });

});
