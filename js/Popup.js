define(function() {
    "use strict";

    function Popup( url, name, features )
    {
        this.url      = url;
        this.name     = name || "";
        this.features = Popup.features;
        this.win      = null;
        this.timer    = null;

        this.blockedCallback = null;
        this.closedCallback = null;
        this.openedCallback = null;

        for (var f in features) {
            if ( !(f in this.features) ) {
                continue;
            }
            this.features[ f ] = features[ f ];
        }

        this.features.width  = this.features.width || screen.availWidth / 2;
        this.features.height = this.features.height || screen.availHeight / 2;
        this.features.left   = this.features.left || (screen.availWidth - this.features.width) / 2;
        this.features.top    = this.features.top || (screen.availHeight - this.features.height) / 2;

        return this;
    }

    Popup.features = {
        width: null,
        height: null,
        left: null,
        top: null,
        menubar: 0,
        toolbar: 0,
        location: 1,
        status: 1,
        resizable: 1,
        scrollbars: 1
    };

    Popup.prototype._featuresString = function() {
        var features = [];

        for (var f in this.features) {
            if ( this.features[f] )
                features.push( f + "=" + this.features[f] );
        }

        return features.join(",");
    };

    Popup.prototype.open = function() {
        this.win = window.open( this.url, this.name, this._featuresString() );

        if ( this.win && !this.win.closed ) {

            this.win.focus();

            if ( typeof this.openedCallback === "function" ) {
                this.openedCallback.call( this.openedCallback, this );
            }

            if ( typeof this.closedCallback === "function" ) {
                this._waitForClosed();
            }

        } else if ( typeof this.blockedCallback === "function" ) {

            this.blockedCallback.call( this.blockedCallback, this );

        }

        return this;
    };

    Popup.prototype.close = function() {
        if ( this.win && !this.win.closed ) {
            this.win.close();
        }
        return this;
    };

    Popup.prototype._clearTimer = function() {
        window.clearInterval( this.timer );
        this.timer = null;
    };

    Popup.prototype._waitForClosed = function() {
        var self = this;
        this.timer = window.setInterval( function() {
            if ( !self.win || self.win.closed ) {
                self._clearTimer();
                if ( typeof self.closedCallback === "function" ) {
                    self.closedCallback.call( self.closedCallback, self );
                }
            }
        }, 500 );
    };

    Popup.prototype.blocked = function( callback ) {
        this.blockedCallback = typeof callback === "function" ? callback : null;
        return this;
    };

    Popup.prototype.opened = function( callback ) {
        this.openedCallback = typeof callback === "function" ? callback : null;
        return this;
    };

    Popup.prototype.closed = function( callback ) {
        this.closedCallback = typeof callback === "function" ? callback : null;
        return this;
    };

    return Popup;

});
