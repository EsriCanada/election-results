/** @license
 |
 |ArcGIS for Canadian Municipalities / ArcGIS pour les municipalités canadiennes
 |Election Results v10.2.0.1-Dev / Résultats électoraux v10.2.0.1-Dev
 |This file was modified by Esri Canada - Copyright 2014 Esri Canada
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
var difference; //variable to store the difference of pods actual length and visible length
var isOrientationChanged = false; //this variable is set to true when the orientation change event is fired
var isInfo = false; //this variable is set to true when the info window is open
var tinyUrl;
var layerCount = 0;
var layerResponseCount = 0;

//Handle orientation change event
function orientationChanged() {
    map.infoWindow.hide();
    if (map) {
        isOrientationChanged = true;
        var timeout = (isMobileDevice && isiOS) ? 100 : 500;
        setTimeout(function () {
            if (isMobileDevice) {
                map.reposition();
                map.resize();
                SetHeightSplashScreen();
                SetHeightElectionResults();
                ResizeBarChart();
                setTimeout(function () {
                    if (selectedGraphic) {
                        map.setExtent(GetBrowserMapExtent(selectedGraphic));
                    }
                    isOrientationChanged = false;
                }, 1000);
            }
            else {
                if (selectedGraphic) {
                    map.centerAt(selectedGraphic);
                    isOrientationChanged = false;
                }
            }
        }, timeout);
    }
}

//Get the extent based on the map-point for browser
function GetBrowserMapExtent(mapPoint) {
    var width = map.extent.getWidth();
    var height = map.extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 4);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Get the extent based on the map-point for mobile
function GetMobileExtent(mapPoint, extent) {
    var width = extent.getWidth();
    var height = extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 4);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Get extent from map-point and extent
function CenterMapPoint(mapPoint, extent) {
    var width = extent.getWidth();
    var height = extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 2);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Resize charts in mobile device when orientation is changed
function ResizeBarChart() {
    if (chartInfo) {
        RemoveChildren(dojo.byId("chartDiv"));
        setTimeout(function () {
            RemoveChildren(dojo.byId("chartDiv"));
            PopulateChartData(chartInfo.ChartType, chartInfo.ChartData, chartInfo.PartyDetails, dojo.byId("chartDiv"), chartInfo.features, chartInfo.CandidateNames, chartInfo.TotalBallots, chartInfo.DisplayWinner); //CanMod: Display Win Party
            SetHeightRepresentativeResults();
        }, 500);
    }
}

//Handle resize browser event
function resizeHandler() {
    if (map) {
        map.reposition();
        map.resize();
        ResetSlideControls();
        setTimeout(function () {
            ResizeBarChart();
        }, 500);
    }
}

//Get the query string value of the provided key
function GetQuerystring(key) {
    var _default;
    if (_default == null) _default = "";
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (qs == null)
        return _default;
    else
        return qs[1];
}

//Hide splash screen container
function HideSplashScreenMessage() {
    if (dojo.isIE < 9) {
        dojo.byId("divSplashScreenDialog").style.display = "none";
    }
    dojo.addClass('divSplashScreenContainer', "opacityHideAnimation");
    dojo.replaceClass("divSplashScreenDialog", "hideContainer", "showContainer");

    window.onkeydown = null;
}

//Set height for splash screen
function SetHeightSplashScreen() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h - 110) : (dojo.coords(dojo.byId('divSplashScreenDialog')).h - 80);
    dojo.byId('divSplashContent').style.height = (height + 10) + "px";
    CreateScrollbar(dojo.byId("divSplashContainer"), dojo.byId("divSplashContent"));
}

//Set height and create scrollbar for election results container
function SetHeightElectionResults() {
    var height = dojo.window.getBox().h;
    dojo.byId('divElectionContent').style.height = (height - 55) + "px";
    CreateScrollbar(dojo.byId("divElectionContainer"), dojo.byId("divElectionContent"));
}

//Set height and create scrollbar for representative results container
function SetHeightRepresentativeResults() {
    var height = dojo.window.getBox().h;
    dojo.byId('divRepresentativeScrollContent').style.height = (height - 55) + "px";
    CreateScrollbar(dojo.byId("divRepresentativeDataScrollContainer"), dojo.byId("divRepresentativeScrollContent"));
}

//Show progress indicator
function ShowProgressIndicator(nodeId) {
    dojo.byId('divLoadingIndicator').style.display = "block";
}

//Hide progress indicator
function HideProgressIndicator() {
    dojo.byId('divLoadingIndicator').style.display = "none";
}

//Trim the string
String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); }

//Append '...' for a string
String.prototype.trimString = function (len) {
	//CanMod: Fix issue where sizing does not take into account larger font size in table
	if (isTablet) {
		len = len -3;
	}
    return (this.length > len) ? this.substring(0, len) + "..." : this;
}

//Show sharing container
function ShowSharingContainer() {
    var cellheight = (isMobileDevice || isTablet) ? 79 : 57;
    if (dojo.hasClass('divShareContainer', "showContainerHeight")) {
        dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divShareContainer').style.height = '0px';
    }
    else {
        dojo.byId('divShareContainer').style.height = cellheight + "px";
        dojo.replaceClass("divShareContainer", "showContainerHeight", "hideContainerHeight");
        ShareLink();
    }
	showHideSearch(true);
}

//Create the tiny URL with current extent and selected feature
function ShareLink() {
    tinyUrl = null;
    var mapExtent = GetMapExtent();

    var url = esri.urlToObject(window.location.toString());
    var urlStr = encodeURI(url.path) + "?extent=" + mapExtent;
    if (isInfo) {
        urlStr = encodeURI(url.path) + "?extent=" + mapExtent + "?precinct=" + map.getLayer(precinctLayer.Key).getSelectedFeatures()[0].attributes[precinctLayer.DivisionId] + "?SelectedLayer=" + currentSelectedLayer; //CanMod: PrecinctName-->DivisionId
    }
    else {
        if (map.getLayer(precinctLayer.Key).getSelectedFeatures().length > 0) {
            urlStr = encodeURI(url.path) + "?extent=" + mapExtent + "?precinct=" + map.getLayer(precinctLayer.Key).getSelectedFeatures()[0].attributes[precinctLayer.DivisionId]; //CanMod: PrecinctName-->DivisionId
        }
    }
    url = dojo.string.substitute(mapSharingOptions.TinyURLServiceURL, [urlStr]);

    dojo.io.script.get({
        url: url,
        callbackParamName: "callback",
        load: function (data) {
            tinyResponse = data;
            tinyUrl = data;
            var attr = mapSharingOptions.TinyURLResponseAttribute.split(".");
            for (var x = 0; x < attr.length; x++) {
                tinyUrl = tinyUrl[attr[x]];
            }
        },
        error: function (error) {
            alert(tinyResponse.error);
        }
    });
    setTimeout(function () {
        if (!tinyResponse) {
            alert(messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
            return;
        }
    }, 6000);
}

//Get current map Extent
function GetMapExtent() {
    var extents = Math.round(map.extent.xmin).toString() + "," + Math.round(map.extent.ymin).toString() + "," +
                  Math.round(map.extent.xmax).toString() + "," + Math.round(map.extent.ymax).toString();
    return (extents);
}

//Open login page for facebook,tweet and open Email client with shared link for Email
function Share(site) {
    if (dojo.hasClass('divShareContainer', "showContainerHeight")) {
        dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divShareContainer').style.height = '0px';
    }
	//CanMod: Modified to take in strings for post/status/subject in the config file
    if (tinyUrl) {
		var ShareURL;
        switch (site) {
            case "facebook":
                ShareURL = mapSharingOptions.FacebookShareURL + "?";
				ShareURL += dojo.objectToQuery({u:tinyUrl});
				window.open(ShareURL);
                break;
            case "twitter":
                ShareURL = mapSharingOptions.TwitterShareURL + "?";
				ShareURL += dojo.objectToQuery({text:mapSharingOptions.TwitterText, url:tinyUrl, related:mapSharingOptions.TwitterFollow, hashtags:mapSharingOptions.TwitterHashtag});
				window.open(ShareURL);
                break;
            case "mail":
                ShareURL = "mailto:%20?";
				ShareURL += dojo.objectToQuery({subject:mapSharingOptions.EmailSubject, body:tinyUrl});
				parent.location = ShareURL;
                break;
        }
		//end of CanMod
    }
    else {
        alert(messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
        return;
    }
}

//Display the current location of the user
function ShowMyLocation() {
    navigator.geolocation.getCurrentPosition(
		function (position) {
		    ShowProgressIndicator('map');
		    var mapPoint = new esri.geometry.Point(position.coords.longitude, position.coords.latitude, new esri.SpatialReference({ wkid: 4326 }));
		    var graphicCollection = new esri.geometry.Multipoint(new esri.SpatialReference({ wkid: 4326 }));
		    graphicCollection.addPoint(mapPoint);
		    geometryService.project([graphicCollection], map.spatialReference, function (newPointCollection) {
		        HideProgressIndicator();
		        if (!map.getLayer(precinctLayer.Key).fullExtent.contains(newPointCollection[0].getPoint(0))) {
		            alert(messages.getElementsByTagName("outsideArea")[0].childNodes[0].nodeValue);
		            return;
		        }
		        mapPoint = newPointCollection[0].getPoint(0);
		        map.centerAt(mapPoint);
		        FindPrecinctLayer(mapPoint, null, (!currentSelectedLayer) ? true : false);
		    });
		},
		function (error) {
		    HideProgressIndicator();
		    switch (error.code) {
		        case error.TIMEOUT:
		            alert(messages.getElementsByTagName("timeOut")[0].childNodes[0].nodeValue);
		            break;
		        case error.POSITION_UNAVAILABLE:
		            alert(messages.getElementsByTagName("positionUnavailable")[0].childNodes[0].nodeValue);
		            break;
		        case error.PERMISSION_DENIED:
		            alert(messages.getElementsByTagName("permissionDenied")[0].childNodes[0].nodeValue);
		            break;
		        case error.UNKNOWN_ERROR:
		            alert(messages.getElementsByTagName("unknownError")[0].childNodes[0].nodeValue);
		            break;
		    }
		}, { timeout: 5000 });
}

var scrolling = false; //flag to detect is touch-move event scrolling div

//Create dynamic scrollbar in container for target content
function CreateScrollbar(container, content) {
    var yMax;
    var pxLeft, pxTop, xCoord, yCoord;
    var scrollbar_track;
    var isHandleClicked = false;
    this.container = container;
    this.content = content;
    content.scrollTop = 0;
    if (dojo.byId(container.id + 'scrollbar_track')) {
        RemoveChildren(dojo.byId(container.id + 'scrollbar_track'));
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
    if (!dojo.byId(container.id + 'scrollbar_track')) {
        scrollbar_track = document.createElement('div');
        scrollbar_track.id = container.id + "scrollbar_track";
        scrollbar_track.className = "scrollbar_track";
    }
    else {
        scrollbar_track = dojo.byId(container.id + 'scrollbar_track');
    }

    var containerHeight = dojo.coords(container);
    scrollbar_track.style.height = (containerHeight.h) + "px";
    scrollbar_track.style.right = 0 + 'px';

    var scrollbar_handle = document.createElement('div');
    scrollbar_handle.className = 'scrollbar_handle';
    scrollbar_handle.id = container.id + "scrollbar_handle";

    scrollbar_track.appendChild(scrollbar_handle);
    container.appendChild(scrollbar_track);

    if (content.scrollHeight <= content.offsetHeight + 5) {
        scrollbar_handle.style.display = 'none';
        scrollbar_track.style.display = 'none';
        return;
    }
    else {
        scrollbar_handle.style.display = 'block';
        scrollbar_track.style.display = 'block';
        scrollbar_handle.style.height = Math.max(this.content.offsetHeight * (this.content.offsetHeight / this.content.scrollHeight), 25) + 'px';
        yMax = this.content.offsetHeight - scrollbar_handle.offsetHeight;
        yMax = yMax - 5; //for getting rounded bottom of handle
        if (window.addEventListener) {
            content.addEventListener('DOMMouseScroll', ScrollDiv, false);
        }

        content.onmousewheel = function (evt) {
            ScrollDiv(evt);
        }
    }

    function ScrollDiv(evt) {
        var evt = window.event || evt //equalize event object
        var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
        pxTop = scrollbar_handle.offsetTop;

        if (delta <= -120) {
            var y = pxTop + 10;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
        else {
            var y = pxTop - 10;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = (y - 2) + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    }

    //Attaching events to scrollbar components
    scrollbar_track.onclick = function (evt) {
        if (!isHandleClicked) {
            evt = (evt) ? evt : event;
            pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
            var offsetY;
            if (!evt.offsetY) {
                var coords = dojo.coords(evt.target);
                offsetY = evt.layerY - coords.t;
            }
            else
                offsetY = evt.offsetY;
            if (offsetY < scrollbar_handle.offsetTop) {
                scrollbar_handle.style.top = offsetY + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            }
            else if (offsetY > (scrollbar_handle.offsetTop + scrollbar_handle.clientHeight)) {
                var y = offsetY - scrollbar_handle.clientHeight;
                if (y > yMax) y = yMax // Limit vertical movement
                if (y < 0) y = 0 // Limit vertical movement
                scrollbar_handle.style.top = y + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            }
            else {
                return;
            }
        }
        isHandleClicked = false;
    };

    //Attaching events to scrollbar components
    scrollbar_handle.onmousedown = function (evt) {
        isHandleClicked = true;
        evt = (evt) ? evt : event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) evt.stopPropagation();
        pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
        yCoord = evt.screenY // Vertical mouse position at start of slide.
        document.body.style.MozUserSelect = 'none';
        document.body.style.userSelect = 'none';
        document.onselectstart = function () {
            return false;
        }
        document.onmousemove = function (evt) {
            evt = (evt) ? evt : event;
            evt.cancelBubble = true;
            if (evt.stopPropagation) evt.stopPropagation();
            var y = pxTop + evt.screenY - yCoord;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = (y - 2) + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    };

    document.onmouseup = function () {
        document.body.onselectstart = null;
        document.onmousemove = null;
    };

    scrollbar_handle.onmouseout = function (evt) {
        document.body.onselectstart = null;
    };

    var startPos;
    var scrollingTimer;

    dojo.connect(container, "touchstart", function (evt) {
        touchStartHandler(evt);
    });

    dojo.connect(container, "touchmove", function (evt) {
        touchMoveHandler(evt);
    });

    dojo.connect(container, "touchend", function (evt) {
        touchEndHandler(evt);
    });

    //Handlers for Touch Events
    function touchStartHandler(e) {
        startPos = e.touches[0].pageY;
    }

    function touchMoveHandler(e) {
        var touch = e.touches[0];
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        e.preventDefault();

        pxTop = scrollbar_handle.offsetTop;
        var y;
        if (startPos > touch.pageY) {
            y = pxTop + 10;
        }
        else {
            y = pxTop - 10;
        }

        //setting scrollbar handle
        if (y > yMax) y = yMax // Limit vertical movement
        if (y < 0) y = 0 // Limit vertical movement
        scrollbar_handle.style.top = y + "px";

        //setting content position
        content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));

        scrolling = true;
        startPos = touch.pageY;
    }

    function touchEndHandler(e) {
        scrollingTimer = setTimeout(function () { clearTimeout(scrollingTimer); scrolling = false; }, 100);
    }
    //touch scrollbar end
}

//Refresh container div
function RemoveChildren(parentNode) {
    while (parentNode.hasChildNodes()) {
        parentNode.removeChild(parentNode.lastChild);
    }
}

//Remove scroll bar
function RemoveScrollBar(container) {
    if (dojo.byId(container.id + 'scrollbar_track')) {
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
}

//Show or hide bottom panel
function ShowHideBottomPanel() {
    if (dojo.byId("imgToggle").getAttribute("state") == "maximized") {
        HideBottomPanel();
    }
    else {
        ShowBottomPanel();
    }
}

//Hide bottom panel
function HideBottomPanel() {
    dojo.byId("divToggle").title = intl.showTooltip; //CanMod
    dojo.byId("imgToggle").src = "images/up.png";
    dojo.byId("imgToggle").style.cursor = "pointer";
    dojo.byId("imgToggle").setAttribute("state", "minimized");
    dojo.byId("esriLogo").style.bottom = "10px";
    dojo.byId("divBottomPanelBody").style.height = "0px";
    dojo.replaceClass("divBottomPanelBody", "hideBottomContainer", "showBottomContainer");
    dojo.byId("divBottomPanelHeader").style.bottom = "0px";
    dojo.replaceClass("divBottomPanelHeader", "hideHeaderContainer", "showHeaderContainer");
}

//Show bottom panel
function ShowBottomPanel() {
    dojo.byId("divToggle").title = intl.hideTooltip; //CanMod
    dojo.byId("imgToggle").src = "images/down.png";
    dojo.byId("imgToggle").style.cursor = "pointer";
    dojo.byId("imgToggle").setAttribute("state", "maximized");
    dojo.byId("esriLogo").style.bottom = "250px";
    dojo.byId("divBottomPanelBody").style.height = "250px";
    dojo.replaceClass("divBottomPanelBody", "showBottomContainer", "hideBottomContainer");
    dojo.byId("divBottomPanelHeader").style.bottom = "250px";
    dojo.replaceClass("divBottomPanelHeader", "showHeaderContainer", "hideHeaderContainer");
}

//Slide next pod in the bottom panel
function SlideNext() {
    difference = dojo.byId("divElectionResultsContainer").offsetWidth - dojo.byId("divElectionResultsContent").offsetWidth;
    if (leftOffsetCarosuel > difference) {
        dojo.byId('divSlideLeft').style.display = "block";
        dojo.byId('divSlideLeft').style.cursor = "pointer";
        leftOffsetCarosuel = leftOffsetCarosuel - (infoBoxWidth + 4);
        dojo.byId("divElectionResultsContent").style.left = leftOffsetCarosuel + "px";
        dojo.addClass("divElectionResultsContent", "slideTransition");
        ResetSlideControls();
    }
}

//Reset carousel controls in the bottom panel
function ResetSlideControls() {
    if (leftOffsetCarosuel > (dojo.byId("divElectionResultsContainer").offsetWidth - dojo.byId("divElectionResultsContent").offsetWidth + 4)) {
        dojo.byId('divSlideRight').style.display = "block";
        dojo.byId('divSlideRight').style.cursor = "pointer";
    }
    else {
        dojo.byId('divSlideRight').style.display = "none";
        dojo.byId('divSlideRight').style.cursor = "default";
    }

    if (leftOffsetCarosuel == 0) {
        dojo.byId('divSlideLeft').style.display = "none";
        dojo.byId('divSlideLeft').style.cursor = "default";
    }
    else {
        dojo.byId('divSlideLeft').style.display = "block";
        dojo.byId('divSlideLeft').style.cursor = "pointer";
    }
}

//Slide previous pod in the bottom panel
function SlidePrev() {
    if (leftOffsetCarosuel < 0) {
        if (leftOffsetCarosuel > -(infoBoxWidth + 4)) {
            leftOffsetCarosuel = 0;
        }
        else {
            leftOffsetCarosuel = leftOffsetCarosuel + (infoBoxWidth + 4);
        }
        if (leftOffsetCarosuel >= -10) {
            leftOffsetCarosuel = 0;
        }

        dojo.byId("divElectionResultsContent").style.left = (leftOffsetCarosuel) + "px";
        dojo.addClass("divElectionResultsContent", "slideTransition");

        ResetSlideControls();
    }
}

//Slide to the selected info pod in the bottom panel
function SlideLeft(position) {
    leftOffsetCarosuel = -(position);
    if (position < 10) {
        leftOffsetCarosuel = 0;
    }
    if (position > infoBoxWidth) {
        dojo.byId('divSlideLeft').style.display = "block";
        dojo.byId('divSlideLeft').style.cursor = "pointer";
    }
    dojo.byId("divElectionResultsContent").style.left = -(position) + "px";
    dojo.addClass("divElectionResultsContent", "slideTransition");
    ResetSlideControls();
}

//Show info window in the mobile
function ShowDetails(mapPoint, name, county) {
    map.infoWindow.setTitle("");
    map.infoWindow.setContent("");
    setTimeout(function () {
        var screenPoint;
        selectedGraphic = mapPoint;
        screenPoint = map.toScreen(mapPoint);
        screenPoint.y = map.height - screenPoint.y;
        map.infoWindow.resize(225, 65);
        map.infoWindow.show(screenPoint);
        map.infoWindow.setTitle(name);
        map.infoWindow.setContent(county);
        dojo.connect(map.infoWindow.imgDetailsInstance(), "onclick", function () {
            ShowProgressIndicator();
            dojo.query('.mblListItem', dojo.byId('listElectionContenderContainer')).forEach(dojo.hitch(this, function (node, idx, arr) {
                node.style.display = "block";
            }));

            for (var index in electionResultData) {
                layerCount++;
                FetchElectionResultInformation(index, name);
            }
        });
    }, 100);
}

function FetchElectionResultInformation(index, precinctName) {
    var queryTask = new esri.tasks.QueryTask(electionResultData[index].ServiceURL);
    var query = new esri.tasks.Query();
    query.where = electionResultDataQuery + "='" + precinctName + "'";

    queryTask.executeForIds(query, function (results) {
        layerResponseCount++;
        if (results) {
            if (results.length == 0) {
                dojo.byId('li_' + index).style.display = "none";
            }
        }
        if (layerCount == layerResponseCount) {
            HideProgressIndicator();
            selectedGraphic = null;
            dojo.byId('divElectionResultsView').style.display = "block";
            dojo.replaceClass("divElectionResultsView", "opacityShowAnimation", "opacityHideAnimation");
            dojo.replaceClass("divElectionContenderDetails", "showContainer", "hideContainer");

            dojo.byId("tdListHeader").innerHTML = intl.divisionLabel + ": " + precinctName; //CanMod

            SetHeightElectionResults();
            map.infoWindow.hide();
            selectedGraphic = null;
        }
    });
}

function HideElectionContenderContainer() {
    chartInfo = null;
    dojo.byId("tdList").style.display = "none";
    dojo.byId('divElectionResultsView').style.display = "none";
    dojo.replaceClass("divElectionResultsView", "opacityShowAnimation", "opacityHideAnimation");
    dojo.replaceClass("divElectionContenderDetails", "hideContainer", "showContainer");

    dojo.byId('divElectionContenderContainer').style.display = "block";
    dojo.byId("divRepresentativeDataScrollContainer").style.display = "none";
}

function ReturnElectionContenderContainer() {
    dojo.byId("divRepresentativeDataScrollContainer").style.display = "none";
    dojo.byId('divElectionContenderContainer').style.display = "block";
    dojo.byId("tdList").style.display = "none";
    chartInfo = null;
    SetHeightElectionResults();
}

function HideInformationContainer() {
    map.infoWindow.hide();
    selectedGraphic = null;
    isInfo = false;
}

//Get width of a control when text and font size are specified
String.prototype.getWidth = function (fontSize) {
    var test = document.createElement("span");
    document.body.appendChild(test);
    test.style.visibility = "hidden";

    test.style.fontSize = fontSize + "px";

    test.innerHTML = this;
    var w = test.offsetWidth;
    document.body.removeChild(test);
    return w;
}

//Show bar chart
function ShowBarChart(jsonValues, chartDiv, myLabelSeriesarray, myParallelLabelSeriesarray, winningParty, totalBallots, winString) { //CanMod: Display Win Party
	//CanMod: Reduce candidate list to 9 or fewer
	//jsonValues is always provided in increasing order
	var jsonLength = jsonValues.length;
	var candidatesRemoved = 0;
	if (jsonLength > 10) {
		var subIndex = 0;
		for (var i=0;i<jsonLength;i++) {
			//Reduce array to 8, removing 1 more than 9 to make space for text warning that candidates removed
			if (i < jsonLength - 9) {
				candidatesRemoved++;
				jsonValues.shift(); //Remove the topmost from each list
				myLabelSeriesarray.shift();
				myParallelLabelSeriesarray.shift();
			}
			else {
				//Adjust the value for labels (make them match the index value from jsonValues)
				myLabelSeriesarray[subIndex].value = subIndex + 1;
				myParallelLabelSeriesarray[subIndex].value = subIndex + 1;
				subIndex++;
			}
		}
	}
	//End of CanMod
	
	var colour = "black";
	if (isMobileDevice) {
		colour = "white";
	}
	
    if (!totalBallots) {
        totalBallots = "0"; //CanMod: Show zero instead of N/A
    }
    var chartTitle = '<table style="width:100%;"><tr><td style="width:5px;"></td><td id="tdVoteCast" align="left"> ' + intl.votesCast + ': ' + totalBallots + '</td></td><td align="right">' + winString + ': ' + winningParty + '</td><td style="width:5px;"></td></tr></table>'; //CanMod
    var votesCast = '<table style="width:100%;"><tr><td style="width:5px;"></td><td id="tdVoteCast" align="left"> ' + intl.votesCast + ': ' + totalBallots + '</td></tr></table>'; //CanMod
    var winningParty = '<table style="width:100%;"><tr><td style="width:5px;"></td><td  align="left">' + winString + ': ' + winningParty + '</td></tr></table>'; //CanMod

	//CanMod: Add label to warn that candidates were removed when appropriate
	if (candidatesRemoved != 0) {
		var barChart = new dojox.charting.Chart2D(chartDiv, {title:String(candidatesRemoved) + " " + intl.candNotShown, titlePos:"top",titleGap:1,titleFont:"italic normal normal 8pt Arial",titleFontColor: colour});
	}
	else {
		var barChart = new dojox.charting.Chart2D(chartDiv);
	}
	
    if (isMobileDevice) {

        barChart.margins.l = 0;
        barChart.margins.t = 0;
        barChart.margins.r = 0;
        barChart.margins.b = 0;
        barChart.addPlot("default", { type: "Bars", gap: 0, maxBarSize: 20, margins: 0 });
        barChart.addPlot("other", { type: "Bars", gap: 0, vAxis: "other y", maxBarSize: 20, margins: 0 });
    }
    else {
        barChart.margins.l = 0;
        barChart.margins.t = 0;
        barChart.margins.r = 0;
        barChart.margins.b = 10;
        barChart.addPlot("default", { type: "Bars", gap: 2, maxBarSize: 15, margins: 0 });
        barChart.addPlot("other", { type: "Bars", gap: 2, vAxis: "other y", maxBarSize: 15, margins: 0 });
    }
    barChart.addAxis("x",
    { stroke: {color: colour, width:0}, //CanMod
      includeZero: true,
      minorTicks: false,
      majorLabels: false, //CanMod
      minorLabels: false,
      fontColor: colour,
	  font: "normal normal normal 1pt Arial", //CanMod
      microTicks: false,
      min: 25, max: 100
  });
  
	if (isMobileDevice) {
		var fontAx = "normal normal normal 12px Verdana";
    }
    else {
		var fontAx = "normal normal normal 11px Verdana";
    }
    barChart.addAxis("y",
    { labels: myLabelSeriesarray,
        fontColor: colour,
        stroke: colour,
        natural: false, majorTickStep: 1, minorTicks: false,
        fixUpper: false,
        vertical: true,
		font: fontAx
    });

    barChart.addAxis("other x", { leftBottom: false, labels: false });

    barChart.addAxis("other y", { vertical: true,
        leftBottom: false,
        fontColor: colour,
        minorTicks: false,
        stroke: colour,
        labels: myParallelLabelSeriesarray,
		font: fontAx
    });

    barChart.addSeries("Series 1", jsonValues);
    barChart.addSeries("Series 2", jsonValues, { plot: "other" });
    var myTheme = dojox.charting.themes.Desert;
    myTheme.chart.fill = "transparent";
    myTheme.plotarea.fill = "transparent";
    if (isBrowser) {
        myTheme.axis.tick.font = "normal normal normal 11px Verdana";
    }
    else if (isMobileDevice) {
        myTheme.axis.tick.font = "normal normal normal 12px Verdana";
    }
    else {
        myTheme.axis.tick.font = "normal normal normal 14px Verdana";
    }
    myTheme.axis.tick.color = colour;
    barChart.setTheme(myTheme);

    barChart.render();

    for (var g = 0; g < chartDiv.childNodes.length; g++) {
        chartDiv.childNodes[g].style.float = "left";
    }


    dojo.query('text', chartDiv).forEach(dojo.hitch(this, function (node, idx, arr) {
        node.setAttribute("text-rendering", "initial");
        var y = node.getAttribute("y");
        y = Number(y).toFixed(0);
        node.setAttribute("y", y);
    }));

    if (isMobileDevice) {
        var votesDiv = document.createElement("div");
        votesDiv.className = "divVotes";
        votesDiv.innerHTML = votesCast;
        var winningPartyDiv = document.createElement("div");
        winningPartyDiv.className = "divWinningParty";
        winningPartyDiv.innerHTML = winningParty;
        chartDiv.appendChild(votesDiv);
        chartDiv.appendChild(winningPartyDiv);
    }
    else {
        var div = document.createElement("div");
        div.innerHTML = chartTitle;
        div.className = "divChartTitle";
        chartDiv.appendChild(div);
    }
}

// Show Pie Chart
function ShowPieChart(jsonValues, chartDiv, displayText) {
	var colour = "black";
	if (isMobileDevice) {
		colour = "white";
	}

    var chartTable = dojo.create("table", { "style": "width:100%;height:100%;" }, chartDiv);
    var chartTbody = dojo.create("tbody", {}, chartTable);
    var chartRow = dojo.create("tr", {}, chartTbody);
    var chartColumn = dojo.create("td", { "align": "left" }, chartRow);
    var chartLegendColumn = dojo.create("td", {}, chartRow);

    var chartContainer = dojo.create("div", { "style": "width:120px; height:120px;" }, chartColumn);
    chartContainer.style.width = "120px";
    chartContainer.style.height = "120px";

    var pieChart = new dojox.charting.Chart2D(chartContainer);

    pieChart.addPlot("default", {
        type: "Pie",
        radius: 50,
        labels: false,
        startAngle: 0,
        labelOffset: -30
    });

    pieChart.addSeries("Series A", jsonValues);
    var myTheme = dojox.charting.themes.Desert;
    myTheme.chart.fill = "transparent";
    myTheme.plotarea.fill = "transparent";
    myTheme.series.fontColor = colour;
    myTheme.series.font = "normal normal normal 9pt Verdana";
    pieChart.setTheme(myTheme);

    pieChart.render();

    var chartLegandTable = dojo.create("table", { "style": "width:100%;" }, chartLegendColumn);
    var chartLegandTbody = dojo.create("tbody", {}, chartLegandTable);

    for (var i in jsonValues) {
        var tr = dojo.create("tr", {}, chartLegandTbody);
        var tdColor = dojo.create("td", { "align": "center", "style": "width: 20px;" }, tr);
        dojo.create("div", { "style": "width: 18px; height: 18px; background-color: " + jsonValues[i].color }, tdColor);
        var tdText = dojo.create("td", { "align": "left" }, tr);
        tdText.innerHTML = jsonValues[i].text
    }
}

//Create Dynamic map services
function CreateDynamicMapServiceLayer(layerId, layerURL) {
    var imageParams = new esri.layers.ImageParameters();
    var lastindex = layerURL.lastIndexOf('/');
    var layerIndex = layerURL.substr(lastindex + 1)
    imageParams.layerIds = [layerURL.substr(lastindex + 1)];
    imageParams.layerOption = esri.layers.ImageParameters.LAYER_OPTION_SHOW;
    if (layerId) {
        var dynamicLayer = layerURL.substring(0, lastindex);
        var layertype = dynamicLayer.substring(((dynamicLayer.lastIndexOf("/")) + 1), (dynamicLayer.length));
        if (layertype == "FeatureServer") {
            var mapService = CreateFeatureServiceLayer(layerId, layerURL);
            return mapService;
        }
        else {
            var dynamicMapService = new esri.layers.ArcGISDynamicMapServiceLayer(dynamicLayer, {
                id: layerId,
                imageParameters: imageParams,
                opacity: 0.6,
                visible: false
            });
            return dynamicMapService;
        }

    }
    else {
        var dynamicLayer = layerURL;
        imageParams.layerIds = [0];
        var dynamicMapService = new esri.layers.ArcGISDynamicMapServiceLayer(dynamicLayer, {
            imageParameters: imageParams,
            opacity: 1,
            visible: true
        });
        return dynamicMapService;
    }
}

function CreateFeatureServiceLayer(layerId, layerURL) {
    var dynamicMapService = new esri.layers.FeatureLayer(layerURL, {
        mode: ((dojo.isIE<9)?esri.layers.FeatureLayer.MODE_ONDEMAND:esri.layers.FeatureLayer.MODE_SNAPSHOT),
        id: layerId,
        outFields: ["*"],
		maxAllowableOffset: 2,
		opacity: 0.6
    });
    return dynamicMapService;
}

//Show Dynamic map service
function ShowDynamicMap(key) {
    for (var index in electionResultData) {
        if (map.getLayer(index)) {
            map.getLayer(index).hide();
        }
    }
    map.getLayer(key).show();
}

//Show info window in the browser and tablets
function ShowInfoWindow(mapPoint, precintName, carouselVisible) {
    if (!isMobileDevice) {
        isInfo = true;
    }
    map.infoWindow.hide();
    selectedGraphic = null;
    var queryTask = new esri.tasks.QueryTask(electionResultData[currentSelectedLayer].ServiceURL);
    var query = new esri.tasks.Query();
    if (precintName) {
        query.where = electionResultDataQuery + "='" + precintName + "'";
    }
    else {
        query.geometry = mapPoint;
        query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_WITHIN;
    }
    query.outFields = ["*"];
    query.returnGeometry = true;
    ShowProgressIndicator('map');
    queryTask.execute(query, function (features) {
        HideProgressIndicator();
        if (features.features.length == 0) {
            alert(dojo.string.substitute(messages.getElementsByTagName("noContest")[0].childNodes[0].nodeValue, [currentSelectedPrecinct,intl.divisionLabel])); //CanMod
            return;
        }
        dojo.byId("tdTitle").innerHTML = intl.divisionLabel + " - " + features.features[0].attributes[precinctLayer.DivisionId]; //CanMod: PrecinctName-->DivisionId
        if (!carouselVisible) {
            map.setExtent(CenterMapPoint(mapPoint, features.features[0].geometry.getExtent().expand(4)));
        }
        selectedGraphic = mapPoint;

        if (isBrowser) {
            map.infoWindow.resize(424, 225);
        }
        else {
            map.infoWindow.resize(424, 250);
        }
        var screenPoint = map.toScreen(mapPoint);
        screenPoint.y = map.height - screenPoint.y;
        map.infoWindow.show(screenPoint);
        var chartContainer = dojo.byId("divResultChartContainer");
        RemoveChildren(chartContainer);
        var table = document.createElement("table");
        table.style.width = "100%";
        var tbody = document.createElement("tbody");
        table.appendChild(tbody);
        var tr = document.createElement("tr");
        tbody.appendChild(tr);
        var td = document.createElement("td");
        tr.appendChild(td);
        td.innerHTML = electionResultData[currentSelectedLayer].Title;
        td.style.fontWeight = "bold";
        td.style.paddingLeft = "10px";
        chartContainer.appendChild(table);

        var divChartContent = document.createElement("div");
        chartContainer.appendChild(divChartContent);
        divChartContent.className = "divInfoWindowContent";
        PopulateChartData(electionResultData[currentSelectedLayer].ChartType, electionResultData[currentSelectedLayer].ChartData, electionResultData[currentSelectedLayer].PartyDetails, divChartContent, features, electionResultData[currentSelectedLayer].CandidateNames, electionResultData[currentSelectedLayer].TotalBallots,electionResultData[currentSelectedLayer].DisplayWinner); //CanMod: Display Win Party

        setTimeout(function () {
            if (dojo.coords("divShareContainer").h > 0) {
                ShareLink();
            }
        }, 500);

    }, function (err) {
        alert(dojo.string.substitute(messages.getElementsByTagName("unableToLocatePrecinct")[0].childNodes[0].nodeValue,[intl.divisionLabel])); //CanMod
    });
}

//Convert string to bool
String.prototype.bool = function () {
    return (/^true$/i).test(this);
};

//Show/Hide the IE7/Mobile/Tablet search window
function showHideSearch(closeOnly) {
	var disp = dojo.byId("divAddressSearch").style.display;
	if (disp == "block") {
		dojo.byId("divAddressSearch").style.display = "none";
		dojo.byId("imgSearch").setAttribute("aria-expanded","false");
	}
	else if (disp == "none" && !closeOnly) {
		if (dojo.hasClass('divShareContainer', "showContainerHeight")) {
			dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
			dojo.byId('divShareContainer').style.height = '0px';
		}
		dojo.byId("divAddressSearch").style.display = "block";
		dojo.byId("imgSearch").setAttribute("aria-expanded","true");
	}
}