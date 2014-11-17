function FacebookPicker() {
    PhotoPicker.call(this);
}

FacebookPicker.prototype = createObject( PhotoPicker.prototype );
FacebookPicker.prototype.constructor = FacebookPicker;

FacebookPicker.prototype.fetchData = function()
{
    // get image data from FB.
};
