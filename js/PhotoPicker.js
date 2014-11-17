function PhotoPicker()
{
    this.type          = "photopicker";
    this.photos        = [];
    this.index         = 0;
    this.nextURL       = null;
    this.currentURL    = null;
    this.batchSize     = 10;
    this.selectedPhoto = null;

    this.container      = null;
    this.photoContainer = null;
    this.loadMoreButton = null;
    this.cancelButton   = null;
    this.submitButton   = null;
}

PhotoPicker.prototype.init = function()
{
    var self = this;

    this.photoContainer = this.container.find(".photo-container");
    this.loadMoreButton = this.container.find(".button-load-more");
    this.cancelButton   = this.container.find(".button-cancel");
    this.submitButton   = this.container.find(".button-submit");

    this.photoContainer.on("click", ".photo", $.proxy( this.handlePhotoClick, this ) );

    this.loadMoreButton.click( function() {
        self.loadMore();
    });

    this.cancelButton.click( function() {
        self.clearSelected();
        self.close();
    });

    this.submitButton.click( function() {
        self.handleSubmit();
    });
};

PhotoPicker.prototype.open = function()
{
};

PhotoPicker.prototype.close = function()
{
    console.log("PhotoPicker close");
};

PhotoPicker.prototype.render = function()
{
    console.log("Rendering data");
};

PhotoPicker.prototype.append = function( photo )
{
    console.log("Appending photo");
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
    console.log("PhotoPicker loadMore");
    this.loadMoreButton.prop("disabled", 1 );
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
    data = data || "";

    console.log( url, data );

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

PhotoPicker.prototype.clearSelected = function()
{
    this.selectedPhoto = null;
    this.container.find(".selected").removeClass("selected");
    this.submitButton.prop("disabled", 1 );
};

PhotoPicker.prototype.handlePhotoClick = function( event )
{
    var photo = $(event.currentTarget),
        photo_index = parseInt( photo.data("photo-index"), 10 );

    if ( photo_index === this.selectedPhoto ) {

        this.clearSelected();

    } else {

        this.clearSelected();
        photo.addClass("selected");
        this.selectedPhoto = photo_index;
        this.submitButton.prop("disabled", 0 );

    }    
};

PhotoPicker.prototype.getSelectedPhotoURL = function()
{
    return "";
};

PhotoPicker.prototype.getSelectedPhoto = function()
{
    if ( this.selectedPhoto !== void 0 ) {
        return this.photos[ this.selectedPhoto ];
    }
    return false;
};

PhotoPicker.prototype.handleSubmit = function()
{
    console.log("PhotoPicker submitted");
    $(document).trigger("photopicker.photo-selected", [ this.getSelectedPhotoURL(), this.type ] );
    this.close();
};
