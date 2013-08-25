// ReSharper disable MisuseOfOwnerFunctionThis
(function (exports) {
    "use strict";
    var document = exports.document;
    
    exports.evaluator = function(args) {
        var func = new Function(args);
        func.call();
    };

    var AppBarModel = function () {
        var _onTapped = [];
        var _ItemTapped = function(result) {
            var title = result;
            
            Array.prototype.forEach.call(_onTapped, function(item) {
                item(title);
            });
        };
        
        this.onTapped = function(action) {
            _onTapped.push(action);
        }.bind(this);
        
        var _onBackDelegate = [];
        var _onBack = function() {
            Array.prototype.forEach.call(_onBackDelegate, function(item) {
                item();
            });
        };
        
        this.onBack = function(action) {
            _onBackDelegate.push(action);
        }.bind(this);

        this.captureBackButton = function() {
            cordova.exec(function () { _onBack(); }, null, "NativeAppBarCommand", "CaptureBackButton", true);
        }.bind(this);

        this.releaseBackButton = function() {
            cordova.exec(function () { _onBack(); }, null, "NativeAppBarCommand", "CaptureBackButton", false);
        }.bind(this);

        this.addMenuItem = function(title) {
            cordova.exec(function (msg) { _ItemTapped(msg); }, null, "NativeAppBarCommand", "CreateMenuItem", JSON.stringify({ title: title }));
        }.bind(this);

        this.addMenuButton = function(title, icon) {
            cordova.exec(function (msg) { _ItemTapped(msg); }, null, "NativeAppBarCommand", "CreateButton", JSON.stringify({ title: title, icon: icon }));
        }.bind(this);
    };
    exports.AppBar = new AppBarModel();

    exports.StickyManager = function (el) {

        var colours = document.querySelector("#changeColourBar");
        var editBar = document.querySelector("#editBar");

        this.elements = [];
        this.el = el;
        this.activeSticky = null;

        this.makeSticky = function (options) {

            var stickyEl = document.createElement("div");
            var stickInnerEl = document.createElement("div");
            var tapeEl = document.createElement("span");
            stickInnerEl.className = "content";
            stickInnerEl.style.tabStop = "-1";

            this.el.appendChild(stickyEl);
            stickyEl.appendChild(stickInnerEl);
            stickyEl.appendChild(tapeEl);

            var initialClass = "draggy";
            if (!!options.path) {
                var imageCover = document.createElement("div");
                imageCover.style.position = "absolute";
                imageCover.style.width = "100%";
                imageCover.style.height = "100%";
                imageCover.style.zIndex = "999";
                imageCover.style.top = "0";
                imageCover.style.left = "0";
                stickyEl.appendChild(imageCover);
                initialClass = "draggyImg";
            }
            stickyEl.className = initialClass + " colour1";
            var sticky = new StickyNote(options, stickyEl, this);
            this.elements.push(sticky);

        }.bind(this);

        this.saveStickies = function () {
            var saveData = [];
            this.elements.forEach(function (item) {
                saveData.push(item.data);
            });
            localStorage["Stickies"] = JSON.stringify(saveData);
        }.bind(this);

        this.loadStickies = function () {
            //var app = WinJS.Application;
            var self = this;

            var serialized = localStorage["Stickies"];
            if (!!serialized) {
                JSON.parse(serialized).forEach(function (item) {
                    self.makeSticky(item);
                });
                if (typeof self.dropStickyCallback == "function") {
                    self.dropStickyCallback();
                }
            }
        };

        this.showTools = function () {
            //begin edit mode
            var style = window.getComputedStyle(this.activeSticky.el, null);

            var left = parseInt(style.getPropertyValue("left"), 10),
                top = parseInt(style.getPropertyValue("top"), 10),
                height = parseInt(style.getPropertyValue("height"), 10),
                width = parseInt(style.getPropertyValue("width"), 10);

            if (!!jQuery) {
                var jqPos = $(this.activeSticky.el).position();
                left = jqPos.left;
                top = jqPos.top;
            }

            if (!!this.activeSticky.data.canEditClass || typeof this.activeSticky.data.canEditClass == "undefined") {
                colours.style.left = (left) + "px";
                colours.style.top = (top + height + 22) + "px";
                colours.style.display = "block";
            }

            editBar.style.left = (left + width + 20) + "px";
            editBar.style.top = (top) + "px";
            editBar.style.display = "block";

            if (!!this.activeSticky.data.path) {
                editBar.querySelector(".edit").style.display = "none";
            } else {
                editBar.querySelector(".edit").style.display = "block";
            }
            
            if (typeof this.dropStickyCallback == "function") {
                this.dropStickyCallback();
            }
        }.bind(this);

        this.hideTools = function() {
            colours.style.display = "none";
            editBar.style.display = "none";
        }.bind(this);

        this.dragOver = function (event) {

            if (this.activeSticky != null && !!this.activeSticky.dragStarted && !this.activeSticky.dragging) {
                this.activeSticky.dragging = true;
            }

            if (!!this.activeSticky && !!this.activeSticky.dragging) {
                var offset = this.activeSticky.dragStartPos.split(',');
                this.activeSticky.updatePosition({
                    x: (event.distX + parseInt(offset[0], 10)) + 'px',
                    y: (event.distY + parseInt(offset[1], 10)) + 'px'
                });
            }

            event.preventDefault();
            return false;
            
        }.bind(this);

        this.drop = function (event) {

            if (!!this.activeSticky && !!this.activeSticky.dragging) {
                
            } else if (!!this.activeSticky && this.activeSticky.dragStarted) {
                this.activeSticky.dragging = false;
                this.activeSticky.dragStarted = false;
                
            } else if (!!this.activeSticky && this.activeSticky.isInEditMode && !$(event.target).is(".draggy") && !$(event.target).is(".content")) {
                this.hideTools();
                this.activeSticky.finishEditMode();
                this.saveStickies();
            } else if (!!this.activeSticky && !$(event.target).is(".draggy") && !$(event.target).is(".content")) {
                this.hideTools();
                this.activeSticky = null;
            }
        }.bind(this);

        this.editClicked = function (event) {

            this.activeSticky.editContentMode();

            event.preventDefault();
            event.stopPropagation();
            return false;
        }.bind(this);

        this.deleteClicked = function (event) {
            var toDelete = this.activeSticky;
                toDelete.deleteMe();
        }.bind(this);

        this.changeColourClicked = function(event) {

            var initialClass = "draggy";
            if (!!this.activeSticky.data.path) {
                initialClass = "draggyImg";
            }
            
            this.activeSticky.updateCss(initialClass + " " + event.target.parentNode.className);
            this.saveStickies();
            
            event.preventDefault();
            event.stopPropagation();
            return false;
        }.bind(this);

        $(this.el).bind('move', this.dragOver);
        $(this.el).bind('moveend click', this.drop);
        $(document).bind("click", this.drop);

        $("li.edit a", editBar).bind('MSPointerUp click', this.editClicked);
        $("li.delete a", editBar).bind('MSPointerUp click', this.deleteClicked);

        Array.prototype.forEach.call(colours.querySelectorAll("li a"), function(li) {
            $(li).bind('MSPointerUp click', this.changeColourClicked);
        }.bind(this));
        
    };

    exports.StickyNote = function (from, el, stickyManager) {

        this.el = el;
        this.manager = stickyManager;
        this.data = {};
        var self = this;
        
        if (!!from.path) {
            this.data.path = from.path;
            
            Windows.Storage.StorageFile.getFileFromPathAsync(from.path).done(function (f) {
                self.el.querySelector("div.content").innerHTML =
                toStaticHTML("<img src='" + URL.createObjectURL(f) + "' style='max-height: 200px;' tabstop='-1' onmousedown='javascript: return false;' />");
            });
        }
        else if (!!from.content) {
            this.data.content = from.content || "new sticky";
            this.el.querySelector("div.content").innerText = this.data.content;
        }
        if (typeof from.canEditClass != "undefined") {
            this.data.canEditClass = from.canEditClass;
        }

        this.isInEditMode = false;
        this._isInEditModeInternal = false;
        this.dragStarted = false;
        this.dragging = false;

        if (!!from.className) {
            this.el.className = from.className;
            this.data.className = from.className;
        }

        this.dragStart = function (event) {
            if (!!this.manager.activeSticky && this.manager.activeSticky != this) {
                this.manager.activeSticky.finishEditMode();
            }

            if (this.isInEditMode == false && this._isInEditModeInternal == false) {
                var style = window.getComputedStyle(event.target, null);

                var left = parseInt(style.getPropertyValue("left"), 10),
                    top = parseInt(style.getPropertyValue("top"), 10);
                if (!!jQuery) {
                    var jqPos = $(this.el).position();
                    left = jqPos.left;
                    top = jqPos.top;
                }

                var data = (left) + ','
                    + (top);
                this.manager.activeSticky = this;
                this.dragStartPos = data;
                this.dragStarted = true;
                this.manager.hideTools();
            } else {
                this.dragStarted = false;
                this.dragging = false;
               // event.stopPropagation();
                
            }

            if (!!this.data.path) {
                event.preventDefault();
                return false;
            }

        }.bind(this);

        this.clickedOn = function (event) {
            
            if (this.dragging) {
                if (this.dragStarted && this.dragging) {
                    this.manager.showTools();
                }
                this.manager.saveStickies();
                event.stopPropagation();
            } else if (this.manager.activeSticky != this) {
                this.manager.activeSticky = this;
                this.manager.showTools();
                event.stopPropagation();
            }
            this.dragStarted = false;
            this.dragging = false;

            
        }.bind(this);

        this.updatePosition = function (point) {
            if (!!point.x) {
                this.el.style.left = point.x;
                this.data.x = point.x;
            }
            if (!!point.y) {
                this.el.style.top = point.y;
                this.data.y = point.y;
            }
        }.bind(this);

        this.updatePosition(from);

        this.editContentMode = function (e) {
            this.isInEditMode = true;
            this._isInEditModeInternal = true;
            this.el.querySelector("div.content").contentEditable = true;
            this.el.querySelector("div.content").focus();
            var self = this;
            setTimeout(1000, function() {
                self.el.querySelector("div.content").focus();
            });
        }.bind(this);

        this.finishEditMode = function (e) {
            this.isInEditMode = false;
            this._isInEditModeInternal = false;
            this.el.querySelector("div.content").contentEditable = false;
            if (!this.data.path) {
                this.data.content = this.el.querySelector("div.content").innerText;
                this.el.querySelector("div.content").innerText = this.data.content;
            }
            this.manager.saveStickies();
        }.bind(this);

        this.deleteMe = function (e) {
            $(this.el).unbind('movestart', this.dragStart);
            var index = this.manager.elements.indexOf(this);
            this.manager.elements.splice(index, 1);
            this.el.parentNode.removeChild(this.el);
            this.manager.hideTools();
            this.manager.saveStickies();
        }.bind(this);

        this.updateCss = function(newCss) {

            this.data.className = newCss;
            this.el.className = newCss;

        }.bind(this);

        $(this.el).bind('movestart', this.dragStart);
        $(this.el).bind('moveend click', this.clickedOn);

    };

}(window));