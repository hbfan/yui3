(function() {

    var Y = YAHOO,
        U = Y.util,
        D = U.Dom,
        L = Y.lang,
        W = Y.widget;

    function SliderThumb(node, attr) {
        this.constructor.superclass.constructor.apply(this, arguments);
    }

    SliderThumb.NAME = "SliderThumb";

    SliderThumb.X = "X";
    SliderThumb.Y = "Y";

    SliderThumb.CONFIG = {
        'group' : {},

        'minX' : {
            value : 0
        },

        'maxX' : {
            value : 0
        },

        'minY' : {
            value : 0
        },

        'maxY' : {
            value : 0
        },

        'tickSize' : {
            validator : function(val) {
                return (L.isNumber(val) && val >= 0);
            },
            value : 0
        },

        'x' : {
            set : function(val) {
                return this.constrain(val, SliderThumb.X);
            },
            value : 0
        },

        'y' : {
            set : function(val) {
                return this.constrain(val, SliderThumb.Y);
            },
            value : 0
        },

        'locked' : {
            value : false
        }
    };
    
    L.extend(SliderThumb, W.Widget, {

        initializer: function (attributes) {
            this.initProps();
        },

        initProps : function() {
            var xR = this.getXRange();
            var yR = this.getYRange();

            if (xR !== 0 && yR !== 0) {
                this._isRegion = true;
            } else if (xR !== 0) {
                this._isHoriz = true;
            } else {
                this._isVert = true;
            }
        },

        constrain : function(val, axis) {
            var min = this.get("min" + axis);
            var max = this.get("max" + axis);
            var tSize = this.get("tickSize");

            if(val < min) {
                val = min;
            } else if (val > max){
                val = max;
            } else {
                if (tSize > 0) {
                    var diff = val % tSize;
                    if (diff > 0) {
                        if (diff < Math.round(tSize/2)) {
                            val = val - diff;
                        } else {
                            val = val + (tSize - diff);
                        }
                    }
                }
            }
            return val;
        },

        clearTicks: function () {
            this.set("tickSize", 0);
        },

        lock : function() {
            this.set("locked", true);
        },

        unlock : function() {
            this.set("locked", false);
        },

        isLocked : function() {
            return this.get("locked");
        },

        getValue: function () {
            if (this._isHoriz) {
                return this.getXValue();
            } else if (this._isVert){
                return this.getYValue();
            } else {
                return [this.getXValue(), this.getYValue()];
            }
        },

        getXValue: function () {
            return this.get("x");
        },

        getYValue: function () {
            return this.get("y");
        },

        getXRange :  function() {
            return this.get("maxX") - this.get("minX");
        },

        getYRange : function() {
            return this.get("maxY") - this.get("minY");
        },

        getTickPause : function() {
            var ticks = this.get("tickSize");
            if (ticks > 0) {
                var range = (this._isHoriz) ? this.getXRange() : this.getYRange();
                var nTicks = Math.round(range/ticks);
                if (nTicks > 0) {
                    return Math.round(360/nTicks);
                }
            }
            return 0;
        },

        endMove : function() {
            this.parent.endMove();
        },

        _isHoriz: false,
        _isVert: false,
        _isRegion: false,
        _dd : null,

        renderer : function() {
            this.centerPoint = this.findCenter();
            this.initDD();
            this.apply();
        },

        initDD : function() {

            var w = this,
                xs = this.getXScale(),
                ys = this.getYScale();

            var dd = new U.DD( this.getThumbEl().id, w.get("group"));

            dd.isTarget = false;
            dd.maintainOffset = true;
            dd.scroll = false;

            dd.setInitPosition();

            dd.setXConstraint( w.get("minX") * xs, w.get("maxX") * xs, w.get("tickSize") * xs);
            dd.setYConstraint( w.get("minY") * ys, w.get("maxY") * ys, w.get("tickSize") * ys);

            this._dd = dd;
        },

        getOffsetFromParent: function(parentPos) {

            var thumbEl = this.getThumbEl();
            var offset;

            if (!this.deltaOffset) {
                var thumbPos = D.getXY(thumbEl);
                parentPos = parentPos || D.getXY(this.getParentEl());

                offset = [ (thumbPos[0] - parentPos[0]), (thumbPos[1] - parentPos[1]) ];

                var l = parseInt( D.getStyle(thumbEl, "left"), 10 );
                var t = parseInt( D.getStyle(thumbEl, "top" ), 10 );
                var deltaX = l - offset[0];
                var deltaY = t - offset[1];

                if (!isNaN(deltaX) && !isNaN(deltaY)) {
                    this.deltaOffset = [deltaX, deltaY];
                }
            } else {
                var left = parseInt( D.getStyle(thumbEl, "left"), 10 );
                var top  = parseInt( D.getStyle(thumbEl, "top" ), 10 );
                offset  = [left + this.deltaOffset[0], top + this.deltaOffset[1]];
            }
            return offset;
        },

        getUIValue : function() {
            if (this._isHoriz) {
                return this.getUIXValue();
            } else if (this._isVert) {
                return this.getUIYValue();
            } else {
                return [this.getUIXValue(), this.getUIYValue()];
            }
        },

        // Get Data from the DOM for this VIEW
        getUIXValue : function() {
            return Math.round(this.getOffsetFromParent()[0]/this.getXScale());
        },

        getUIYValue : function() {
            return Math.round(this.getOffsetFromParent()[1]/this.getYScale());
        },

        setXOffset : function() {
            this.moveThumb(this.getOffsetForX(), null, false, false);
        },

        setYOffset : function() {
            this.moveThumb(null, this.getOffsetForY(), false, false);
        },

        getXScale : function() {
            var range = this.getXRange();
            if (range > 0) {
                var uirange = this.getParentEl().offsetWidth - this.getThumbEl().offsetWidth;
                return Math.round(uirange/range);
            } else {
                return 0;
            }
        },

        getYScale : function() {
            var range = this.getYRange();
            if (range > 0) {
                var uirange = this.getParentEl().offsetHeight - this.getThumbEl().offsetHeight;
                return Math.round(uirange/range);
            } else {
                return 0;
            }
        },

        getOffsetForX : function(x) {
            var diff = this.getXValue() - this.get("minX");
            var offset = diff * this.getXScale() + this.centerPoint.x;

            var parentOffsetX = D.getXY(this.getParentEl())[0];
            return parentOffsetX + offset;
        },

        getOffsetForY : function(y) {
            var diff = this.getYValue() - this.get("minY");
            var offset = diff * this.getYScale() + this.centerPoint.y;
            var parentOffsetY = D.getXY(this.getParentEl())[1];
            return parentOffsetY + offset;
        },

        findCenter : function() {
            var t = this.getThumbEl();
            return {
                x: parseInt(t.offsetWidth/2, 10),
                y: parseInt(t.offsetHeight/2, 10) 
            };
        },

        moveThumb: function(x, y, skipAnim, midMove) {
            var curCoord = D.getXY(this.getThumbEl());
            if (!x && x !== 0) {
                x = curCoord[0];
            }

            if (!y && y !== 0) {
                y = curCoord[1];
            }

            var cp = this.centerPoint;

            this._dd.setDelta(cp.x, cp.y);

            var _p = this._dd.getTargetCoord(x, y);
            var p = [_p.x, _p.y];
            var thumb = this;

            var animate = this.parent.get("animate");
            if (animate && this.get("tickSize") > 0 && !skipAnim) {
                this.lock();

                // cache the current this pos
                this.curCoord = curCoord;
                setTimeout( function() { thumb.moveOneTick(p); }, this.parent.get("tickPause"));

            } else if (animate && !skipAnim) {

                this.lock();

                var oAnim = new U.Motion( 
                        this.get("node").get("id"), 
                        { points: { to: p } }, 
                        this.get("animationDuration"), 
                        U.Easing.easeOut );

                oAnim.onComplete.subscribe(function() { 
                    thumb.endMove(); 
                });
                oAnim.animate();

            } else {
                this._dd.setDragElPos(x, y);
                if (!midMove) {
                    this.endMove();
                }
            }
        },

        moveOneTick: function(finalCoord) {
            var nextCoord = null;

            if (this._isRegion) {
                nextCoord = this._getNextX(this.curCoord, finalCoord);
                var tmpX = (nextCoord) ? nextCoord[0] : this.curCoord[0];
                nextCoord = this._getNextY([tmpX, this.curCoord[1]], finalCoord);
            } else if (this._isHoriz) {
                nextCoord = this._getNextX(this.curCoord, finalCoord);
            } else {
                nextCoord = this._getNextY(this.curCoord, finalCoord);
            }

            if (nextCoord) {
                // cache the position
                this.curCoord = nextCoord;
                this._dd.alignElWithMouse(this.getThumbEl(), nextCoord[0], nextCoord[1]);

                // check if we are in the final position, if not make a recursive call
                if (!(nextCoord[0] == finalCoord[0] && nextCoord[1] == finalCoord[1])) {
                    var self = this;
                    setTimeout(function() { self.moveOneTick(finalCoord); },  this.parent.get("tickPause"));
                } else {
                    this.endMove();
                }
            } else {
                this.endMove();
            }
        },

        _getNextX: function(curCoord, finalCoord) {
            var thresh;
            var tmp = [];

            var nextCoord = null;
            if (curCoord[0] > finalCoord[0]) {
                thresh = this.get("tickSize") - this.centerPoint.x;
                tmp = this._dd.getTargetCoord( curCoord[0] - thresh, curCoord[1] );
                nextCoord = [tmp.x, tmp.y];
            } else if (curCoord[0] < finalCoord[0]) {
                thresh = this.get("tickSize") + this.centerPoint.x;
                tmp = this._dd.getTargetCoord( curCoord[0] + thresh, curCoord[1] );
                nextCoord = [tmp.x, tmp.y];
            } else {
                // equal, do nothing
            }

            return nextCoord;
        },

        _getNextY: function(curCoord, finalCoord) {
            var thresh;
            var tmp = [];
            var nextCoord = null;

            if (curCoord[1] > finalCoord[1]) {
                thresh = this.get("tickSize") - this.centerPoint.y;
                tmp = this._dd.getTargetCoord( curCoord[0], curCoord[1] - thresh );
                nextCoord = [tmp.x, tmp.y];
            } else if (curCoord[1] < finalCoord[1]) {
                thresh = this.get("tickSize") + this.centerPoint.y;
                tmp = this._dd.getTargetCoord( curCoord[0], curCoord[1] + thresh );
                nextCoord = [tmp.x, tmp.y];
            } else {
                // equal, do nothing
            }
            return nextCoord;
        },

        getThumbEl : function() {
            return this.get('node').get('node');
        },

        getParentEl : function() {
            return this.parent.get('node').get('node');
        },

        centerPoint : null,
        curCoord : null,

        apply : function() {
            // Events Fired in the Model, Update/Refresh View
            this.addViewListeners();
        },

        addViewListeners : function() {
            this.on("xChange", this.setXOffset, this, true);
            this.on("yChange", this.setYOffset, this, true);

            this.on("render", function() { this.setYOffset();this.setXOffset(); }, this, true);

            this.on("tickSize", this.onTickSizeChange, this, true);
            this.on("lockedChange", this.onLockChange, this, true);
        },

        onTickSizeChange : function() {
            if (this.get("tickSize") === 0) {
                this._dd.clearTicks();
            }
        },

        onLockChange : function() {
            var dd = this._dd;
            if (this.get("locked")) {
                dd.lock();
            } else {
                dd.unlock();
            }
        }
    });

    W.SliderThumb = SliderThumb;
})();

(function() {

    var Y = YAHOO,
        U = Y.util,
        E = U.Event,
        D = U.Dom,
        L = Y.lang,
        W = Y.widget;

    function Slider(node, attributes) {
        this.constructor.superclass.constructor.apply(this, arguments);
    }

    Slider.INC = 1;
    Slider.DEC = -1;

    Slider.getHorizSlider = function (sliderId, thumbId, minX, maxX, iTickSize) {
        var thumb = new W.SliderThumb(thumbId, { 
                group: sliderId,
                minX: minX,
                maxX: maxX,
                tickSize: iTickSize
        });
        return new Slider(sliderId, { group: sliderId, thumb : thumb, type: "horiz"});
    };

    Slider.getVertSlider = function (sliderId, thumbId, minY, maxY, iTickSize) {
        var thumb = new W.SliderThumb(thumbId, { 
                group: sliderId,
                minY: minY,
                maxY: maxY,
                tickSize: iTickSize
        });
        return new Slider(sliderId, { group: sliderId, thumb : thumb, type: "vert" });
    };

    Slider.getRegionSlider = function (sliderId, thumbId, minX, maxX, minY, maxY, iTickSize) {
        var thumb = new W.SliderThumb(thumbId, { 
                group: sliderId, 
                minX: minX,
                maxX: maxX,
                minY: minY,
                maxY: maxY,
                tickSize: iTickSize
        });
        return new Slider(sliderId, { group: sliderId, thumb : thumb, type: "region" });
    };

    Slider.NAME = "Slider";

    Slider.CONFIG = {
        group : { },
        thumb : {},
        type : {
            value : "horiz",
            validator : function(val) {
                return (val == "horiz" || val == "vert" || val == "region");
            }
        },
        bgEnabled : {
            value:true
        },
        keysEnabled : {
            value:true 
        },
        keyIncrement : {
            value:20
        },
        tickPause : {
            value:40
        },
        animationDuration : {
            value:0.2
        },
        animate : {
            value: !L.isUndefined(U.Anim)
        },
        locked : {
            value: false
        }
    };

    L.extend(Slider, W.Widget, {

        initializer : function(attr) {
            if (this.get("group")) {
                this.initThumb();
            }
        },

        initThumb: function() {
            var t =  this.getThumb();
            t.parent = this;
            this.set("tickPause", t.getTickPause());
        },

        getThumb: function() {
            return this.get("thumb");
        },

        lock: function() {
            this.set("locked", true);
        },

        unlock: function() {
            this.set("locked", false);
        },

        isLocked : function() {
            return this.get("locked");
        },

        getValue: function () { 
            return this.getThumb().getValue();
        },

        getXValue: function () { 
            return this.getThumb().getXValue();
        },

        getYValue: function () { 
            return this.getThumb().getYValue();
        },

        setValueToMin : function() {
            this._setValToLimit(false);
        },

        setValueToMax : function() {
            this._setValToLimit(true);
        },

        _setValToLimit : function(minOrMax) {
            var str = (minOrMax) ? "max" : "min",
                t = this.getThumb(),
                s = W.SliderThumb,
                x = s.X,
                y = s.Y;

            if (t._isHoriz) {
                this.setValue(t.get(str + x));
            } else if (t._isVert) {
                this.setValue(t.get(str + y));
            } else {
                this.setRegionValue(t.get(str + x), t.get(str + y));
            }
        },

        setValue: function(val, force, silent) {
            if ( this.isLocked() && !force ) {
                return false;
            }
            if ( isNaN(val) ) {
                return false;
            }
            var t = this.getThumb();
            if (t._isRegion) {
                return false;
            } else if (t._isHoriz) {
                t.set("x", val, silent);
            } else if (t._isVert) {
                t.set("y", val, silent);
            }
        },

        setRegionValue: function(valX, valY, force, silent) {
            if (this.isLocked() && !force) {
                return false;
            }

            if ( isNaN(valX) && isNaN(valY)) {
                return false;
            }

            var t = this.getThumb();
            if (valX || valX === 0) {
                t.set("x", valX, silent);
            }
            if (valY || valY === 0) {
                t.set("y", valY, silent);
            }
        },

        _slideStart: function() {
            if (!this._sliding) {
                this.fireEvent("slideStart");
                this._sliding = true;
            }
        },

        _slideEnd: function() {
            if (this._sliding && this.moveComplete) {
                this.fireEvent("slideEnd");
                this._sliding = false;
                this.moveComplete = false;
            }
        },

        stepYValue : function(dir) {
            var i = this.get("keyIncrement") * dir,
                t = this.getThumb();

            var newY = this.getYValue() + i; 
            if (t._isVert) {
                this.setValue(newY);
            } else if (t._isRegion) {
                this.setRegionValue(null, newY);
            }
        },

        stepXValue : function(dir) {
            var i = this.get("keyIncrement") * dir,
                t = this.getThumb();

            var newX = this.getXValue() + i;
            if (t._isHoriz) {
                this.setValue(newX);
            } else if (t._isRegion) {
                this.setRegionValue(newX, null);
            }
        },

        endMove: function () {
            this.unlock();
            this.moveComplete = true;

            this.fireEvent("endMove");
            this.fireEvents();
        },

        fireEvents: function (thumbEvent) {
            var t = this.getThumb();

            if (!thumbEvent) {
                this.cachePosition();
            }

            if (!this.isLocked()) {
                if (t._isRegion) {
                    var newX = t.getXValue();
                    var newY = t.getYValue();

                    if (newX != this.previousX || newY != this.previousY) {
                      this.fireEvent("change", { x: newX, y: newY });
                    }

                    this.previousX = newX;
                    this.previousY = newY;
                } else {
                    var newVal = t.getValue();
                      if (newVal != this.previousVal) {
                        this.fireEvent("change", newVal);
                      }
                      this.previousVal = newVal;
                }
                this._slideEnd();
            }
        },

        focus: function() {
            this.focusEl();
            if (this.isLocked()) {
                return false;
            } else {
                this._slideStart();
                return true;
            }
        },

        renderer : function() {
            this.baselinePos = D.getXY(this.getBackgroundEl());

            // TODO: Formal parent child?            
            this.getThumb().render();

            this.initDD();
            this.apply();
        },

        initDD : function() {
            this._dd = new U.DragDrop(
                this.get("node").get("id"), 
                this.get("group"), 
                true);
                
            this._dd.setInitPosition();
            this._dd.isTarget = false;
        },

        focusEl : function() {
            var el = this.getBackgroundEl();
            if (el.focus) {
                try {
                    el.focus();
                } catch(e) {
                }
            }
            this.verifyOffset();
        },

        verifyOffset: function(checkPos) {
            var newPos = D.getXY(this.getBackgroundEl());
            if (newPos) {
                if (newPos[0] != this.baselinePos[0] || newPos[1] != this.baselinePos[1]) {
                    this.getThumb()._dd.resetConstraints();
                    this.baselinePos = newPos;
                    return false;
                }
            }
            return true;
        },

        cachePosition : function() {
            this.getThumb()._dd.cachePosition();        
        },

        getBackgroundEl : function() {
            return this.get("node").get("node");
        },

        apply : function() {

            // Events Fired in the UI, Update Model
            this.addKeyListeners();
            this.addDDListeners();
            this.addThumbDDListeners();

            // Events Fired in the Model, Update/Refresh View
            this.addViewListeners();
        },

        addKeyListeners: function() {
            var bg = this.getBackgroundEl();
            E.on(bg, "keydown",  this.onKeyDown,  this, true);
            E.on(bg, "keypress", this.onKeyPress, this, true);
        },

        addDDListeners : function() {
            var c = this,
                sDD = this._dd;

            sDD.onMouseUp = function(e) {c.onBGMouseUp(e);};
            sDD.b4MouseDown = function(e) {c.beforeBGMouseDown(e);};
            sDD.onDrag = function(e) {c.onBGDrag(e);};
            sDD.onMouseDown = function(e) {c.onBGMouseDown(e);};

            this.on("endMove", this.sync, this, true);
        },

        addThumbDDListeners : function() {
            var c = this,
                tDD = this.getThumb()._dd;

            tDD.onMouseDown = function(e) {c.onThumbMouseDown(e);};
            tDD.startDrag = function(e) {c.onThumbStartDrag(e);};
            tDD.onDrag = function(e) {c.onThumbDrag(e);};
            tDD.onMouseUp = function(e) {c.onThumbMouseUp(e);};
        },

        addViewListeners : function() {
            this.on("lockedChange", this.onLockChange, this, true);
        },

        onLockChange : function() {
            var dd = this._dd;
            var t = this.getThumb();
            if (this.get("locked")) {
                dd.lock();
                t.lock();
            } else {
                dd.unlock();
                t.unlock();
            }
        },

        sync : function() {
            var val = this.getThumb().getUIValue();
            if (this.getThumb()._isRegion) {
                this.setRegionValue(val[0], val[1], false, true);
            } else {
                this.setValue(val, false, true);
            }
        },

        beforeBGMouseDown: function(e) {
            var dd = this.getThumb()._dd;
            dd.autoOffset();
            dd.resetConstraints();
        },

        onBGMouseDown: function(e) {
            if (!this.isLocked() && this.get("bgEnabled")) {
                this.focus();
                this._moveThumb(e);
            }
        },

        _moveThumb : function(e) {
            var x = E.getPageX(e);
            var y = E.getPageY(e);
            this.getThumb().moveThumb(x, y);
        },

        onBGDrag: function(e) {
            if (!this.isLocked()) {
                this._moveThumb(e);
            }
        },

        onBGMouseUp: function(e) {
            if (!this.isLocked() && !this.moveComplete) {
               // this.endMove();
            }
        },

        onThumbMouseDown : function (e) { 
            return this.focus(); 
        },

        onThumbStartDrag : function(e) { 
            this._slideStart(); 
        },

        onThumbDrag : function(e) {
            this.sync();
            this.fireEvents(true);
        },

        onThumbMouseUp: function(e) {
            if (!this.isLocked() && !this.moveComplete) {
                this.endMove();
            }
        },

        onKeyPress: function(e) {
            if (this.get("keysEnabled")) {
                switch (E.getCharCode(e)) {
                    case 0x25: // left
                    case 0x26: // up
                    case 0x27: // right
                    case 0x28: // down
                    case 0x24: // home
                    case 0x23: // end
                        E.preventDefault(e);
                        break;
                    default:
                }
            }
    
        },

        onKeyDown: function(e) {
            var s = Slider;

            if (this.get("keysEnabled")) {
                var changed = true;
                switch (E.getCharCode(e)) {
                    case 0x25:  // left 
                        this.stepXValue(s.DEC);
                        break;
                    case 0x26:  // up
                        this.stepYValue(s.DEC);
                        break;
                    case 0x27:  // right
                        this.stepXValue(s.INC);
                        break;
                    case 0x28:  // down
                        this.stepYValue(s.INC);
                        break;
                    case 0x24:  // home
                        this.setValueToMin();
                        break;
                    case 0x23:  // end
                        this.setValueToMax();
                        break;
                    default:
                        changed = false;
                }
                if (changed) {
                    E.stopEvent(e);
                }
            }
        },

        _dd : null
    });

    W.Slider = Slider;

})();

YAHOO.register("slider", YAHOO.widget.Slider, {version: "@VERSION@", build: "@BUILD@"});