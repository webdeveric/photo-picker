function FacebookPicker()
{
    PhotoPicker.call(this);

    this.type           = "facebookpicker";
    this.batchSize      = 20;
    // this.clientID       = clientID;
    // this.redirectURI    = redirectURI;
    // this.accessToken    = null;
}

extendClass( FacebookPicker, PhotoPicker );

FacebookPicker.prototype.fetchData = function()
{
    // get image data from FB.
};
