!function($) {
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
}(window.jQuery);

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
            alert("testaaa"), $("#location-form").length && bindEvents();
        }
    };
}();

$(SettingsForm.init), angular.module("electiondeskStream", [ "btford.socket-io", "timeRelative", "ui.bootstrap-slider" ]).factory("socket", function(socketFactory) {
    return socketFactory({
        ioSocket: io.connect("http://" + window.location.host + ":4242")
    });
}).controller("StreamController", function($scope, socket) {
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
    }, $scope.interactions = [], $scope.$on("socket:update", function(ev, data) {
        if ($scope.streamIsActive) {
            var json = JSON.parse(data), unixTime = new Date().getTime() / 1e3;
            json.interaction.created_at.sec > unixTime && (json.interaction.created_at.sec = unixTime), 
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