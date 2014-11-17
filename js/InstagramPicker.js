function InstagramPicker( clientID, redirectURI )
{
    PhotoPicker.call(this);
    this.type           = "instgrampicker";
    this.batchSize      = 20;
    this.clientID       = clientID;
    this.redirectURI    = redirectURI;
    this.accessToken    = null;
}

InstagramPicker.prototype = createObject( PhotoPicker.prototype );
InstagramPicker.prototype.constructor = InstagramPicker;

InstagramPicker.prototype.init = function()
{
    PhotoPicker.prototype.init.call(this);
};

InstagramPicker.prototype.setContainer = function( container ) {
    this.container = $(container);
    return this;
};

InstagramPicker.prototype.authorizePicker = function()
{
    if ( ! this.clientID || ! this.redirectURI ) {
        // console.log("Please provide clientID and redirectURI");
        return false;
    }

    var url = "http://api.instagram.com/oauth/authorize/?response_type=token&client_id=" + this.clientID + "&redirect_uri=" + this.redirectURI;

    popup( url, { name: "instagram", width: 650, height: 480 } );
};

InstagramPicker.prototype.setAccessToken = function( token )
{
    this.accessToken = token;
    return this;
};

InstagramPicker.prototype.fetchData = function()
{
    var endpoint = "https://api.instagram.com/v1/users/self/media/recent",
        data = {
            "count": this.batchSize,
            "access_token": this.accessToken
        };
    // console.log("Fetching instagram data");
    return this.fetch( endpoint, data );
};

InstagramPicker.prototype.processData = function(data, status, jqXHR)
{
    this.nextURL = data.pagination.next_url || false;

    this.loadMoreButton.prop("disabled", this.nextURL === false );

    var data = data.data,
        i = 0,
        l = data.length;

    for ( ; i < l ; ) {
        this.append( data[ i++ ] );
    }
};

InstagramPicker.prototype.open = function()
{
    if ( this.accessToken ) {

        if ( this.photos.length === 0 ) {
            this.fetchData().done( $.proxy( this.render, this ) );
        } else {
            this.render();
        }

    } else {

        this.authorizePicker();

    }
};

InstagramPicker.prototype.getSelectedPhotoURL = function()
{
    var photo = this.getSelectedPhoto();

    if ( photo !== false && photo.images.standard_resolution.url ) {
        return photo.images.standard_resolution.url;
    }

    console.log("No photo selected");

    return "";
};

InstagramPicker.prototype.render = function()
{
    // console.log("Rendering instagram data");
    // this should open the lightbox
};

InstagramPicker.prototype.append = function( photo )
{
    var photos_length = this.photos.push( photo );

    var img = new Image(),
        item = document.createElement("div");

    img.onload = function() {
        this.parentNode.className = "photo";
        this.onload = null;
    };
    
    img.src = photo.images.thumbnail.url;

    item.setAttribute("data-photo-index", photos_length - 1 );
    item.className = "photo loading";
    item.appendChild( img );

    this.photoContainer.append( item );
};
