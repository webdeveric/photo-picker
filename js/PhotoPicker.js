function PhotoPicker( templateSelector )
{
    ContentProvider.call(this);

    this.type           = "photopicker";
    this.template       = templateSelector;
    this.photos         = [];
    this.index          = 0;
    this.nextURL        = null;
    this.currentURL     = null;
    this.batchSize      = 10;
    this.selectedPhoto  = null;
    this.lightbox       = null;
    this.photoContainer = null;
    this.loadMoreButton = null;
    this.cancelButton   = null;
    this.submitButton   = null;
}

extendClass( PhotoPicker, ContentProvider );

PhotoPicker.prototype.init = function()
{
    this.setupTemplate();
};

PhotoPicker.prototype.bindEvents = function()
{
    var self = this;

    if ( this.photoContainer ) {
        this.photoContainer.on("click.photopicker", ".photo", $.proxy( this.handlePhotoClick, this ) );
    }

    if ( this.loadMoreButton ) {
        this.loadMoreButton.on("click.photopicker", function() {
            self.loadMore();
        });
    }

    if ( this.cancelButton ) {
        this.cancelButton.on("click.photopicker", function() {
            self.clearSelected();
            self.close();
        });
    }

    if ( this.submitButton ) {
        this.submitButton.on("click.photopicker", function() {
            self.handleSubmit();
        });
    }

    return this;
}

PhotoPicker.prototype.unbindEvents = function()
{
    if ( this.photoContainer ) {
        this.photoContainer.off("click.photopicker", ".photo");
    }

    if ( this.loadMoreButton ) {
        this.loadMoreButton.off("click.photopicker");
    }

    if ( this.cancelButton ) {
        this.cancelButton.off("click.photopicker");
    }

    if ( this.submitButton ) {
        this.submitButton.off("click.photopicker");
    }

    return this;
};

PhotoPicker.prototype.open = function()
{
};

PhotoPicker.prototype.close = function()
{
    if ( this.lightbox ) {
        this.lightbox.close();
    }
    console.log("PhotoPicker closed");
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

    // console.log( url, data );

    var xhr = $.ajax({
        url: url,
        data: data,
        dataType: "jsonp"
    }).done(
        $.proxy( this.processData, this )
    ).fail(
        $.proxy( this.fetchFailed, this )
    );

    return xhr;
}

PhotoPicker.prototype.fetchFailed = function()
{
    console.log("Fetch failed");
};

PhotoPicker.prototype.clearSelected = function()
{
    this.selectedPhoto = null;
    this.content.find(".selected").removeClass("selected");
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

PhotoPicker.prototype.setupTemplate = function()
{
    this.template       = Hogan.compile( $(this.template).html() );
    this.content        = $( this.template.render() );
    this.photoContainer = $(".photo-container", this.content );
    this.loadMoreButton = $(".button-load-more", this.content );
    this.cancelButton   = $(".button-cancel", this.content );
    this.submitButton   = $(".button-submit", this.content );
    return this;
};
