/** @license
 |
 |ArcGIS for Canadian Municipalities / ArcGIS pour les municipalités canadiennes
 |Election Results v10.2.0 / Résultats électoraux v10.2.0
 |
 | Version 10.2
 | Copyright 2012 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
dojo.provide("mobile.InfoWindow");
dojo.require("esri.InfoWindowBase");

dojo.ready(function () {
    dojo.declare("mobile.InfoWindow", [esri.InfoWindowBase], {

        constructor: function (parameters) {
            dojo.mixin(this, parameters);

            this.infoWindowWidth;
            this.infoWindowHeight;

            dojo.addClass(this.domNode, "divInfoWindowContainer");

            this._container = dojo.create("div", {}, this.domNode);
            this._title = dojo.create("div", { "class": "title" }, this._container);
            this._content = dojo.create("div", { "class": "content" }, this._container);
            this._anchor = dojo.create("div", { "class": "divTriangle" }, this.domNode);
            this._imgDetails;


            this._spanContent = dojo.create("span", { "class": "spanContentText" }, this._content);
            if (!isMobileDevice) {
                this._title.style.display = 'none';
                this._content.appendChild(dojo.byId('divInfowindowContent'));
            }
            // Hidden initially
            esri.hide(this.domNode);
            this.isShowing = false;
            this._eventConnections = [];
        },

        setMap: function (map) {
            this.inherited(arguments);

        },

        setTitle: function (title, callbackHandler) {
            RemoveChildren(this._title);
            var titleNode = document.createTextNode(title);
            this._title.appendChild(titleNode);
            this._imgDetails = dojo.create("img", { "class": "imgArrow", "src": "images/arrow.png" }, this._title);
        },

        imgDetailsInstance: function () {
            return this._imgDetails;
        },

        setContent: function (content) {
            this._spanContent.style.display = "block";
            this._spanContent.innerHTML = content;
        },

        show: function (location) {
            this._title.style.display = "block";
            if (this._imgDetails)
                this._imgDetails.style.display = "block";

            if (!isMobileDevice) {
                this._title.style.display = 'none';
            }
            this.setLocation(location);
        },

        reSetLocation: function (location) {
            this._title.style.display = "none";
            this._imgDetails.style.display = "none";
            this._spanContent.style.display = "none";

            this.setLocation(location);
        },

        setLocation: function (location) {
            if (location.spatialReference) {
                location = this.map.toScreen(location);
            }

            dojo.style(this.domNode, {
                left: (location.x - (this.infoWindowWidth / 2)) + "px",
                bottom: (location.y + 20) + "px"
            });
            esri.show(this.domNode);
            this.isShowing = true;
        },

        hide: function () {
            esri.hide(this.domNode);
            this.isShowing = false;
            this.onHide();
        },

        resize: function (width, height) {
            this.infoWindowWidth = width;
            this.infoWindowHeight = height;
            dojo.style(this._content, {
                width: width + "px"
            });

            dojo.style(this._container, {
                width: width + "px",
                height: height + "px"
            });
            dojo.style(this.domNode, {
                width: width + "px",
                height: height + "px"
            });
            dojo.style(this._title, {
                width: (width - 10) + "px"
            });
        },

        destroy: function () {
            dojo.forEach(this._eventConnections, dojo.disconnect);
            dojo.destroy(this.domNode);
            this._title = this._content = this._eventConnections = this._imgDetails = null;
        }

    });
});