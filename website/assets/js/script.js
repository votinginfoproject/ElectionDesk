if (angular.module("linkify", []), angular.module("linkify").filter("linkify", function() {
    "use strict";
    function linkify(_str, type) {
        if (_str) {
            var _text = _str.replace(/(?:https?\:\/\/|www\.)+(?![^\s]*?")([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi, function(url) {
                var wrap = document.createElement("div"), anch = document.createElement("a");
                return anch.href = url, anch.target = "_blank", anch.innerHTML = url, wrap.appendChild(anch), 
                wrap.innerHTML;
            });
            return _text ? ("twitter" === type && (_text = _text.replace(/(|\s)*@([a-zA-Z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿñ_-]+)/g, '$1<a href="https://twitter.com/$2" target="_blank">@$2</a>'), 
            _text = _text.replace(/(^|\s)*#([a-zA-Z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿñ_-]+)/g, '$1<a href="https://twitter.com/search?q=%23$2" target="_blank">#$2</a>')), 
            "github" === type && (_text = _text.replace(/(|\s)*@(\w+)/g, '$1<a href="https://github.com/$2" target="_blank">@$2</a>')), 
            _text) : "";
        }
    }
    return function(text, type) {
        return linkify(text, type);
    };
}).factory("linkify", [ "$filter", function($filter) {
    "use strict";
    function _linkifyAsType(type) {
        return function(str) {
            return $filter("linkify")(str, type);
        };
    }
    return {
        twitter: _linkifyAsType("twitter"),
        github: _linkifyAsType("github"),
        normal: _linkifyAsType()
    };
} ]).directive("linkify", [ "$filter", "$timeout", "linkify", function($filter, $timeout, linkify) {
    "use strict";
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            var type = attrs.linkify || "normal";
            $timeout(function() {
                element.html(linkify[type](element.html()));
            });
        }
    };
} ]), angular.module("cgNotify", []).factory("notify", [ "$timeout", "$http", "$compile", "$templateCache", "$rootScope", function($timeout, $http, $compile, $templateCache, $rootScope) {
    var startTop = 10, verticalSpacing = 15, duration = 1e4, defaultTemplateUrl = "angular-notify.html", position = "center", container = document.body, messageElements = [], notify = function(args) {
        "object" != typeof args && (args = {
            message: args
        }), args.templateUrl = args.templateUrl ? args.templateUrl : defaultTemplateUrl, 
        args.position = args.position ? args.position : position, args.container = args.container ? args.container : container, 
        args.classes = args.classes ? args.classes : "";
        var scope = args.scope ? args.scope.$new() : $rootScope.$new();
        scope.$message = args.message, scope.$classes = args.classes, scope.$messageTemplate = args.messageTemplate, 
        $http.get(args.templateUrl, {
            cache: $templateCache
        }).success(function(template) {
            var templateElement = $compile(template)(scope);
            if (templateElement.bind("webkitTransitionEnd oTransitionEnd otransitionend transitionend msTransitionEnd", function(e) {
                ("opacity" === e.propertyName || e.originalEvent && "opacity" === e.originalEvent.propertyName) && (templateElement.remove(), 
                messageElements.splice(messageElements.indexOf(templateElement), 1), layoutMessages());
            }), args.messageTemplate) {
                for (var messageTemplateElement, i = 0; i < templateElement.children().length; i++) if (angular.element(templateElement.children()[i]).hasClass("cg-notify-message-template")) {
                    messageTemplateElement = angular.element(templateElement.children()[i]);
                    break;
                }
                if (!messageTemplateElement) throw new Error("cgNotify could not find the .cg-notify-message-template element in " + args.templateUrl + ".");
                messageTemplateElement.append($compile(args.messageTemplate)(scope));
            }
            angular.element(args.container).append(templateElement), messageElements.push(templateElement), 
            "center" === args.position && $timeout(function() {
                templateElement.css("margin-left", "-" + templateElement[0].offsetWidth / 2 + "px");
            }), scope.$close = function() {
                templateElement.css("opacity", 0).attr("data-closing", "true"), layoutMessages();
            };
            var layoutMessages = function() {
                for (var j = 0, currentY = startTop, i = messageElements.length - 1; i >= 0; i--) {
                    var shadowHeight = 10, element = messageElements[i], height = element[0].offsetHeight, top = currentY + height + shadowHeight;
                    element.attr("data-closing") ? top += 20 : currentY += height + verticalSpacing, 
                    element.css("top", top + "px").css("margin-top", "-" + (height + shadowHeight) + "px").css("visibility", "visible"), 
                    j++;
                }
            };
            $timeout(function() {
                layoutMessages();
            }), duration > 0 && $timeout(function() {
                scope.$close();
            }, duration);
        }).error(function(data) {
            throw new Error("Template specified for cgNotify (" + args.templateUrl + ") could not be loaded. " + data);
        });
        var retVal = {};
        return retVal.close = function() {
            scope.$close && scope.$close();
        }, Object.defineProperty(retVal, "message", {
            get: function() {
                return scope.$message;
            },
            set: function(val) {
                scope.$message = val;
            }
        }), retVal;
    };
    return notify.config = function(args) {
        startTop = angular.isUndefined(args.startTop) ? startTop : args.startTop, verticalSpacing = angular.isUndefined(args.verticalSpacing) ? verticalSpacing : args.verticalSpacing, 
        duration = angular.isUndefined(args.duration) ? duration : args.duration, defaultTemplateUrl = args.templateUrl ? args.templateUrl : defaultTemplateUrl, 
        position = angular.isUndefined(args.position) ? position : args.position, container = args.container ? args.container : container;
    }, notify.closeAll = function() {
        for (var i = messageElements.length - 1; i >= 0; i--) {
            var element = messageElements[i];
            element.css("opacity", 0);
        }
    }, notify;
} ]), angular.module("cgNotify").run([ "$templateCache", function($templateCache) {
    "use strict";
    $templateCache.put("angular-notify.html", '<div class="cg-notify-message" ng-class="$classes">\n\n    <div ng-show="!$messageTemplate">\n        {{$message}}\n    </div>\n\n    <div ng-show="$messageTemplate" class="cg-notify-message-template">\n        \n    </div>\n\n    <button type="button" class="cg-notify-close" ng-click="$close()">\n        <span aria-hidden="true">&times;</span>\n        <span class="cg-notify-sr-only">Close</span>\n    </button>\n\n</div>');
} ]), function($) {
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

!function(factory) {
    "function" == typeof define && define.amd ? define([ "jquery" ], factory) : factory("object" == typeof exports ? require("jquery") : jQuery);
}(function($) {
    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }
    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }
    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }
    function parseCookieValue(s) {
        0 === s.indexOf('"') && (s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
        try {
            return s = decodeURIComponent(s.replace(pluses, " ")), config.json ? JSON.parse(s) : s;
        } catch (e) {}
    }
    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }
    var pluses = /\+/g, config = $.cookie = function(key, value, options) {
        if (arguments.length > 1 && !$.isFunction(value)) {
            if (options = $.extend({}, config.defaults, options), "number" == typeof options.expires) {
                var days = options.expires, t = options.expires = new Date();
                t.setTime(+t + 864e5 * days);
            }
            return document.cookie = [ encode(key), "=", stringifyCookieValue(value), options.expires ? "; expires=" + options.expires.toUTCString() : "", options.path ? "; path=" + options.path : "", options.domain ? "; domain=" + options.domain : "", options.secure ? "; secure" : "" ].join("");
        }
        for (var result = key ? void 0 : {}, cookies = document.cookie ? document.cookie.split("; ") : [], i = 0, l = cookies.length; l > i; i++) {
            var parts = cookies[i].split("="), name = decode(parts.shift()), cookie = parts.join("=");
            if (key && key === name) {
                result = read(cookie, value);
                break;
            }
            key || void 0 === (cookie = read(cookie)) || (result[name] = cookie);
        }
        return result;
    };
    config.defaults = {}, $.removeCookie = function(key, options) {
        return void 0 === $.cookie(key) ? !1 : ($.cookie(key, "", $.extend({}, options, {
            expires: -1
        })), !$.cookie(key));
    };
}), function($) {
    var lang = {
        en: {
            days: [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ],
            months: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
            sep: "-",
            format: "YYYY-MM-DD hh:mm",
            prevMonth: "Previous month",
            nextMonth: "Next month",
            today: "Today"
        },
        ro: {
            days: [ "Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "SÃ¢m" ],
            months: [ "Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
            sep: ".",
            format: "DD.MM.YYYY hh:mm",
            prevMonth: "Luna precedentÄƒ",
            nextMonth: "Luna urmÄƒtoare",
            today: "Azi"
        },
        ja: {
            days: [ "æ—¥", "æœˆ", "ç«", "æ°´", "æœ¨", "é‡‘", "åœŸ" ],
            months: [ "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12" ],
            sep: "/",
            format: "YYYY/MM/DD hh:mm"
        },
        ru: {
            days: [ "Ð’Ñ", "ÐŸÐ½", "Ð’Ñ‚", "Ð¡Ñ€", "Ð§Ñ‚", "ÐŸÑ‚", "Ð¡Ð±" ],
            months: [ "Ð¯Ð½Ð²", "Ð¤ÐµÐ²", "ÐœÐ°Ñ€", "ÐÐ¿Ñ€", "ÐœÐ°Ð¹", "Ð˜ÑŽÐ½", "Ð˜ÑŽÐ»", "ÐÐ²Ð³", "Ð¡ÐµÐ½", "ÐžÐºÑ‚", "ÐÐ¾Ñ", "Ð”ÐµÐº" ],
            format: "DD.MM.YYYY hh:mm"
        },
        br: {
            days: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "SÃ¡b" ],
            months: [ "Janeiro", "Fevereiro", "MarÃ§o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" ],
            format: "DD/MM/YYYY hh:mm"
        },
        pt: {
            days: [ "dom", "seg", "ter", "qua", "qui", "sex", "sÃ¡b" ],
            months: [ "janeiro", "fevereiro", "marÃ§o", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro" ]
        },
        cn: {
            days: [ "æ—¥", "ä¸€", "äºŒ", "ä¸‰", "å››", "äº”", "å…­" ],
            months: [ "ä¸€æœˆ", "äºŒæœˆ", "ä¸‰æœˆ", "å››æœˆ", "äº”æœˆ", "å…­æœˆ", "ä¸ƒæœˆ", "å…«æœˆ", "ä¹æœˆ", "åæœˆ", "åä¸€æœˆ", "åäºŒæœˆ" ]
        },
        de: {
            days: [ "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa" ],
            months: [ "Jan", "Feb", "MÃ¤rz", "Apr", "Mai", "Juni", "Juli", "Aug", "Sept", "Okt", "Nov", "Dez" ],
            format: "DD.MM.YYYY hh:mm"
        },
        sv: {
            days: [ "SÃ¶", "MÃ¥", "Ti", "On", "To", "Fr", "LÃ¶" ],
            months: [ "Jan", "Feb", "Mar", "Apr", "Maj", "Juni", "Juli", "Aug", "Sept", "Okt", "Nov", "Dec" ]
        },
        id: {
            days: [ "Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab" ],
            months: [ "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des" ]
        },
        it: {
            days: [ "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab" ],
            months: [ "Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic" ],
            format: "DD/MM/YYYY hh:mm"
        },
        tr: {
            days: [ "Pz", "Pzt", "Sal", "Ã‡ar", "Per", "Cu", "Cts" ],
            months: [ "Ock", "Åžub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Ekm", "Kas", "Arlk" ]
        },
        es: {
            days: [ "dom", "lun", "mar", "miÃ©r", "jue", "viÃ©", "sÃ¡b" ],
            months: [ "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic" ],
            format: "DD/MM/YYYY hh:mm"
        },
        ko: {
            days: [ "ì¼", "ì›”", "í™”", "ìˆ˜", "ëª©", "ê¸ˆ", "í† " ],
            months: [ "1ì›”", "2ì›”", "3ì›”", "4ì›”", "5ì›”", "6ì›”", "7ì›”", "8ì›”", "9ì›”", "10ì›”", "11ì›”", "12ì›”" ]
        },
        nl: {
            days: [ "zo", "ma", "di", "wo", "do", "vr", "za" ],
            months: [ "jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec" ],
            format: "DD-MM-YYYY hh:mm"
        },
        cz: {
            days: [ "Ne", "Po", "Ãšt", "St", "ÄŒt", "PÃ¡", "So" ],
            months: [ "Led", "Ãšno", "BÅ™e", "Dub", "KvÄ›", "ÄŒer", "ÄŒvc", "Srp", "ZÃ¡Å™", "Å˜Ã­j", "Lis", "Pro" ],
            format: "DD.MM.YYYY hh:mm"
        },
        fr: {
            days: [ "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam" ],
            months: [ "Janvier", "FÃ©vrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "AoÃ»t", "Septembre", "Octobre", "Novembre", "DÃ©cembre" ],
            format: "DD-MM-YYYY hh:mm"
        },
        pl: {
            days: [ "N", "Pn", "Wt", "Åšr", "Cz", "Pt", "So" ],
            months: [ "StyczeÅ„", "Luty", "Marzec", "KwiecieÅ„", "Maj", "Czerwiec", "Lipiec", "SierpieÅ„", "WrzesieÅ„", "PaÅºdziernik", "Listopad", "GrudzieÅ„" ],
            sep: "-",
            format: "YYYY-MM-DD hh:mm",
            prevMonth: "Poprzedni miesiÄ…c",
            nextMonth: "NastÄ™pny miesiÄ…c",
            today: "Dzisiaj"
        }
    }, PickerHandler = function($picker, $input) {
        this.$pickerObject = $picker, this.$inputObject = $input;
    };
    PickerHandler.prototype.getPicker = function() {
        return this.$pickerObject;
    }, PickerHandler.prototype.getInput = function() {
        return this.$inputObject;
    }, PickerHandler.prototype.isShow = function() {
        var is_show = !0;
        return "none" == this.$pickerObject.css("display") && (is_show = !1), is_show;
    }, PickerHandler.prototype.show = function() {
        var $picker = this.$pickerObject, $input = this.$inputObject;
        if ($picker.show(), ActivePickerId = $input.data("pickerId"), 0 == $picker.data("isInline")) {
            var _position = $input.parent().css("position");
            "relative" === _position || "absolute" === _position ? $picker.parent().css("top", $input.outerHeight() + 2 + "px") : ($picker.parent().css("top", $input.position().top + $input.outerHeight() + 2 + "px"), 
            $picker.parent().css("left", $input.position().left + "px"));
        }
    }, PickerHandler.prototype.hide = function() {
        {
            var $picker = this.$pickerObject;
            this.$inputObject;
        }
        $picker.hide();
    }, PickerHandler.prototype.destroy = function() {
        var $picker = this.$pickerObject, picker_id = $picker.data("pickerId");
        PickerObjects[picker_id] = null, $picker.remove();
    };
    var PickerObjects = [], InputObjects = [], ActivePickerId = -1, getParentPickerObject = function(obj) {
        return $(obj).closest(".datepicker");
    }, getPickersInputObject = function($obj) {
        var $picker = getParentPickerObject($obj);
        return null != $picker.data("inputObjectId") ? $(InputObjects[$picker.data("inputObjectId")]) : null;
    }, setToNow = function($obj) {
        var $picker = getParentPickerObject($obj), date = new Date();
        draw($picker, {
            isAnim: !0,
            isOutputToInputObject: !0
        }, date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
    }, beforeMonth = function($obj) {
        var $picker = getParentPickerObject($obj);
        if (0 != $picker.data("stateAllowBeforeMonth")) {
            var date = getPickedDate($picker), targetMonth_lastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
            targetMonth_lastDay < date.getDate() && date.setDate(targetMonth_lastDay), draw($picker, {
                isAnim: !0,
                isOutputToInputObject: !0
            }, date.getFullYear(), date.getMonth() - 1, date.getDate(), date.getHours(), date.getMinutes());
            var todayDate = new Date(), isCurrentYear = todayDate.getFullYear() == date.getFullYear(), isCurrentMonth = isCurrentYear && todayDate.getMonth() == date.getMonth();
            isCurrentMonth && $picker.data("futureOnly") || (targetMonth_lastDay < date.getDate() && date.setDate(targetMonth_lastDay), 
            draw($picker, {
                isAnim: !0,
                isOutputToInputObject: !0
            }, date.getFullYear(), date.getMonth() - 1, date.getDate(), date.getHours(), date.getMinutes()));
        }
    }, nextMonth = function($obj) {
        var $picker = getParentPickerObject($obj), date = getPickedDate($picker), targetMonth_lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        targetMonth_lastDay < date.getDate() && date.setDate(targetMonth_lastDay), draw($picker, {
            isAnim: !0,
            isOutputToInputObject: !0
        }, date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes());
    }, getDateFormat = function(format, locale, is_date_only) {
        return "default" == format && (format = translate(locale, "format"), is_date_only && (format = format.substring(0, format.search(" ")))), 
        format;
    }, normalizeYear = function(year) {
        if (99 > year) {
            var date = new Date();
            return parseInt(year) + parseInt(date.getFullYear().toString().substr(0, 2) + "00");
        }
        return year;
    }, parseDate = function(str, opt_date_format) {
        if (null != opt_date_format) {
            var df = opt_date_format.replace(/(-|\/)/g, "[-/]").replace(/YYYY/gi, "(\\d{2,4})").replace(/(YY|MM|DD|hh|mm)/g, "(\\d{1,2})").replace(/(M|D|h|m)/g, "(\\d{1,2})"), re = new RegExp(df), m = re.exec(str);
            if (null != m) {
                for (var formats = new Array(), format_buf = "", format_before_c = "", df = opt_date_format; null != df && 0 < df.length; ) {
                    var format_c = df.substring(0, 1);
                    df = df.substring(1, df.length), format_before_c != format_c && (/(YYYY|YY|MM|DD|mm|dd|M|D|h|m)/.test(format_buf) ? (formats.push(format_buf), 
                    format_buf = "") : format_buf = ""), format_buf += format_c, format_before_c = format_c;
                }
                "" != format_buf && /(YYYY|YY|MM|DD|mm|dd|M|D|h|m)/.test(format_buf) && formats.push(format_buf);
                for (var year, month, day, hour, min, is_successful = !1, i = 0; i < formats.length && !(m.length < i); i++) {
                    var f = formats[i], d = m[i + 1];
                    "YYYY" == f ? (year = normalizeYear(d), is_successful = !0) : "YY" == f ? (year = parseInt(d) + 2e3, 
                    is_successful = !0) : "MM" == f || "M" == f ? (day = parseInt(d) - 1, is_successful = !0) : "DD" == f || "D" == f ? (day = d, 
                    is_successful = !0) : "hh" == f || "h" == f ? (hour = d, is_successful = !0) : ("mm" == f || "m" == f) && (min = d, 
                    is_successful = !0);
                }
                var date = new Date(year, month, day, hour, min);
                if (1 == is_successful && 0 == isNaN(date) && 0 == isNaN(date.getDate())) return date;
            }
        }
        var re = /^(\d{2,4})[-\/](\d{1,2})[-\/](\d{1,2}) (\d{1,2}):(\d{1,2})$/, m = re.exec(str);
        return null !== m ? (m[1] = normalizeYear(m[1]), date = new Date(m[1], m[2] - 1, m[3], m[4], m[5])) : (re = /^(\d{2,4})[-\/](\d{1,2})[-\/](\d{1,2})$/, 
        m = re.exec(str), null !== m && (m[1] = normalizeYear(m[1]), date = new Date(m[1], m[2] - 1, m[3]))), 
        0 == isNaN(date) && 0 == isNaN(date.getDate()) ? date : !1;
    }, getFormattedDate = function(date, date_format) {
        null == date && (date = new Date());
        var y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate(), hou = date.getHours(), min = date.getMinutes(), date_format = date_format.replace(/YYYY/gi, y).replace(/YY/g, y - 2e3).replace(/MM/g, zpadding(m)).replace(/M/g, m).replace(/DD/g, zpadding(d)).replace(/D/g, d).replace(/hh/g, zpadding(hou)).replace(/h/g, hou).replace(/mm/g, zpadding(min)).replace(/m/g, min);
        return date_format;
    }, outputToInputObject = function($picker) {
        var $inp = getPickersInputObject($picker);
        if (null != $inp) {
            var date = getPickedDate($picker), locale = $picker.data("locale"), format = getDateFormat($picker.data("dateFormat"), locale, $picker.data("dateOnly")), old = $inp.val();
            $inp.val(getFormattedDate(date, format)), old != $inp.val() && $inp.trigger("change");
        }
    }, getPickedDate = function($obj) {
        var $picker = getParentPickerObject($obj);
        return $picker.data("pickedDate");
    }, zpadding = function(num) {
        return num = ("0" + num).slice(-2);
    }, draw_date = function($picker, option, date) {
        draw($picker, option, date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
    }, translate = function(locale, s) {
        return "undefined" != typeof lang[locale][s] ? lang[locale][s] : lang.en[s];
    }, draw = function($picker, option, year, month, day, hour, min) {
        var date = new Date();
        date = null != hour ? new Date(year, month, day, hour, min, 0) : null != year ? new Date(year, month, day) : new Date();
        var isTodayButton = $picker.data("todayButton"), isScroll = option.isAnim;
        0 == $picker.data("timelistScroll") && (isScroll = !1);
        var isAnim = option.isAnim;
        0 == $picker.data("animation") && (isAnim = !1);
        var isFutureOnly = $picker.data("futureOnly"), minDate = $picker.data("minDate"), maxDate = $picker.data("maxDate"), isOutputToInputObject = option.isOutputToInputObject, minuteInterval = $picker.data("minuteInterval"), firstDayOfWeek = $picker.data("firstDayOfWeek"), minTime = $picker.data("minTime"), maxTime = $picker.data("maxTime"), locale = $picker.data("locale");
        lang.hasOwnProperty(locale) || (locale = "en");
        var todayDate = new Date(), firstWday = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - firstDayOfWeek, lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(), beforeMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate(), dateBeforeMonth = new Date(date.getFullYear(), date.getMonth(), 0), dateNextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0), isCurrentYear = todayDate.getFullYear() == date.getFullYear(), isCurrentMonth = isCurrentYear && todayDate.getMonth() == date.getMonth(), isCurrentDay = isCurrentMonth && todayDate.getDate() == date.getDate(), isPastMonth = !1;
        (date.getFullYear() < todayDate.getFullYear() || isCurrentYear && date.getMonth() < todayDate.getMonth()) && (isPastMonth = !0);
        var $header = $picker.children(".datepicker_header"), $calendar = ($picker.children(".datepicker_inner_container"), 
        $picker.children(".datepicker_inner_container").children(".datepicker_calendar")), $table = $calendar.children(".datepicker_table"), $timelist = $picker.children(".datepicker_inner_container").children(".datepicker_timelist"), changePoint = "", oldDate = getPickedDate($picker);
        null != oldDate && (oldDate.getMonth() != date.getMonth() || oldDate.getDate() != date.getDate() ? changePoint = "calendar" : (oldDate.getHours() != date.getHours() || oldDate.getMinutes() != date.getMinutes()) && (0 == date.getMinutes() || date.getMinutes() % minuteInterval == 0) && (changePoint = "timelist")), 
        $($picker).data("pickedDate", date), 1 == isAnim && ("calendar" == changePoint ? ($calendar.stop().queue([]), 
        $calendar.fadeTo("fast", .8)) : "timelist" == changePoint && ($timelist.stop().queue([]), 
        $timelist.fadeTo("fast", .8)));
        var drawBefore_timeList_scrollTop = $timelist.scrollTop(), timelist_activeTimeCell_offsetTop = -1;
        $header.children().remove();
        var cDate = new Date(date.getTime());
        if (cDate.setMinutes(59), cDate.setHours(23), cDate.setSeconds(59), cDate.setDate(0), 
        isFutureOnly && isCurrentMonth || !(null == minDate || minDate < cDate.getTime())) $picker.data("stateAllowBeforeMonth", !1); else {
            var $link_before_month = $("<a>");
            $link_before_month.text("<"), $link_before_month.prop("alt", translate(locale, "prevMonth")), 
            $link_before_month.prop("title", translate(locale, "prevMonth")), $link_before_month.click(function() {
                beforeMonth($picker);
            }), $picker.data("stateAllowBeforeMonth", !0);
        }
        cDate.setMinutes(0), cDate.setHours(0), cDate.setSeconds(0), cDate.setDate(1), cDate.setMonth(date.getMonth() + 1);
        var $now_month = $("<span>");
        if ($now_month.text(date.getFullYear() + " " + translate(locale, "sep") + " " + translate(locale, "months")[date.getMonth()]), 
        null == maxDate || maxDate > cDate.getTime()) {
            var $link_next_month = $("<a>");
            $link_next_month.text(">"), $link_next_month.prop("alt", translate(locale, "nextMonth")), 
            $link_next_month.prop("title", translate(locale, "nextMonth")), $link_next_month.click(function() {
                nextMonth($picker);
            });
        }
        if (isTodayButton) {
            var $link_today = $("<a/>");
            $link_today.html(decodeURIComponent("%3c%3fxml%20version%3d%221%2e0%22%20encoding%3d%22UTF%2d8%22%20standalone%3d%22no%22%3f%3e%3csvg%20%20xmlns%3adc%3d%22http%3a%2f%2fpurl%2eorg%2fdc%2felements%2f1%2e1%2f%22%20%20xmlns%3acc%3d%22http%3a%2f%2fcreativecommons%2eorg%2fns%23%22%20xmlns%3ardf%3d%22http%3a%2f%2fwww%2ew3%2eorg%2f1999%2f02%2f22%2drdf%2dsyntax%2dns%23%22%20%20xmlns%3asvg%3d%22http%3a%2f%2fwww%2ew3%2eorg%2f2000%2fsvg%22%20xmlns%3d%22http%3a%2f%2fwww%2ew3%2eorg%2f2000%2fsvg%22%20%20version%3d%221%2e1%22%20%20width%3d%22100%25%22%20%20height%3d%22100%25%22%20viewBox%3d%220%200%2010%2010%22%3e%3cg%20transform%3d%22translate%28%2d5%2e5772299%2c%2d26%2e54581%29%22%3e%3cpath%20d%3d%22m%2014%2e149807%2c31%2e130932%20c%200%2c%2d0%2e01241%200%2c%2d0%2e02481%20%2d0%2e0062%2c%2d0%2e03721%20L%2010%2e57723%2c28%2e153784%207%2e0108528%2c31%2e093719%20c%200%2c0%2e01241%20%2d0%2e0062%2c0%2e02481%20%2d0%2e0062%2c0%2e03721%20l%200%2c2%2e97715%20c%200%2c0%2e217084%200%2e1798696%2c0%2e396953%200%2e3969534%2c0%2e396953%20l%202%2e3817196%2c0%200%2c%2d2%2e38172%201%2e5878132%2c0%200%2c2%2e38172%202%2e381719%2c0%20c%200%2e217084%2c0%200%2e396953%2c%2d0%2e179869%200%2e396953%2c%2d0%2e396953%20l%200%2c%2d2%2e97715%20m%201%2e383134%2c%2d0%2e427964%20c%200%2e06823%2c%2d0%2e08063%200%2e05582%2c%2d0%2e210882%20%2d0%2e02481%2c%2d0%2e279108%20l%20%2d1%2e358324%2c%2d1%2e128837%200%2c%2d2%2e530576%20c%200%2c%2d0%2e111643%20%2d0%2e08683%2c%2d0%2e198477%20%2d0%2e198477%2c%2d0%2e198477%20l%20%2d1%2e190859%2c0%20c%20%2d0%2e111643%2c0%20%2d0%2e198477%2c0%2e08683%20%2d0%2e198477%2c0%2e198477%20l%200%2c1%2e209467%20%2d1%2e513384%2c%2d1%2e265289%20c%20%2d0%2e2605%2c%2d0%2e217083%20%2d0%2e682264%2c%2d0%2e217083%20%2d0%2e942764%2c0%20L%205%2e6463253%2c30%2e42386%20c%20%2d0%2e080631%2c0%2e06823%20%2d0%2e093036%2c0%2e198476%20%2d0%2e024809%2c0%2e279108%20l%200%2e3845485%2c0%2e458976%20c%200%2e031012%2c0%2e03721%200%2e080631%2c0%2e06203%200%2e1302503%2c0%2e06823%200%2e055821%2c0%2e0062%200%2e1054407%2c%2d0%2e01241%200%2e1488574%2c%2d0%2e04342%20l%204%2e2920565%2c%2d3%2e578782%204%2e292058%2c3%2e578782%20c%200%2e03721%2c0%2e03101%200%2e08063%2c0%2e04342%200%2e13025%2c0%2e04342%200%2e0062%2c0%200%2e01241%2c0%200%2e01861%2c0%200%2e04962%2c%2d0%2e0062%200%2e09924%2c%2d0%2e03101%200%2e130251%2c%2d0%2e06823%20l%200%2e384549%2c%2d0%2e458976%22%20%2f%3e%3c%2fg%3e%3c%2fsvg%3e")), 
            $link_today.addClass("icon-home"), $link_today.prop("alt", translate(locale, "today")), 
            $link_today.prop("title", translate(locale, "today")), $link_today.click(function() {
                setToNow($picker);
            }), $header.append($link_today);
        }
        $header.append($link_before_month), $header.append($now_month), $header.append($link_next_month), 
        $table.children().remove();
        var $tr = $("<tr>");
        $table.append($tr);
        for (var firstDayDiff = 7 + firstDayOfWeek, daysOfWeek = translate(locale, "days"), i = 0; 7 > i; i++) {
            var $td = $("<th>");
            $td.text(daysOfWeek[(i + firstDayDiff) % 7]), $tr.append($td);
        }
        var cellNum = 7 * Math.ceil((firstWday + lastDay) / 7), i = 0;
        0 > firstWday && (i = -7);
        var realDayObj = new Date(date.getTime());
        realDayObj.setHours(0), realDayObj.setMinutes(0), realDayObj.setSeconds(0);
        for (;cellNum > i; i++) {
            var realDay = i + 1 - firstWday, isPast = isPastMonth || isCurrentMonth && realDay < todayDate.getDate();
            i % 7 == 0 && ($tr = $("<tr>"), $table.append($tr));
            var $td = $("<td>");
            $td.data("day", realDay), $tr.append($td), firstWday > i ? ($td.text(beforeMonthLastDay + realDay), 
            $td.addClass("day_another_month"), $td.data("dateStr", dateBeforeMonth.getFullYear() + "/" + (dateBeforeMonth.getMonth() + 1) + "/" + (beforeMonthLastDay + realDay)), 
            realDayObj.setDate(beforeMonthLastDay + realDay), realDayObj.setMonth(dateBeforeMonth.getMonth()), 
            realDayObj.setYear(dateBeforeMonth.getFullYear())) : firstWday + lastDay > i ? ($td.text(realDay), 
            $td.data("dateStr", date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + realDay), 
            realDayObj.setDate(realDay), realDayObj.setMonth(date.getMonth()), realDayObj.setYear(date.getFullYear())) : ($td.text(realDay - lastDay), 
            $td.addClass("day_another_month"), $td.data("dateStr", dateNextMonth.getFullYear() + "/" + (dateNextMonth.getMonth() + 1) + "/" + (realDay - lastDay)), 
            realDayObj.setDate(realDay - lastDay), realDayObj.setMonth(dateNextMonth.getMonth()), 
            realDayObj.setYear(dateNextMonth.getFullYear())), (i + firstDayDiff) % 7 == 0 ? $td.addClass("wday_sun") : (i + firstDayDiff) % 7 == 6 && $td.addClass("wday_sat"), 
            realDay == date.getDate() && $td.addClass("active"), isCurrentMonth && realDay == todayDate.getDate() && $td.addClass("today");
            var realDayObjMN = new Date(realDayObj.getTime());
            realDayObjMN.setHours(23), realDayObjMN.setMinutes(59), realDayObjMN.setSeconds(59), 
            null != minDate && minDate > realDayObjMN.getTime() || null != maxDate && maxDate < realDayObj.getTime() ? $td.addClass("out_of_range") : isFutureOnly && isPast ? $td.addClass("day_in_past") : ($td.click(function() {
                $(this).hasClass("hover") && $(this).removeClass("hover"), $(this).addClass("active");
                var $picker = getParentPickerObject($(this)), targetDate = new Date($(this).data("dateStr")), selectedDate = getPickedDate($picker);
                draw($picker, {
                    isAnim: !1,
                    isOutputToInputObject: !0
                }, targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), selectedDate.getHours(), selectedDate.getMinutes()), 
                1 == $picker.data("dateOnly") && 0 == $picker.data("isInline") && $picker.data("closeOnSelected") && (ActivePickerId = -1, 
                $picker.hide());
            }), $td.hover(function() {
                $(this).hasClass("active") || $(this).addClass("hover");
            }, function() {
                $(this).hasClass("hover") && $(this).removeClass("hover");
            }));
        }
        if (1 == $picker.data("dateOnly")) $timelist.css("display", "none"); else {
            $timelist.children().remove(), $calendar.innerHeight() > 0 && $timelist.css("height", $calendar.innerHeight() - 10 + "px"), 
            realDayObj = new Date(date.getTime()), $timelist.css("height", $calendar.innerHeight() - 10 + "px");
            for (var hour = minTime[0], min = minTime[1]; 100 * hour + min < 100 * maxTime[0] + maxTime[1]; ) {
                var $o = $("<div>"), isPastTime = hour < todayDate.getHours() || hour == todayDate.getHours() && min < todayDate.getMinutes(), isPast = isCurrentDay && isPastTime;
                $o.addClass("timelist_item"), $o.text(zpadding(hour) + ":" + zpadding(min)), $o.data("hour", hour), 
                $o.data("min", min), $timelist.append($o), realDayObj.setHours(hour), realDayObj.setMinutes(min), 
                null != minDate && minDate > realDayObj.getTime() || null != maxDate && maxDate < realDayObj.getTime() ? $o.addClass("out_of_range") : isFutureOnly && isPast ? $o.addClass("time_in_past") : ($o.click(function() {
                    $(this).hasClass("hover") && $(this).removeClass("hover"), $(this).addClass("active");
                    var $picker = getParentPickerObject($(this)), date = getPickedDate($picker), hour = $(this).data("hour"), min = $(this).data("min");
                    draw($picker, {
                        isAnim: !1,
                        isOutputToInputObject: !0
                    }, date.getFullYear(), date.getMonth(), date.getDate(), hour, min), 0 == $picker.data("isInline") && $picker.data("closeOnSelected") && (ActivePickerId = -1, 
                    $picker.hide());
                }), $o.hover(function() {
                    $(this).hasClass("active") || $(this).addClass("hover");
                }, function() {
                    $(this).hasClass("hover") && $(this).removeClass("hover");
                })), hour == date.getHours() && min == date.getMinutes() && ($o.addClass("active"), 
                timelist_activeTimeCell_offsetTop = $o.offset().top), isFutureOnly && isPast ? $o.addClass("time_in_past") : ($o.click(function() {
                    $(this).hasClass("hover") && $(this).removeClass("hover"), $(this).addClass("active");
                    var $picker = getParentPickerObject($(this)), date = getPickedDate($picker), hour = $(this).data("hour"), min = $(this).data("min");
                    draw($picker, {
                        isAnim: !1,
                        isOutputToInputObject: !0
                    }, date.getFullYear(), date.getMonth(), date.getDate(), hour, min), 0 == $picker.data("isInline") && $picker.data("closeOnSelected") && (ActivePickerId = -1, 
                    $picker.hide());
                }), $o.hover(function() {
                    $(this).hasClass("active") || $(this).addClass("hover");
                }, function() {
                    $(this).hasClass("hover") && $(this).removeClass("hover");
                })), min += minuteInterval, min >= 60 && (min -= 60, hour++);
            }
            $timelist.scrollTop(1 == isScroll ? timelist_activeTimeCell_offsetTop - $timelist.offset().top : drawBefore_timeList_scrollTop);
        }
        1 == isAnim && ("calendar" == changePoint ? $calendar.fadeTo("fast", 1) : "timelist" == changePoint && $timelist.fadeTo("fast", 1)), 
        1 == isOutputToInputObject && outputToInputObject($picker);
    }, init = function($obj, opt) {
        var $picker = $("<div>");
        if ($picker.destroy = function() {
            window.alert("destroy!");
        }, $picker.addClass("datepicker"), $obj.append($picker), opt.current) {
            var format = getDateFormat(opt.dateFormat, opt.locale, opt.dateOnly), date = parseDate(opt.current, format);
            opt.current = date ? date : new Date();
        } else opt.current = new Date();
        null != opt.inputObjectId && $picker.data("inputObjectId", opt.inputObjectId), $picker.data("dateOnly", opt.dateOnly), 
        $picker.data("pickerId", PickerObjects.length), $picker.data("dateFormat", opt.dateFormat), 
        $picker.data("locale", opt.locale), $picker.data("firstDayOfWeek", opt.firstDayOfWeek), 
        $picker.data("animation", opt.animation), $picker.data("closeOnSelected", opt.closeOnSelected), 
        $picker.data("timelistScroll", opt.timelistScroll), $picker.data("calendarMouseScroll", opt.calendarMouseScroll), 
        $picker.data("todayButton", opt.todayButton), $picker.data("futureOnly", opt.futureOnly), 
        $picker.data("onShow", opt.onShow), $picker.data("onHide", opt.onHide), $picker.data("onInit", opt.onInit);
        var minDate = Date.parse(opt.minDate);
        isNaN(minDate) ? $picker.data("minDate", null) : $picker.data("minDate", minDate);
        var maxDate = Date.parse(opt.maxDate);
        isNaN(maxDate) ? $picker.data("maxDate", null) : $picker.data("maxDate", maxDate), 
        $picker.data("state", 0), 5 <= opt.minuteInterval && opt.minuteInterval <= 30 ? $picker.data("minuteInterval", opt.minuteInterval) : $picker.data("minuteInterval", 30), 
        opt.minTime = opt.minTime.split(":"), opt.maxTime = opt.maxTime.split(":"), opt.minTime[0] >= 0 && opt.minTime[0] < 24 || (opt.minTime[0] = "00"), 
        opt.maxTime[0] >= 0 && opt.maxTime[0] < 24 || (opt.maxTime[0] = "23"), opt.minTime[1] >= 0 && opt.minTime[1] < 60 || (opt.minTime[1] = "00"), 
        opt.maxTime[1] >= 0 && opt.maxTime[1] < 24 || (opt.maxTime[1] = "59"), opt.minTime[0] = parseInt(opt.minTime[0]), 
        opt.minTime[1] = parseInt(opt.minTime[1]), opt.maxTime[0] = parseInt(opt.maxTime[0]), 
        opt.maxTime[1] = parseInt(opt.maxTime[1]), $picker.data("minTime", opt.minTime), 
        $picker.data("maxTime", opt.maxTime);
        var $header = $("<div>");
        $header.addClass("datepicker_header"), $picker.append($header);
        var $inner = $("<div>");
        $inner.addClass("datepicker_inner_container"), $picker.append($inner);
        var $calendar = $("<div>");
        $calendar.addClass("datepicker_calendar");
        var $table = $("<table>");
        $table.addClass("datepicker_table"), $calendar.append($table), $inner.append($calendar);
        var $timelist = $("<div>");
        $timelist.addClass("datepicker_timelist"), $inner.append($timelist), $picker.hover(function() {
            ActivePickerId = $(this).data("pickerId");
        }, function() {
            ActivePickerId = -1;
        }), opt.calendarMouseScroll && (window.sidebar ? $calendar.bind("DOMMouseScroll", function(e) {
            var $picker = getParentPickerObject($(this)), delta = e.originalEvent.detail;
            return delta > 0 ? nextMonth($picker) : beforeMonth($picker), !1;
        }) : $calendar.bind("mousewheel", function(e) {
            var $picker = getParentPickerObject($(this));
            return e.originalEvent.wheelDelta / 120 > 0 ? beforeMonth($picker) : nextMonth($picker), 
            !1;
        })), PickerObjects.push($picker), draw_date($picker, {
            isAnim: !0,
            isOutputToInputObject: opt.autodateOnStart
        }, opt.current);
    }, getDefaults = function() {
        return {
            current: null,
            dateFormat: "default",
            locale: "en",
            animation: !0,
            minuteInterval: 30,
            firstDayOfWeek: 0,
            closeOnSelected: !1,
            timelistScroll: !0,
            calendarMouseScroll: !0,
            todayButton: !0,
            dateOnly: !1,
            futureOnly: !1,
            minDate: null,
            maxDate: null,
            autodateOnStart: !0,
            minTime: "00:00",
            maxTime: "23:59",
            onShow: null,
            onHide: null
        };
    };
    $.fn.dtpicker = function(config) {
        var defaults = (new Date(), getDefaults());
        defaults.inputObjectId = void 0;
        var options = $.extend(defaults, config);
        return this.each(function() {
            init($(this), options);
        });
    }, $.fn.appendDtpicker = function(config) {
        var defaults = (new Date(), getDefaults());
        defaults.inline = !1;
        var options = $.extend(defaults, config);
        return this.each(function() {
            var input = this;
            if (0 < $(PickerObjects[$(input).data("pickerId")]).length) return void console.log("dtpicker - Already exist appended picker");
            var inputObjectId = InputObjects.length;
            InputObjects.push(input), options.inputObjectId = inputObjectId;
            null != $(input).val() && "" != $(input).val() && (options.current = $(input).val());
            var $d = $("<div>");
            0 == options.inline && $d.css("position", "absolute"), $d.insertAfter(input);
            var pickerId = PickerObjects.length, $picker_parent = $($d).dtpicker(options), $picker = $picker_parent.children(".datepicker");
            $(input).data("pickerId", pickerId), $(input).keyup(function() {
                var $input = $(this), $picker = $(PickerObjects[$input.data("pickerId")]);
                if (null != $input.val() && (null == $input.data("beforeVal") || null != $input.data("beforeVal") && $input.data("beforeVal") != $input.val())) {
                    var format = getDateFormat($picker.data("dateFormat"), $picker.data("locale"), $picker.data("dateOnly")), date = parseDate($input.val(), format);
                    date && draw_date($picker, {
                        isAnim: !0,
                        isOutputToInputObject: !1
                    }, date);
                }
                $input.data("beforeVal", $input.val());
            }), $(input).change(function() {
                $(this).trigger("keyup");
            }), 1 == options.inline ? $picker.data("isInline", !0) : ($picker.data("isInline", !1), 
            $picker_parent.css({
                zIndex: 100
            }), $picker.css("width", "auto"), $picker.hide(), $(input).on("click, focus", function() {
                console.log("onClick");
                var $input = $(this), $picker = $(PickerObjects[$input.data("pickerId")]), handler = new PickerHandler($picker, $input), is_showed = handler.isShow();
                if (!is_showed) {
                    handler.show();
                    var func = $picker.data("onShow");
                    null != func && (console.log("dtpicker- Call the onShow handler"), func(handler));
                }
            }));
            var handler = new PickerHandler($picker, $(input)), func = $picker.data("onInit");
            null != func && (console.log("dtpicker- Call the onInit handler"), func(handler));
        });
    };
    var methods = {
        show: function() {
            var $input = $(this), $picker = $(PickerObjects[$input.data("pickerId")]);
            if (null != $picker) {
                var handler = new PickerHandler($picker, $input);
                handler.show();
            }
        },
        hide: function() {
            var $input = $(this), $picker = $(PickerObjects[$input.data("pickerId")]);
            if (null != $picker) {
                var handler = new PickerHandler($picker, $input);
                handler.hide();
            }
        },
        destroy: function() {
            var $input = $(this), $picker = $(PickerObjects[$input.data("pickerId")]);
            if (null != $picker) {
                var handler = new PickerHandler($picker, $input);
                handler.destroy();
            }
        }
    };
    $.fn.handleDtpicker = function(method) {
        return methods[method] ? methods[method].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof method && method ? void $.error("Method " + method + " does not exist on jQuery.handleDtpicker") : methods.init.apply(this, arguments);
    }, $(function() {
        $("body").click(function() {
            for (var i = 0; i < PickerObjects.length; i++) {
                var $picker = $(PickerObjects[i]);
                if (ActivePickerId != i && null != $picker.data("inputObjectId") && 0 == $picker.data("isInline") && "none" != $picker.css("display")) {
                    var $input = InputObjects[$picker.data("inputObjectId")], handler = new PickerHandler($picker, $input);
                    handler.hide();
                    var func = $picker.data("onHide");
                    null != func && (console.log("dtpicker- Call the onHide handler"), func(handler));
                }
            }
        });
    });
}(jQuery), angular.module("ui.bootstrap-slider", []).directive("slider", [ "$parse", "$timeout", function($parse, $timeout) {
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
}), angular.module("ui.bootstrap", [ "ui.bootstrap.tpls", "ui.bootstrap.transition", "ui.bootstrap.collapse", "ui.bootstrap.accordion", "ui.bootstrap.alert", "ui.bootstrap.bindHtml", "ui.bootstrap.buttons", "ui.bootstrap.carousel", "ui.bootstrap.dateparser", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.dropdown", "ui.bootstrap.modal", "ui.bootstrap.pagination", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.progressbar", "ui.bootstrap.rating", "ui.bootstrap.tabs", "ui.bootstrap.timepicker", "ui.bootstrap.typeahead" ]), 
angular.module("ui.bootstrap.tpls", [ "template/accordion/accordion-group.html", "template/accordion/accordion.html", "template/alert/alert.html", "template/carousel/carousel.html", "template/carousel/slide.html", "template/datepicker/datepicker.html", "template/datepicker/day.html", "template/datepicker/month.html", "template/datepicker/popup.html", "template/datepicker/year.html", "template/modal/backdrop.html", "template/modal/window.html", "template/pagination/pager.html", "template/pagination/pagination.html", "template/tooltip/tooltip-html-unsafe-popup.html", "template/tooltip/tooltip-popup.html", "template/popover/popover.html", "template/progressbar/bar.html", "template/progressbar/progress.html", "template/progressbar/progressbar.html", "template/rating/rating.html", "template/tabs/tab.html", "template/tabs/tabset.html", "template/timepicker/timepicker.html", "template/typeahead/typeahead-match.html", "template/typeahead/typeahead-popup.html" ]), 
angular.module("ui.bootstrap.transition", []).factory("$transition", [ "$q", "$timeout", "$rootScope", function(a, b, c) {
    function d(a) {
        for (var b in a) if (void 0 !== f.style[b]) return a[b];
    }
    var e = function(d, f, g) {
        g = g || {};
        var h = a.defer(), i = e[g.animation ? "animationEndEventName" : "transitionEndEventName"], j = function() {
            c.$apply(function() {
                d.unbind(i, j), h.resolve(d);
            });
        };
        return i && d.bind(i, j), b(function() {
            angular.isString(f) ? d.addClass(f) : angular.isFunction(f) ? f(d) : angular.isObject(f) && d.css(f), 
            i || h.resolve(d);
        }), h.promise.cancel = function() {
            i && d.unbind(i, j), h.reject("Transition cancelled");
        }, h.promise;
    }, f = document.createElement("trans"), g = {
        WebkitTransition: "webkitTransitionEnd",
        MozTransition: "transitionend",
        OTransition: "oTransitionEnd",
        transition: "transitionend"
    }, h = {
        WebkitTransition: "webkitAnimationEnd",
        MozTransition: "animationend",
        OTransition: "oAnimationEnd",
        transition: "animationend"
    };
    return e.transitionEndEventName = d(g), e.animationEndEventName = d(h), e;
} ]), angular.module("ui.bootstrap.collapse", [ "ui.bootstrap.transition" ]).directive("collapse", [ "$transition", function(a) {
    return {
        link: function(b, c, d) {
            function e(b) {
                function d() {
                    j === e && (j = void 0);
                }
                var e = a(c, b);
                return j && j.cancel(), j = e, e.then(d, d), e;
            }
            function f() {
                k ? (k = !1, g()) : (c.removeClass("collapse").addClass("collapsing"), e({
                    height: c[0].scrollHeight + "px"
                }).then(g));
            }
            function g() {
                c.removeClass("collapsing"), c.addClass("collapse in"), c.css({
                    height: "auto"
                });
            }
            function h() {
                k ? (k = !1, i(), c.css({
                    height: 0
                })) : (c.css({
                    height: c[0].scrollHeight + "px"
                }), c[0].offsetWidth, c.removeClass("collapse in").addClass("collapsing"), e({
                    height: 0
                }).then(i));
            }
            function i() {
                c.removeClass("collapsing"), c.addClass("collapse");
            }
            var j, k = !0;
            b.$watch(d.collapse, function(a) {
                a ? h() : f();
            });
        }
    };
} ]), angular.module("ui.bootstrap.accordion", [ "ui.bootstrap.collapse" ]).constant("accordionConfig", {
    closeOthers: !0
}).controller("AccordionController", [ "$scope", "$attrs", "accordionConfig", function(a, b, c) {
    this.groups = [], this.closeOthers = function(d) {
        var e = angular.isDefined(b.closeOthers) ? a.$eval(b.closeOthers) : c.closeOthers;
        e && angular.forEach(this.groups, function(a) {
            a !== d && (a.isOpen = !1);
        });
    }, this.addGroup = function(a) {
        var b = this;
        this.groups.push(a), a.$on("$destroy", function() {
            b.removeGroup(a);
        });
    }, this.removeGroup = function(a) {
        var b = this.groups.indexOf(a);
        -1 !== b && this.groups.splice(b, 1);
    };
} ]).directive("accordion", function() {
    return {
        restrict: "EA",
        controller: "AccordionController",
        transclude: !0,
        replace: !1,
        templateUrl: "template/accordion/accordion.html"
    };
}).directive("accordionGroup", function() {
    return {
        require: "^accordion",
        restrict: "EA",
        transclude: !0,
        replace: !0,
        templateUrl: "template/accordion/accordion-group.html",
        scope: {
            heading: "@",
            isOpen: "=?",
            isDisabled: "=?"
        },
        controller: function() {
            this.setHeading = function(a) {
                this.heading = a;
            };
        },
        link: function(a, b, c, d) {
            d.addGroup(a), a.$watch("isOpen", function(b) {
                b && d.closeOthers(a);
            }), a.toggleOpen = function() {
                a.isDisabled || (a.isOpen = !a.isOpen);
            };
        }
    };
}).directive("accordionHeading", function() {
    return {
        restrict: "EA",
        transclude: !0,
        template: "",
        replace: !0,
        require: "^accordionGroup",
        link: function(a, b, c, d, e) {
            d.setHeading(e(a, function() {}));
        }
    };
}).directive("accordionTransclude", function() {
    return {
        require: "^accordionGroup",
        link: function(a, b, c, d) {
            a.$watch(function() {
                return d[c.accordionTransclude];
            }, function(a) {
                a && (b.html(""), b.append(a));
            });
        }
    };
}), angular.module("ui.bootstrap.alert", []).controller("AlertController", [ "$scope", "$attrs", function(a, b) {
    a.closeable = "close" in b;
} ]).directive("alert", function() {
    return {
        restrict: "EA",
        controller: "AlertController",
        templateUrl: "template/alert/alert.html",
        transclude: !0,
        replace: !0,
        scope: {
            type: "@",
            close: "&"
        }
    };
}), angular.module("ui.bootstrap.bindHtml", []).directive("bindHtmlUnsafe", function() {
    return function(a, b, c) {
        b.addClass("ng-binding").data("$binding", c.bindHtmlUnsafe), a.$watch(c.bindHtmlUnsafe, function(a) {
            b.html(a || "");
        });
    };
}), angular.module("ui.bootstrap.buttons", []).constant("buttonConfig", {
    activeClass: "active",
    toggleEvent: "click"
}).controller("ButtonsController", [ "buttonConfig", function(a) {
    this.activeClass = a.activeClass || "active", this.toggleEvent = a.toggleEvent || "click";
} ]).directive("btnRadio", function() {
    return {
        require: [ "btnRadio", "ngModel" ],
        controller: "ButtonsController",
        link: function(a, b, c, d) {
            var e = d[0], f = d[1];
            f.$render = function() {
                b.toggleClass(e.activeClass, angular.equals(f.$modelValue, a.$eval(c.btnRadio)));
            }, b.bind(e.toggleEvent, function() {
                var d = b.hasClass(e.activeClass);
                (!d || angular.isDefined(c.uncheckable)) && a.$apply(function() {
                    f.$setViewValue(d ? null : a.$eval(c.btnRadio)), f.$render();
                });
            });
        }
    };
}).directive("btnCheckbox", function() {
    return {
        require: [ "btnCheckbox", "ngModel" ],
        controller: "ButtonsController",
        link: function(a, b, c, d) {
            function e() {
                return g(c.btnCheckboxTrue, !0);
            }
            function f() {
                return g(c.btnCheckboxFalse, !1);
            }
            function g(b, c) {
                var d = a.$eval(b);
                return angular.isDefined(d) ? d : c;
            }
            var h = d[0], i = d[1];
            i.$render = function() {
                b.toggleClass(h.activeClass, angular.equals(i.$modelValue, e()));
            }, b.bind(h.toggleEvent, function() {
                a.$apply(function() {
                    i.$setViewValue(b.hasClass(h.activeClass) ? f() : e()), i.$render();
                });
            });
        }
    };
}), angular.module("ui.bootstrap.carousel", [ "ui.bootstrap.transition" ]).controller("CarouselController", [ "$scope", "$timeout", "$transition", function(a, b, c) {
    function d() {
        e();
        var c = +a.interval;
        !isNaN(c) && c >= 0 && (g = b(f, c));
    }
    function e() {
        g && (b.cancel(g), g = null);
    }
    function f() {
        h ? (a.next(), d()) : a.pause();
    }
    var g, h, i = this, j = i.slides = a.slides = [], k = -1;
    i.currentSlide = null;
    var l = !1;
    i.select = a.select = function(e, f) {
        function g() {
            l || (i.currentSlide && angular.isString(f) && !a.noTransition && e.$element ? (e.$element.addClass(f), 
            e.$element[0].offsetWidth, angular.forEach(j, function(a) {
                angular.extend(a, {
                    direction: "",
                    entering: !1,
                    leaving: !1,
                    active: !1
                });
            }), angular.extend(e, {
                direction: f,
                active: !0,
                entering: !0
            }), angular.extend(i.currentSlide || {}, {
                direction: f,
                leaving: !0
            }), a.$currentTransition = c(e.$element, {}), function(b, c) {
                a.$currentTransition.then(function() {
                    h(b, c);
                }, function() {
                    h(b, c);
                });
            }(e, i.currentSlide)) : h(e, i.currentSlide), i.currentSlide = e, k = m, d());
        }
        function h(b, c) {
            angular.extend(b, {
                direction: "",
                active: !0,
                leaving: !1,
                entering: !1
            }), angular.extend(c || {}, {
                direction: "",
                active: !1,
                leaving: !1,
                entering: !1
            }), a.$currentTransition = null;
        }
        var m = j.indexOf(e);
        void 0 === f && (f = m > k ? "next" : "prev"), e && e !== i.currentSlide && (a.$currentTransition ? (a.$currentTransition.cancel(), 
        b(g)) : g());
    }, a.$on("$destroy", function() {
        l = !0;
    }), i.indexOfSlide = function(a) {
        return j.indexOf(a);
    }, a.next = function() {
        var b = (k + 1) % j.length;
        return a.$currentTransition ? void 0 : i.select(j[b], "next");
    }, a.prev = function() {
        var b = 0 > k - 1 ? j.length - 1 : k - 1;
        return a.$currentTransition ? void 0 : i.select(j[b], "prev");
    }, a.isActive = function(a) {
        return i.currentSlide === a;
    }, a.$watch("interval", d), a.$on("$destroy", e), a.play = function() {
        h || (h = !0, d());
    }, a.pause = function() {
        a.noPause || (h = !1, e());
    }, i.addSlide = function(b, c) {
        b.$element = c, j.push(b), 1 === j.length || b.active ? (i.select(j[j.length - 1]), 
        1 == j.length && a.play()) : b.active = !1;
    }, i.removeSlide = function(a) {
        var b = j.indexOf(a);
        j.splice(b, 1), j.length > 0 && a.active ? i.select(b >= j.length ? j[b - 1] : j[b]) : k > b && k--;
    };
} ]).directive("carousel", [ function() {
    return {
        restrict: "EA",
        transclude: !0,
        replace: !0,
        controller: "CarouselController",
        require: "carousel",
        templateUrl: "template/carousel/carousel.html",
        scope: {
            interval: "=",
            noTransition: "=",
            noPause: "="
        }
    };
} ]).directive("slide", function() {
    return {
        require: "^carousel",
        restrict: "EA",
        transclude: !0,
        replace: !0,
        templateUrl: "template/carousel/slide.html",
        scope: {
            active: "=?"
        },
        link: function(a, b, c, d) {
            d.addSlide(a, b), a.$on("$destroy", function() {
                d.removeSlide(a);
            }), a.$watch("active", function(b) {
                b && d.select(a);
            });
        }
    };
}), angular.module("ui.bootstrap.dateparser", []).service("dateParser", [ "$locale", "orderByFilter", function(a, b) {
    function c(a) {
        var c = [], d = a.split("");
        return angular.forEach(e, function(b, e) {
            var f = a.indexOf(e);
            if (f > -1) {
                a = a.split(""), d[f] = "(" + b.regex + ")", a[f] = "$";
                for (var g = f + 1, h = f + e.length; h > g; g++) d[g] = "", a[g] = "$";
                a = a.join(""), c.push({
                    index: f,
                    apply: b.apply
                });
            }
        }), {
            regex: new RegExp("^" + d.join("") + "$"),
            map: b(c, "index")
        };
    }
    function d(a, b, c) {
        return 1 === b && c > 28 ? 29 === c && (a % 4 === 0 && a % 100 !== 0 || a % 400 === 0) : 3 === b || 5 === b || 8 === b || 10 === b ? 31 > c : !0;
    }
    this.parsers = {};
    var e = {
        yyyy: {
            regex: "\\d{4}",
            apply: function(a) {
                this.year = +a;
            }
        },
        yy: {
            regex: "\\d{2}",
            apply: function(a) {
                this.year = +a + 2e3;
            }
        },
        y: {
            regex: "\\d{1,4}",
            apply: function(a) {
                this.year = +a;
            }
        },
        MMMM: {
            regex: a.DATETIME_FORMATS.MONTH.join("|"),
            apply: function(b) {
                this.month = a.DATETIME_FORMATS.MONTH.indexOf(b);
            }
        },
        MMM: {
            regex: a.DATETIME_FORMATS.SHORTMONTH.join("|"),
            apply: function(b) {
                this.month = a.DATETIME_FORMATS.SHORTMONTH.indexOf(b);
            }
        },
        MM: {
            regex: "0[1-9]|1[0-2]",
            apply: function(a) {
                this.month = a - 1;
            }
        },
        M: {
            regex: "[1-9]|1[0-2]",
            apply: function(a) {
                this.month = a - 1;
            }
        },
        dd: {
            regex: "[0-2][0-9]{1}|3[0-1]{1}",
            apply: function(a) {
                this.date = +a;
            }
        },
        d: {
            regex: "[1-2]?[0-9]{1}|3[0-1]{1}",
            apply: function(a) {
                this.date = +a;
            }
        },
        EEEE: {
            regex: a.DATETIME_FORMATS.DAY.join("|")
        },
        EEE: {
            regex: a.DATETIME_FORMATS.SHORTDAY.join("|")
        }
    };
    this.parse = function(b, e) {
        if (!angular.isString(b) || !e) return b;
        e = a.DATETIME_FORMATS[e] || e, this.parsers[e] || (this.parsers[e] = c(e));
        var f = this.parsers[e], g = f.regex, h = f.map, i = b.match(g);
        if (i && i.length) {
            for (var j, k = {
                year: 1900,
                month: 0,
                date: 1,
                hours: 0
            }, l = 1, m = i.length; m > l; l++) {
                var n = h[l - 1];
                n.apply && n.apply.call(k, i[l]);
            }
            return d(k.year, k.month, k.date) && (j = new Date(k.year, k.month, k.date, k.hours)), 
            j;
        }
    };
} ]), angular.module("ui.bootstrap.position", []).factory("$position", [ "$document", "$window", function(a, b) {
    function c(a, c) {
        return a.currentStyle ? a.currentStyle[c] : b.getComputedStyle ? b.getComputedStyle(a)[c] : a.style[c];
    }
    function d(a) {
        return "static" === (c(a, "position") || "static");
    }
    var e = function(b) {
        for (var c = a[0], e = b.offsetParent || c; e && e !== c && d(e); ) e = e.offsetParent;
        return e || c;
    };
    return {
        position: function(b) {
            var c = this.offset(b), d = {
                top: 0,
                left: 0
            }, f = e(b[0]);
            f != a[0] && (d = this.offset(angular.element(f)), d.top += f.clientTop - f.scrollTop, 
            d.left += f.clientLeft - f.scrollLeft);
            var g = b[0].getBoundingClientRect();
            return {
                width: g.width || b.prop("offsetWidth"),
                height: g.height || b.prop("offsetHeight"),
                top: c.top - d.top,
                left: c.left - d.left
            };
        },
        offset: function(c) {
            var d = c[0].getBoundingClientRect();
            return {
                width: d.width || c.prop("offsetWidth"),
                height: d.height || c.prop("offsetHeight"),
                top: d.top + (b.pageYOffset || a[0].documentElement.scrollTop),
                left: d.left + (b.pageXOffset || a[0].documentElement.scrollLeft)
            };
        },
        positionElements: function(a, b, c, d) {
            var e, f, g, h, i = c.split("-"), j = i[0], k = i[1] || "center";
            e = d ? this.offset(a) : this.position(a), f = b.prop("offsetWidth"), g = b.prop("offsetHeight");
            var l = {
                center: function() {
                    return e.left + e.width / 2 - f / 2;
                },
                left: function() {
                    return e.left;
                },
                right: function() {
                    return e.left + e.width;
                }
            }, m = {
                center: function() {
                    return e.top + e.height / 2 - g / 2;
                },
                top: function() {
                    return e.top;
                },
                bottom: function() {
                    return e.top + e.height;
                }
            };
            switch (j) {
              case "right":
                h = {
                    top: m[k](),
                    left: l[j]()
                };
                break;

              case "left":
                h = {
                    top: m[k](),
                    left: e.left - f
                };
                break;

              case "bottom":
                h = {
                    top: m[j](),
                    left: l[k]()
                };
                break;

              default:
                h = {
                    top: e.top - g,
                    left: l[k]()
                };
            }
            return h;
        }
    };
} ]), angular.module("ui.bootstrap.datepicker", [ "ui.bootstrap.dateparser", "ui.bootstrap.position" ]).constant("datepickerConfig", {
    formatDay: "dd",
    formatMonth: "MMMM",
    formatYear: "yyyy",
    formatDayHeader: "EEE",
    formatDayTitle: "MMMM yyyy",
    formatMonthTitle: "yyyy",
    datepickerMode: "day",
    minMode: "day",
    maxMode: "year",
    showWeeks: !0,
    startingDay: 0,
    yearRange: 20,
    minDate: null,
    maxDate: null
}).controller("DatepickerController", [ "$scope", "$attrs", "$parse", "$interpolate", "$timeout", "$log", "dateFilter", "datepickerConfig", function(a, b, c, d, e, f, g, h) {
    var i = this, j = {
        $setViewValue: angular.noop
    };
    this.modes = [ "day", "month", "year" ], angular.forEach([ "formatDay", "formatMonth", "formatYear", "formatDayHeader", "formatDayTitle", "formatMonthTitle", "minMode", "maxMode", "showWeeks", "startingDay", "yearRange" ], function(c, e) {
        i[c] = angular.isDefined(b[c]) ? 8 > e ? d(b[c])(a.$parent) : a.$parent.$eval(b[c]) : h[c];
    }), angular.forEach([ "minDate", "maxDate" ], function(d) {
        b[d] ? a.$parent.$watch(c(b[d]), function(a) {
            i[d] = a ? new Date(a) : null, i.refreshView();
        }) : i[d] = h[d] ? new Date(h[d]) : null;
    }), a.datepickerMode = a.datepickerMode || h.datepickerMode, a.uniqueId = "datepicker-" + a.$id + "-" + Math.floor(1e4 * Math.random()), 
    this.activeDate = angular.isDefined(b.initDate) ? a.$parent.$eval(b.initDate) : new Date(), 
    a.isActive = function(b) {
        return 0 === i.compare(b.date, i.activeDate) ? (a.activeDateId = b.uid, !0) : !1;
    }, this.init = function(a) {
        j = a, j.$render = function() {
            i.render();
        };
    }, this.render = function() {
        if (j.$modelValue) {
            var a = new Date(j.$modelValue), b = !isNaN(a);
            b ? this.activeDate = a : f.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'), 
            j.$setValidity("date", b);
        }
        this.refreshView();
    }, this.refreshView = function() {
        if (this.element) {
            this._refreshView();
            var a = j.$modelValue ? new Date(j.$modelValue) : null;
            j.$setValidity("date-disabled", !a || this.element && !this.isDisabled(a));
        }
    }, this.createDateObject = function(a, b) {
        var c = j.$modelValue ? new Date(j.$modelValue) : null;
        return {
            date: a,
            label: g(a, b),
            selected: c && 0 === this.compare(a, c),
            disabled: this.isDisabled(a),
            current: 0 === this.compare(a, new Date())
        };
    }, this.isDisabled = function(c) {
        return this.minDate && this.compare(c, this.minDate) < 0 || this.maxDate && this.compare(c, this.maxDate) > 0 || b.dateDisabled && a.dateDisabled({
            date: c,
            mode: a.datepickerMode
        });
    }, this.split = function(a, b) {
        for (var c = []; a.length > 0; ) c.push(a.splice(0, b));
        return c;
    }, a.select = function(b) {
        if (a.datepickerMode === i.minMode) {
            var c = j.$modelValue ? new Date(j.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
            c.setFullYear(b.getFullYear(), b.getMonth(), b.getDate()), j.$setViewValue(c), j.$render();
        } else i.activeDate = b, a.datepickerMode = i.modes[i.modes.indexOf(a.datepickerMode) - 1];
    }, a.move = function(a) {
        var b = i.activeDate.getFullYear() + a * (i.step.years || 0), c = i.activeDate.getMonth() + a * (i.step.months || 0);
        i.activeDate.setFullYear(b, c, 1), i.refreshView();
    }, a.toggleMode = function(b) {
        b = b || 1, a.datepickerMode === i.maxMode && 1 === b || a.datepickerMode === i.minMode && -1 === b || (a.datepickerMode = i.modes[i.modes.indexOf(a.datepickerMode) + b]);
    }, a.keys = {
        13: "enter",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down"
    };
    var k = function() {
        e(function() {
            i.element[0].focus();
        }, 0, !1);
    };
    a.$on("datepicker.focus", k), a.keydown = function(b) {
        var c = a.keys[b.which];
        if (c && !b.shiftKey && !b.altKey) if (b.preventDefault(), b.stopPropagation(), 
        "enter" === c || "space" === c) {
            if (i.isDisabled(i.activeDate)) return;
            a.select(i.activeDate), k();
        } else !b.ctrlKey || "up" !== c && "down" !== c ? (i.handleKeyDown(c, b), i.refreshView()) : (a.toggleMode("up" === c ? 1 : -1), 
        k());
    };
} ]).directive("datepicker", function() {
    return {
        restrict: "EA",
        replace: !0,
        templateUrl: "template/datepicker/datepicker.html",
        scope: {
            datepickerMode: "=?",
            dateDisabled: "&"
        },
        require: [ "datepicker", "?^ngModel" ],
        controller: "DatepickerController",
        link: function(a, b, c, d) {
            var e = d[0], f = d[1];
            f && e.init(f);
        }
    };
}).directive("daypicker", [ "dateFilter", function(a) {
    return {
        restrict: "EA",
        replace: !0,
        templateUrl: "template/datepicker/day.html",
        require: "^datepicker",
        link: function(b, c, d, e) {
            function f(a, b) {
                return 1 !== b || a % 4 !== 0 || a % 100 === 0 && a % 400 !== 0 ? i[b] : 29;
            }
            function g(a, b) {
                var c = new Array(b), d = new Date(a), e = 0;
                for (d.setHours(12); b > e; ) c[e++] = new Date(d), d.setDate(d.getDate() + 1);
                return c;
            }
            function h(a) {
                var b = new Date(a);
                b.setDate(b.getDate() + 4 - (b.getDay() || 7));
                var c = b.getTime();
                return b.setMonth(0), b.setDate(1), Math.floor(Math.round((c - b) / 864e5) / 7) + 1;
            }
            b.showWeeks = e.showWeeks, e.step = {
                months: 1
            }, e.element = c;
            var i = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
            e._refreshView = function() {
                var c = e.activeDate.getFullYear(), d = e.activeDate.getMonth(), f = new Date(c, d, 1), i = e.startingDay - f.getDay(), j = i > 0 ? 7 - i : -i, k = new Date(f);
                j > 0 && k.setDate(-j + 1);
                for (var l = g(k, 42), m = 0; 42 > m; m++) l[m] = angular.extend(e.createDateObject(l[m], e.formatDay), {
                    secondary: l[m].getMonth() !== d,
                    uid: b.uniqueId + "-" + m
                });
                b.labels = new Array(7);
                for (var n = 0; 7 > n; n++) b.labels[n] = {
                    abbr: a(l[n].date, e.formatDayHeader),
                    full: a(l[n].date, "EEEE")
                };
                if (b.title = a(e.activeDate, e.formatDayTitle), b.rows = e.split(l, 7), b.showWeeks) {
                    b.weekNumbers = [];
                    for (var o = h(b.rows[0][0].date), p = b.rows.length; b.weekNumbers.push(o++) < p; ) ;
                }
            }, e.compare = function(a, b) {
                return new Date(a.getFullYear(), a.getMonth(), a.getDate()) - new Date(b.getFullYear(), b.getMonth(), b.getDate());
            }, e.handleKeyDown = function(a) {
                var b = e.activeDate.getDate();
                if ("left" === a) b -= 1; else if ("up" === a) b -= 7; else if ("right" === a) b += 1; else if ("down" === a) b += 7; else if ("pageup" === a || "pagedown" === a) {
                    var c = e.activeDate.getMonth() + ("pageup" === a ? -1 : 1);
                    e.activeDate.setMonth(c, 1), b = Math.min(f(e.activeDate.getFullYear(), e.activeDate.getMonth()), b);
                } else "home" === a ? b = 1 : "end" === a && (b = f(e.activeDate.getFullYear(), e.activeDate.getMonth()));
                e.activeDate.setDate(b);
            }, e.refreshView();
        }
    };
} ]).directive("monthpicker", [ "dateFilter", function(a) {
    return {
        restrict: "EA",
        replace: !0,
        templateUrl: "template/datepicker/month.html",
        require: "^datepicker",
        link: function(b, c, d, e) {
            e.step = {
                years: 1
            }, e.element = c, e._refreshView = function() {
                for (var c = new Array(12), d = e.activeDate.getFullYear(), f = 0; 12 > f; f++) c[f] = angular.extend(e.createDateObject(new Date(d, f, 1), e.formatMonth), {
                    uid: b.uniqueId + "-" + f
                });
                b.title = a(e.activeDate, e.formatMonthTitle), b.rows = e.split(c, 3);
            }, e.compare = function(a, b) {
                return new Date(a.getFullYear(), a.getMonth()) - new Date(b.getFullYear(), b.getMonth());
            }, e.handleKeyDown = function(a) {
                var b = e.activeDate.getMonth();
                if ("left" === a) b -= 1; else if ("up" === a) b -= 3; else if ("right" === a) b += 1; else if ("down" === a) b += 3; else if ("pageup" === a || "pagedown" === a) {
                    var c = e.activeDate.getFullYear() + ("pageup" === a ? -1 : 1);
                    e.activeDate.setFullYear(c);
                } else "home" === a ? b = 0 : "end" === a && (b = 11);
                e.activeDate.setMonth(b);
            }, e.refreshView();
        }
    };
} ]).directive("yearpicker", [ "dateFilter", function() {
    return {
        restrict: "EA",
        replace: !0,
        templateUrl: "template/datepicker/year.html",
        require: "^datepicker",
        link: function(a, b, c, d) {
            function e(a) {
                return parseInt((a - 1) / f, 10) * f + 1;
            }
            var f = d.yearRange;
            d.step = {
                years: f
            }, d.element = b, d._refreshView = function() {
                for (var b = new Array(f), c = 0, g = e(d.activeDate.getFullYear()); f > c; c++) b[c] = angular.extend(d.createDateObject(new Date(g + c, 0, 1), d.formatYear), {
                    uid: a.uniqueId + "-" + c
                });
                a.title = [ b[0].label, b[f - 1].label ].join(" - "), a.rows = d.split(b, 5);
            }, d.compare = function(a, b) {
                return a.getFullYear() - b.getFullYear();
            }, d.handleKeyDown = function(a) {
                var b = d.activeDate.getFullYear();
                "left" === a ? b -= 1 : "up" === a ? b -= 5 : "right" === a ? b += 1 : "down" === a ? b += 5 : "pageup" === a || "pagedown" === a ? b += ("pageup" === a ? -1 : 1) * d.step.years : "home" === a ? b = e(d.activeDate.getFullYear()) : "end" === a && (b = e(d.activeDate.getFullYear()) + f - 1), 
                d.activeDate.setFullYear(b);
            }, d.refreshView();
        }
    };
} ]).constant("datepickerPopupConfig", {
    datepickerPopup: "yyyy-MM-dd",
    currentText: "Today",
    clearText: "Clear",
    closeText: "Done",
    closeOnDateSelection: !0,
    appendToBody: !1,
    showButtonBar: !0
}).directive("datepickerPopup", [ "$compile", "$parse", "$document", "$position", "dateFilter", "dateParser", "datepickerPopupConfig", function(a, b, c, d, e, f, g) {
    return {
        restrict: "EA",
        require: "ngModel",
        scope: {
            isOpen: "=?",
            currentText: "@",
            clearText: "@",
            closeText: "@",
            dateDisabled: "&"
        },
        link: function(h, i, j, k) {
            function l(a) {
                return a.replace(/([A-Z])/g, function(a) {
                    return "-" + a.toLowerCase();
                });
            }
            function m(a) {
                if (a) {
                    if (angular.isDate(a) && !isNaN(a)) return k.$setValidity("date", !0), a;
                    if (angular.isString(a)) {
                        var b = f.parse(a, n) || new Date(a);
                        return isNaN(b) ? void k.$setValidity("date", !1) : (k.$setValidity("date", !0), 
                        b);
                    }
                    return void k.$setValidity("date", !1);
                }
                return k.$setValidity("date", !0), null;
            }
            var n, o = angular.isDefined(j.closeOnDateSelection) ? h.$parent.$eval(j.closeOnDateSelection) : g.closeOnDateSelection, p = angular.isDefined(j.datepickerAppendToBody) ? h.$parent.$eval(j.datepickerAppendToBody) : g.appendToBody;
            h.showButtonBar = angular.isDefined(j.showButtonBar) ? h.$parent.$eval(j.showButtonBar) : g.showButtonBar, 
            h.getText = function(a) {
                return h[a + "Text"] || g[a + "Text"];
            }, j.$observe("datepickerPopup", function(a) {
                n = a || g.datepickerPopup, k.$render();
            });
            var q = angular.element("<div datepicker-popup-wrap><div datepicker></div></div>");
            q.attr({
                "ng-model": "date",
                "ng-change": "dateSelection()"
            });
            var r = angular.element(q.children()[0]);
            j.datepickerOptions && angular.forEach(h.$parent.$eval(j.datepickerOptions), function(a, b) {
                r.attr(l(b), a);
            }), h.watchData = {}, angular.forEach([ "minDate", "maxDate", "datepickerMode" ], function(a) {
                if (j[a]) {
                    var c = b(j[a]);
                    if (h.$parent.$watch(c, function(b) {
                        h.watchData[a] = b;
                    }), r.attr(l(a), "watchData." + a), "datepickerMode" === a) {
                        var d = c.assign;
                        h.$watch("watchData." + a, function(a, b) {
                            a !== b && d(h.$parent, a);
                        });
                    }
                }
            }), j.dateDisabled && r.attr("date-disabled", "dateDisabled({ date: date, mode: mode })"), 
            k.$parsers.unshift(m), h.dateSelection = function(a) {
                angular.isDefined(a) && (h.date = a), k.$setViewValue(h.date), k.$render(), o && (h.isOpen = !1, 
                i[0].focus());
            }, i.bind("input change keyup", function() {
                h.$apply(function() {
                    h.date = k.$modelValue;
                });
            }), k.$render = function() {
                var a = k.$viewValue ? e(k.$viewValue, n) : "";
                i.val(a), h.date = m(k.$modelValue);
            };
            var s = function(a) {
                h.isOpen && a.target !== i[0] && h.$apply(function() {
                    h.isOpen = !1;
                });
            }, t = function(a) {
                h.keydown(a);
            };
            i.bind("keydown", t), h.keydown = function(a) {
                27 === a.which ? (a.preventDefault(), a.stopPropagation(), h.close()) : 40 !== a.which || h.isOpen || (h.isOpen = !0);
            }, h.$watch("isOpen", function(a) {
                a ? (h.$broadcast("datepicker.focus"), h.position = p ? d.offset(i) : d.position(i), 
                h.position.top = h.position.top + i.prop("offsetHeight"), c.bind("click", s)) : c.unbind("click", s);
            }), h.select = function(a) {
                if ("today" === a) {
                    var b = new Date();
                    angular.isDate(k.$modelValue) ? (a = new Date(k.$modelValue), a.setFullYear(b.getFullYear(), b.getMonth(), b.getDate())) : a = new Date(b.setHours(0, 0, 0, 0));
                }
                h.dateSelection(a);
            }, h.close = function() {
                h.isOpen = !1, i[0].focus();
            };
            var u = a(q)(h);
            q.remove(), p ? c.find("body").append(u) : i.after(u), h.$on("$destroy", function() {
                u.remove(), i.unbind("keydown", t), c.unbind("click", s);
            });
        }
    };
} ]).directive("datepickerPopupWrap", function() {
    return {
        restrict: "EA",
        replace: !0,
        transclude: !0,
        templateUrl: "template/datepicker/popup.html",
        link: function(a, b) {
            b.bind("click", function(a) {
                a.preventDefault(), a.stopPropagation();
            });
        }
    };
}), angular.module("ui.bootstrap.dropdown", []).constant("dropdownConfig", {
    openClass: "open"
}).service("dropdownService", [ "$document", function(a) {
    var b = null;
    this.open = function(e) {
        b || (a.bind("click", c), a.bind("keydown", d)), b && b !== e && (b.isOpen = !1), 
        b = e;
    }, this.close = function(e) {
        b === e && (b = null, a.unbind("click", c), a.unbind("keydown", d));
    };
    var c = function(a) {
        var c = b.getToggleElement();
        a && c && c[0].contains(a.target) || b.$apply(function() {
            b.isOpen = !1;
        });
    }, d = function(a) {
        27 === a.which && (b.focusToggleElement(), c());
    };
} ]).controller("DropdownController", [ "$scope", "$attrs", "$parse", "dropdownConfig", "dropdownService", "$animate", function(a, b, c, d, e, f) {
    var g, h = this, i = a.$new(), j = d.openClass, k = angular.noop, l = b.onToggle ? c(b.onToggle) : angular.noop;
    this.init = function(d) {
        h.$element = d, b.isOpen && (g = c(b.isOpen), k = g.assign, a.$watch(g, function(a) {
            i.isOpen = !!a;
        }));
    }, this.toggle = function(a) {
        return i.isOpen = arguments.length ? !!a : !i.isOpen;
    }, this.isOpen = function() {
        return i.isOpen;
    }, i.getToggleElement = function() {
        return h.toggleElement;
    }, i.focusToggleElement = function() {
        h.toggleElement && h.toggleElement[0].focus();
    }, i.$watch("isOpen", function(b, c) {
        f[b ? "addClass" : "removeClass"](h.$element, j), b ? (i.focusToggleElement(), e.open(i)) : e.close(i), 
        k(a, b), angular.isDefined(b) && b !== c && l(a, {
            open: !!b
        });
    }), a.$on("$locationChangeSuccess", function() {
        i.isOpen = !1;
    }), a.$on("$destroy", function() {
        i.$destroy();
    });
} ]).directive("dropdown", function() {
    return {
        restrict: "CA",
        controller: "DropdownController",
        link: function(a, b, c, d) {
            d.init(b);
        }
    };
}).directive("dropdownToggle", function() {
    return {
        restrict: "CA",
        require: "?^dropdown",
        link: function(a, b, c, d) {
            if (d) {
                d.toggleElement = b;
                var e = function(e) {
                    e.preventDefault(), b.hasClass("disabled") || c.disabled || a.$apply(function() {
                        d.toggle();
                    });
                };
                b.bind("click", e), b.attr({
                    "aria-haspopup": !0,
                    "aria-expanded": !1
                }), a.$watch(d.isOpen, function(a) {
                    b.attr("aria-expanded", !!a);
                }), a.$on("$destroy", function() {
                    b.unbind("click", e);
                });
            }
        }
    };
}), angular.module("ui.bootstrap.modal", [ "ui.bootstrap.transition" ]).factory("$$stackedMap", function() {
    return {
        createNew: function() {
            var a = [];
            return {
                add: function(b, c) {
                    a.push({
                        key: b,
                        value: c
                    });
                },
                get: function(b) {
                    for (var c = 0; c < a.length; c++) if (b == a[c].key) return a[c];
                },
                keys: function() {
                    for (var b = [], c = 0; c < a.length; c++) b.push(a[c].key);
                    return b;
                },
                top: function() {
                    return a[a.length - 1];
                },
                remove: function(b) {
                    for (var c = -1, d = 0; d < a.length; d++) if (b == a[d].key) {
                        c = d;
                        break;
                    }
                    return a.splice(c, 1)[0];
                },
                removeTop: function() {
                    return a.splice(a.length - 1, 1)[0];
                },
                length: function() {
                    return a.length;
                }
            };
        }
    };
}).directive("modalBackdrop", [ "$timeout", function(a) {
    return {
        restrict: "EA",
        replace: !0,
        templateUrl: "template/modal/backdrop.html",
        link: function(b, c, d) {
            b.backdropClass = d.backdropClass || "", b.animate = !1, a(function() {
                b.animate = !0;
            });
        }
    };
} ]).directive("modalWindow", [ "$modalStack", "$timeout", function(a, b) {
    return {
        restrict: "EA",
        scope: {
            index: "@",
            animate: "="
        },
        replace: !0,
        transclude: !0,
        templateUrl: function(a, b) {
            return b.templateUrl || "template/modal/window.html";
        },
        link: function(c, d, e) {
            d.addClass(e.windowClass || ""), c.size = e.size, b(function() {
                c.animate = !0, d[0].querySelectorAll("[autofocus]").length || d[0].focus();
            }), c.close = function(b) {
                var c = a.getTop();
                c && c.value.backdrop && "static" != c.value.backdrop && b.target === b.currentTarget && (b.preventDefault(), 
                b.stopPropagation(), a.dismiss(c.key, "backdrop click"));
            };
        }
    };
} ]).directive("modalTransclude", function() {
    return {
        link: function(a, b, c, d, e) {
            e(a.$parent, function(a) {
                b.empty(), b.append(a);
            });
        }
    };
}).factory("$modalStack", [ "$transition", "$timeout", "$document", "$compile", "$rootScope", "$$stackedMap", function(a, b, c, d, e, f) {
    function g() {
        for (var a = -1, b = n.keys(), c = 0; c < b.length; c++) n.get(b[c]).value.backdrop && (a = c);
        return a;
    }
    function h(a) {
        var b = c.find("body").eq(0), d = n.get(a).value;
        n.remove(a), j(d.modalDomEl, d.modalScope, 300, function() {
            d.modalScope.$destroy(), b.toggleClass(m, n.length() > 0), i();
        });
    }
    function i() {
        if (k && -1 == g()) {
            var a = l;
            j(k, l, 150, function() {
                a.$destroy(), a = null;
            }), k = void 0, l = void 0;
        }
    }
    function j(c, d, e, f) {
        function g() {
            g.done || (g.done = !0, c.remove(), f && f());
        }
        d.animate = !1;
        var h = a.transitionEndEventName;
        if (h) {
            var i = b(g, e);
            c.bind(h, function() {
                b.cancel(i), g(), d.$apply();
            });
        } else b(g);
    }
    var k, l, m = "modal-open", n = f.createNew(), o = {};
    return e.$watch(g, function(a) {
        l && (l.index = a);
    }), c.bind("keydown", function(a) {
        var b;
        27 === a.which && (b = n.top(), b && b.value.keyboard && (a.preventDefault(), e.$apply(function() {
            o.dismiss(b.key, "escape key press");
        })));
    }), o.open = function(a, b) {
        n.add(a, {
            deferred: b.deferred,
            modalScope: b.scope,
            backdrop: b.backdrop,
            keyboard: b.keyboard
        });
        var f = c.find("body").eq(0), h = g();
        if (h >= 0 && !k) {
            l = e.$new(!0), l.index = h;
            var i = angular.element("<div modal-backdrop></div>");
            i.attr("backdrop-class", b.backdropClass), k = d(i)(l), f.append(k);
        }
        var j = angular.element("<div modal-window></div>");
        j.attr({
            "template-url": b.windowTemplateUrl,
            "window-class": b.windowClass,
            size: b.size,
            index: n.length() - 1,
            animate: "animate"
        }).html(b.content);
        var o = d(j)(b.scope);
        n.top().value.modalDomEl = o, f.append(o), f.addClass(m);
    }, o.close = function(a, b) {
        var c = n.get(a);
        c && (c.value.deferred.resolve(b), h(a));
    }, o.dismiss = function(a, b) {
        var c = n.get(a);
        c && (c.value.deferred.reject(b), h(a));
    }, o.dismissAll = function(a) {
        for (var b = this.getTop(); b; ) this.dismiss(b.key, a), b = this.getTop();
    }, o.getTop = function() {
        return n.top();
    }, o;
} ]).provider("$modal", function() {
    var a = {
        options: {
            backdrop: !0,
            keyboard: !0
        },
        $get: [ "$injector", "$rootScope", "$q", "$http", "$templateCache", "$controller", "$modalStack", function(b, c, d, e, f, g, h) {
            function i(a) {
                return a.template ? d.when(a.template) : e.get(angular.isFunction(a.templateUrl) ? a.templateUrl() : a.templateUrl, {
                    cache: f
                }).then(function(a) {
                    return a.data;
                });
            }
            function j(a) {
                var c = [];
                return angular.forEach(a, function(a) {
                    (angular.isFunction(a) || angular.isArray(a)) && c.push(d.when(b.invoke(a)));
                }), c;
            }
            var k = {};
            return k.open = function(b) {
                var e = d.defer(), f = d.defer(), k = {
                    result: e.promise,
                    opened: f.promise,
                    close: function(a) {
                        h.close(k, a);
                    },
                    dismiss: function(a) {
                        h.dismiss(k, a);
                    }
                };
                if (b = angular.extend({}, a.options, b), b.resolve = b.resolve || {}, !b.template && !b.templateUrl) throw new Error("One of template or templateUrl options is required.");
                var l = d.all([ i(b) ].concat(j(b.resolve)));
                return l.then(function(a) {
                    var d = (b.scope || c).$new();
                    d.$close = k.close, d.$dismiss = k.dismiss;
                    var f, i = {}, j = 1;
                    b.controller && (i.$scope = d, i.$modalInstance = k, angular.forEach(b.resolve, function(b, c) {
                        i[c] = a[j++];
                    }), f = g(b.controller, i), b.controllerAs && (d[b.controllerAs] = f)), h.open(k, {
                        scope: d,
                        deferred: e,
                        content: a[0],
                        backdrop: b.backdrop,
                        keyboard: b.keyboard,
                        backdropClass: b.backdropClass,
                        windowClass: b.windowClass,
                        windowTemplateUrl: b.windowTemplateUrl,
                        size: b.size
                    });
                }, function(a) {
                    e.reject(a);
                }), l.then(function() {
                    f.resolve(!0);
                }, function() {
                    f.reject(!1);
                }), k;
            }, k;
        } ]
    };
    return a;
}), angular.module("ui.bootstrap.pagination", []).controller("PaginationController", [ "$scope", "$attrs", "$parse", function(a, b, c) {
    var d = this, e = {
        $setViewValue: angular.noop
    }, f = b.numPages ? c(b.numPages).assign : angular.noop;
    this.init = function(f, g) {
        e = f, this.config = g, e.$render = function() {
            d.render();
        }, b.itemsPerPage ? a.$parent.$watch(c(b.itemsPerPage), function(b) {
            d.itemsPerPage = parseInt(b, 10), a.totalPages = d.calculateTotalPages();
        }) : this.itemsPerPage = g.itemsPerPage;
    }, this.calculateTotalPages = function() {
        var b = this.itemsPerPage < 1 ? 1 : Math.ceil(a.totalItems / this.itemsPerPage);
        return Math.max(b || 0, 1);
    }, this.render = function() {
        a.page = parseInt(e.$viewValue, 10) || 1;
    }, a.selectPage = function(b) {
        a.page !== b && b > 0 && b <= a.totalPages && (e.$setViewValue(b), e.$render());
    }, a.getText = function(b) {
        return a[b + "Text"] || d.config[b + "Text"];
    }, a.noPrevious = function() {
        return 1 === a.page;
    }, a.noNext = function() {
        return a.page === a.totalPages;
    }, a.$watch("totalItems", function() {
        a.totalPages = d.calculateTotalPages();
    }), a.$watch("totalPages", function(b) {
        f(a.$parent, b), a.page > b ? a.selectPage(b) : e.$render();
    });
} ]).constant("paginationConfig", {
    itemsPerPage: 10,
    boundaryLinks: !1,
    directionLinks: !0,
    firstText: "First",
    previousText: "Previous",
    nextText: "Next",
    lastText: "Last",
    rotate: !0
}).directive("pagination", [ "$parse", "paginationConfig", function(a, b) {
    return {
        restrict: "EA",
        scope: {
            totalItems: "=",
            firstText: "@",
            previousText: "@",
            nextText: "@",
            lastText: "@"
        },
        require: [ "pagination", "?ngModel" ],
        controller: "PaginationController",
        templateUrl: "template/pagination/pagination.html",
        replace: !0,
        link: function(c, d, e, f) {
            function g(a, b, c) {
                return {
                    number: a,
                    text: b,
                    active: c
                };
            }
            function h(a, b) {
                var c = [], d = 1, e = b, f = angular.isDefined(k) && b > k;
                f && (l ? (d = Math.max(a - Math.floor(k / 2), 1), e = d + k - 1, e > b && (e = b, 
                d = e - k + 1)) : (d = (Math.ceil(a / k) - 1) * k + 1, e = Math.min(d + k - 1, b)));
                for (var h = d; e >= h; h++) {
                    var i = g(h, h, h === a);
                    c.push(i);
                }
                if (f && !l) {
                    if (d > 1) {
                        var j = g(d - 1, "...", !1);
                        c.unshift(j);
                    }
                    if (b > e) {
                        var m = g(e + 1, "...", !1);
                        c.push(m);
                    }
                }
                return c;
            }
            var i = f[0], j = f[1];
            if (j) {
                var k = angular.isDefined(e.maxSize) ? c.$parent.$eval(e.maxSize) : b.maxSize, l = angular.isDefined(e.rotate) ? c.$parent.$eval(e.rotate) : b.rotate;
                c.boundaryLinks = angular.isDefined(e.boundaryLinks) ? c.$parent.$eval(e.boundaryLinks) : b.boundaryLinks, 
                c.directionLinks = angular.isDefined(e.directionLinks) ? c.$parent.$eval(e.directionLinks) : b.directionLinks, 
                i.init(j, b), e.maxSize && c.$parent.$watch(a(e.maxSize), function(a) {
                    k = parseInt(a, 10), i.render();
                });
                var m = i.render;
                i.render = function() {
                    m(), c.page > 0 && c.page <= c.totalPages && (c.pages = h(c.page, c.totalPages));
                };
            }
        }
    };
} ]).constant("pagerConfig", {
    itemsPerPage: 10,
    previousText: "« Previous",
    nextText: "Next »",
    align: !0
}).directive("pager", [ "pagerConfig", function(a) {
    return {
        restrict: "EA",
        scope: {
            totalItems: "=",
            previousText: "@",
            nextText: "@"
        },
        require: [ "pager", "?ngModel" ],
        controller: "PaginationController",
        templateUrl: "template/pagination/pager.html",
        replace: !0,
        link: function(b, c, d, e) {
            var f = e[0], g = e[1];
            g && (b.align = angular.isDefined(d.align) ? b.$parent.$eval(d.align) : a.align, 
            f.init(g, a));
        }
    };
} ]), angular.module("ui.bootstrap.tooltip", [ "ui.bootstrap.position", "ui.bootstrap.bindHtml" ]).provider("$tooltip", function() {
    function a(a) {
        var b = /[A-Z]/g, c = "-";
        return a.replace(b, function(a, b) {
            return (b ? c : "") + a.toLowerCase();
        });
    }
    var b = {
        placement: "top",
        animation: !0,
        popupDelay: 0
    }, c = {
        mouseenter: "mouseleave",
        click: "click",
        focus: "blur"
    }, d = {};
    this.options = function(a) {
        angular.extend(d, a);
    }, this.setTriggers = function(a) {
        angular.extend(c, a);
    }, this.$get = [ "$window", "$compile", "$timeout", "$parse", "$document", "$position", "$interpolate", function(e, f, g, h, i, j, k) {
        return function(e, l, m) {
            function n(a) {
                var b = a || o.trigger || m, d = c[b] || b;
                return {
                    show: b,
                    hide: d
                };
            }
            var o = angular.extend({}, b, d), p = a(e), q = k.startSymbol(), r = k.endSymbol(), s = "<div " + p + '-popup title="' + q + "tt_title" + r + '" content="' + q + "tt_content" + r + '" placement="' + q + "tt_placement" + r + '" animation="tt_animation" is-open="tt_isOpen"></div>';
            return {
                restrict: "EA",
                scope: !0,
                compile: function() {
                    var a = f(s);
                    return function(b, c, d) {
                        function f() {
                            b.tt_isOpen ? m() : k();
                        }
                        function k() {
                            (!y || b.$eval(d[l + "Enable"])) && (b.tt_popupDelay ? v || (v = g(p, b.tt_popupDelay, !1), 
                            v.then(function(a) {
                                a();
                            })) : p()());
                        }
                        function m() {
                            b.$apply(function() {
                                q();
                            });
                        }
                        function p() {
                            return v = null, u && (g.cancel(u), u = null), b.tt_content ? (r(), t.css({
                                top: 0,
                                left: 0,
                                display: "block"
                            }), w ? i.find("body").append(t) : c.after(t), z(), b.tt_isOpen = !0, b.$digest(), 
                            z) : angular.noop;
                        }
                        function q() {
                            b.tt_isOpen = !1, g.cancel(v), v = null, b.tt_animation ? u || (u = g(s, 500)) : s();
                        }
                        function r() {
                            t && s(), t = a(b, function() {}), b.$digest();
                        }
                        function s() {
                            u = null, t && (t.remove(), t = null);
                        }
                        var t, u, v, w = angular.isDefined(o.appendToBody) ? o.appendToBody : !1, x = n(void 0), y = angular.isDefined(d[l + "Enable"]), z = function() {
                            var a = j.positionElements(c, t, b.tt_placement, w);
                            a.top += "px", a.left += "px", t.css(a);
                        };
                        b.tt_isOpen = !1, d.$observe(e, function(a) {
                            b.tt_content = a, !a && b.tt_isOpen && q();
                        }), d.$observe(l + "Title", function(a) {
                            b.tt_title = a;
                        }), d.$observe(l + "Placement", function(a) {
                            b.tt_placement = angular.isDefined(a) ? a : o.placement;
                        }), d.$observe(l + "PopupDelay", function(a) {
                            var c = parseInt(a, 10);
                            b.tt_popupDelay = isNaN(c) ? o.popupDelay : c;
                        });
                        var A = function() {
                            c.unbind(x.show, k), c.unbind(x.hide, m);
                        };
                        d.$observe(l + "Trigger", function(a) {
                            A(), x = n(a), x.show === x.hide ? c.bind(x.show, f) : (c.bind(x.show, k), c.bind(x.hide, m));
                        });
                        var B = b.$eval(d[l + "Animation"]);
                        b.tt_animation = angular.isDefined(B) ? !!B : o.animation, d.$observe(l + "AppendToBody", function(a) {
                            w = angular.isDefined(a) ? h(a)(b) : w;
                        }), w && b.$on("$locationChangeSuccess", function() {
                            b.tt_isOpen && q();
                        }), b.$on("$destroy", function() {
                            g.cancel(u), g.cancel(v), A(), s();
                        });
                    };
                }
            };
        };
    } ];
}).directive("tooltipPopup", function() {
    return {
        restrict: "EA",
        replace: !0,
        scope: {
            content: "@",
            placement: "@",
            animation: "&",
            isOpen: "&"
        },
        templateUrl: "template/tooltip/tooltip-popup.html"
    };
}).directive("tooltip", [ "$tooltip", function(a) {
    return a("tooltip", "tooltip", "mouseenter");
} ]).directive("tooltipHtmlUnsafePopup", function() {
    return {
        restrict: "EA",
        replace: !0,
        scope: {
            content: "@",
            placement: "@",
            animation: "&",
            isOpen: "&"
        },
        templateUrl: "template/tooltip/tooltip-html-unsafe-popup.html"
    };
}).directive("tooltipHtmlUnsafe", [ "$tooltip", function(a) {
    return a("tooltipHtmlUnsafe", "tooltip", "mouseenter");
} ]), angular.module("ui.bootstrap.popover", [ "ui.bootstrap.tooltip" ]).directive("popoverPopup", function() {
    return {
        restrict: "EA",
        replace: !0,
        scope: {
            title: "@",
            content: "@",
            placement: "@",
            animation: "&",
            isOpen: "&"
        },
        templateUrl: "template/popover/popover.html"
    };
}).directive("popover", [ "$tooltip", function(a) {
    return a("popover", "popover", "click");
} ]), angular.module("ui.bootstrap.progressbar", []).constant("progressConfig", {
    animate: !0,
    max: 100
}).controller("ProgressController", [ "$scope", "$attrs", "progressConfig", function(a, b, c) {
    var d = this, e = angular.isDefined(b.animate) ? a.$parent.$eval(b.animate) : c.animate;
    this.bars = [], a.max = angular.isDefined(b.max) ? a.$parent.$eval(b.max) : c.max, 
    this.addBar = function(b, c) {
        e || c.css({
            transition: "none"
        }), this.bars.push(b), b.$watch("value", function(c) {
            b.percent = +(100 * c / a.max).toFixed(2);
        }), b.$on("$destroy", function() {
            c = null, d.removeBar(b);
        });
    }, this.removeBar = function(a) {
        this.bars.splice(this.bars.indexOf(a), 1);
    };
} ]).directive("progress", function() {
    return {
        restrict: "EA",
        replace: !0,
        transclude: !0,
        controller: "ProgressController",
        require: "progress",
        scope: {},
        templateUrl: "template/progressbar/progress.html"
    };
}).directive("bar", function() {
    return {
        restrict: "EA",
        replace: !0,
        transclude: !0,
        require: "^progress",
        scope: {
            value: "=",
            type: "@"
        },
        templateUrl: "template/progressbar/bar.html",
        link: function(a, b, c, d) {
            d.addBar(a, b);
        }
    };
}).directive("progressbar", function() {
    return {
        restrict: "EA",
        replace: !0,
        transclude: !0,
        controller: "ProgressController",
        scope: {
            value: "=",
            type: "@"
        },
        templateUrl: "template/progressbar/progressbar.html",
        link: function(a, b, c, d) {
            d.addBar(a, angular.element(b.children()[0]));
        }
    };
}), angular.module("ui.bootstrap.rating", []).constant("ratingConfig", {
    max: 5,
    stateOn: null,
    stateOff: null
}).controller("RatingController", [ "$scope", "$attrs", "ratingConfig", function(a, b, c) {
    var d = {
        $setViewValue: angular.noop
    };
    this.init = function(e) {
        d = e, d.$render = this.render, this.stateOn = angular.isDefined(b.stateOn) ? a.$parent.$eval(b.stateOn) : c.stateOn, 
        this.stateOff = angular.isDefined(b.stateOff) ? a.$parent.$eval(b.stateOff) : c.stateOff;
        var f = angular.isDefined(b.ratingStates) ? a.$parent.$eval(b.ratingStates) : new Array(angular.isDefined(b.max) ? a.$parent.$eval(b.max) : c.max);
        a.range = this.buildTemplateObjects(f);
    }, this.buildTemplateObjects = function(a) {
        for (var b = 0, c = a.length; c > b; b++) a[b] = angular.extend({
            index: b
        }, {
            stateOn: this.stateOn,
            stateOff: this.stateOff
        }, a[b]);
        return a;
    }, a.rate = function(b) {
        !a.readonly && b >= 0 && b <= a.range.length && (d.$setViewValue(b), d.$render());
    }, a.enter = function(b) {
        a.readonly || (a.value = b), a.onHover({
            value: b
        });
    }, a.reset = function() {
        a.value = d.$viewValue, a.onLeave();
    }, a.onKeydown = function(b) {
        /(37|38|39|40)/.test(b.which) && (b.preventDefault(), b.stopPropagation(), a.rate(a.value + (38 === b.which || 39 === b.which ? 1 : -1)));
    }, this.render = function() {
        a.value = d.$viewValue;
    };
} ]).directive("rating", function() {
    return {
        restrict: "EA",
        require: [ "rating", "ngModel" ],
        scope: {
            readonly: "=?",
            onHover: "&",
            onLeave: "&"
        },
        controller: "RatingController",
        templateUrl: "template/rating/rating.html",
        replace: !0,
        link: function(a, b, c, d) {
            var e = d[0], f = d[1];
            f && e.init(f);
        }
    };
}), angular.module("ui.bootstrap.tabs", []).controller("TabsetController", [ "$scope", function(a) {
    var b = this, c = b.tabs = a.tabs = [];
    b.select = function(a) {
        angular.forEach(c, function(b) {
            b.active && b !== a && (b.active = !1, b.onDeselect());
        }), a.active = !0, a.onSelect();
    }, b.addTab = function(a) {
        c.push(a), 1 === c.length ? a.active = !0 : a.active && b.select(a);
    }, b.removeTab = function(a) {
        var d = c.indexOf(a);
        if (a.active && c.length > 1) {
            var e = d == c.length - 1 ? d - 1 : d + 1;
            b.select(c[e]);
        }
        c.splice(d, 1);
    };
} ]).directive("tabset", function() {
    return {
        restrict: "EA",
        transclude: !0,
        replace: !0,
        scope: {
            type: "@"
        },
        controller: "TabsetController",
        templateUrl: "template/tabs/tabset.html",
        link: function(a, b, c) {
            a.vertical = angular.isDefined(c.vertical) ? a.$parent.$eval(c.vertical) : !1, a.justified = angular.isDefined(c.justified) ? a.$parent.$eval(c.justified) : !1;
        }
    };
}).directive("tab", [ "$parse", function(a) {
    return {
        require: "^tabset",
        restrict: "EA",
        replace: !0,
        templateUrl: "template/tabs/tab.html",
        transclude: !0,
        scope: {
            active: "=?",
            heading: "@",
            onSelect: "&select",
            onDeselect: "&deselect"
        },
        controller: function() {},
        compile: function(b, c, d) {
            return function(b, c, e, f) {
                b.$watch("active", function(a) {
                    a && f.select(b);
                }), b.disabled = !1, e.disabled && b.$parent.$watch(a(e.disabled), function(a) {
                    b.disabled = !!a;
                }), b.select = function() {
                    b.disabled || (b.active = !0);
                }, f.addTab(b), b.$on("$destroy", function() {
                    f.removeTab(b);
                }), b.$transcludeFn = d;
            };
        }
    };
} ]).directive("tabHeadingTransclude", [ function() {
    return {
        restrict: "A",
        require: "^tab",
        link: function(a, b) {
            a.$watch("headingElement", function(a) {
                a && (b.html(""), b.append(a));
            });
        }
    };
} ]).directive("tabContentTransclude", function() {
    function a(a) {
        return a.tagName && (a.hasAttribute("tab-heading") || a.hasAttribute("data-tab-heading") || "tab-heading" === a.tagName.toLowerCase() || "data-tab-heading" === a.tagName.toLowerCase());
    }
    return {
        restrict: "A",
        require: "^tabset",
        link: function(b, c, d) {
            var e = b.$eval(d.tabContentTransclude);
            e.$transcludeFn(e.$parent, function(b) {
                angular.forEach(b, function(b) {
                    a(b) ? e.headingElement = b : c.append(b);
                });
            });
        }
    };
}), angular.module("ui.bootstrap.timepicker", []).constant("timepickerConfig", {
    hourStep: 1,
    minuteStep: 1,
    showMeridian: !0,
    meridians: null,
    readonlyInput: !1,
    mousewheel: !0
}).controller("TimepickerController", [ "$scope", "$attrs", "$parse", "$log", "$locale", "timepickerConfig", function(a, b, c, d, e, f) {
    function g() {
        var b = parseInt(a.hours, 10), c = a.showMeridian ? b > 0 && 13 > b : b >= 0 && 24 > b;
        return c ? (a.showMeridian && (12 === b && (b = 0), a.meridian === p[1] && (b += 12)), 
        b) : void 0;
    }
    function h() {
        var b = parseInt(a.minutes, 10);
        return b >= 0 && 60 > b ? b : void 0;
    }
    function i(a) {
        return angular.isDefined(a) && a.toString().length < 2 ? "0" + a : a;
    }
    function j(a) {
        k(), o.$setViewValue(new Date(n)), l(a);
    }
    function k() {
        o.$setValidity("time", !0), a.invalidHours = !1, a.invalidMinutes = !1;
    }
    function l(b) {
        var c = n.getHours(), d = n.getMinutes();
        a.showMeridian && (c = 0 === c || 12 === c ? 12 : c % 12), a.hours = "h" === b ? c : i(c), 
        a.minutes = "m" === b ? d : i(d), a.meridian = n.getHours() < 12 ? p[0] : p[1];
    }
    function m(a) {
        var b = new Date(n.getTime() + 6e4 * a);
        n.setHours(b.getHours(), b.getMinutes()), j();
    }
    var n = new Date(), o = {
        $setViewValue: angular.noop
    }, p = angular.isDefined(b.meridians) ? a.$parent.$eval(b.meridians) : f.meridians || e.DATETIME_FORMATS.AMPMS;
    this.init = function(c, d) {
        o = c, o.$render = this.render;
        var e = d.eq(0), g = d.eq(1), h = angular.isDefined(b.mousewheel) ? a.$parent.$eval(b.mousewheel) : f.mousewheel;
        h && this.setupMousewheelEvents(e, g), a.readonlyInput = angular.isDefined(b.readonlyInput) ? a.$parent.$eval(b.readonlyInput) : f.readonlyInput, 
        this.setupInputEvents(e, g);
    };
    var q = f.hourStep;
    b.hourStep && a.$parent.$watch(c(b.hourStep), function(a) {
        q = parseInt(a, 10);
    });
    var r = f.minuteStep;
    b.minuteStep && a.$parent.$watch(c(b.minuteStep), function(a) {
        r = parseInt(a, 10);
    }), a.showMeridian = f.showMeridian, b.showMeridian && a.$parent.$watch(c(b.showMeridian), function(b) {
        if (a.showMeridian = !!b, o.$error.time) {
            var c = g(), d = h();
            angular.isDefined(c) && angular.isDefined(d) && (n.setHours(c), j());
        } else l();
    }), this.setupMousewheelEvents = function(b, c) {
        var d = function(a) {
            a.originalEvent && (a = a.originalEvent);
            var b = a.wheelDelta ? a.wheelDelta : -a.deltaY;
            return a.detail || b > 0;
        };
        b.bind("mousewheel wheel", function(b) {
            a.$apply(d(b) ? a.incrementHours() : a.decrementHours()), b.preventDefault();
        }), c.bind("mousewheel wheel", function(b) {
            a.$apply(d(b) ? a.incrementMinutes() : a.decrementMinutes()), b.preventDefault();
        });
    }, this.setupInputEvents = function(b, c) {
        if (a.readonlyInput) return a.updateHours = angular.noop, void (a.updateMinutes = angular.noop);
        var d = function(b, c) {
            o.$setViewValue(null), o.$setValidity("time", !1), angular.isDefined(b) && (a.invalidHours = b), 
            angular.isDefined(c) && (a.invalidMinutes = c);
        };
        a.updateHours = function() {
            var a = g();
            angular.isDefined(a) ? (n.setHours(a), j("h")) : d(!0);
        }, b.bind("blur", function() {
            !a.invalidHours && a.hours < 10 && a.$apply(function() {
                a.hours = i(a.hours);
            });
        }), a.updateMinutes = function() {
            var a = h();
            angular.isDefined(a) ? (n.setMinutes(a), j("m")) : d(void 0, !0);
        }, c.bind("blur", function() {
            !a.invalidMinutes && a.minutes < 10 && a.$apply(function() {
                a.minutes = i(a.minutes);
            });
        });
    }, this.render = function() {
        var a = o.$modelValue ? new Date(o.$modelValue) : null;
        isNaN(a) ? (o.$setValidity("time", !1), d.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')) : (a && (n = a), 
        k(), l());
    }, a.incrementHours = function() {
        m(60 * q);
    }, a.decrementHours = function() {
        m(60 * -q);
    }, a.incrementMinutes = function() {
        m(r);
    }, a.decrementMinutes = function() {
        m(-r);
    }, a.toggleMeridian = function() {
        m(720 * (n.getHours() < 12 ? 1 : -1));
    };
} ]).directive("timepicker", function() {
    return {
        restrict: "EA",
        require: [ "timepicker", "?^ngModel" ],
        controller: "TimepickerController",
        replace: !0,
        scope: {},
        templateUrl: "template/timepicker/timepicker.html",
        link: function(a, b, c, d) {
            var e = d[0], f = d[1];
            f && e.init(f, b.find("input"));
        }
    };
}), angular.module("ui.bootstrap.typeahead", [ "ui.bootstrap.position", "ui.bootstrap.bindHtml" ]).factory("typeaheadParser", [ "$parse", function(a) {
    var b = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;
    return {
        parse: function(c) {
            var d = c.match(b);
            if (!d) throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "' + c + '".');
            return {
                itemName: d[3],
                source: a(d[4]),
                viewMapper: a(d[2] || d[1]),
                modelMapper: a(d[1])
            };
        }
    };
} ]).directive("typeahead", [ "$compile", "$parse", "$q", "$timeout", "$document", "$position", "typeaheadParser", function(a, b, c, d, e, f, g) {
    var h = [ 9, 13, 27, 38, 40 ];
    return {
        require: "ngModel",
        link: function(i, j, k, l) {
            var m, n = i.$eval(k.typeaheadMinLength) || 1, o = i.$eval(k.typeaheadWaitMs) || 0, p = i.$eval(k.typeaheadEditable) !== !1, q = b(k.typeaheadLoading).assign || angular.noop, r = b(k.typeaheadOnSelect), s = k.typeaheadInputFormatter ? b(k.typeaheadInputFormatter) : void 0, t = k.typeaheadAppendToBody ? i.$eval(k.typeaheadAppendToBody) : !1, u = b(k.ngModel).assign, v = g.parse(k.typeahead), w = i.$new();
            i.$on("$destroy", function() {
                w.$destroy();
            });
            var x = "typeahead-" + w.$id + "-" + Math.floor(1e4 * Math.random());
            j.attr({
                "aria-autocomplete": "list",
                "aria-expanded": !1,
                "aria-owns": x
            });
            var y = angular.element("<div typeahead-popup></div>");
            y.attr({
                id: x,
                matches: "matches",
                active: "activeIdx",
                select: "select(activeIdx)",
                query: "query",
                position: "position"
            }), angular.isDefined(k.typeaheadTemplateUrl) && y.attr("template-url", k.typeaheadTemplateUrl);
            var z = function() {
                w.matches = [], w.activeIdx = -1, j.attr("aria-expanded", !1);
            }, A = function(a) {
                return x + "-option-" + a;
            };
            w.$watch("activeIdx", function(a) {
                0 > a ? j.removeAttr("aria-activedescendant") : j.attr("aria-activedescendant", A(a));
            });
            var B = function(a) {
                var b = {
                    $viewValue: a
                };
                q(i, !0), c.when(v.source(i, b)).then(function(c) {
                    var d = a === l.$viewValue;
                    if (d && m) if (c.length > 0) {
                        w.activeIdx = 0, w.matches.length = 0;
                        for (var e = 0; e < c.length; e++) b[v.itemName] = c[e], w.matches.push({
                            id: A(e),
                            label: v.viewMapper(w, b),
                            model: c[e]
                        });
                        w.query = a, w.position = t ? f.offset(j) : f.position(j), w.position.top = w.position.top + j.prop("offsetHeight"), 
                        j.attr("aria-expanded", !0);
                    } else z();
                    d && q(i, !1);
                }, function() {
                    z(), q(i, !1);
                });
            };
            z(), w.query = void 0;
            var C, D = function(a) {
                C = d(function() {
                    B(a);
                }, o);
            }, E = function() {
                C && d.cancel(C);
            };
            l.$parsers.unshift(function(a) {
                return m = !0, a && a.length >= n ? o > 0 ? (E(), D(a)) : B(a) : (q(i, !1), E(), 
                z()), p ? a : a ? void l.$setValidity("editable", !1) : (l.$setValidity("editable", !0), 
                a);
            }), l.$formatters.push(function(a) {
                var b, c, d = {};
                return s ? (d.$model = a, s(i, d)) : (d[v.itemName] = a, b = v.viewMapper(i, d), 
                d[v.itemName] = void 0, c = v.viewMapper(i, d), b !== c ? b : a);
            }), w.select = function(a) {
                var b, c, e = {};
                e[v.itemName] = c = w.matches[a].model, b = v.modelMapper(i, e), u(i, b), l.$setValidity("editable", !0), 
                r(i, {
                    $item: c,
                    $model: b,
                    $label: v.viewMapper(i, e)
                }), z(), d(function() {
                    j[0].focus();
                }, 0, !1);
            }, j.bind("keydown", function(a) {
                0 !== w.matches.length && -1 !== h.indexOf(a.which) && (a.preventDefault(), 40 === a.which ? (w.activeIdx = (w.activeIdx + 1) % w.matches.length, 
                w.$digest()) : 38 === a.which ? (w.activeIdx = (w.activeIdx ? w.activeIdx : w.matches.length) - 1, 
                w.$digest()) : 13 === a.which || 9 === a.which ? w.$apply(function() {
                    w.select(w.activeIdx);
                }) : 27 === a.which && (a.stopPropagation(), z(), w.$digest()));
            }), j.bind("blur", function() {
                m = !1;
            });
            var F = function(a) {
                j[0] !== a.target && (z(), w.$digest());
            };
            e.bind("click", F), i.$on("$destroy", function() {
                e.unbind("click", F);
            });
            var G = a(y)(w);
            t ? e.find("body").append(G) : j.after(G);
        }
    };
} ]).directive("typeaheadPopup", function() {
    return {
        restrict: "EA",
        scope: {
            matches: "=",
            query: "=",
            active: "=",
            position: "=",
            select: "&"
        },
        replace: !0,
        templateUrl: "template/typeahead/typeahead-popup.html",
        link: function(a, b, c) {
            a.templateUrl = c.templateUrl, a.isOpen = function() {
                return a.matches.length > 0;
            }, a.isActive = function(b) {
                return a.active == b;
            }, a.selectActive = function(b) {
                a.active = b;
            }, a.selectMatch = function(b) {
                a.select({
                    activeIdx: b
                });
            };
        }
    };
}).directive("typeaheadMatch", [ "$http", "$templateCache", "$compile", "$parse", function(a, b, c, d) {
    return {
        restrict: "EA",
        scope: {
            index: "=",
            match: "=",
            query: "="
        },
        link: function(e, f, g) {
            var h = d(g.templateUrl)(e.$parent) || "template/typeahead/typeahead-match.html";
            a.get(h, {
                cache: b
            }).success(function(a) {
                f.replaceWith(c(a.trim())(e));
            });
        }
    };
} ]).filter("typeaheadHighlight", function() {
    function a(a) {
        return a.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    }
    return function(b, c) {
        return c ? ("" + b).replace(new RegExp(a(c), "gi"), "<strong>$&</strong>") : b;
    };
}), angular.module("template/accordion/accordion-group.html", []).run([ "$templateCache", function(a) {
    a.put("template/accordion/accordion-group.html", '<div class="panel panel-default">\n  <div class="panel-heading">\n    <h4 class="panel-title">\n      <a class="accordion-toggle" ng-click="toggleOpen()" accordion-transclude="heading"><span ng-class="{\'text-muted\': isDisabled}">{{heading}}</span></a>\n    </h4>\n  </div>\n  <div class="panel-collapse" collapse="!isOpen">\n	  <div class="panel-body" ng-transclude></div>\n  </div>\n</div>');
} ]), angular.module("template/accordion/accordion.html", []).run([ "$templateCache", function(a) {
    a.put("template/accordion/accordion.html", '<div class="panel-group" ng-transclude></div>');
} ]), angular.module("template/alert/alert.html", []).run([ "$templateCache", function(a) {
    a.put("template/alert/alert.html", '<div class="alert" ng-class="[\'alert-\' + (type || \'warning\'), closeable ? \'alert-dismissable\' : null]" role="alert">\n    <button ng-show="closeable" type="button" class="close" ng-click="close()">\n        <span aria-hidden="true">&times;</span>\n        <span class="sr-only">Close</span>\n    </button>\n    <div ng-transclude></div>\n</div>\n');
} ]), angular.module("template/carousel/carousel.html", []).run([ "$templateCache", function(a) {
    a.put("template/carousel/carousel.html", '<div ng-mouseenter="pause()" ng-mouseleave="play()" class="carousel" ng-swipe-right="prev()" ng-swipe-left="next()">\n    <ol class="carousel-indicators" ng-show="slides.length > 1">\n        <li ng-repeat="slide in slides track by $index" ng-class="{active: isActive(slide)}" ng-click="select(slide)"></li>\n    </ol>\n    <div class="carousel-inner" ng-transclude></div>\n    <a class="left carousel-control" ng-click="prev()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-left"></span></a>\n    <a class="right carousel-control" ng-click="next()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-right"></span></a>\n</div>\n');
} ]), angular.module("template/carousel/slide.html", []).run([ "$templateCache", function(a) {
    a.put("template/carousel/slide.html", "<div ng-class=\"{\n    'active': leaving || (active && !entering),\n    'prev': (next || active) && direction=='prev',\n    'next': (next || active) && direction=='next',\n    'right': direction=='prev',\n    'left': direction=='next'\n  }\" class=\"item text-center\" ng-transclude></div>\n");
} ]), angular.module("template/datepicker/datepicker.html", []).run([ "$templateCache", function(a) {
    a.put("template/datepicker/datepicker.html", '<div ng-switch="datepickerMode" role="application" ng-keydown="keydown($event)">\n  <daypicker ng-switch-when="day" tabindex="0"></daypicker>\n  <monthpicker ng-switch-when="month" tabindex="0"></monthpicker>\n  <yearpicker ng-switch-when="year" tabindex="0"></yearpicker>\n</div>');
} ]), angular.module("template/datepicker/day.html", []).run([ "$templateCache", function(a) {
    a.put("template/datepicker/day.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="{{5 + showWeeks}}"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n    <tr>\n      <th ng-show="showWeeks" class="text-center"></th>\n      <th ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}</small></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
} ]), angular.module("template/datepicker/month.html", []).run([ "$templateCache", function(a) {
    a.put("template/datepicker/month.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
} ]), angular.module("template/datepicker/popup.html", []).run([ "$templateCache", function(a) {
    a.put("template/datepicker/popup.html", '<ul class="dropdown-menu" ng-style="{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}" ng-keydown="keydown($event)">\n	<li ng-transclude></li>\n	<li ng-if="showButtonBar" style="padding:10px 9px 2px">\n		<span class="btn-group">\n			<button type="button" class="btn btn-sm btn-info" ng-click="select(\'today\')">{{ getText(\'current\') }}</button>\n			<button type="button" class="btn btn-sm btn-danger" ng-click="select(null)">{{ getText(\'clear\') }}</button>\n		</span>\n		<button type="button" class="btn btn-sm btn-success pull-right" ng-click="close()">{{ getText(\'close\') }}</button>\n	</li>\n</ul>\n');
} ]), angular.module("template/datepicker/year.html", []).run([ "$templateCache", function(a) {
    a.put("template/datepicker/year.html", '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="3"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
} ]), angular.module("template/modal/backdrop.html", []).run([ "$templateCache", function(a) {
    a.put("template/modal/backdrop.html", '<div class="modal-backdrop fade {{ backdropClass }}"\n     ng-class="{in: animate}"\n     ng-style="{\'z-index\': 1040 + (index && 1 || 0) + index*10}"\n></div>\n');
} ]), angular.module("template/modal/window.html", []).run([ "$templateCache", function(a) {
    a.put("template/modal/window.html", '<div tabindex="-1" role="dialog" class="modal fade" ng-class="{in: animate}" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)">\n    <div class="modal-dialog" ng-class="{\'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\'}"><div class="modal-content" modal-transclude></div></div>\n</div>');
} ]), angular.module("template/pagination/pager.html", []).run([ "$templateCache", function(a) {
    a.put("template/pagination/pager.html", '<ul class="pager">\n  <li ng-class="{disabled: noPrevious(), previous: align}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-class="{disabled: noNext(), next: align}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n</ul>');
} ]), angular.module("template/pagination/pagination.html", []).run([ "$templateCache", function(a) {
    a.put("template/pagination/pagination.html", '<ul class="pagination">\n  <li ng-if="boundaryLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(1)">{{getText(\'first\')}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-repeat="page in pages track by $index" ng-class="{active: page.active}"><a href ng-click="selectPage(page.number)">{{page.text}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n  <li ng-if="boundaryLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(totalPages)">{{getText(\'last\')}}</a></li>\n</ul>');
} ]), angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run([ "$templateCache", function(a) {
    a.put("template/tooltip/tooltip-html-unsafe-popup.html", '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" bind-html-unsafe="content"></div>\n</div>\n');
} ]), angular.module("template/tooltip/tooltip-popup.html", []).run([ "$templateCache", function(a) {
    a.put("template/tooltip/tooltip-popup.html", '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" ng-bind="content"></div>\n</div>\n');
} ]), angular.module("template/popover/popover.html", []).run([ "$templateCache", function(a) {
    a.put("template/popover/popover.html", '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="arrow"></div>\n\n  <div class="popover-inner">\n      <h3 class="popover-title" ng-bind="title" ng-show="title"></h3>\n      <div class="popover-content" ng-bind="content"></div>\n  </div>\n</div>\n');
} ]), angular.module("template/progressbar/bar.html", []).run([ "$templateCache", function(a) {
    a.put("template/progressbar/bar.html", '<div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>');
} ]), angular.module("template/progressbar/progress.html", []).run([ "$templateCache", function(a) {
    a.put("template/progressbar/progress.html", '<div class="progress" ng-transclude></div>');
} ]), angular.module("template/progressbar/progressbar.html", []).run([ "$templateCache", function(a) {
    a.put("template/progressbar/progressbar.html", '<div class="progress">\n  <div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>\n</div>');
} ]), angular.module("template/rating/rating.html", []).run([ "$templateCache", function(a) {
    a.put("template/rating/rating.html", '<span ng-mouseleave="reset()" ng-keydown="onKeydown($event)" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="{{range.length}}" aria-valuenow="{{value}}">\n    <i ng-repeat="r in range track by $index" ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="glyphicon" ng-class="$index < value && (r.stateOn || \'glyphicon-star\') || (r.stateOff || \'glyphicon-star-empty\')">\n        <span class="sr-only">({{ $index < value ? \'*\' : \' \' }})</span>\n    </i>\n</span>');
} ]), angular.module("template/tabs/tab.html", []).run([ "$templateCache", function(a) {
    a.put("template/tabs/tab.html", '<li ng-class="{active: active, disabled: disabled}">\n  <a ng-click="select()" tab-heading-transclude>{{heading}}</a>\n</li>\n');
} ]), angular.module("template/tabs/tabset.html", []).run([ "$templateCache", function(a) {
    a.put("template/tabs/tabset.html", '<div>\n  <ul class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></ul>\n  <div class="tab-content">\n    <div class="tab-pane" \n         ng-repeat="tab in tabs" \n         ng-class="{active: tab.active}"\n         tab-content-transclude="tab">\n    </div>\n  </div>\n</div>\n');
} ]), angular.module("template/timepicker/timepicker.html", []).run([ "$templateCache", function(a) {
    a.put("template/timepicker/timepicker.html", '<table>\n	<tbody>\n		<tr class="text-center">\n			<td><a ng-click="incrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n			<td>&nbsp;</td>\n			<td><a ng-click="incrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n			<td ng-show="showMeridian"></td>\n		</tr>\n		<tr>\n			<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidHours}">\n				<input type="text" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">\n			</td>\n			<td>:</td>\n			<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidMinutes}">\n				<input type="text" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2">\n			</td>\n			<td ng-show="showMeridian"><button type="button" class="btn btn-default text-center" ng-click="toggleMeridian()">{{meridian}}</button></td>\n		</tr>\n		<tr class="text-center">\n			<td><a ng-click="decrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n			<td>&nbsp;</td>\n			<td><a ng-click="decrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n			<td ng-show="showMeridian"></td>\n		</tr>\n	</tbody>\n</table>\n');
} ]), angular.module("template/typeahead/typeahead-match.html", []).run([ "$templateCache", function(a) {
    a.put("template/typeahead/typeahead-match.html", '<a tabindex="-1" bind-html-unsafe="match.label | typeaheadHighlight:query"></a>');
} ]), angular.module("template/typeahead/typeahead-popup.html", []).run([ "$templateCache", function(a) {
    a.put("template/typeahead/typeahead-popup.html", '<ul class="dropdown-menu" ng-show="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">\n    <li ng-repeat="match in matches track by $index" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index)" role="option" id="{{match.id}}">\n        <div typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>\n    </li>\n</ul>\n');
} ]), angular.module("electiondesk", [ "btford.socket-io", "timeRelative", "ui.bootstrap", "ui.bootstrap-slider", "cgNotify", "linkify" ]);

var Areas = function() {
    function initialize() {
        var mapOptions = {
            zoom: 4,
            center: new google.maps.LatLng(41.850033, -87.6500523),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        for (var i = 0; i < window.COORDS.length; i++) {
            var polygon = new google.maps.Polygon({
                paths: window.COORDS[i],
                strokeColor: "#FF0000",
                strokeOpacity: .8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: .35
            });
            polygon.setMap(map);
        }
    }
    function bindEvents() {
        function mapClicked(event) {
            drawPolyPoints.insertAt(drawPolyPoints.length, event.latLng);
            var marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                draggable: !0
            });
            drawMarkers.push(marker), marker.setTitle("#" + drawPolyPoints.length), google.maps.event.addListener(marker, "click", function() {
                marker.setMap(null);
                for (var i = 0, I = drawMarkers.length; I > i && drawMarkers[i] != marker; ++i) ;
                drawMarkers.splice(i, 1), drawPolyPoints.removeAt(i);
            }), google.maps.event.addListener(marker, "dragend", function() {
                for (var i = 0, I = drawMarkers.length; I > i && drawMarkers[i] != marker; ++i) ;
                drawPolyPoints.setAt(i, marker.getPosition());
            });
        }
        $("#drawbtn").click(function() {
            if ($("#drawbtn").data("editing") === !0) {
                var name = prompt("What do you want to call this area?");
                if (name) {
                    $("#drawname").val(name);
                    var normalizedPoints = [];
                    drawPolyPoints.forEach(function(point) {
                        normalizedPoints.push({
                            lat: point.lat(),
                            lng: point.lng()
                        });
                    }), $("#drawpoints").val(JSON.stringify(normalizedPoints)), $("#draw-form").submit();
                }
                $("#drawcancelbtn").addClass("hide"), $("#drawbtn").data("editing", !1).val("Saving...");
            } else drawPolygon = new google.maps.Polygon({
                strokeColor: "#0000FF",
                strokeOpacity: .8,
                strokeWeight: 2,
                fillColor: "#0000FF",
                fillOpacity: .35
            }), drawPolygon.setMap(map), drawPolygon.setPaths(new google.maps.MVCArray([ drawPolyPoints ])), 
            drawClickListener = google.maps.event.addListener(map, "click", mapClicked), $("#drawcancelbtn").removeClass("hide"), 
            $("#drawbtn").data("editing", !0).val("Save area");
        }), $("#drawcancelbtn").click(function() {
            google.maps.event.removeListener(drawClickListener), drawPolyPoints = new google.maps.MVCArray(), 
            drawPolygon = null, drawMarkers = [], $("#drawbtn").data("editing", !1).val("Start");
        });
    }
    var map, drawPolygon, drawClickListener, drawPolyPoints = new google.maps.MVCArray(), drawMarkers = [];
    return google.maps.event.addDomListener(window, "load", initialize), {
        init: function() {
            $("body#areas").length && (initialize(), bindEvents());
        }
    };
}();

$(Areas.init), angular.module("electiondesk").factory("dataService", [ "$http", function($http) {
    return {
        getJson: function() {
            return $http.get("/trending/bookmarksinteractions");
        }
    };
} ]).value("modelService", []).controller("BookmarksController", function($scope, dataService, modelService) {
    $scope.bookmark = function(interaction) {
        var messageId = interaction._id.$id;
        interaction.bookmarked ? $http({
            method: "POST",
            url: "/trending/unbookmark",
            data: $.param({
                message: messageId
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).success(function(data) {
            data.error ? "You cannot remove a bookmark that is not bookmarked." != data.error && alert("Could not unbookmark message: " + data.error) : interaction.bookmarked = !1;
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
            data.error ? alert("Could not bookmark message: " + data.error) : interaction.bookmarked = !0;
        });
    }, $scope.interactions = modelService, dataService.getJson().then(function(res) {
        angular.forEach(res.data, function(item) {
            item.bookmarked = !0;
        }), angular.copy(res.data, modelService);
    }, function() {
        alert("Could not load bookmarks");
    });
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

var Conversations = function() {
    function loadConversations() {
        $.get("/conversations/data", function(conversations) {
            if ($("#loading").hide(), conversations.error) return void alert(conversations.error);
            conversations.length <= 0 && $("#no-conversations").show();
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
                $(".go-back").show(), $(".go-back").unbind("click").click(function() {
                    return $("#conversations-overview").show(), $("body").attr("id", "conversations"), 
                    $("#conversations-list > div").hide(), $(".go-back").hide(), !1;
                }), !1;
            });
        });
    }
    function prepareReplyForm(username, message_id) {
        $(".reply textarea").val("@" + username + " ");
        var tweet_length = $(".reply textarea").val().length, remaining = 140 - tweet_length;
        $(".reply .word-count").html(remaining), $(".reply textarea").keyup(function() {
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

var History = function() {
    function restoreSession() {
        var cookie;
        try {
            cookie = $.cookie("history_sources"), null !== cookie && (sources = JSON.parse(cookie), 
            -1 == $.inArray("twitter", sources) && ($(".twitter-toggle").removeClass("on"), 
            $(".twitter-toggle").addClass("off")), -1 == $.inArray("facebook", sources) && ($(".facebook-toggle").removeClass("on"), 
            $(".facebook-toggle").addClass("off")), -1 == $.inArray("googleplus", sources) && ($(".google-toggle").removeClass("on"), 
            $(".google-toggle").addClass("off")));
        } catch (err) {}
        try {
            if (cookie = $.cookie("history_geo"), null !== cookie) {
                var cookieData = JSON.parse(cookie);
                distance = cookieData.distance, use_geo_near = cookieData.use_geo_near, use_geo_near && $("#distance-select").val(distance);
            }
        } catch (err) {}
        try {
            if (cookie = $.cookie("history_filters"), null !== cookie) filters = JSON.parse(cookie), 
            $.each(filters, function(index, filter_id) {
                var elem = $("#filter-" + filter_id);
                -1 != elem.length && elem.attr("checked", !0);
            }); else {
                var checkbox = $(".main-topics input:first");
                checkbox.attr("checked", !0), filters.push(checkbox.val());
            }
        } catch (err) {}
    }
    function updateStream() {
        var query = $("#filter-form .search-bar").val(), after = $("#from_date").val(), before = $("#to_date").val();
        if (!(before.length <= 0 || after.length <= 0)) {
            var sourcesStr = sources.join(",");
            sources.length <= 0 && (sourcesStr = "all");
            var url = stream_server + "/streams?sources=" + sourcesStr + "&after=" + encodeURIComponent(after) + "&before=" + encodeURIComponent(before) + "&filters=" + filters.join(",") + "&subfilter=" + encodeURIComponent(query);
            use_geo_near && "area" != distance && (url += "&near=" + near + "&distance=" + encodeURIComponent(distance)), 
            $("#feed-stream section").remove(), $("#loading").show(), $("#results").hide(), 
            $.get(url, function(data) {
                $("#loading").hide(), $("#results").show().html((data.length >= 500 ? "500+" : data.length) + " results"), 
                data.length <= 0 && alert("No results, please try a less specific query."), $.each(data, function(index, message) {
                    if (use_geo_near && "area" == distance) {
                        var found = !1;
                        if (message.internal.location) for (var i = 0; i < geofencePolygons.length; i++) if (isPointInPoly(geofencePolygons[i], {
                            x: message.internal.location.coords[0],
                            y: message.internal.location.coords[1]
                        })) {
                            found = !0;
                            break;
                        }
                        if (!found) return;
                    }
                    var section = $("<section>");
                    section.addClass("entry"), section.addClass(message.interaction.type), section.attr("data-messageid", message._id.$id), 
                    "twitter" == message.interaction.type && section.attr("data-twitterid", message.twitter.id);
                    var img = $("<img>");
                    img.attr("src", message.interaction.author.avatar), img.attr("alt", message.interaction.author.name), 
                    img.addClass("profile-pic"), section.append(img);
                    var timestamp = $("<time>").attr("datetime", message.interaction.created_at).attr("pubdate", "pubdate").html(moment(message.interaction.created_at).format("LLL"));
                    section.append(timestamp);
                    var link = $('<a class="username">');
                    "facebook" == message.interaction.type ? link.attr("href", message.interaction.author.link) : link.attr("href", message.interaction.link), 
                    link.attr("target", "_blank"), link.html("twitter" == message.interaction.type ? "@" + message.interaction.author.username : message.interaction.author.name), 
                    section.append(link);
                    var paragraph = $("<p>");
                    paragraph.html(message.interaction.content), section.append(paragraph);
                    var actions = $("<ul>");
                    if (actions.addClass("actions"), "twitter" == message.interaction.type && actions.append('<li class="follow"><a href="#"><i class="fa fa-plus"></i>Follow</a></li>'), 
                    message.internal.location && message.internal.location.state) {
                        var location;
                        location = message.internal.location.county && null !== message.internal.location.county ? message.internal.location.county + ", " + message.internal.location.state : message.internal.location.state, 
                        actions.append('<li class="location"><a href="https://maps.google.com/maps?q=' + encodeURIComponent(location) + '">' + location + "</a></li>");
                    }
                    section.append(actions), section.find("img").error(function() {
                        $(this).remove();
                    }), $("#feed-stream").append(section);
                }), attachButtonEvents();
            });
        }
    }
    function attachButtonEvents() {
        $(".actions .follow a").unbind("click").click(function() {
            var section = $(this).parent().parent().parent(), username = section.find("a").html().substr(1);
            return $.post("/tweet/follow", {
                username: username
            }, function(data) {
                alert(data.error ? "Could not follow user: " + data.error : "You are now following @" + username);
            }), !1;
        });
    }
    function isPointInPoly(poly, pt) {
        for (var c = !1, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) (poly[i].y <= pt.y && pt.y < poly[j].y || poly[j].y <= pt.y && pt.y < poly[i].y) && pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x && (c = !c);
        return c;
    }
    function bindEvents() {
        $("#to_date").change(function() {
            $("#from_date").appendDtpicker({
                maxDate: $("#to_date").val()
            });
        }), $("#from_date").change(function() {
            $("#to_date").appendDtpicker({
                minDate: $("#from_date").val()
            });
        }), $("#to_date").trigger("change"), $("#from_date").trigger("change"), null === near && (near = $("#distance-select").attr("data-location")), 
        restoreSession(), $("#filter-form").submit(function() {
            return updateStream(), !1;
        }), $(".main-topics input").click(function() {
            var filter_id = $(this).val();
            if ($(this).is(":checked")) filters.push(filter_id); else {
                var index = filters.indexOf(filter_id);
                -1 != index && filters.splice(index, 1);
            }
            $.cookie("history_filters", JSON.stringify(filters), default_cookie_settings);
        }), $("#distance-select").change(function() {
            var val = $(this).val();
            "all" == val ? use_geo_near = !1 : (distance = val, use_geo_near = !0), $.cookie("history_geo", JSON.stringify({
                distance: distance,
                use_geo_near: use_geo_near
            }), default_cookie_settings);
        }), $(".feed-controls a").click(function() {
            var source = $(this).html().toLowerCase();
            if (source = source.replace("+", "plus"), $(this).hasClass("off")) $(this).removeClass("off"), 
            $(this).addClass("on"), sources.push(source); else {
                $(this).removeClass("on"), $(this).addClass("off");
                var index = sources.indexOf(source);
                -1 != index && sources.splice(index, 1);
            }
            return $.cookie("history_sources", JSON.stringify(sources), default_cookie_settings), 
            !1;
        });
    }
    var hostname = window.location.host;
    hostname.indexOf("local") && (hostname = "stage.electiondesk.us");
    var distance, stream_server = "//" + hostname + "/data", use_geo_near = !1, sources = [ "twitter", "facebook", "googleplus" ], filters = [], near = null, default_cookie_settings = {
        expires: 7
    };
    return {
        init: function() {
            $("body#history").length && bindEvents();
        }
    };
}();

$(History.init), angular.module("electiondesk").controller("PostController", function($scope, $http) {
    $scope.twitterAccounts = [], $scope.twitterAccountSelected = null, $scope.twitterErrorMessage = "", 
    $scope.twitterPostContent = "", $scope.processTwitterForm = function() {
        $scope.twitterErrorMessage = "";
        var parameters = {
            message: $scope.twitterPostContent,
            account_id: $scope.twitterAccountSelected
        };
        $http({
            method: "POST",
            url: "/tweet/post",
            data: $.param(parameters),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).success(function(data) {
            data.error ? $scope.twitterErrorMessage = data.error : ($scope.twitterPostContent = "", 
            $("#postModal").modal("hide"));
        });
    }, $scope.loadTwitterAccounts = function() {
        $http.get("/post/twitter").success(function(data) {
            $scope.twitterAccounts = data.accounts;
            for (var i = $scope.twitterAccounts.length - 1; i >= 0; i--) if (1 == $scope.twitterAccounts[i].is_primary) {
                $scope.twitterAccountSelected = $scope.twitterAccounts[i].id;
                break;
            }
        });
    }, $scope.facebookPages = [], $scope.facebookPageSelected = null, $scope.facebookErrorMessage = "", 
    $scope.facebookPostContent = "", $scope.processFacebookForm = function() {
        $scope.facebookErrorMessage = "";
        var parameters = {
            pages: $scope.facebookPageSelected,
            message: $scope.facebookPostContent
        };
        $http({
            method: "POST",
            url: "/post/facebook",
            data: $.param(parameters),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).success(function(data) {
            data.error ? $scope.facebookErrorMessage = data.error : ($scope.facebookPostContent = "", 
            $("#postModal").modal("hide"));
        });
    }, $scope.loadFacebookAccounts = function() {
        $http.get("/post/facebook").success(function(data) {
            $scope.facebookPages = data.pages;
        });
    };
}).directive("modalShown", function() {
    return function($scope, $element) {
        $element.bind("show.bs.modal", function() {
            $scope.loadTwitterAccounts(), $scope.loadFacebookAccounts();
        });
    };
});

var SettingsForm = function() {
    function bindEvents() {
        $(".btn-locate").click(function() {
            return navigator.geolocation ? ($(this).find(".fa").removeClass("fa-location-arrow").addClass("fa-spin").addClass("fa-spinner"), 
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
            $(".btn-locate .fa").removeClass("fa-spin").removeClass("fa-spinner").addClass("fa-location-arrow"), 
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

$(SettingsForm.init), angular.module("electiondesk").factory("socket", function(socketFactory) {
    var hostname = window.location.host;
    return hostname.indexOf("local") && (hostname = "stage.electiondesk.us"), socketFactory({
        ioSocket: io.connect("http://" + hostname + ":4242")
    });
}).controller("StreamController", function($scope, $http, $modal, socket, notify) {
    socket.forward([ "update", "hello" ], $scope), $scope.reply = function(interaction) {
        $modal.open({
            templateUrl: "replyModalContent.html",
            controller: "ReplyModalInstanceController",
            resolve: {
                interaction: function() {
                    return interaction;
                }
            }
        });
    }, $scope.follow = function(interaction) {
        $http({
            method: "POST",
            url: "/tweet/follow",
            data: $.param({
                username: interaction.interaction.author.username
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).success(function(data) {
            notify(data.error ? {
                message: "Could not follow user: " + data.error,
                classes: "alert-danger"
            } : {
                message: "You are now following @" + interaction.interaction.author.username,
                classes: "alert-success"
            });
        });
    }, $scope.retweet = function(interaction) {
        $http({
            method: "POST",
            url: "/tweet/retweet",
            data: $.param({
                message_id: interaction.twitter.id_str || interaction.twitter.id
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).success(function(data) {
            notify(data.error ? {
                message: "Could not follow user: " + data.error,
                classes: "alert-danger"
            } : {
                message: "Retweet successful",
                classes: "alert-success"
            });
        });
    }, $scope.streamIsActive = !0, $scope.topicQuery = {
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
        var messageId = interaction._id.$id;
        interaction.bookmarked ? $http({
            method: "POST",
            url: "/trending/unbookmark",
            data: $.param({
                message: messageId
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).success(function(data) {
            data.error ? "You cannot remove a bookmark that is not bookmarked." != data.error && alert("Could not unbookmark message: " + data.error) : interaction.bookmarked = !1;
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
            data.error ? alert("Could not bookmark message: " + data.error) : interaction.bookmarked = !0;
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
}).controller("ReplyModalInstanceController", function($scope, $modalInstance, $http, interaction) {
    $scope.twitterAccounts = [], $scope.twitterAccountSelected = null, $scope.interaction = interaction, 
    $scope.errorMessage = "", $scope.twitterMessage = "@" + interaction.interaction.author.username + " ", 
    $scope.loadTwitterAccounts = function() {
        $http.get("/post/twitter").success(function(data) {
            $scope.twitterAccounts = data.accounts;
            for (var i = $scope.twitterAccounts.length - 1; i >= 0; i--) if (1 == $scope.twitterAccounts[i].is_primary) {
                $scope.twitterAccountSelected = $scope.twitterAccounts[i].id;
                break;
            }
        });
    }, $scope.loadTwitterAccounts(), $scope.processForm = function() {
        $scope.errorMessage = "";
        var parameters = {
            message_id: $scope.interaction._id.$id,
            tweet_id: $scope.interaction.twitter.id_str || $scope.interaction.twitter.id,
            message: $scope.twitterMessage,
            account_id: $scope.twitterAccountSelected
        };
        $http({
            method: "POST",
            url: "/tweet/post",
            data: $.param(parameters),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).success(function(data) {
            data.error ? $scope.errorMessage = data.error : $modalInstance.close();
        });
    }, $scope.ok = function() {
        $modalInstance.close();
    }, $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
}).filter("topicfilter", function() {
    return function(items, topics) {
        if (!topics) return [];
        var activeTopics = [];
        return angular.forEach(topics, function(active, source) {
            active && activeTopics.push(parseInt(source));
        }), items.filter(function(element) {
            return -1 != activeTopics.indexOf(parseInt(element.internal.filter_id));
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
        if ("custom" == limit) {
            var isPointInPoly = function(poly, pt) {
                for (var c = !1, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) (poly[i].y <= pt.y && pt.y < poly[j].y || poly[j].y <= pt.y && pt.y < poly[i].y) && pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x && (c = !c);
                return c;
            };
            return items.filter(function(element) {
                if ("undefined" == typeof element.internal.location || 0 === element.internal.location.coords[0] || 0 === element.internal.location.coords[1]) return !1;
                for (var i = 0; i < window.STREAM.geofencePolygons.length; i++) if (isPointInPoly(window.STREAM.geofencePolygons[i], {
                    x: element.internal.location.coords[0],
                    y: element.internal.location.coords[1]
                })) return !0;
                return !1;
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