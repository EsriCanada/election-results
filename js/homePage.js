/** @license
 |
 |ArcGIS for Canadian Municipalities / ArcGIS pour les municipalités canadiennes
 |Election Results v10.2.0 / Résultats électoraux v10.2.0
 |This file was modified by Esri Canada - Copyright 2013 Esri Canada
 |
 | Version 10.2
 | Copyright 2013 Esri
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
dojo.require("esri.map");
dojo.require("esri.tasks.geometry");
dojo.require("dojox.mobile.parser");
dojo.require("dojox.mobile");
dojo.require("dojo.window");
dojo.require("esri.tasks.locator");
dojo.require("esri.tasks.query");
dojo.require("esri.layers.FeatureLayer");
dojo.require("dojo.string");
dojo.require("dojox.charting.Chart2D");
dojo.require("dojox.charting.themes.Desert");
dojo.require("js.config");
dojo.require("dojo.date.locale");
dojo.require("js.date");
dojo.require("esri.geometry.Extent"); //CanMod
dojo.require("esri.SpatialReference"); //CanMod

var map;  //variable to store map object

var isiOS = false; //This variable will be set to 'true' if the application is accessed from iPhone or iPad
var isBrowser = false; //This variable will be set to 'true' when application is accessed from desktop browsers
var isMobileDevice = false; //This variable will be set to 'true' when application is accessed from mobile phone device
var isTablet = false; //This variable will be set to 'true' when application is accessed from tablet device

var zoomLevel; //variable to store the zoom level
var locator; //variable to store the locator URL
var leftOffsetCarosuel = 0;    //Variable to store the new left value for carousel of Elected Offices
var selectedGraphic = null; // variable to store selected map point

var electionResultData; //variable to store the Election Result Data
var currentSelectedLayer = null; //variable to store the Currently Selected Layer
var currentSelectedPrecinct = null; //variable to store the Currently Selected Precinct

var baseMapLayers; //variable to store the Base Map Layers
var mapSharingOptions; //variable for storing the tiny service URL
var geometryService; //variable to store the Geometry service used for Geo-coding
var precinctLayer; //variable to store the Precinct Layer

var infoBoxWidth; //variable to store the carousel pod width

var colorCodeOfParties; //variable to store the color code for different parties
var numberOfContests = 0; //variable to store the number of contestants
var nullValueString; //variable to store the default value for replacing null values
var votedColor; //variable to store the color code for those who voted
var didNotVoteColor; //variable to store the color code for those who did not vote

var horizontalPosition = 0; //variable to store the position of pods
var touchStart = false; //this variable will be set to true when touchStart event is fired
var referenceOverlayLayer; //variable to store the reference overlay layer
var updates; //variable to store the time of last update
var locatorSettings; //variable to store locator settings

var lastSearchString; //variable for storing the last search string value
var stagedSearch; //variable for storing the time limit for search
var lastSearchTime; //variable for storing the time of last searched value

var electionResultDataQuery;
var arrowClick = false;

var piechartProportions; //CanMod: Store whether proportions or percents are used for piecharts
var buttonFlash; //CanMod: Store the search button setInterval method

//This initialization function is called when the DOM elements are ready
function init() {
	Internationalization(false); //CanMod: Launch the internationalization function in internationalization.js (variable creation only)

    esri.config.defaults.io.proxyUrl = "proxy.ashx";        //Setting to use proxy file
    esriConfig.defaults.io.alwaysUseProxy = false;
    esriConfig.defaults.io.timeout = 180000;    //Esri request timeout value

    if (!Modernizr.geolocation) {
        dojo.byId("tdGps").style.display = "none";
    }

    var userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("iPhone") >= 0 || userAgent.indexOf("iPad") >= 0) {
        isiOS = true;
    }

    if (userAgent.indexOf("Android") >= 0 || userAgent.indexOf("iPhone") >= 0) {
        isMobileDevice = true;
        dojo.byId('dynamicStyleSheet').href = "styles/mobile.css";
        dojo.byId('divSplashContent').style.fontSize = "15px";
    }
    else if (userAgent.indexOf("iPad") >= 0) {
        isTablet = true;
        dojo.byId('dynamicStyleSheet').href = "styles/tablet.css";
        dojo.byId('divSplashContent').style.fontSize = "14px";
    }
    else {
        isBrowser = true;
        dojo.byId('dynamicStyleSheet').href = "styles/browser.css";
        dojo.byId('divSplashContent').style.fontSize = "11px";
    }

    if (isMobileDevice) {
        dojo.byId('divSplashScreenDialog').style.width = "95%";
        dojo.byId('divSplashScreenDialog').style.height = "95%";
        dojo.byId('divAddressContainer').style.display = "none";
        dojo.replaceClass("divAddressContainer", "", "hideContainer");
        dojo.byId("divLogo").style.display = "none";
        dojo.byId("divBottomPanelHeader").style.display = "none";
        dojo.byId("divBottomPanelBody").style.display = "none";
        dojo.byId("lblAppName").style.display = "none";
        dojo.byId("lblAppName").style.width = "80%";
    }
    else {
        dojo.byId('divSplashScreenDialog').style.width = "350px";
        dojo.byId('divSplashScreenDialog').style.height = "290px";
        dojo.byId("divLogo").style.display = "none";
    }

    var responseObject = new js.config();

    baseMapLayers = responseObject.BaseMapLayers;
    mapSharingOptions = responseObject.MapSharingOptions;
    precinctLayer = responseObject.PrecinctLayer;
    infoBoxWidth = responseObject.InfoBoxWidth;
    electionResultData = responseObject.ElectionResultData;
    colorCodeOfParties = responseObject.ColorCodeOfParties;
    nullValueString = responseObject.ShowNullValueAs;
    votedColor = responseObject.VotedColor;
    didNotVoteColor = responseObject.DidNotVoteColor;
    referenceOverlayLayer = responseObject.ReferenceOverlayLayer;
    //dojo.byId('imgApplication').src = responseObject.ApplicationIcon; //CanMod: Logo no longer used
    updates = responseObject.Updates;
    dojo.byId('divSplashContent').innerHTML = responseObject.SplashScreenMessage;
    locatorSettings = responseObject.LocatorSettings;
    electionResultDataQuery = responseObject.ElectionResultDataQueryString;
	piechartProportions = responseObject.PiechartProportions; //CanMod: Retreive proportions/percent option
	document.title = responseObject.WindowTitle; //CanMod: Change the document title to the one specified in the config page
	
    dojo.connect(dojo.byId("txtAddress"), 'onkeyup', function (evt) {
        if (evt) {
            if (evt.keyCode == dojo.keys.ENTER) {
                if (dojo.byId("txtAddress").value != '') {
                    dojo.byId("imgSearchLoader").style.display = "block";
                    LocateAddress();
                    return;
                }
            }
            if (!((evt.keyCode >= 46 && evt.keyCode < 58) || (evt.keyCode > 64 && evt.keyCode < 91) || (evt.keyCode > 95 && evt.keyCode < 106) || evt.keyCode == 8 || evt.keyCode == 110 || evt.keyCode == 188)) {
                evt = (evt) ? evt : event;
                evt.cancelBubble = true;
                if (evt.stopPropagation) evt.stopPropagation();
                return;
            }
            if (dojo.coords("divAddressContent").h > 0) {
                if (dojo.byId("txtAddress").value.trim() != '') {
                    if (lastSearchString != dojo.byId("txtAddress").value.trim()) {
                        lastSearchString = dojo.byId("txtAddress").value.trim();
                        RemoveChildren(dojo.byId('tblAddressResults'));

                        // Clear any staged search
                        clearTimeout(stagedSearch);

                        if (dojo.byId("txtAddress").value.trim().length > 0) {
                            // Stage a new search, which will launch if no new searches show up
                            // before the timeout
                            stagedSearch = setTimeout(function () {
                                dojo.byId("imgSearchLoader").style.display = "block";
                                LocateAddress();
                            }, 500);
                        }
                    }
                } else {
                    lastSearchString = dojo.byId("txtAddress").value.trim();
                    dojo.byId("imgSearchLoader").style.display = "none";
                    RemoveChildren(dojo.byId('tblAddressResults'));
                    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
                }
            }
        }
    });

    dojo.connect(dojo.byId("txtAddress"), 'onpaste', function (evt) {
        setTimeout(function () {
            LocateAddress();
        }, 100);
    });

    dojo.connect(dojo.byId("txtAddress"), 'oncut', function (evt) {
        setTimeout(function () {
            LocateAddress();
        }, 100);
    });

    dojo.byId("tdsearchAddress").innerHTML = responseObject.LocatorSettings.Locators[0].DisplayText;
    dojo.byId("tdSearchPrecinct").innerHTML = responseObject.LocatorSettings.Locators[1].DisplayText;

    geometryService = new esri.tasks.GeometryService(responseObject.GeometryService);

    locator = new esri.tasks.Locator(responseObject.LocatorSettings.Locators[0].LocatorURL);

    dojo.byId("lblAppNameText").innerHTML = responseObject.ApplicationName; //CanMod
    dojo.connect(dojo.byId('imgHelp'), "onclick", function () {
        window.open(responseObject.HelpURL);
    });
    dojo.byId("txtAddress").setAttribute("defaultAddress", ""); //CanMod: Start off with empty defaults, preventing a default text box value
    dojo.byId("txtAddress").setAttribute("defaultPrecinct", ""); //CanMod: Start off with empty defaults, preventing a default text box value
    //dojo.byId("txtAddress").value = responseObject.LocatorSettings.Locators[0].LocatorDefaultAddress; //CanMod: Setting does not exist anymore
    lastSearchString = dojo.byId("txtAddress").value.trim();
    dojo.connect(dojo.byId('txtAddress'), "ondblclick", ClearDefaultText);
    dojo.connect(dojo.byId('txtAddress'), "onblur", ReplaceDefaultText);
    dojo.connect(dojo.byId('txtAddress'), "onfocus", function (evt) {
        this.style.color = "#FFF";
    });
    ShowProgressIndicator('map');

    if (responseObject.UseWebmap) {
        var webMapData = getWebMapInfo("electionResultsKey", responseObject.WebMapId);
        webMapData.addCallback(function (webMapDetails) {
            electionResultData = {};
            referenceOverlayLayer.ServiceURL = webMapDetails.basemap.url;
            for (var i = 0; i < webMapDetails.operationalLayers.length; i++) {
                if (webMapDetails.operationalLayers[i].popupInfo) {
                    if (webMapDetails.operationalLayers[i].popupInfo.mediaInfos.length > 0) {
                        electionResultData[webMapDetails.operationalLayers[i].id] = {};
                        electionResultData[webMapDetails.operationalLayers[i].id]["Title"] = dojo.trim(webMapDetails.operationalLayers[i].title.split("-")[1]);
                        electionResultData[webMapDetails.operationalLayers[i].id]["HeaderColor"] = "#393939";
                        electionResultData[webMapDetails.operationalLayers[i].id]["ServiceURL"] = webMapDetails.operationalLayers[i].url;
                        electionResultData[webMapDetails.operationalLayers[i].id]["ChartData"] = [];
                        electionResultData[webMapDetails.operationalLayers[i].id]["PartyDetails"] = [];
                        electionResultData[webMapDetails.operationalLayers[i].id]["CandidateNames"] = [];
                        electionResultData[webMapDetails.operationalLayers[i].id]["DisplayOnLoad"] = webMapDetails.operationalLayers[i].visibility;
                        for (var fieldInfo in webMapDetails.operationalLayers[i].popupInfo.fieldInfos) {
                            if (webMapDetails.operationalLayers[i].popupInfo.fieldInfos[fieldInfo].visible) {
                                electionResultData[webMapDetails.operationalLayers[i].id]["TotalBallots"] = webMapDetails.operationalLayers[i].popupInfo.fieldInfos[fieldInfo].fieldName;
                                break;
                            }
                        }

                        for (var x in webMapDetails.operationalLayers[i].popupInfo.mediaInfos[0].value.fields) {
                            electionResultData[webMapDetails.operationalLayers[i].id]["ChartData"].push(webMapDetails.operationalLayers[i].popupInfo.mediaInfos[0].value.fields[x]);
                        }
                        var results = webMapDetails.operationalLayers[i].popupInfo.mediaInfos[0].caption.split(/\r\n|\r|\n/);
                        for (var index in results) {
                            var val = results[index].replace(/\{/g, '');
                            val = val.split("}");
                            if (val.length > 1) {
                                electionResultData[webMapDetails.operationalLayers[i].id]["PartyDetails"].push(val[1]);
                                electionResultData[webMapDetails.operationalLayers[i].id]["CandidateNames"].push(val[0]);
                            }
                        }
                        electionResultData[webMapDetails.operationalLayers[i].id]["ChartType"] = webMapDetails.operationalLayers[i].popupInfo.mediaInfos[0].type;
                    }
                    else {
                        precinctLayer.Key = webMapDetails.operationalLayers[i].id;
                        precinctLayer.ServiceURL = webMapDetails.operationalLayers[i].url;
                        precinctLayer.UseColor = true;
                    }
                }
            }
            Initialize(responseObject.DefaultExtent);
        });
    }
    else {
        Initialize(responseObject.DefaultExtent);
    }
    dojo.xhrGet({
        url: "errorMessages.xml",
        handleAs: "xml",
        preventCache: true,
        load: function (xmlResponse) {
            messages = xmlResponse;
        }
    });
    dojo.connect(window, "onkeydown", function (e) {
        if (e.keyCode == 9) {
            dojo.stopEvent(e);
        }
    });
	Internationalization(true); //CanMod: Launch the internationalization function in internationalization.js along with the code block
}

//function to initialize map after reading the config settings
function Initialize(defaultExtent) {
    var infoWindow = new mobile.InfoWindow({
        domNode: dojo.create("div", null, dojo.byId("map"))
    });

    map = new esri.Map("map", { slider: true, infoWindow: infoWindow });

    var basemap = new esri.layers.ArcGISTiledMapServiceLayer(baseMapLayers[0].MapURL, { id: baseMapLayers[0].Key });
    map.addLayer(basemap);

    dojo.connect(map.getLayer(baseMapLayers.Key), "onLoad", function (e) {
        zoomLevel = e.scales.length - 2;
    });

    dojo.connect(map, "onLoad", function () {
        MapInitFunction(); //Function to create graphics and feature layer
        var mapExtent = defaultExtent.split(',');
        var extent = GetQuerystring('extent');
        if (extent != "") {
            mapExtent = extent.split(',');
        }
        var precinct;
        var url = esri.urlToObject(window.location.toString());
        if (url.query && url.query != null) {
            if (url.query.extent.split("?precinct=").length > 0) {
                var details = url.query.extent.split("?precinct=")[1];
                if (details) {
                    if (details.split("?SelectedLayer=").length > 0) {
                        precinct = details.split("?SelectedLayer=")[0];
                        if (details.split("?SelectedLayer=")[1]) {
                            currentSelectedLayer = details.split("?SelectedLayer=")[1];
                        }
                    }
                }
            }
        }

        mapExtent = new esri.geometry.Extent(parseFloat(mapExtent[0]), parseFloat(mapExtent[1]), parseFloat(mapExtent[2]), parseFloat(mapExtent[3]), map.spatialReference);
        map.setExtent(mapExtent);
        if (precinct) {
            SearchPrecinctName(unescape(precinct), true);
            return;
        }
    });
}

//Function to create graphics and feature layer
function MapInitFunction() {
    window.onresize = function () {
        if (!isMobileDevice) {
            resizeHandler();
        }
        else {
            if (!isOrientationChanged) {
                if (!arrowClick) {
                    orientationChanged();
                }
            }
        }
    }

    var mapSlider = dojo.query(".esriSimpleSlider", this.domNode);
    if (mapSlider.length > 0) {
        dojo.addClass(mapSlider[0], "roundedCorner");
    }

    dojo.byId('divSplashScreenContainer').style.display = "block";

    dojo.addClass(dojo.byId('divSplashScreenDialog'), "divSplashScreenDialogContent");
    dojo.replaceClass("divSplashScreenDialog", "showContainer", "hideContainer");
    SetHeightSplashScreen();

    dojo.connect(map, "onExtentChange", function (evt) {
        if (!isOrientationChanged) {
            if (selectedGraphic) {
                var screenPoint = map.toScreen(selectedGraphic);
                screenPoint.y = map.height - screenPoint.y;
                map.infoWindow.setLocation(screenPoint);
                return;
            }
        }
    });

    CreateElectionResultLayOut();

    var pLayer = new esri.layers.FeatureLayer(precinctLayer.ServiceURL, {
        mode: esri.layers.FeatureLayer.MODE_SELECTION,
        outFields: ["*"]
    });
    pLayer.id = precinctLayer.Key;
    map.addLayer(pLayer);
    if (precinctLayer.UseColor) {
        var precinctSymbol = new esri.symbol.SimpleFillSymbol();
        var precinctColor = new dojo.Color(precinctLayer.Color);
        precinctColor.a = precinctLayer.Alpha;
        precinctSymbol.setColor(precinctColor);
        var precinctRederer = new esri.renderer.SimpleRenderer(precinctSymbol);
        pLayer.setRenderer(precinctRederer);
    }

    dojo.connect(pLayer, "onClick", function (evt) {
        if (!isMobileDevice) {
            if (currentSelectedLayer) {
                ShowInfoWindow(evt.mapPoint, evt.graphic.attributes[precinctLayer.DivisionId]); //CanMod: PrecinctName-->DivisionId
            }
            dojo.stopEvent(evt);
        }
    });

    if (referenceOverlayLayer.DisplayOnLoad) {
        var overlaymap;
        var layerType = referenceOverlayLayer.ServiceURL.substring(((referenceOverlayLayer.ServiceURL.lastIndexOf("/")) + 1), (referenceOverlayLayer.ServiceURL.length));
        if (!isNaN(layerType)) {
            overlaymap = new esri.layers.FeatureLayer(referenceOverlayLayer.ServiceURL, {
                mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
                outFields: ["*"]
            });
            map.addLayer(overlaymap);
        }
        else {
            var url1 = referenceOverlayLayer.ServiceURL + "?f=json";
            esri.request({
                url: url1, handleAs: "json",
                load: function (data) {
                    if (!data.singleFusedMapCache) {
                        var imageParameters = new esri.layers.ImageParameters();
                        //Takes a URL to a non cached map service.
                        overlaymap = new esri.layers.ArcGISDynamicMapServiceLayer(referenceOverlayLayer.ServiceURL, { "imageParameters": imageParameters });
                        overlaymap.id = "overlaymapID";
                        map.addLayer(overlaymap);
                        dojo.connect(overlaymap, "onUpdateEnd", function () {
                            dojo.byId("map_overlaymapID").style.zIndex = 25;
                        });
                    }
                    else {
                        overlaymap = new esri.layers.ArcGISTiledMapServiceLayer(referenceOverlayLayer.ServiceURL);
                        overlaymap.id = "overlaymapID";
                        map.addLayer(overlaymap);
                        dojo.connect(overlaymap, "onUpdateEnd", function () {
                            dojo.byId("map_overlaymapID").style.zIndex = 25;
                        });
                    }
                }
            });
        }
    }


    var layer;
    for (var election in electionResultData) {
        layer = electionResultData[election];
    }
    var queryTask = new esri.tasks.QueryTask(layer.ServiceURL);
    var query = new esri.tasks.Query();
    query.where = "1=1";
    query.returnGeometry = false;
    query.outFields = [updates.FieldName];
    queryTask.execute(query, function (featureSet) {
        var utcMilliseconds = Number(featureSet.features[0].attributes[updates.FieldName]);
        var date = new js.date();
        featureSet.features[0].attributes[updates.FieldName] = dojo.date.locale.format(date.utcToLocal(date.utcTimestampFromMs(utcMilliseconds)), { datePattern: updates.FormatDateAs, timePattern: updates.FormatTimeAs });
        dojo.byId('tdLastUpdate').innerHTML = intl.lastUpdate + ": " + featureSet.features[0].attributes[updates.FieldName];
        dojo.byId("divResultsUpdateInfo").style.display = "block";
    });

    HideProgressIndicator();
    dojo.connect(dojo.byId('divElectionResultsContainer'), "touchstart", function (e) {
        horizontalPosition = e.touches[0].pageX;
        touchStart = true;
    });

    dojo.connect(dojo.byId('divElectionResultsContainer'), "touchmove", function (e) {
        if (touchStart) {
            touchStart = false;
            var touch = e.touches[0];
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            e.preventDefault();
            if (touch.pageX - horizontalPosition >= 2) {
                setTimeout(function () {
                    SlidePrev();
                }, 100);
            }
            if (horizontalPosition - touch.pageX >= 2) {
                setTimeout(function () {
                    SlideNext();
                }, 100);
            }
        }
    });

    dojo.connect(dojo.byId('divElectionResultsContainer'), "touchend", function (e) {
        horizontalPosition = 0
        touchStart = false;
    });
    if (dojo.query('.esriControlsBR', dojo.byId('map')).length > 0) {
        dojo.query('.esriControlsBR', dojo.byId('map'))[0].id = "esriLogo";
    }


}

//Function to create Election Results container
function CreateElectionResultLayOut() {
    if (isMobileDevice) {   //If mobile device, list items are created
        var listServiceTypesContainer = dijit.byId('listElectionContenderContainer');
        for (var index in electionResultData) {
            var li = dojo.create("LI");
            listServiceTypesContainer.containerNode.appendChild(li);
            var itemWidget = new dojox.mobile.ListItem({
                label: electionResultData[index].Title.trimString(20),
                icon: "images/arrow.png",
                id: "li_" + index
            }, li);
            itemWidget.startup();

            itemWidget.domNode.setAttribute("key", index);
            dojo.connect(itemWidget.domNode, "onclick", function (e) {
                arrowClick = true;
                dojo.byId('divElectionContenderContainer').style.display = "none";
                dojo.byId("divRepresentativeDataScrollContainer").style.display = "block";
                RemoveChildren(dojo.byId('divRepresentativeScrollContent'));
                var key = this.getAttribute("key");
                FetchContestData(electionResultData[key], key, null, map.getLayer(precinctLayer.Key).getSelectedFeatures()[0].attributes[precinctLayer.DivisionId], true); //CanMod: PrecinctName-->DivisionId
                dojo.byId("tdList").style.display = "block";
                dojo.byId("tdListHeader").innerHTML = intl.divisionLabel + ": " + map.getLayer(precinctLayer.Key).getSelectedFeatures()[0].attributes["DIVISIONID"]; //CanMod_ID

                setTimeout(function () {
                    arrowClick = false;
                }, 1000);
            });
        }

        if (listServiceTypesContainer.redrawBorders) {
            listServiceTypesContainer.redrawBorders();
        }
    }
    else {  //If not mobile device bottom panel is created and dynamic map services are added to the map
        for (var index in electionResultData) {
            var td = document.createElement("td");
            var templateNode = dojo.byId("divTemplateBox");
            var dataContainerNode = templateNode.cloneNode(true);
            dataContainerNode.style.display = "block";
            dataContainerNode.id = "div" + index;
            dataContainerNode.style.width = infoBoxWidth + "px";

            var dataContainerHeader = dojo.query(".spanHeader", dataContainerNode)[0];
            dataContainerHeader.innerHTML = electionResultData[index].Title;
            var dataContainer = dojo.query(".divContentStyle", dataContainerNode);
            dataContainer[0].id = "div" + index + "container";
            dataContainer[1].id = "div" + index + "content";

            td.appendChild(dataContainerNode);

            var candidateLinktd = document.createElement("td");
            candidateLinktd.id = "tdContest" + index;
            candidateLinktd.setAttribute("candidateLinkId", index);
            candidateLinktd.setAttribute("position", numberOfContests);
            numberOfContests++;
            candidateLinktd.style.borderRight = "1px solid white";
            candidateLinktd.style.fontSize = "10px";

            var divCandidateLink = document.createElement("div");
            divCandidateLink.id = "divContest" + index;
            candidateLinktd.appendChild(divCandidateLink);
            candidateLinktd.onclick = function () {
                //map.setExtent(map.getLayer(precinctLayer.Key).fullExtent); //CanMod: Stop zoom out when layer changed
                HideInformationContainer();
                var key = this.getAttribute("candidateLinkId");
                dojo.query('.border', dojo.byId("divElectionResultsContent")).forEach(function (node, index, arr) {
                    dojo.removeClass(node, "border");
                });
                dojo.addClass(dojo.byId('div' + key), "border");
                if (dojo.byId('div' + key).style.display == "block") {
                    var hiddenContests = 0;
                    for (var index in electionResultData) {
                        if (index == key)
                            break;
                        if (dojo.byId('div' + index).style.display == "none") {
                            hiddenContests++;
                        }
                    }
                    var position = Number(this.getAttribute("position")) - hiddenContests;
                    SlideLeft((position * infoBoxWidth) + (position * 4));
                }
                ShowDynamicMap(key);
                currentSelectedLayer = key;
                currentSelectedPrecinct = this.children[0].title;
                //HideBottomPanel(); //CanMod: Stop panel from being hidden on map click
            }
            dojo.byId("trElectionResults").appendChild(td);
            dojo.byId("trElectionContest").appendChild(candidateLinktd);
            map.addLayer(CreateDynamicMapServiceLayer(index, electionResultData[index].ServiceURL));

            if (electionResultData[index].DisplayOnLoad && !currentSelectedLayer) {
                map.getLayer(index).show();
                currentSelectedPrecinct = electionResultData[index].Title;
            }
            else {
                map.getLayer(index).hide();
            }
        }
        FixWidthBottomPanel();
    }

    //Event handler for map click to fetch the contest details for the selected precinct
    dojo.connect(map, "onClick", function (evt) {
		StopFlashSearchButton(); //CanMod: Stop search button flashing when map click event occurs
        map.infoWindow.hide();
        evt.mapPoint.spatialReference = map.spatialReference;
        FindPrecinctLayer(evt.mapPoint, null, (!currentSelectedLayer) ? true : false);
    });
}

dojo.addOnLoad(init);