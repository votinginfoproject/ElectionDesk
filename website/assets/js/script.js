if (function($) {
    !function($) {
        "use strict";
        function noop() {}
        function defineBridget($) {
            function addOptionMethod(PluginClass) {
                PluginClass.prototype.option || (PluginClass.prototype.option = function(opts) {
                    $.isPlainObject(opts) && (this.options = $.extend(!0, this.options, opts));
                });
            }
            function bridge(namespace, PluginClass) {
                $.fn[namespace] = function(options) {
                    if ("string" == typeof options) {
                        for (var args = slice.call(arguments, 1), i = 0, len = this.length; len > i; i++) {
                            var elem = this[i], instance = $.data(elem, namespace);
                            if (instance) if ($.isFunction(instance[options]) && "_" !== options.charAt(0)) {
                                var returnValue = instance[options].apply(instance, args);
                                if (void 0 !== returnValue && returnValue !== instance) return returnValue;
                            } else logError("no such method '" + options + "' for " + namespace + " instance"); else logError("cannot call methods on " + namespace + " prior to initialization; attempted to call '" + options + "'");
                        }
                        return this;
                    }
                    var objects = this.map(function() {
                        var instance = $.data(this, namespace);
                        return instance ? (instance.option(options), instance._init()) : (instance = new PluginClass(this, options), 
                        $.data(this, namespace, instance)), $(this);
                    });
                    return !objects || objects.length > 1 ? objects : objects[0];
                };
            }
            if ($) {
                var logError = "undefined" == typeof console ? noop : function(message) {
                    console.error(message);
                };
                return $.bridget = function(namespace, PluginClass) {
                    addOptionMethod(PluginClass), bridge(namespace, PluginClass);
                }, $.bridget;
            }
        }
        var slice = Array.prototype.slice;
        defineBridget($);
    }($), function($) {
        function createNewSlider(element, options) {
            function getDataAttrib(element, optName) {
                var dataName = "data-slider-" + optName, dataValString = element.getAttribute(dataName);
                try {
                    return JSON.parse(dataValString);
                } catch (err) {
                    return dataValString;
                }
            }
            "string" == typeof element ? this.element = document.querySelector(element) : element instanceof HTMLElement && (this.element = element);
            var sliderTrackSelection, sliderMinHandle, sliderMaxHandle, origWidth = this.element.style.width, updateSlider = !1, parent = this.element.parentNode;
            if (this.sliderElem) updateSlider = !0; else {
                this.sliderElem = document.createElement("div"), this.sliderElem.className = "slider";
                var sliderTrack = document.createElement("div");
                sliderTrack.className = "slider-track", sliderTrackSelection = document.createElement("div"), 
                sliderTrackSelection.className = "slider-selection", sliderMinHandle = document.createElement("div"), 
                sliderMinHandle.className = "slider-handle min-slider-handle", sliderMaxHandle = document.createElement("div"), 
                sliderMaxHandle.className = "slider-handle max-slider-handle", sliderTrack.appendChild(sliderTrackSelection), 
                sliderTrack.appendChild(sliderMinHandle), sliderTrack.appendChild(sliderMaxHandle);
                var createAndAppendTooltipSubElements = function(tooltipElem) {
                    var arrow = document.createElement("div");
                    arrow.className = "tooltip-arrow";
                    var inner = document.createElement("div");
                    inner.className = "tooltip-inner", tooltipElem.appendChild(arrow), tooltipElem.appendChild(inner);
                }, sliderTooltip = document.createElement("div");
                sliderTooltip.className = "tooltip tooltip-main", createAndAppendTooltipSubElements(sliderTooltip);
                var sliderTooltipMin = document.createElement("div");
                sliderTooltipMin.className = "tooltip tooltip-min", createAndAppendTooltipSubElements(sliderTooltipMin);
                var sliderTooltipMax = document.createElement("div");
                sliderTooltipMax.className = "tooltip tooltip-max", createAndAppendTooltipSubElements(sliderTooltipMax), 
                this.sliderElem.appendChild(sliderTrack), this.sliderElem.appendChild(sliderTooltip), 
                this.sliderElem.appendChild(sliderTooltipMin), this.sliderElem.appendChild(sliderTooltipMax), 
                parent.insertBefore(this.sliderElem, this.element), this.element.style.display = "none";
            }
            $ && (this.$element = $(this.element), this.$sliderElem = $(this.sliderElem)), options = options ? options : {};
            for (var optionTypes = Object.keys(this.defaultOptions), i = 0; i < optionTypes.length; i++) {
                var optName = optionTypes[i], val = options[optName];
                val = "undefined" != typeof val ? val : getDataAttrib(this.element, optName), val = null !== val ? val : this.defaultOptions[optName], 
                this.options || (this.options = {}), this.options[optName] = val;
            }
            this.eventToCallbackMap = {}, this.sliderElem.id = this.options.id, this.touchCapable = "ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch, 
            this.tooltip = this.sliderElem.querySelector(".tooltip-main"), this.tooltipInner = this.tooltip.querySelector(".tooltip-inner"), 
            this.tooltip_min = this.sliderElem.querySelector(".tooltip-min"), this.tooltipInner_min = this.tooltip_min.querySelector(".tooltip-inner"), 
            this.tooltip_max = this.sliderElem.querySelector(".tooltip-max"), this.tooltipInner_max = this.tooltip_max.querySelector(".tooltip-inner"), 
            updateSlider === !0 && (this._removeClass(this.sliderElem, "slider-horizontal"), 
            this._removeClass(this.sliderElem, "slider-vertical"), this._removeClass(this.tooltip, "hide"), 
            this._removeClass(this.tooltip_min, "hide"), this._removeClass(this.tooltip_max, "hide"), 
            [ "left", "top", "width", "height" ].forEach(function(prop) {
                this._removeProperty(this.trackSelection, prop);
            }, this), [ this.handle1, this.handle2 ].forEach(function(handle) {
                this._removeProperty(handle, "left"), this._removeProperty(handle, "top");
            }, this), [ this.tooltip, this.tooltip_min, this.tooltip_max ].forEach(function(tooltip) {
                this._removeProperty(tooltip, "left"), this._removeProperty(tooltip, "top"), this._removeProperty(tooltip, "margin-left"), 
                this._removeProperty(tooltip, "margin-top"), this._removeClass(tooltip, "right"), 
                this._removeClass(tooltip, "top");
            }, this)), "vertical" === this.options.orientation ? (this._addClass(this.sliderElem, "slider-vertical"), 
            this.stylePos = "top", this.mousePos = "pageY", this.sizePos = "offsetHeight", this._addClass(this.tooltip, "right"), 
            this.tooltip.style.left = "100%", this._addClass(this.tooltip_min, "right"), this.tooltip_min.style.left = "100%", 
            this._addClass(this.tooltip_max, "right"), this.tooltip_max.style.left = "100%") : (this._addClass(this.sliderElem, "slider-horizontal"), 
            this.sliderElem.style.width = origWidth, this.options.orientation = "horizontal", 
            this.stylePos = "left", this.mousePos = "pageX", this.sizePos = "offsetWidth", this._addClass(this.tooltip, "top"), 
            this.tooltip.style.top = -this.tooltip.outerHeight - 14 + "px", this._addClass(this.tooltip_min, "top"), 
            this.tooltip_min.style.top = -this.tooltip_min.outerHeight - 14 + "px", this._addClass(this.tooltip_max, "top"), 
            this.tooltip_max.style.top = -this.tooltip_max.outerHeight - 14 + "px"), this.options.value instanceof Array ? this.options.range = !0 : this.options.range && (this.options.value = [ this.options.value, this.options.max ]), 
            this.trackSelection = sliderTrackSelection || this.trackSelection, "none" === this.options.selection && this._addClass(this.trackSelection, "hide"), 
            this.handle1 = sliderMinHandle || this.handle1, this.handle2 = sliderMaxHandle || this.handle2, 
            updateSlider === !0 && (this._removeClass(this.handle1, "round triangle"), this._removeClass(this.handle2, "round triangle hide"));
            var availableHandleModifiers = [ "round", "triangle", "custom" ], isValidHandleType = -1 !== availableHandleModifiers.indexOf(this.options.handle);
            isValidHandleType && (this._addClass(this.handle1, this.options.handle), this._addClass(this.handle2, this.options.handle)), 
            this.offset = this._offset(this.sliderElem), this.size = this.sliderElem[this.sizePos], 
            this.setValue(this.options.value), this.handle1Keydown = this._keydown.bind(this, 0), 
            this.handle1.addEventListener("keydown", this.handle1Keydown, !1), this.handle2Keydown = this._keydown.bind(this, 0), 
            this.handle2.addEventListener("keydown", this.handle2Keydown, !1), this.touchCapable ? (this.mousedown = this._mousedown.bind(this), 
            this.sliderElem.addEventListener("touchstart", this.mousedown, !1)) : (this.mousedown = this._mousedown.bind(this), 
            this.sliderElem.addEventListener("mousedown", this.mousedown, !1)), "hide" === this.options.tooltip ? (this._addClass(this.tooltip, "hide"), 
            this._addClass(this.tooltip_min, "hide"), this._addClass(this.tooltip_max, "hide")) : "always" === this.options.tooltip ? (this._showTooltip(), 
            this._alwaysShowTooltip = !0) : (this.showTooltip = this._showTooltip.bind(this), 
            this.hideTooltip = this._hideTooltip.bind(this), this.sliderElem.addEventListener("mouseenter", this.showTooltip, !1), 
            this.sliderElem.addEventListener("mouseleave", this.hideTooltip, !1), this.handle1.addEventListener("focus", this.showTooltip, !1), 
            this.handle1.addEventListener("blur", this.hideTooltip, !1), this.handle2.addEventListener("focus", this.showTooltip, !1), 
            this.handle2.addEventListener("blur", this.hideTooltip, !1)), this.options.enabled ? this.enable() : this.disable();
        }
        var ErrorMsgs = {
            formatInvalidInputErrorMsg: function(input) {
                return "Invalid input value '" + input + "' passed in";
            },
            callingContextNotSliderInstance: "Calling context element does not have instance of Slider bound to it. Check your code to make sure the JQuery object returned from the call to the slider() initializer is calling the method"
        }, Slider = function(element, options) {
            return createNewSlider.call(this, element, options), this;
        };
        if (Slider.prototype = {
            _init: function() {},
            constructor: Slider,
            defaultOptions: {
                id: "",
                min: 0,
                max: 10,
                step: 1,
                precision: 0,
                orientation: "horizontal",
                value: 5,
                range: !1,
                selection: "before",
                tooltip: "show",
                tooltip_split: !1,
                handle: "round",
                reversed: !1,
                enabled: !0,
                formatter: function(val) {
                    return val instanceof Array ? val[0] + " : " + val[1] : val;
                },
                natural_arrow_keys: !1
            },
            over: !1,
            inDrag: !1,
            getValue: function() {
                return this.options.range ? this.options.value : this.options.value[0];
            },
            setValue: function(val, triggerSlideEvent) {
                val || (val = 0), this.options.value = this._validateInputValue(val);
                var applyPrecision = this._applyPrecision.bind(this);
                this.options.range ? (this.options.value[0] = applyPrecision(this.options.value[0]), 
                this.options.value[1] = applyPrecision(this.options.value[1]), this.options.value[0] = Math.max(this.options.min, Math.min(this.options.max, this.options.value[0])), 
                this.options.value[1] = Math.max(this.options.min, Math.min(this.options.max, this.options.value[1]))) : (this.options.value = applyPrecision(this.options.value), 
                this.options.value = [ Math.max(this.options.min, Math.min(this.options.max, this.options.value)) ], 
                this._addClass(this.handle2, "hide"), this.options.value[1] = "after" === this.options.selection ? this.options.max : this.options.min), 
                this.diff = this.options.max - this.options.min, this.percentage = this.diff > 0 ? [ 100 * (this.options.value[0] - this.options.min) / this.diff, 100 * (this.options.value[1] - this.options.min) / this.diff, 100 * this.options.step / this.diff ] : [ 0, 0, 100 ], 
                this._layout();
                var sliderValue = this.options.range ? this.options.value : this.options.value[0];
                return this._setDataVal(sliderValue), triggerSlideEvent === !0 && this._trigger("slide", sliderValue), 
                this;
            },
            destroy: function() {
                this._removeSliderEventHandlers(), this.sliderElem.parentNode.removeChild(this.sliderElem), 
                this.element.style.display = "", this._cleanUpEventCallbacksMap(), this.element.removeAttribute("data"), 
                $ && (this._unbindJQueryEventHandlers(), this.$element.removeData("slider"));
            },
            disable: function() {
                return this.options.enabled = !1, this.handle1.removeAttribute("tabindex"), this.handle2.removeAttribute("tabindex"), 
                this._addClass(this.sliderElem, "slider-disabled"), this._trigger("slideDisabled"), 
                this;
            },
            enable: function() {
                return this.options.enabled = !0, this.handle1.setAttribute("tabindex", 0), this.handle2.setAttribute("tabindex", 0), 
                this._removeClass(this.sliderElem, "slider-disabled"), this._trigger("slideEnabled"), 
                this;
            },
            toggle: function() {
                return this.options.enabled ? this.disable() : this.enable(), this;
            },
            isEnabled: function() {
                return this.options.enabled;
            },
            on: function(evt, callback) {
                return $ ? (this.$element.on(evt, callback), this.$sliderElem.on(evt, callback)) : this._bindNonQueryEventHandler(evt, callback), 
                this;
            },
            getAttribute: function(attribute) {
                return attribute ? this.options[attribute] : this.options;
            },
            setAttribute: function(attribute, value) {
                return this.options[attribute] = value, this;
            },
            refresh: function() {
                return this._removeSliderEventHandlers(), createNewSlider.call(this, this.element, this.options), 
                $ && $.data(this.element, "slider", this), this;
            },
            _removeSliderEventHandlers: function() {
                this.handle1.removeEventListener("keydown", this.handle1Keydown, !1), this.handle1.removeEventListener("focus", this.showTooltip, !1), 
                this.handle1.removeEventListener("blur", this.hideTooltip, !1), this.handle2.removeEventListener("keydown", this.handle2Keydown, !1), 
                this.handle2.removeEventListener("focus", this.handle2Keydown, !1), this.handle2.removeEventListener("blur", this.handle2Keydown, !1), 
                this.sliderElem.removeEventListener("mouseenter", this.showTooltip, !1), this.sliderElem.removeEventListener("mouseleave", this.hideTooltip, !1), 
                this.sliderElem.removeEventListener("touchstart", this.mousedown, !1), this.sliderElem.removeEventListener("mousedown", this.mousedown, !1);
            },
            _bindNonQueryEventHandler: function(evt, callback) {
                void 0 === this.eventToCallbackMap[evt] && (this.eventToCallbackMap[evt] = []), 
                this.eventToCallbackMap[evt].push(callback);
            },
            _cleanUpEventCallbacksMap: function() {
                for (var eventNames = Object.keys(this.eventToCallbackMap), i = 0; i < eventNames.length; i++) {
                    var eventName = eventNames[i];
                    this.eventToCallbackMap[eventName] = null;
                }
            },
            _showTooltip: function() {
                this.options.tooltip_split === !1 ? this._addClass(this.tooltip, "in") : (this._addClass(this.tooltip_min, "in"), 
                this._addClass(this.tooltip_max, "in")), this.over = !0;
            },
            _hideTooltip: function() {
                this.inDrag === !1 && this.alwaysShowTooltip !== !0 && (this._removeClass(this.tooltip, "in"), 
                this._removeClass(this.tooltip_min, "in"), this._removeClass(this.tooltip_max, "in")), 
                this.over = !1;
            },
            _layout: function() {
                var positionPercentages;
                if (positionPercentages = this.options.reversed ? [ 100 - this.percentage[0], this.percentage[1] ] : [ this.percentage[0], this.percentage[1] ], 
                this.handle1.style[this.stylePos] = positionPercentages[0] + "%", this.handle2.style[this.stylePos] = positionPercentages[1] + "%", 
                "vertical" === this.options.orientation) this.trackSelection.style.top = Math.min(positionPercentages[0], positionPercentages[1]) + "%", 
                this.trackSelection.style.height = Math.abs(positionPercentages[0] - positionPercentages[1]) + "%"; else {
                    this.trackSelection.style.left = Math.min(positionPercentages[0], positionPercentages[1]) + "%", 
                    this.trackSelection.style.width = Math.abs(positionPercentages[0] - positionPercentages[1]) + "%";
                    var offset_min = this.tooltip_min.getBoundingClientRect(), offset_max = this.tooltip_max.getBoundingClientRect();
                    offset_min.right > offset_max.left ? (this._removeClass(this.tooltip_max, "top"), 
                    this._addClass(this.tooltip_max, "bottom"), this.tooltip_max.style.top = "18px") : (this._removeClass(this.tooltip_max, "bottom"), 
                    this._addClass(this.tooltip_max, "top"), this.tooltip_max.style.top = "-30px");
                }
                var formattedTooltipVal;
                if (this.options.range) {
                    formattedTooltipVal = this.options.formatter(this.options.value), this._setText(this.tooltipInner, formattedTooltipVal), 
                    this.tooltip.style[this.stylePos] = (positionPercentages[1] + positionPercentages[0]) / 2 + "%", 
                    "vertical" === this.options.orientation ? this._css(this.tooltip, "margin-top", -this.tooltip.offsetHeight / 2 + "px") : this._css(this.tooltip, "margin-left", -this.tooltip.offsetWidth / 2 + "px"), 
                    "vertical" === this.options.orientation ? this._css(this.tooltip, "margin-top", -this.tooltip.offsetHeight / 2 + "px") : this._css(this.tooltip, "margin-left", -this.tooltip.offsetWidth / 2 + "px");
                    var innerTooltipMinText = this.options.formatter(this.options.value[0]);
                    this._setText(this.tooltipInner_min, innerTooltipMinText);
                    var innerTooltipMaxText = this.options.formatter(this.options.value[1]);
                    this._setText(this.tooltipInner_max, innerTooltipMaxText), this.tooltip_min.style[this.stylePos] = positionPercentages[0] + "%", 
                    "vertical" === this.options.orientation ? this._css(this.tooltip_min, "margin-top", -this.tooltip_min.offsetHeight / 2 + "px") : this._css(this.tooltip_min, "margin-left", -this.tooltip_min.offsetWidth / 2 + "px"), 
                    this.tooltip_max.style[this.stylePos] = positionPercentages[1] + "%", "vertical" === this.options.orientation ? this._css(this.tooltip_max, "margin-top", -this.tooltip_max.offsetHeight / 2 + "px") : this._css(this.tooltip_max, "margin-left", -this.tooltip_max.offsetWidth / 2 + "px");
                } else formattedTooltipVal = this.options.formatter(this.options.value[0]), this._setText(this.tooltipInner, formattedTooltipVal), 
                this.tooltip.style[this.stylePos] = positionPercentages[0] + "%", "vertical" === this.options.orientation ? this._css(this.tooltip, "margin-top", -this.tooltip.offsetHeight / 2 + "px") : this._css(this.tooltip, "margin-left", -this.tooltip.offsetWidth / 2 + "px");
            },
            _removeProperty: function(element, prop) {
                element.style.removeProperty ? element.style.removeProperty(prop) : element.style.removeAttribute(prop);
            },
            _mousedown: function(ev) {
                if (!this.options.enabled) return !1;
                this._triggerFocusOnHandle(), this.offset = this._offset(this.sliderElem), this.size = this.sliderElem[this.sizePos];
                var percentage = this._getPercentage(ev);
                if (this.options.range) {
                    var diff1 = Math.abs(this.percentage[0] - percentage), diff2 = Math.abs(this.percentage[1] - percentage);
                    this.dragged = diff2 > diff1 ? 0 : 1;
                } else this.dragged = 0;
                this.percentage[this.dragged] = this.options.reversed ? 100 - percentage : percentage, 
                this._layout(), this.mousemove = this._mousemove.bind(this), this.mouseup = this._mouseup.bind(this), 
                this.touchCapable ? (document.addEventListener("touchmove", this.mousemove, !1), 
                document.addEventListener("touchend", this.mouseup, !1)) : (document.addEventListener("mousemove", this.mousemove, !1), 
                document.addEventListener("mouseup", this.mouseup, !1)), this.inDrag = !0;
                var val = this._calculateValue();
                return this._trigger("slideStart", val), this._setDataVal(val), this.setValue(val), 
                this._pauseEvent(ev), !0;
            },
            _triggerFocusOnHandle: function(handleIdx) {
                0 === handleIdx && this.handle1.focus(), 1 === handleIdx && this.handle2.focus();
            },
            _keydown: function(handleIdx, ev) {
                if (!this.options.enabled) return !1;
                var dir;
                switch (ev.keyCode) {
                  case 37:
                  case 40:
                    dir = -1;
                    break;

                  case 39:
                  case 38:
                    dir = 1;
                }
                if (dir) {
                    if (this.options.natural_arrow_keys) {
                        var ifVerticalAndNotReversed = "vertical" === this.options.orientation && !this.options.reversed, ifHorizontalAndReversed = "horizontal" === this.options.orientation && this.options.reversed;
                        (ifVerticalAndNotReversed || ifHorizontalAndReversed) && (dir = -1 * dir);
                    }
                    var oneStepValuePercentageChange = dir * this.percentage[2], percentage = this.percentage[handleIdx] + oneStepValuePercentageChange;
                    percentage > 100 ? percentage = 100 : 0 > percentage && (percentage = 0), this.dragged = handleIdx, 
                    this._adjustPercentageForRangeSliders(percentage), this.percentage[this.dragged] = percentage, 
                    this._layout();
                    var val = this._calculateValue();
                    return this._trigger("slideStart", val), this._setDataVal(val), this.setValue(val, !0), 
                    this._trigger("slideStop", val), this._setDataVal(val), this._pauseEvent(ev), !1;
                }
            },
            _pauseEvent: function(ev) {
                ev.stopPropagation && ev.stopPropagation(), ev.preventDefault && ev.preventDefault(), 
                ev.cancelBubble = !0, ev.returnValue = !1;
            },
            _mousemove: function(ev) {
                if (!this.options.enabled) return !1;
                var percentage = this._getPercentage(ev);
                this._adjustPercentageForRangeSliders(percentage), this.percentage[this.dragged] = this.options.reversed ? 100 - percentage : percentage, 
                this._layout();
                var val = this._calculateValue();
                return this.setValue(val, !0), !1;
            },
            _adjustPercentageForRangeSliders: function(percentage) {
                this.options.range && (0 === this.dragged && this.percentage[1] < percentage ? (this.percentage[0] = this.percentage[1], 
                this.dragged = 1) : 1 === this.dragged && this.percentage[0] > percentage && (this.percentage[1] = this.percentage[0], 
                this.dragged = 0));
            },
            _mouseup: function() {
                if (!this.options.enabled) return !1;
                this.touchCapable ? (document.removeEventListener("touchmove", this.mousemove, !1), 
                document.removeEventListener("touchend", this.mouseup, !1)) : (document.removeEventListener("mousemove", this.mousemove, !1), 
                document.removeEventListener("mouseup", this.mouseup, !1)), this.inDrag = !1, this.over === !1 && this._hideTooltip();
                var val = this._calculateValue();
                return this._layout(), this._setDataVal(val), this._trigger("slideStop", val), !1;
            },
            _calculateValue: function() {
                var val;
                return this.options.range ? (val = [ this.options.min, this.options.max ], 0 !== this.percentage[0] && (val[0] = Math.max(this.options.min, this.options.min + Math.round(this.diff * this.percentage[0] / 100 / this.options.step) * this.options.step), 
                val[0] = this._applyPrecision(val[0])), 100 !== this.percentage[1] && (val[1] = Math.min(this.options.max, this.options.min + Math.round(this.diff * this.percentage[1] / 100 / this.options.step) * this.options.step), 
                val[1] = this._applyPrecision(val[1])), this.options.value = val) : (val = this.options.min + Math.round(this.diff * this.percentage[0] / 100 / this.options.step) * this.options.step, 
                val < this.options.min ? val = this.options.min : val > this.options.max && (val = this.options.max), 
                val = parseFloat(val), val = this._applyPrecision(val), this.options.value = [ val, this.options.value[1] ]), 
                val;
            },
            _applyPrecision: function(val) {
                var precision = this.options.precision || this._getNumDigitsAfterDecimalPlace(this.step);
                return this._applyToFixedAndParseFloat(val, precision);
            },
            _getNumDigitsAfterDecimalPlace: function(num) {
                var match = ("" + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
                return match ? Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)) : 0;
            },
            _applyToFixedAndParseFloat: function(num, toFixedInput) {
                var truncatedNum = num.toFixed(toFixedInput);
                return parseFloat(truncatedNum);
            },
            _getPercentage: function(ev) {
                !this.touchCapable || "touchstart" !== ev.type && "touchmove" !== ev.type || (ev = ev.touches[0]);
                var percentage = 100 * (ev[this.mousePos] - this.offset[this.stylePos]) / this.size;
                return percentage = Math.round(percentage / this.percentage[2]) * this.percentage[2], 
                Math.max(0, Math.min(100, percentage));
            },
            _validateInputValue: function(val) {
                if ("number" == typeof val) return val;
                if (val instanceof Array) return this._validateArray(val), val;
                throw new Error(ErrorMsgs.formatInvalidInputErrorMsg(val));
            },
            _validateArray: function(val) {
                for (var i = 0; i < val.length; i++) {
                    var input = val[i];
                    if ("number" != typeof input) throw new Error(ErrorMsgs.formatInvalidInputErrorMsg(input));
                }
            },
            _setDataVal: function(val) {
                var value = "value: '" + val + "'";
                this.element.setAttribute("data", value), this.element.setAttribute("value", val);
            },
            _trigger: function(evt, val) {
                val = val || void 0;
                var callbackFnArray = this.eventToCallbackMap[evt];
                if (callbackFnArray && callbackFnArray.length) for (var i = 0; i < callbackFnArray.length; i++) {
                    var callbackFn = callbackFnArray[i];
                    callbackFn(val);
                }
                $ && this._triggerJQueryEvent(evt, val);
            },
            _triggerJQueryEvent: function(evt, val) {
                var eventData = {
                    type: evt,
                    value: val
                };
                this.$element.trigger(eventData), this.$sliderElem.trigger(eventData);
            },
            _unbindJQueryEventHandlers: function() {
                this.$element.off(), this.$sliderElem.off();
            },
            _setText: function(element, text) {
                "undefined" != typeof element.innerText ? element.innerText = text : "undefined" != typeof element.textContent && (element.textContent = text);
            },
            _removeClass: function(element, classString) {
                for (var classes = classString.split(" "), newClasses = element.className, i = 0; i < classes.length; i++) {
                    var classTag = classes[i], regex = new RegExp("(?:\\s|^)" + classTag + "(?:\\s|$)");
                    newClasses = newClasses.replace(regex, " ");
                }
                element.className = newClasses.trim();
            },
            _addClass: function(element, classString) {
                for (var classes = classString.split(" "), newClasses = element.className, i = 0; i < classes.length; i++) {
                    var classTag = classes[i], regex = new RegExp("(?:\\s|^)" + classTag + "(?:\\s|$)"), ifClassExists = regex.test(newClasses);
                    ifClassExists || (newClasses += " " + classTag);
                }
                element.className = newClasses.trim();
            },
            _offset: function(obj) {
                var ol = 0, ot = 0;
                if (obj.offsetParent) do ol += obj.offsetLeft, ot += obj.offsetTop; while (obj = obj.offsetParent);
                return {
                    left: ol,
                    top: ot
                };
            },
            _css: function(elementRef, styleName, value) {
                elementRef.style[styleName] = value;
            }
        }, $) {
            var namespace = $.fn.slider ? "bootstrapSlider" : "slider";
            $.bridget(namespace, Slider);
        } else window.Slider = Slider;
    }($);
}(window.jQuery), "undefined" == typeof jQuery) throw new Error("Bootstrap's JavaScript requires jQuery");

+function($) {
    "use strict";
    function transitionEnd() {
        var el = document.createElement("bootstrap"), transEndEventNames = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd otransitionend",
            transition: "transitionend"
        };
        for (var name in transEndEventNames) if (void 0 !== el.style[name]) return {
            end: transEndEventNames[name]
        };
        return !1;
    }
    $.fn.emulateTransitionEnd = function(duration) {
        var called = !1, $el = this;
        $(this).one("bsTransitionEnd", function() {
            called = !0;
        });
        var callback = function() {
            called || $($el).trigger($.support.transition.end);
        };
        return setTimeout(callback, duration), this;
    }, $(function() {
        $.support.transition = transitionEnd(), $.support.transition && ($.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function(e) {
                return $(e.target).is(this) ? e.handleObj.handler.apply(this, arguments) : void 0;
            }
        });
    });
}(jQuery), +function($) {
    "use strict";
    function Plugin(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.alert");
            data || $this.data("bs.alert", data = new Alert(this)), "string" == typeof option && data[option].call($this);
        });
    }
    var dismiss = '[data-dismiss="alert"]', Alert = function(el) {
        $(el).on("click", dismiss, this.close);
    };
    Alert.VERSION = "3.2.0", Alert.prototype.close = function(e) {
        function removeElement() {
            $parent.detach().trigger("closed.bs.alert").remove();
        }
        var $this = $(this), selector = $this.attr("data-target");
        selector || (selector = $this.attr("href"), selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ""));
        var $parent = $(selector);
        e && e.preventDefault(), $parent.length || ($parent = $this.hasClass("alert") ? $this : $this.parent()), 
        $parent.trigger(e = $.Event("close.bs.alert")), e.isDefaultPrevented() || ($parent.removeClass("in"), 
        $.support.transition && $parent.hasClass("fade") ? $parent.one("bsTransitionEnd", removeElement).emulateTransitionEnd(150) : removeElement());
    };
    var old = $.fn.alert;
    $.fn.alert = Plugin, $.fn.alert.Constructor = Alert, $.fn.alert.noConflict = function() {
        return $.fn.alert = old, this;
    }, $(document).on("click.bs.alert.data-api", dismiss, Alert.prototype.close);
}(jQuery), +function($) {
    "use strict";
    function Plugin(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.button"), options = "object" == typeof option && option;
            data || $this.data("bs.button", data = new Button(this, options)), "toggle" == option ? data.toggle() : option && data.setState(option);
        });
    }
    var Button = function(element, options) {
        this.$element = $(element), this.options = $.extend({}, Button.DEFAULTS, options), 
        this.isLoading = !1;
    };
    Button.VERSION = "3.2.0", Button.DEFAULTS = {
        loadingText: "loading..."
    }, Button.prototype.setState = function(state) {
        var d = "disabled", $el = this.$element, val = $el.is("input") ? "val" : "html", data = $el.data();
        state += "Text", null == data.resetText && $el.data("resetText", $el[val]()), $el[val](null == data[state] ? this.options[state] : data[state]), 
        setTimeout($.proxy(function() {
            "loadingText" == state ? (this.isLoading = !0, $el.addClass(d).attr(d, d)) : this.isLoading && (this.isLoading = !1, 
            $el.removeClass(d).removeAttr(d));
        }, this), 0);
    }, Button.prototype.toggle = function() {
        var changed = !0, $parent = this.$element.closest('[data-toggle="buttons"]');
        if ($parent.length) {
            var $input = this.$element.find("input");
            "radio" == $input.prop("type") && ($input.prop("checked") && this.$element.hasClass("active") ? changed = !1 : $parent.find(".active").removeClass("active")), 
            changed && $input.prop("checked", !this.$element.hasClass("active")).trigger("change");
        }
        changed && this.$element.toggleClass("active");
    };
    var old = $.fn.button;
    $.fn.button = Plugin, $.fn.button.Constructor = Button, $.fn.button.noConflict = function() {
        return $.fn.button = old, this;
    }, $(document).on("click.bs.button.data-api", '[data-toggle^="button"]', function(e) {
        var $btn = $(e.target);
        $btn.hasClass("btn") || ($btn = $btn.closest(".btn")), Plugin.call($btn, "toggle"), 
        e.preventDefault();
    });
}(jQuery), +function($) {
    "use strict";
    function Plugin(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.carousel"), options = $.extend({}, Carousel.DEFAULTS, $this.data(), "object" == typeof option && option), action = "string" == typeof option ? option : options.slide;
            data || $this.data("bs.carousel", data = new Carousel(this, options)), "number" == typeof option ? data.to(option) : action ? data[action]() : options.interval && data.pause().cycle();
        });
    }
    var Carousel = function(element, options) {
        this.$element = $(element).on("keydown.bs.carousel", $.proxy(this.keydown, this)), 
        this.$indicators = this.$element.find(".carousel-indicators"), this.options = options, 
        this.paused = this.sliding = this.interval = this.$active = this.$items = null, 
        "hover" == this.options.pause && this.$element.on("mouseenter.bs.carousel", $.proxy(this.pause, this)).on("mouseleave.bs.carousel", $.proxy(this.cycle, this));
    };
    Carousel.VERSION = "3.2.0", Carousel.DEFAULTS = {
        interval: 5e3,
        pause: "hover",
        wrap: !0
    }, Carousel.prototype.keydown = function(e) {
        switch (e.which) {
          case 37:
            this.prev();
            break;

          case 39:
            this.next();
            break;

          default:
            return;
        }
        e.preventDefault();
    }, Carousel.prototype.cycle = function(e) {
        return e || (this.paused = !1), this.interval && clearInterval(this.interval), this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval)), 
        this;
    }, Carousel.prototype.getItemIndex = function(item) {
        return this.$items = item.parent().children(".item"), this.$items.index(item || this.$active);
    }, Carousel.prototype.to = function(pos) {
        var that = this, activeIndex = this.getItemIndex(this.$active = this.$element.find(".item.active"));
        return pos > this.$items.length - 1 || 0 > pos ? void 0 : this.sliding ? this.$element.one("slid.bs.carousel", function() {
            that.to(pos);
        }) : activeIndex == pos ? this.pause().cycle() : this.slide(pos > activeIndex ? "next" : "prev", $(this.$items[pos]));
    }, Carousel.prototype.pause = function(e) {
        return e || (this.paused = !0), this.$element.find(".next, .prev").length && $.support.transition && (this.$element.trigger($.support.transition.end), 
        this.cycle(!0)), this.interval = clearInterval(this.interval), this;
    }, Carousel.prototype.next = function() {
        return this.sliding ? void 0 : this.slide("next");
    }, Carousel.prototype.prev = function() {
        return this.sliding ? void 0 : this.slide("prev");
    }, Carousel.prototype.slide = function(type, next) {
        var $active = this.$element.find(".item.active"), $next = next || $active[type](), isCycling = this.interval, direction = "next" == type ? "left" : "right", fallback = "next" == type ? "first" : "last", that = this;
        if (!$next.length) {
            if (!this.options.wrap) return;
            $next = this.$element.find(".item")[fallback]();
        }
        if ($next.hasClass("active")) return this.sliding = !1;
        var relatedTarget = $next[0], slideEvent = $.Event("slide.bs.carousel", {
            relatedTarget: relatedTarget,
            direction: direction
        });
        if (this.$element.trigger(slideEvent), !slideEvent.isDefaultPrevented()) {
            if (this.sliding = !0, isCycling && this.pause(), this.$indicators.length) {
                this.$indicators.find(".active").removeClass("active");
                var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)]);
                $nextIndicator && $nextIndicator.addClass("active");
            }
            var slidEvent = $.Event("slid.bs.carousel", {
                relatedTarget: relatedTarget,
                direction: direction
            });
            return $.support.transition && this.$element.hasClass("slide") ? ($next.addClass(type), 
            $next[0].offsetWidth, $active.addClass(direction), $next.addClass(direction), $active.one("bsTransitionEnd", function() {
                $next.removeClass([ type, direction ].join(" ")).addClass("active"), $active.removeClass([ "active", direction ].join(" ")), 
                that.sliding = !1, setTimeout(function() {
                    that.$element.trigger(slidEvent);
                }, 0);
            }).emulateTransitionEnd(1e3 * $active.css("transition-duration").slice(0, -1))) : ($active.removeClass("active"), 
            $next.addClass("active"), this.sliding = !1, this.$element.trigger(slidEvent)), 
            isCycling && this.cycle(), this;
        }
    };
    var old = $.fn.carousel;
    $.fn.carousel = Plugin, $.fn.carousel.Constructor = Carousel, $.fn.carousel.noConflict = function() {
        return $.fn.carousel = old, this;
    }, $(document).on("click.bs.carousel.data-api", "[data-slide], [data-slide-to]", function(e) {
        var href, $this = $(this), $target = $($this.attr("data-target") || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, ""));
        if ($target.hasClass("carousel")) {
            var options = $.extend({}, $target.data(), $this.data()), slideIndex = $this.attr("data-slide-to");
            slideIndex && (options.interval = !1), Plugin.call($target, options), slideIndex && $target.data("bs.carousel").to(slideIndex), 
            e.preventDefault();
        }
    }), $(window).on("load", function() {
        $('[data-ride="carousel"]').each(function() {
            var $carousel = $(this);
            Plugin.call($carousel, $carousel.data());
        });
    });
}(jQuery), +function($) {
    "use strict";
    function Plugin(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.collapse"), options = $.extend({}, Collapse.DEFAULTS, $this.data(), "object" == typeof option && option);
            !data && options.toggle && "show" == option && (option = !option), data || $this.data("bs.collapse", data = new Collapse(this, options)), 
            "string" == typeof option && data[option]();
        });
    }
    var Collapse = function(element, options) {
        this.$element = $(element), this.options = $.extend({}, Collapse.DEFAULTS, options), 
        this.transitioning = null, this.options.parent && (this.$parent = $(this.options.parent)), 
        this.options.toggle && this.toggle();
    };
    Collapse.VERSION = "3.2.0", Collapse.DEFAULTS = {
        toggle: !0
    }, Collapse.prototype.dimension = function() {
        var hasWidth = this.$element.hasClass("width");
        return hasWidth ? "width" : "height";
    }, Collapse.prototype.show = function() {
        if (!this.transitioning && !this.$element.hasClass("in")) {
            var startEvent = $.Event("show.bs.collapse");
            if (this.$element.trigger(startEvent), !startEvent.isDefaultPrevented()) {
                var actives = this.$parent && this.$parent.find("> .panel > .in");
                if (actives && actives.length) {
                    var hasData = actives.data("bs.collapse");
                    if (hasData && hasData.transitioning) return;
                    Plugin.call(actives, "hide"), hasData || actives.data("bs.collapse", null);
                }
                var dimension = this.dimension();
                this.$element.removeClass("collapse").addClass("collapsing")[dimension](0), this.transitioning = 1;
                var complete = function() {
                    this.$element.removeClass("collapsing").addClass("collapse in")[dimension](""), 
                    this.transitioning = 0, this.$element.trigger("shown.bs.collapse");
                };
                if (!$.support.transition) return complete.call(this);
                var scrollSize = $.camelCase([ "scroll", dimension ].join("-"));
                this.$element.one("bsTransitionEnd", $.proxy(complete, this)).emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize]);
            }
        }
    }, Collapse.prototype.hide = function() {
        if (!this.transitioning && this.$element.hasClass("in")) {
            var startEvent = $.Event("hide.bs.collapse");
            if (this.$element.trigger(startEvent), !startEvent.isDefaultPrevented()) {
                var dimension = this.dimension();
                this.$element[dimension](this.$element[dimension]())[0].offsetHeight, this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"), 
                this.transitioning = 1;
                var complete = function() {
                    this.transitioning = 0, this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse");
                };
                return $.support.transition ? void this.$element[dimension](0).one("bsTransitionEnd", $.proxy(complete, this)).emulateTransitionEnd(350) : complete.call(this);
            }
        }
    }, Collapse.prototype.toggle = function() {
        this[this.$element.hasClass("in") ? "hide" : "show"]();
    };
    var old = $.fn.collapse;
    $.fn.collapse = Plugin, $.fn.collapse.Constructor = Collapse, $.fn.collapse.noConflict = function() {
        return $.fn.collapse = old, this;
    }, $(document).on("click.bs.collapse.data-api", '[data-toggle="collapse"]', function(e) {
        var href, $this = $(this), target = $this.attr("data-target") || e.preventDefault() || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, ""), $target = $(target), data = $target.data("bs.collapse"), option = data ? "toggle" : $this.data(), parent = $this.attr("data-parent"), $parent = parent && $(parent);
        data && data.transitioning || ($parent && $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass("collapsed"), 
        $this[$target.hasClass("in") ? "addClass" : "removeClass"]("collapsed")), Plugin.call($target, option);
    });
}(jQuery), +function($) {
    "use strict";
    function clearMenus(e) {
        e && 3 === e.which || ($(backdrop).remove(), $(toggle).each(function() {
            var $parent = getParent($(this)), relatedTarget = {
                relatedTarget: this
            };
            $parent.hasClass("open") && ($parent.trigger(e = $.Event("hide.bs.dropdown", relatedTarget)), 
            e.isDefaultPrevented() || $parent.removeClass("open").trigger("hidden.bs.dropdown", relatedTarget));
        }));
    }
    function getParent($this) {
        var selector = $this.attr("data-target");
        selector || (selector = $this.attr("href"), selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ""));
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }
    function Plugin(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.dropdown");
            data || $this.data("bs.dropdown", data = new Dropdown(this)), "string" == typeof option && data[option].call($this);
        });
    }
    var backdrop = ".dropdown-backdrop", toggle = '[data-toggle="dropdown"]', Dropdown = function(element) {
        $(element).on("click.bs.dropdown", this.toggle);
    };
    Dropdown.VERSION = "3.2.0", Dropdown.prototype.toggle = function(e) {
        var $this = $(this);
        if (!$this.is(".disabled, :disabled")) {
            var $parent = getParent($this), isActive = $parent.hasClass("open");
            if (clearMenus(), !isActive) {
                "ontouchstart" in document.documentElement && !$parent.closest(".navbar-nav").length && $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on("click", clearMenus);
                var relatedTarget = {
                    relatedTarget: this
                };
                if ($parent.trigger(e = $.Event("show.bs.dropdown", relatedTarget)), e.isDefaultPrevented()) return;
                $this.trigger("focus"), $parent.toggleClass("open").trigger("shown.bs.dropdown", relatedTarget);
            }
            return !1;
        }
    }, Dropdown.prototype.keydown = function(e) {
        if (/(38|40|27)/.test(e.keyCode)) {
            var $this = $(this);
            if (e.preventDefault(), e.stopPropagation(), !$this.is(".disabled, :disabled")) {
                var $parent = getParent($this), isActive = $parent.hasClass("open");
                if (!isActive || isActive && 27 == e.keyCode) return 27 == e.which && $parent.find(toggle).trigger("focus"), 
                $this.trigger("click");
                var desc = " li:not(.divider):visible a", $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc);
                if ($items.length) {
                    var index = $items.index($items.filter(":focus"));
                    38 == e.keyCode && index > 0 && index--, 40 == e.keyCode && index < $items.length - 1 && index++, 
                    ~index || (index = 0), $items.eq(index).trigger("focus");
                }
            }
        }
    };
    var old = $.fn.dropdown;
    $.fn.dropdown = Plugin, $.fn.dropdown.Constructor = Dropdown, $.fn.dropdown.noConflict = function() {
        return $.fn.dropdown = old, this;
    }, $(document).on("click.bs.dropdown.data-api", clearMenus).on("click.bs.dropdown.data-api", ".dropdown form", function(e) {
        e.stopPropagation();
    }).on("click.bs.dropdown.data-api", toggle, Dropdown.prototype.toggle).on("keydown.bs.dropdown.data-api", toggle + ', [role="menu"], [role="listbox"]', Dropdown.prototype.keydown);
}(jQuery), +function($) {
    "use strict";
    function Plugin(option, _relatedTarget) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.modal"), options = $.extend({}, Modal.DEFAULTS, $this.data(), "object" == typeof option && option);
            data || $this.data("bs.modal", data = new Modal(this, options)), "string" == typeof option ? data[option](_relatedTarget) : options.show && data.show(_relatedTarget);
        });
    }
    var Modal = function(element, options) {
        this.options = options, this.$body = $(document.body), this.$element = $(element), 
        this.$backdrop = this.isShown = null, this.scrollbarWidth = 0, this.options.remote && this.$element.find(".modal-content").load(this.options.remote, $.proxy(function() {
            this.$element.trigger("loaded.bs.modal");
        }, this));
    };
    Modal.VERSION = "3.2.0", Modal.DEFAULTS = {
        backdrop: !0,
        keyboard: !0,
        show: !0
    }, Modal.prototype.toggle = function(_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget);
    }, Modal.prototype.show = function(_relatedTarget) {
        var that = this, e = $.Event("show.bs.modal", {
            relatedTarget: _relatedTarget
        });
        this.$element.trigger(e), this.isShown || e.isDefaultPrevented() || (this.isShown = !0, 
        this.checkScrollbar(), this.$body.addClass("modal-open"), this.setScrollbar(), this.escape(), 
        this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', $.proxy(this.hide, this)), 
        this.backdrop(function() {
            var transition = $.support.transition && that.$element.hasClass("fade");
            that.$element.parent().length || that.$element.appendTo(that.$body), that.$element.show().scrollTop(0), 
            transition && that.$element[0].offsetWidth, that.$element.addClass("in").attr("aria-hidden", !1), 
            that.enforceFocus();
            var e = $.Event("shown.bs.modal", {
                relatedTarget: _relatedTarget
            });
            transition ? that.$element.find(".modal-dialog").one("bsTransitionEnd", function() {
                that.$element.trigger("focus").trigger(e);
            }).emulateTransitionEnd(300) : that.$element.trigger("focus").trigger(e);
        }));
    }, Modal.prototype.hide = function(e) {
        e && e.preventDefault(), e = $.Event("hide.bs.modal"), this.$element.trigger(e), 
        this.isShown && !e.isDefaultPrevented() && (this.isShown = !1, this.$body.removeClass("modal-open"), 
        this.resetScrollbar(), this.escape(), $(document).off("focusin.bs.modal"), this.$element.removeClass("in").attr("aria-hidden", !0).off("click.dismiss.bs.modal"), 
        $.support.transition && this.$element.hasClass("fade") ? this.$element.one("bsTransitionEnd", $.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal());
    }, Modal.prototype.enforceFocus = function() {
        $(document).off("focusin.bs.modal").on("focusin.bs.modal", $.proxy(function(e) {
            this.$element[0] === e.target || this.$element.has(e.target).length || this.$element.trigger("focus");
        }, this));
    }, Modal.prototype.escape = function() {
        this.isShown && this.options.keyboard ? this.$element.on("keyup.dismiss.bs.modal", $.proxy(function(e) {
            27 == e.which && this.hide();
        }, this)) : this.isShown || this.$element.off("keyup.dismiss.bs.modal");
    }, Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide(), this.backdrop(function() {
            that.$element.trigger("hidden.bs.modal");
        });
    }, Modal.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove(), this.$backdrop = null;
    }, Modal.prototype.backdrop = function(callback) {
        var that = this, animate = this.$element.hasClass("fade") ? "fade" : "";
        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;
            if (this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(this.$body), 
            this.$element.on("click.dismiss.bs.modal", $.proxy(function(e) {
                e.target === e.currentTarget && ("static" == this.options.backdrop ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this));
            }, this)), doAnimate && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"), 
            !callback) return;
            doAnimate ? this.$backdrop.one("bsTransitionEnd", callback).emulateTransitionEnd(150) : callback();
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass("in");
            var callbackRemove = function() {
                that.removeBackdrop(), callback && callback();
            };
            $.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one("bsTransitionEnd", callbackRemove).emulateTransitionEnd(150) : callbackRemove();
        } else callback && callback();
    }, Modal.prototype.checkScrollbar = function() {
        document.body.clientWidth >= window.innerWidth || (this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar());
    }, Modal.prototype.setScrollbar = function() {
        var bodyPad = parseInt(this.$body.css("padding-right") || 0, 10);
        this.scrollbarWidth && this.$body.css("padding-right", bodyPad + this.scrollbarWidth);
    }, Modal.prototype.resetScrollbar = function() {
        this.$body.css("padding-right", "");
    }, Modal.prototype.measureScrollbar = function() {
        var scrollDiv = document.createElement("div");
        scrollDiv.className = "modal-scrollbar-measure", this.$body.append(scrollDiv);
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        return this.$body[0].removeChild(scrollDiv), scrollbarWidth;
    };
    var old = $.fn.modal;
    $.fn.modal = Plugin, $.fn.modal.Constructor = Modal, $.fn.modal.noConflict = function() {
        return $.fn.modal = old, this;
    }, $(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(e) {
        var $this = $(this), href = $this.attr("href"), $target = $($this.attr("data-target") || href && href.replace(/.*(?=#[^\s]+$)/, "")), option = $target.data("bs.modal") ? "toggle" : $.extend({
            remote: !/#/.test(href) && href
        }, $target.data(), $this.data());
        $this.is("a") && e.preventDefault(), $target.one("show.bs.modal", function(showEvent) {
            showEvent.isDefaultPrevented() || $target.one("hidden.bs.modal", function() {
                $this.is(":visible") && $this.trigger("focus");
            });
        }), Plugin.call($target, option, this);
    });
}(jQuery), +function($) {
    "use strict";
    function Plugin(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.tooltip"), options = "object" == typeof option && option;
            (data || "destroy" != option) && (data || $this.data("bs.tooltip", data = new Tooltip(this, options)), 
            "string" == typeof option && data[option]());
        });
    }
    var Tooltip = function(element, options) {
        this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null, 
        this.init("tooltip", element, options);
    };
    Tooltip.VERSION = "3.2.0", Tooltip.DEFAULTS = {
        animation: !0,
        placement: "top",
        selector: !1,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover focus",
        title: "",
        delay: 0,
        html: !1,
        container: !1,
        viewport: {
            selector: "body",
            padding: 0
        }
    }, Tooltip.prototype.init = function(type, element, options) {
        this.enabled = !0, this.type = type, this.$element = $(element), this.options = this.getOptions(options), 
        this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport);
        for (var triggers = this.options.trigger.split(" "), i = triggers.length; i--; ) {
            var trigger = triggers[i];
            if ("click" == trigger) this.$element.on("click." + this.type, this.options.selector, $.proxy(this.toggle, this)); else if ("manual" != trigger) {
                var eventIn = "hover" == trigger ? "mouseenter" : "focusin", eventOut = "hover" == trigger ? "mouseleave" : "focusout";
                this.$element.on(eventIn + "." + this.type, this.options.selector, $.proxy(this.enter, this)), 
                this.$element.on(eventOut + "." + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }
        this.options.selector ? this._options = $.extend({}, this.options, {
            trigger: "manual",
            selector: ""
        }) : this.fixTitle();
    }, Tooltip.prototype.getDefaults = function() {
        return Tooltip.DEFAULTS;
    }, Tooltip.prototype.getOptions = function(options) {
        return options = $.extend({}, this.getDefaults(), this.$element.data(), options), 
        options.delay && "number" == typeof options.delay && (options.delay = {
            show: options.delay,
            hide: options.delay
        }), options;
    }, Tooltip.prototype.getDelegateOptions = function() {
        var options = {}, defaults = this.getDefaults();
        return this._options && $.each(this._options, function(key, value) {
            defaults[key] != value && (options[key] = value);
        }), options;
    }, Tooltip.prototype.enter = function(obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data("bs." + this.type);
        return self || (self = new this.constructor(obj.currentTarget, this.getDelegateOptions()), 
        $(obj.currentTarget).data("bs." + this.type, self)), clearTimeout(self.timeout), 
        self.hoverState = "in", self.options.delay && self.options.delay.show ? void (self.timeout = setTimeout(function() {
            "in" == self.hoverState && self.show();
        }, self.options.delay.show)) : self.show();
    }, Tooltip.prototype.leave = function(obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data("bs." + this.type);
        return self || (self = new this.constructor(obj.currentTarget, this.getDelegateOptions()), 
        $(obj.currentTarget).data("bs." + this.type, self)), clearTimeout(self.timeout), 
        self.hoverState = "out", self.options.delay && self.options.delay.hide ? void (self.timeout = setTimeout(function() {
            "out" == self.hoverState && self.hide();
        }, self.options.delay.hide)) : self.hide();
    }, Tooltip.prototype.show = function() {
        var e = $.Event("show.bs." + this.type);
        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);
            var inDom = $.contains(document.documentElement, this.$element[0]);
            if (e.isDefaultPrevented() || !inDom) return;
            var that = this, $tip = this.tip(), tipId = this.getUID(this.type);
            this.setContent(), $tip.attr("id", tipId), this.$element.attr("aria-describedby", tipId), 
            this.options.animation && $tip.addClass("fade");
            var placement = "function" == typeof this.options.placement ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement, autoToken = /\s?auto?\s?/i, autoPlace = autoToken.test(placement);
            autoPlace && (placement = placement.replace(autoToken, "") || "top"), $tip.detach().css({
                top: 0,
                left: 0,
                display: "block"
            }).addClass(placement).data("bs." + this.type, this), this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
            var pos = this.getPosition(), actualWidth = $tip[0].offsetWidth, actualHeight = $tip[0].offsetHeight;
            if (autoPlace) {
                var orgPlacement = placement, $parent = this.$element.parent(), parentDim = this.getPosition($parent);
                placement = "bottom" == placement && pos.top + pos.height + actualHeight - parentDim.scroll > parentDim.height ? "top" : "top" == placement && pos.top - parentDim.scroll - actualHeight < 0 ? "bottom" : "right" == placement && pos.right + actualWidth > parentDim.width ? "left" : "left" == placement && pos.left - actualWidth < parentDim.left ? "right" : placement, 
                $tip.removeClass(orgPlacement).addClass(placement);
            }
            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
            this.applyPlacement(calculatedOffset, placement);
            var complete = function() {
                that.$element.trigger("shown.bs." + that.type), that.hoverState = null;
            };
            $.support.transition && this.$tip.hasClass("fade") ? $tip.one("bsTransitionEnd", complete).emulateTransitionEnd(150) : complete();
        }
    }, Tooltip.prototype.applyPlacement = function(offset, placement) {
        var $tip = this.tip(), width = $tip[0].offsetWidth, height = $tip[0].offsetHeight, marginTop = parseInt($tip.css("margin-top"), 10), marginLeft = parseInt($tip.css("margin-left"), 10);
        isNaN(marginTop) && (marginTop = 0), isNaN(marginLeft) && (marginLeft = 0), offset.top = offset.top + marginTop, 
        offset.left = offset.left + marginLeft, $.offset.setOffset($tip[0], $.extend({
            using: function(props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0), $tip.addClass("in");
        var actualWidth = $tip[0].offsetWidth, actualHeight = $tip[0].offsetHeight;
        "top" == placement && actualHeight != height && (offset.top = offset.top + height - actualHeight);
        var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);
        delta.left ? offset.left += delta.left : offset.top += delta.top;
        var arrowDelta = delta.left ? 2 * delta.left - width + actualWidth : 2 * delta.top - height + actualHeight, arrowPosition = delta.left ? "left" : "top", arrowOffsetPosition = delta.left ? "offsetWidth" : "offsetHeight";
        $tip.offset(offset), this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], arrowPosition);
    }, Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
        this.arrow().css(position, delta ? 50 * (1 - delta / dimension) + "%" : "");
    }, Tooltip.prototype.setContent = function() {
        var $tip = this.tip(), title = this.getTitle();
        $tip.find(".tooltip-inner")[this.options.html ? "html" : "text"](title), $tip.removeClass("fade in top bottom left right");
    }, Tooltip.prototype.hide = function() {
        function complete() {
            "in" != that.hoverState && $tip.detach(), that.$element.trigger("hidden.bs." + that.type);
        }
        var that = this, $tip = this.tip(), e = $.Event("hide.bs." + this.type);
        return this.$element.removeAttr("aria-describedby"), this.$element.trigger(e), e.isDefaultPrevented() ? void 0 : ($tip.removeClass("in"), 
        $.support.transition && this.$tip.hasClass("fade") ? $tip.one("bsTransitionEnd", complete).emulateTransitionEnd(150) : complete(), 
        this.hoverState = null, this);
    }, Tooltip.prototype.fixTitle = function() {
        var $e = this.$element;
        ($e.attr("title") || "string" != typeof $e.attr("data-original-title")) && $e.attr("data-original-title", $e.attr("title") || "").attr("title", "");
    }, Tooltip.prototype.hasContent = function() {
        return this.getTitle();
    }, Tooltip.prototype.getPosition = function($element) {
        $element = $element || this.$element;
        var el = $element[0], isBody = "BODY" == el.tagName;
        return $.extend({}, "function" == typeof el.getBoundingClientRect ? el.getBoundingClientRect() : null, {
            scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
            width: isBody ? $(window).width() : $element.outerWidth(),
            height: isBody ? $(window).height() : $element.outerHeight()
        }, isBody ? {
            top: 0,
            left: 0
        } : $element.offset());
    }, Tooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
        return "bottom" == placement ? {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : "top" == placement ? {
            top: pos.top - actualHeight,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : "left" == placement ? {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left - actualWidth
        } : {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left + pos.width
        };
    }, Tooltip.prototype.getViewportAdjustedDelta = function(placement, pos, actualWidth, actualHeight) {
        var delta = {
            top: 0,
            left: 0
        };
        if (!this.$viewport) return delta;
        var viewportPadding = this.options.viewport && this.options.viewport.padding || 0, viewportDimensions = this.getPosition(this.$viewport);
        if (/right|left/.test(placement)) {
            var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll, bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
            topEdgeOffset < viewportDimensions.top ? delta.top = viewportDimensions.top - topEdgeOffset : bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height && (delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset);
        } else {
            var leftEdgeOffset = pos.left - viewportPadding, rightEdgeOffset = pos.left + viewportPadding + actualWidth;
            leftEdgeOffset < viewportDimensions.left ? delta.left = viewportDimensions.left - leftEdgeOffset : rightEdgeOffset > viewportDimensions.width && (delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset);
        }
        return delta;
    }, Tooltip.prototype.getTitle = function() {
        var title, $e = this.$element, o = this.options;
        return title = $e.attr("data-original-title") || ("function" == typeof o.title ? o.title.call($e[0]) : o.title);
    }, Tooltip.prototype.getUID = function(prefix) {
        do prefix += ~~(1e6 * Math.random()); while (document.getElementById(prefix));
        return prefix;
    }, Tooltip.prototype.tip = function() {
        return this.$tip = this.$tip || $(this.options.template);
    }, Tooltip.prototype.arrow = function() {
        return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow");
    }, Tooltip.prototype.validate = function() {
        this.$element[0].parentNode || (this.hide(), this.$element = null, this.options = null);
    }, Tooltip.prototype.enable = function() {
        this.enabled = !0;
    }, Tooltip.prototype.disable = function() {
        this.enabled = !1;
    }, Tooltip.prototype.toggleEnabled = function() {
        this.enabled = !this.enabled;
    }, Tooltip.prototype.toggle = function(e) {
        var self = this;
        e && (self = $(e.currentTarget).data("bs." + this.type), self || (self = new this.constructor(e.currentTarget, this.getDelegateOptions()), 
        $(e.currentTarget).data("bs." + this.type, self))), self.tip().hasClass("in") ? self.leave(self) : self.enter(self);
    }, Tooltip.prototype.destroy = function() {
        clearTimeout(this.timeout), this.hide().$element.off("." + this.type).removeData("bs." + this.type);
    };
    var old = $.fn.tooltip;
    $.fn.tooltip = Plugin, $.fn.tooltip.Constructor = Tooltip, $.fn.tooltip.noConflict = function() {
        return $.fn.tooltip = old, this;
    };
}(jQuery), +function($) {
    "use strict";
    function Plugin(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.popover"), options = "object" == typeof option && option;
            (data || "destroy" != option) && (data || $this.data("bs.popover", data = new Popover(this, options)), 
            "string" == typeof option && data[option]());
        });
    }
    var Popover = function(element, options) {
        this.init("popover", element, options);
    };
    if (!$.fn.tooltip) throw new Error("Popover requires tooltip.js");
    Popover.VERSION = "3.2.0", Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: "right",
        trigger: "click",
        content: "",
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    }), Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype), Popover.prototype.constructor = Popover, 
    Popover.prototype.getDefaults = function() {
        return Popover.DEFAULTS;
    }, Popover.prototype.setContent = function() {
        var $tip = this.tip(), title = this.getTitle(), content = this.getContent();
        $tip.find(".popover-title")[this.options.html ? "html" : "text"](title), $tip.find(".popover-content").empty()[this.options.html ? "string" == typeof content ? "html" : "append" : "text"](content), 
        $tip.removeClass("fade top bottom left right in"), $tip.find(".popover-title").html() || $tip.find(".popover-title").hide();
    }, Popover.prototype.hasContent = function() {
        return this.getTitle() || this.getContent();
    }, Popover.prototype.getContent = function() {
        var $e = this.$element, o = this.options;
        return $e.attr("data-content") || ("function" == typeof o.content ? o.content.call($e[0]) : o.content);
    }, Popover.prototype.arrow = function() {
        return this.$arrow = this.$arrow || this.tip().find(".arrow");
    }, Popover.prototype.tip = function() {
        return this.$tip || (this.$tip = $(this.options.template)), this.$tip;
    };
    var old = $.fn.popover;
    $.fn.popover = Plugin, $.fn.popover.Constructor = Popover, $.fn.popover.noConflict = function() {
        return $.fn.popover = old, this;
    };
}(jQuery), +function($) {
    "use strict";
    function ScrollSpy(element, options) {
        var process = $.proxy(this.process, this);
        this.$body = $("body"), this.$scrollElement = $($(element).is("body") ? window : element), 
        this.options = $.extend({}, ScrollSpy.DEFAULTS, options), this.selector = (this.options.target || "") + " .nav li > a", 
        this.offsets = [], this.targets = [], this.activeTarget = null, this.scrollHeight = 0, 
        this.$scrollElement.on("scroll.bs.scrollspy", process), this.refresh(), this.process();
    }
    function Plugin(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.scrollspy"), options = "object" == typeof option && option;
            data || $this.data("bs.scrollspy", data = new ScrollSpy(this, options)), "string" == typeof option && data[option]();
        });
    }
    ScrollSpy.VERSION = "3.2.0", ScrollSpy.DEFAULTS = {
        offset: 10
    }, ScrollSpy.prototype.getScrollHeight = function() {
        return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight);
    }, ScrollSpy.prototype.refresh = function() {
        var offsetMethod = "offset", offsetBase = 0;
        $.isWindow(this.$scrollElement[0]) || (offsetMethod = "position", offsetBase = this.$scrollElement.scrollTop()), 
        this.offsets = [], this.targets = [], this.scrollHeight = this.getScrollHeight();
        var self = this;
        this.$body.find(this.selector).map(function() {
            var $el = $(this), href = $el.data("target") || $el.attr("href"), $href = /^#./.test(href) && $(href);
            return $href && $href.length && $href.is(":visible") && [ [ $href[offsetMethod]().top + offsetBase, href ] ] || null;
        }).sort(function(a, b) {
            return a[0] - b[0];
        }).each(function() {
            self.offsets.push(this[0]), self.targets.push(this[1]);
        });
    }, ScrollSpy.prototype.process = function() {
        var i, scrollTop = this.$scrollElement.scrollTop() + this.options.offset, scrollHeight = this.getScrollHeight(), maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height(), offsets = this.offsets, targets = this.targets, activeTarget = this.activeTarget;
        if (this.scrollHeight != scrollHeight && this.refresh(), scrollTop >= maxScroll) return activeTarget != (i = targets[targets.length - 1]) && this.activate(i);
        if (activeTarget && scrollTop <= offsets[0]) return activeTarget != (i = targets[0]) && this.activate(i);
        for (i = offsets.length; i--; ) activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]) && this.activate(targets[i]);
    }, ScrollSpy.prototype.activate = function(target) {
        this.activeTarget = target, $(this.selector).parentsUntil(this.options.target, ".active").removeClass("active");
        var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]', active = $(selector).parents("li").addClass("active");
        active.parent(".dropdown-menu").length && (active = active.closest("li.dropdown").addClass("active")), 
        active.trigger("activate.bs.scrollspy");
    };
    var old = $.fn.scrollspy;
    $.fn.scrollspy = Plugin, $.fn.scrollspy.Constructor = ScrollSpy, $.fn.scrollspy.noConflict = function() {
        return $.fn.scrollspy = old, this;
    }, $(window).on("load.bs.scrollspy.data-api", function() {
        $('[data-spy="scroll"]').each(function() {
            var $spy = $(this);
            Plugin.call($spy, $spy.data());
        });
    });
}(jQuery), +function($) {
    "use strict";
    function Plugin(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.tab");
            data || $this.data("bs.tab", data = new Tab(this)), "string" == typeof option && data[option]();
        });
    }
    var Tab = function(element) {
        this.element = $(element);
    };
    Tab.VERSION = "3.2.0", Tab.prototype.show = function() {
        var $this = this.element, $ul = $this.closest("ul:not(.dropdown-menu)"), selector = $this.data("target");
        if (selector || (selector = $this.attr("href"), selector = selector && selector.replace(/.*(?=#[^\s]*$)/, "")), 
        !$this.parent("li").hasClass("active")) {
            var previous = $ul.find(".active:last a")[0], e = $.Event("show.bs.tab", {
                relatedTarget: previous
            });
            if ($this.trigger(e), !e.isDefaultPrevented()) {
                var $target = $(selector);
                this.activate($this.closest("li"), $ul), this.activate($target, $target.parent(), function() {
                    $this.trigger({
                        type: "shown.bs.tab",
                        relatedTarget: previous
                    });
                });
            }
        }
    }, Tab.prototype.activate = function(element, container, callback) {
        function next() {
            $active.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"), 
            element.addClass("active"), transition ? (element[0].offsetWidth, element.addClass("in")) : element.removeClass("fade"), 
            element.parent(".dropdown-menu") && element.closest("li.dropdown").addClass("active"), 
            callback && callback();
        }
        var $active = container.find("> .active"), transition = callback && $.support.transition && $active.hasClass("fade");
        transition ? $active.one("bsTransitionEnd", next).emulateTransitionEnd(150) : next(), 
        $active.removeClass("in");
    };
    var old = $.fn.tab;
    $.fn.tab = Plugin, $.fn.tab.Constructor = Tab, $.fn.tab.noConflict = function() {
        return $.fn.tab = old, this;
    }, $(document).on("click.bs.tab.data-api", '[data-toggle="tab"], [data-toggle="pill"]', function(e) {
        e.preventDefault(), Plugin.call($(this), "show");
    });
}(jQuery), +function($) {
    "use strict";
    function Plugin(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.affix"), options = "object" == typeof option && option;
            data || $this.data("bs.affix", data = new Affix(this, options)), "string" == typeof option && data[option]();
        });
    }
    var Affix = function(element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options), this.$target = $(this.options.target).on("scroll.bs.affix.data-api", $.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", $.proxy(this.checkPositionWithEventLoop, this)), 
        this.$element = $(element), this.affixed = this.unpin = this.pinnedOffset = null, 
        this.checkPosition();
    };
    Affix.VERSION = "3.2.0", Affix.RESET = "affix affix-top affix-bottom", Affix.DEFAULTS = {
        offset: 0,
        target: window
    }, Affix.prototype.getPinnedOffset = function() {
        if (this.pinnedOffset) return this.pinnedOffset;
        this.$element.removeClass(Affix.RESET).addClass("affix");
        var scrollTop = this.$target.scrollTop(), position = this.$element.offset();
        return this.pinnedOffset = position.top - scrollTop;
    }, Affix.prototype.checkPositionWithEventLoop = function() {
        setTimeout($.proxy(this.checkPosition, this), 1);
    }, Affix.prototype.checkPosition = function() {
        if (this.$element.is(":visible")) {
            var scrollHeight = $(document).height(), scrollTop = this.$target.scrollTop(), position = this.$element.offset(), offset = this.options.offset, offsetTop = offset.top, offsetBottom = offset.bottom;
            "object" != typeof offset && (offsetBottom = offsetTop = offset), "function" == typeof offsetTop && (offsetTop = offset.top(this.$element)), 
            "function" == typeof offsetBottom && (offsetBottom = offset.bottom(this.$element));
            var affix = null != this.unpin && scrollTop + this.unpin <= position.top ? !1 : null != offsetBottom && position.top + this.$element.height() >= scrollHeight - offsetBottom ? "bottom" : null != offsetTop && offsetTop >= scrollTop ? "top" : !1;
            if (this.affixed !== affix) {
                null != this.unpin && this.$element.css("top", "");
                var affixType = "affix" + (affix ? "-" + affix : ""), e = $.Event(affixType + ".bs.affix");
                this.$element.trigger(e), e.isDefaultPrevented() || (this.affixed = affix, this.unpin = "bottom" == affix ? this.getPinnedOffset() : null, 
                this.$element.removeClass(Affix.RESET).addClass(affixType).trigger($.Event(affixType.replace("affix", "affixed"))), 
                "bottom" == affix && this.$element.offset({
                    top: scrollHeight - this.$element.height() - offsetBottom
                }));
            }
        }
    };
    var old = $.fn.affix;
    $.fn.affix = Plugin, $.fn.affix.Constructor = Affix, $.fn.affix.noConflict = function() {
        return $.fn.affix = old, this;
    }, $(window).on("load", function() {
        $('[data-spy="affix"]').each(function() {
            var $spy = $(this), data = $spy.data();
            data.offset = data.offset || {}, data.offsetBottom && (data.offset.bottom = data.offsetBottom), 
            data.offsetTop && (data.offset.top = data.offsetTop), Plugin.call($spy, data);
        });
    });
}(jQuery);

var haversine = function() {
    var toRad = function(num) {
        return num * Math.PI / 180;
    };
    return function(start, end, options) {
        var km = 6371, mile = 3960;
        options = options || {};
        var R = "mile" === options.unit ? mile : km, dLat = toRad(end.latitude - start.latitude), dLon = toRad(end.longitude - start.longitude), lat1 = toRad(start.latitude), lat2 = toRad(end.latitude), a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2), c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return options.threshold ? options.threshold > R * c : R * c;
    };
}();

angular.module("ui.bootstrap-slider", []).directive("slider", [ "$parse", "$timeout", function($parse, $timeout) {
    return {
        restrict: "AE",
        replace: !0,
        template: '<input type="text" />',
        require: "ngModel",
        link: function($scope, element, attrs, ngModelCtrl) {
            attrs.ngChange && ngModelCtrl.$viewChangeListeners.push(function() {
                $scope.$apply(attrs.ngChange);
            });
            var options = {};
            attrs.sliderid && (options.id = attrs.sliderid), attrs.min && (options.min = parseFloat(attrs.min)), 
            attrs.max && (options.max = parseFloat(attrs.max)), attrs.step && (options.step = parseFloat(attrs.step)), 
            attrs.precision && (options.precision = parseFloat(attrs.precision)), attrs.orientation && (options.orientation = attrs.orientation), 
            attrs.value && (angular.isNumber(attrs.value) || angular.isArray(attrs.value) ? options.value = attrs.value : angular.isString(attrs.value) && (options.value = 0 === attrs.value.indexOf("[") ? angular.fromJson(attrs.value) : parseFloat(attrs.value))), 
            attrs.range && (options.range = "true" === attrs.range), attrs.selection && (options.selection = attrs.selection), 
            attrs.tooltip && (options.tooltip = attrs.tooltip), attrs.tooltipseparator && (options.tooltip_separator = attrs.tooltipseparator), 
            attrs.tooltipsplit && (options.tooltip_split = "true" === attrs.tooltipsplit), attrs.handle && (options.handle = attrs.handle), 
            attrs.reversed && (options.reversed = "true" === attrs.reversed), attrs.enabled && (options.enabled = "true" === attrs.enabled), 
            attrs.naturalarrowkeys && (options.natural_arrow_keys = "true" === attrs.naturalarrowkeys), 
            attrs.formatter && (options.formatter = $scope.$eval(attrs.formatter)), options.range && !options.value && (options.value = [ 0, 0 ]);
            var slider = $(element[0]).slider(options), updateEvent = attrs.updateevent || "slide";
            slider.on(updateEvent, function(ev) {
                ngModelCtrl.$setViewValue(ev.value), $timeout(function() {
                    $scope.$apply();
                });
            }), $scope.$watch(attrs.ngModel, function(value) {
                (value || 0 === value) && slider.slider("setValue", value, !1);
            }), angular.isDefined(attrs.ngDisabled) && $scope.$watch(attrs.ngDisabled, function(value) {
                slider.slider(value ? "disable" : "enable");
            });
        }
    };
} ]), function(e) {
    if ("function" == typeof bootstrap) bootstrap("ng-time-relative", e); else if ("object" == typeof exports) module.exports = e(); else if ("function" == typeof define && define.amd) define(e); else if ("undefined" != typeof ses) {
        if (!ses.ok()) return;
        ses.makeNgTimeRelative = e;
    } else "undefined" != typeof window ? window.ngTimeRelative = e() : global.ngTimeRelative = e();
}(function() {
    return function(e, t, n) {
        function i(n, s) {
            if (!t[n]) {
                if (!e[n]) {
                    var o = "function" == typeof require && require;
                    if (!s && o) return o(n, !0);
                    if (r) return r(n, !0);
                    throw new Error("Cannot find module '" + n + "'");
                }
                var u = t[n] = {
                    exports: {}
                };
                e[n][0](function(t) {
                    var r = e[n][1][t];
                    return i(r ? r : t);
                }, u, u.exports);
            }
            return t[n].exports;
        }
        for (var r = "function" == typeof require && require, s = 0; s < n.length; s++) i(n[s]);
        return i;
    }({
        1: [ function(require, module, exports) {
            "use strict";
            function directive($timeout, moment) {
                return {
                    restrict: "AC",
                    scope: {
                        datetime: "@"
                    },
                    link: function(scope, element, attrs) {
                        var timeout;
                        scope.$watch("datetime", function(dateString) {
                            function updateTime() {
                                element.text(diffString(date, to()));
                            }
                            function diffString(a, b) {
                                return Math.abs(a.clone().startOf("day").diff(b, "days", !0)) < 1 ? a.from(b, withoutSuffix) : a.calendar(b);
                            }
                            function updateLater() {
                                updateTime(), timeout = $timeout(function() {
                                    updateLater();
                                }, nextUpdateIn());
                            }
                            function nextUpdateIn() {
                                var delta = Math.abs(moment().diff(date));
                                return 45e3 > delta ? 45e3 - delta : 9e4 > delta ? 9e4 - delta : 27e5 > delta ? 6e4 - (delta + 3e4) % 6e4 : 366e4 - delta % 36e5;
                            }
                            $timeout.cancel(timeout);
                            var date = moment(dateString);
                            if (date) {
                                var to = function() {
                                    return moment(attrs.to);
                                }, withoutSuffix = "withoutSuffix" in attrs;
                                attrs.title || element.attr("title", date.format("LLLL")), element.bind("$destroy", function() {
                                    $timeout.cancel(timeout);
                                }), updateLater();
                            }
                        });
                    }
                };
            }
            if (exports = module.exports = function(module) {
                module.constant("timeRelativeConfig", {
                    calendar: {
                        en: {
                            lastDay: "[Yesterday], LT",
                            sameDay: "[Today], LT",
                            nextDay: "[Tomorrow], LT",
                            lastWeek: "dddd, LT",
                            nextWeek: "[Next] dddd, LT",
                            sameElse: "LL"
                        }
                    }
                }).directive("relative", [ "$timeout", "moment", directive ]).run([ "moment", "timeRelativeConfig", function(moment, timeRelativeConfig) {
                    angular.forEach(timeRelativeConfig.calendar, function(translation, lang) {
                        moment.lang(lang, {
                            calendar: translation
                        });
                    });
                } ]);
            }, exports.directive = directive, angular) {
                var mod = angular.module("timeRelative", []);
                moment && (mod.constant("moment", moment), moment.lang("en", {})), exports(mod);
            }
        }, {} ]
    }, {}, [ 1 ]);
}), angular.module("btford.socket-io", []).provider("socketFactory", function() {
    "use strict";
    var defaultPrefix = "socket:";
    this.$get = [ "$rootScope", "$timeout", function($rootScope, $timeout) {
        var asyncAngularify = function(socket, callback) {
            return callback ? function() {
                var args = arguments;
                $timeout(function() {
                    callback.apply(socket, args);
                }, 0);
            } : angular.noop;
        };
        return function(options) {
            options = options || {};
            var socket = options.ioSocket || io.connect(), prefix = options.prefix || defaultPrefix, defaultScope = options.scope || $rootScope, addListener = function(eventName, callback) {
                socket.on(eventName, callback.__ng = asyncAngularify(socket, callback));
            }, addOnceListener = function(eventName, callback) {
                socket.once(eventName, callback.__ng = asyncAngularify(socket, callback));
            }, wrappedSocket = {
                on: addListener,
                addListener: addListener,
                once: addOnceListener,
                emit: function(eventName, data, callback) {
                    var lastIndex = arguments.length - 1, callback = arguments[lastIndex];
                    return "function" == typeof callback && (callback = asyncAngularify(socket, callback), 
                    arguments[lastIndex] = callback), socket.emit.apply(socket, arguments);
                },
                removeListener: function(ev, fn) {
                    return fn && fn.__ng && (arguments[1] = fn.__ng), socket.removeListener.apply(socket, arguments);
                },
                removeAllListeners: function() {
                    return socket.removeAllListeners.apply(socket, arguments);
                },
                disconnect: function(close) {
                    return socket.disconnect(close);
                },
                forward: function(events, scope) {
                    events instanceof Array == !1 && (events = [ events ]), scope || (scope = defaultScope), 
                    events.forEach(function(eventName) {
                        var prefixedEvent = prefix + eventName, forwardBroadcast = asyncAngularify(socket, function(data) {
                            scope.$broadcast(prefixedEvent, data);
                        });
                        scope.$on("$destroy", function() {
                            socket.removeListener(eventName, forwardBroadcast);
                        }), socket.on(eventName, forwardBroadcast);
                    });
                }
            };
            return wrappedSocket;
        };
    } ];
});

var Conversations = function() {
    function loadConversations() {
        $.get("/conversations/data", function(conversations) {
            $("#loading").hide(), conversations.length <= 0 && $("#no-conversations").show();
            var conversation_id = 1;
            $.each(conversations, function(index, conversation) {
                for (var firstconversation = null, has_unread_messages = !1, i = 0; i < conversation.list.length && (conversation.list[i].id && (firstconversation = conversation.list[i]), 
                conversation.list[i].is_read === !1 && (has_unread_messages = !0), null === firstconversation || !has_unread_messages); i++) ;
                var lastconversation = conversation.list[conversation.list.length - 1];
                $("#conversations-overview").append('<div class="convo' + (has_unread_messages ? " unread" : "") + '" data-id="' + conversation_id + '" data-username="' + conversation.user + '" data-messageid="' + firstconversation.id.$id + '"><a href="#">	<img src="' + lastconversation.picture + '" class="thumbnail" alt="' + lastconversation.author + '">	<p class="time-stamp">Posted ' + lastconversation.reltime + " ago</p>	<h4>" + lastconversation.author + "</h4>	<p>" + lastconversation.message + "</p></a></div>");
                var conversationObj = $("<div>");
                conversationObj.addClass("conversation" + conversation_id), $("#conversations-list").append(conversationObj), 
                $.each(conversation.list, function(index, message) {
                    conversationObj.append('<div class="convo"' + (message.twitter_message_id ? ' data-twittermessageid="' + message.twitter_message_id + '"' : "") + '>	<img src="' + message.picture + '" class="thumbnail" alt="' + message.author + '">	<p class="time-stamp">Posted ' + message.reltime + " ago</p>	<h4>" + message.author + "</h4>	<p>" + message.message + "</p></div>");
                }), conversation_id++;
            }), $(".convo a").unbind("click").click(function() {
                var parent = $(this).parent();
                parent.removeClass("unread"), $("#conversations-overview").hide(), $("body").attr("id", "conversations-single"), 
                currentConversation = $("#conversations-list .conversation" + parent.attr("data-id")), 
                currentConversation.show();
                var message_ids = [];
                return currentConversation.find(".convo[data-twittermessageid]").each(function() {
                    message_ids.push($(this).attr("data-twittermessageid"));
                }), message_ids.length > 0 && $.get("/conversations/read_messages", {
                    ids: message_ids.join(",")
                }, function(data) {
                    if (data.status && "OK" == data.status) {
                        var obj = $(".unread-messages");
                        if (-1 != obj.length) {
                            var val = parseInt(obj.html()), newVal = val - data.changed;
                            newVal > 0 ? obj.html(newVal) : obj.hide();
                        }
                    }
                }), prepareReplyForm(parent.attr("data-username"), parent.attr("data-messageid")), 
                $(".go-back-tab").show(), $(".go-back-tab a").unbind("click").click(function() {
                    return $("#conversations-overview").show(), $("body").attr("id", "conversations"), 
                    $("#conversations-list > div").hide(), $(".go-back-tab").hide(), !1;
                }), !1;
            });
        });
    }
    function prepareReplyForm(username, message_id) {
        $(".reply textarea").val("@" + username + " ");
        var tweet_length = $(".reply textarea").val().length, remaining = 140 - tweet_length;
        $(".reply .word-count").html(remaining), $(".reply textarea").selectRange(tweet_length, tweet_length), 
        $(".reply textarea").keyup(function() {
            var remaining = 140 - $(this).val().length;
            $(".reply .word-count").html(remaining);
        }), $(".reply .error").hide(), $(".reply").unbind("submit").submit(function() {
            if (!$("#saving-reply-indicator").is(":visible")) {
                var message = $(".reply textarea").val();
                return message.length > 140 ? alert("You can not post tweets that exceed 140 characters.") : ($("#saving-reply-indicator").show(), 
                $.post("/tweet/post", {
                    message_id: message_id,
                    message: message
                }, function(data) {
                    $("#saving-reply-indicator").hide(), data.error ? alert(data.error) : (currentConversation.append('<div class="convo">	<img src="/assets/img/user.png" class="thumbnail" alt="Me">	<p class="time-stamp">Posted just now</p>	<h4>Me</h4>	<p>' + message + "</p></div>"), 
                    prepareReplyForm(username, message_id));
                })), !1;
            }
        });
    }
    var currentConversation = null;
    return {
        init: function() {
            $("body#conversations").length && loadConversations();
        }
    };
}();

$(Conversations.init);

var SettingsForm = function() {
    function bindEvents() {
        $("#location-form .btn").click(function() {
            return navigator.geolocation ? ($("#location-form a img").attr("src", $("#location-form a img").attr("src").replace("locateme.png", "loading.gif")), 
            navigator.geolocation.getCurrentPosition(geoLocationSuccess, geoLocationError)) : alert("Sorry! Your browser does not support this feature"), 
            !1;
        }), $("#location-form").submit(function() {
            if (!$("#loading").is(":visible")) {
                $("#loading").show();
                var address = $("#address").val();
                return geocoder.geocode({
                    address: address
                }, function(results, status) {
                    status == google.maps.GeocoderStatus.OK ? ($("#lat").val(results[0].geometry.location.lat()), 
                    $("#long").val(results[0].geometry.location.lng()), $.each(results[0].address_components, function(index, component) {
                        -1 != $.inArray("administrative_area_level_1", component.types) ? $("#state").val(component.short_name) : -1 != $.inArray("administrative_area_level_2", component.types) && $("#county").val(component.long_name);
                    }), $("#location-form").submit()) : ($("#loading").hide(), alert("Sorry, there was an error locating your address. Please try again."));
                }), !1;
            }
        });
    }
    function geoLocationError(message) {
        alert("Could not get your current location: " + message);
    }
    function geoLocationSuccess(position) {
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        geocoder.geocode({
            latLng: latlng
        }, function(results, status) {
            $("#location-form a img").attr("src", $("#location-form a img").attr("src").replace("loading.gif", "locateme.png")), 
            status == google.maps.GeocoderStatus.OK ? $("#address").val(results[0].formatted_address) : alert("Sorry, there was an error locating your address. Please try again.");
        });
    }
    var geocoder = new google.maps.Geocoder();
    return {
        init: function() {
            $("#location-form").length && bindEvents();
        }
    };
}();

$(SettingsForm.init), angular.module("electiondeskStream", [ "btford.socket-io", "timeRelative", "ui.bootstrap-slider" ]).factory("socket", function(socketFactory) {
    var hostname = window.location.host;
    return hostname.indexOf("local") && (hostname = "stage.electiondesk.us"), socketFactory({
        ioSocket: io.connect("http://" + hostname + ":4242")
    });
}).controller("StreamController", function($scope, $http, socket) {
    socket.forward([ "update", "hello" ], $scope), $scope.streamIsActive = !0, $scope.topicQuery = {
        6: !0,
        7: !0,
        8: !0,
        9: !0,
        10: !0
    }, $scope.sourceQuery = {
        facebook: !0,
        twitter: !0,
        googleplus: !0,
        wordpress: !0,
        disqus: !0
    }, $scope.togglePause = function() {
        var icon = $("#feed_paused_label").find("i");
        $scope.streamIsActive ? icon.removeClass("fa-play").addClass("fa-pause") : icon.removeClass("fa-pause").addClass("fa-play");
    }, $scope.limitQuery = "all", $scope.radiusQuery = {}, $scope.radiusQuery.val = 20, 
    $scope.radiusQuery.formatter = function(value) {
        return 1e3 === value && (value = "1,000"), value + " miles";
    }, $scope.radiusQuery.changed = function() {
        $scope.limitQuery = "radius";
    }, $scope.bookmark = function(interaction) {
        console.log(interaction);
        var messageId = interaction._id.$id;
        console.log(interaction._id), console.log(messageId), interaction.bookmarked ? $http({
            method: "POST",
            url: "/trending/unbookmark",
            data: $.param({
                message: messageId
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).success(function(data) {
            data.error ? "You cannot remove a bookmark that is not bookmarked." != data.error && alert("Could not unbookmark message: " + data.error) : (interaction.bookmarked = !1, 
            console.log(interaction.bookmarked));
        }) : $http({
            method: "POST",
            url: "/trending/bookmark",
            data: $.param({
                message: messageId
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).success(function(data) {
            data.error ? alert("Could not bookmark message: " + data.error) : (interaction.bookmarked = !0, 
            console.log(interaction.bookmarked));
        });
    }, $scope.interactions = [], $scope.$on("socket:update", function(ev, data) {
        if ($scope.streamIsActive) {
            var json = JSON.parse(data), unixTime = new Date().getTime() / 1e3;
            json.interaction.created_at.sec > unixTime && (json.interaction.created_at.sec = unixTime), 
            json.bookmarked = "undefined" != typeof window.STREAM.bookmarks[json._id.$id] ? !0 : !1, 
            $scope.interactions.push(json);
        }
    }), $scope.$on("socket:hello", function() {
        socket.emit("dump");
    });
}).filter("topicfilter", function() {
    return function(items, topics) {
        if (!topics) return [];
        var activeTopics = [];
        return angular.forEach(topics, function(active, source) {
            active && activeTopics.push(parseInt(source));
        }), items.filter(function(element) {
            return -1 != activeTopics.indexOf(element.internal.filter_id);
        });
    };
}).filter("sourcefilter", function() {
    return function(items, sources) {
        if (!sources) return [];
        var activeSources = [];
        return angular.forEach(sources, function(active, source) {
            active && activeSources.push(source);
        }), items.filter(function(element) {
            return -1 != activeSources.indexOf(element.interaction.type);
        });
    };
}).filter("limitfilter", function() {
    return function(items, limit, radiusVal) {
        if (!limit || "all" == limit) return items;
        if ("state" == limit) {
            var userState = $("#limit_state").data("state");
            return items.filter(function(element) {
                return "undefined" != typeof element.internal.location && element.internal.location.state == userState;
            });
        }
        if ("radius" == limit) {
            var userLocation = {
                latitude: $("#limit_radius").data("lat"),
                longitude: $("#limit_radius").data("lon")
            };
            return items.filter(function(element) {
                if ("undefined" == typeof element.internal.location || 0 === element.internal.location.coords[0] || 0 === element.internal.location.coords[1]) return !1;
                var interactionLocation = {
                    latitude: element.internal.location.coords[1],
                    longitude: element.internal.location.coords[0]
                }, distance = haversine(userLocation, interactionLocation, {
                    unit: "mile"
                });
                return radiusVal >= distance;
            });
        }
    };
}).filter("contentfilter", function() {
    return function(items, query) {
        return query ? items.filter(function(element) {
            return "undefined" != typeof element.interaction.content && element.interaction.content ? -1 != element.interaction.content.search(new RegExp(query, "i")) : !1;
        }) : items;
    };
}).filter("orderByCreated", function() {
    return function(items, reverse) {
        var filtered = [];
        return angular.forEach(items, function(item) {
            filtered.push(item);
        }), filtered.sort(function(a, b) {
            return a.interaction.created_at.sec < b.interaction.created_at.sec ? 1 : -1;
        }), reverse && filtered.reverse(), filtered;
    };
});