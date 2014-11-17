function InstagramPicker( clientID, redirectURI )
{
    PhotoPicker.call(this);
    this.type        = "instgrampicker";
    this.batchSize   = 20;
    this.clientID    = clientID;
    this.redirectURI = redirectURI;
    this.accessToken = null;
}

InstagramPicker.prototype = createObject( PhotoPicker.prototype );
InstagramPicker.prototype.constructor = InstagramPicker;

InstagramPicker.prototype.authorizePicker = function()
{
    if ( ! this.clientID || ! this.redirectURI ) {
        console.log("Please provide clientID and redirectURI");
        return false;
    }

    var url = "http://api.instagram.com/oauth/authorize/?response_type=token&client_id=" + this.clientID + "&redirect_uri=" + this.redirectURI;

    popup( url, { name: 'instagram', width: 600, height: 450 } );
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
    console.log("Fetching instagram data");
    return this.fetch( endpoint, data );
};

InstagramPicker.prototype.processData = function(data, status, jqXHR)
{
    this.nextURL = data.pagination.next_url || false;

    var data = data.data,
        i = 0,
        l = data.length;

    for ( ; i < l ; ++i ) {
        this.photos[ this.photos.length ] = data[ i ];
    }

    console.log(this);
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

InstagramPicker.prototype.render = function()
{
    console.log("Rendering instagram data");
};
