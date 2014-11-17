function PhotoPicker()
{
    this.type        = "photopicker";
    this.photos      = [];
    this.nextURL     = null;
    this.currentURL  = null;
    this.batchSize   = 10;
}

PhotoPicker.prototype.init = function()
{
};

PhotoPicker.prototype.open = function()
{
};

PhotoPicker.prototype.close = function()
{
};

PhotoPicker.prototype.render = function()
{
    console.log("Rendering data");
};

PhotoPicker.prototype.fetchData = function()
{
    console.log("Fetching data");
};

PhotoPicker.prototype.getPhotos = function()
{
    return this.photos;
};

PhotoPicker.prototype.loadMore = function()
{
    if ( this.nextURL ) {
        this.fetch( this.nextURL );
    }
};

PhotoPicker.prototype.processData = function(data, status, jqXHR)
{
    console.log(data, status, jqXHR);
};

PhotoPicker.prototype.fetch = function( url, data )
{
    this.currentURL = url;
    var xhr = $.ajax({
        url: url,
        data: data,
        dataType: "jsonp"
    }).done(
        $.proxy( this.processData, this )
    ).fail(
        $.proxy( this.fetchFailed, this )
    );
    console.log("Fetching data with XHR");
    return xhr;
}

PhotoPicker.prototype.fetchFailed = function()
{
    console.log("Fetch failed");
};
