/** @license
 |
 |ArcGIS for Canadian Municipalities / ArcGIS pour les municipalités canadiennes
 |Election Results v10.2.0.1 / Résultats électoraux v10.2.0.1
 |This file was modified by Esri Canada - Copyright 2014 Esri Canada
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
dojo.require("dojox.mobile.ListItem");
dojo.require("dojox.mobile.EdgeToEdgeList");
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

//Load internationlization object
var intl;
require(["dojo/i18n!js/nls/text"],function(i18n) {intl = i18n;});

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

var electionResultDataQuery;
var arrowClick = false;

var locatorSettings; //variable used to store address search setting
var lastSearchString; //variable for store the last search string
var lastSearchResults; //variable to store the last search candidates
var timeouts = {}; //object to store timeout objects
var searchType; //object to store which search is selected

var piechartProportions; //CanMod: Store whether proportions or percents are used for piecharts

//This initialization function is called when the DOM elements are ready
function init() {
    esri.config.defaults.io.proxyUrl = "proxy.ashx";        //Setting to use proxy file
    esriConfig.defaults.io.alwaysUseProxy = false;
    esriConfig.defaults.io.timeout = 180000;    //Esri request timeout value

    if (!Modernizr.geolocation) {
        dojo.byId("geoBtn").style.display = "none";
    }

	//As of 2013, detects: Mobile: iOS/iPhone, Android Mobile, Blackberry Phone, Windows Phone, Symbian OS, Firefox OS, Opera Mini/Mobile
	//                     Tablet: iOS/iPad, Android Tablet, Blackberry Playbook, Windows RT (Microsoft Surface RT, Asus VivoTab RT, Dell XPS, Lumia Tablets...)
	//                     Browser: All others including Windows 7/8 tablets
    var userAgent = window.navigator.userAgent.toLowerCase(); //used to detect the type of devices
	if (userAgent.indexOf("ipad") >= 0) {
		isiOS = true;
		dojo.byId('divSplashContent').style.fontSize = "14px";
        isTablet = true;
        dojo.byId('dynamicStyleSheet').href = "styles/tablet.css";
    } else if (userAgent.indexOf("iphone") >= 0) {
        isiOS = true;
		dojo.byId('divSplashContent').style.fontSize = "15px";
        isMobileDevice = true;
        dojo.byId('dynamicStyleSheet').href = "styles/mobile.css";
    } else if (userAgent.indexOf("mobile") >= 0 || userAgent.indexOf("opera mini") >= 0 || userAgent.indexOf("opera mobi") >= 0 || userAgent.indexOf("symbian") >= 0) {
		dojo.byId('divSplashContent').style.fontSize = "15px";
        isMobileDevice = true;
        dojo.byId('dynamicStyleSheet').href = "styles/mobile.css";
    } else if (userAgent.indexOf("tablet") >= 0 || /*Android not mobile*/ userAgent.indexOf("android") >= 0 || (/*Windows RT*/ userAgent.indexOf("windows") >= 0 && userAgent.indexOf("arm") >= 0)) {
		dojo.byId('divSplashContent').style.fontSize = "14px";
        isTablet = true;
        dojo.byId('dynamicStyleSheet').href = "styles/tablet.css";
    } else {
        dojo.byId('divSplashContent').style.fontSize = "11px";
        isBrowser = true;
        dojo.byId('dynamicStyleSheet').href = "styles/browser.css";
    }

    if (isMobileDevice) {
        dojo.byId('divSplashScreenDialog').style.width = "95%";
        dojo.byId('divSplashScreenDialog').style.height = "95%";
        dojo.byId("divBottomPanelHeader").style.display = "none";
        dojo.byId("divBottomPanelBody").style.display = "none";
        dojo.byId("lblAppName").style.display = "none";
    }
    else {
        dojo.byId('divSplashScreenDialog').style.width = "350px";
        dojo.byId('divSplashScreenDialog').style.height = "290px";
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
    updates = responseObject.Updates;
    dojo.byId('divSplashContent').innerHTML = responseObject.SplashScreenMessage;
    locatorSettings = responseObject.LocatorSettings;
    electionResultDataQuery = responseObject.ElectionResultDataQueryString;
	piechartProportions = responseObject.PiechartProportions; //CanMod: Retreive proportions/percent option
	document.title = responseObject.WindowTitle; //CanMod: Change the document title to the one specified in the config page
	
	//Display language toggle button if required
	if (responseObject.LanguageButton.Enabled && !isMobileDevice) {
		var langB = document.getElementById("imgLang");
		langB.src = responseObject.LanguageButton.Image;
		langB.alt = responseObject.LanguageButton.Title;
		langB.title = responseObject.LanguageButton.Title;
		
		dojo.connect(langB, "onclick", function() {
			window.location.href = responseObject.LanguageButton.AppURL;
		});
		dojo.connect(langB, "onkeydown", function (evt) {
			var kc = evt.keyCode;
			if (kc == dojo.keys.ENTER || kc == dojo.keys.SPACE) {
				window.location.href = responseObject.LanguageButton.AppURL;
			}
		});
		
		langB.style.display = "inline";
	}
	
	// Initialize search module*/
	dojo.query("[for='searchAddress']")[0].innerHTML = responseObject.LocatorSettings.Locators[0].LabelText;
	dojo.query("[for='searchRequest']")[0].innerHTML = responseObject.LocatorSettings.Locators[1].LabelText;
	if (isMobileDevice) {
		dojo.byId('imgSearch').style.display = "inline";
		dojo.replaceClass(dojo.byId("divAddressSearch"),"searchBlock","searchInline");
		document.getElementById("searchTitle").innerHTML = responseObject.LocatorSettings.Locators[0].DisplayText;
		document.getElementById("searchTitle").style.display = "block";
		dojo.byId("radioDiv").style.display = "block";
		dojo.byId("inputDiv").style.display = "block";
    } else {
		if (dojo.isIE <= 7 || isTablet) {
			dojo.byId('imgSearch').style.display = "inline";
			dojo.replaceClass(dojo.byId("divAddressSearch"),"searchBlock","searchInline");
			document.getElementById("searchTitle").innerHTML = responseObject.LocatorSettings.Locators[0].DisplayText;
			document.getElementById("searchTitle").style.display = "block";
			dojo.byId("radioDiv").style.display = "block";
			dojo.byId("inputDiv").style.display = "block";
		}
		else {
			document.getElementById("searchInput").setAttribute("placeholder", responseObject.LocatorSettings.Locators[0].DisplayText);
			dojo.byId('divAddressSearch').style.display = "inline-block";
		}
		//Prevent map from moving when selecting an autocomplete option with the arrow keys and the mouse is on top of the map
		require(["dojo/on"],function(on) {
			on(dojo.byId("searchInput"),"focus", function	() {
				map.disableKeyboardNavigation();
			});
			on(dojo.byId("searchInput"),"blur", function() {
				map.enableKeyboardNavigation();
			});
		});
	}
	dojo.forEach(dojo.query("[name='searchType']"), function(item,i) {
		item.onclick = function() {searchChange(responseObject.LocatorSettings);}
	});
	searchChange(responseObject.LocatorSettings); //set placeholder text & searchType variable (FF does not reset forms on page refresh)

    geometryService = new esri.tasks.GeometryService(responseObject.GeometryService);

    locator = new esri.tasks.Locator(responseObject.LocatorSettings.Locators[0].LocatorURL);

    dojo.byId("lblAppName").innerHTML = "<img alt='' src='" + responseObject.ApplicationIcon + "'>" + responseObject.ApplicationName;
    dojo.connect(dojo.byId('helpBtn'), "onclick", function () {
        window.open(responseObject.HelpURL);
    });
    ShowProgressIndicator('map');

	Initialize(responseObject.DefaultExtent);

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
	internationalization();
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
            locateDivisionCML2(unescape(precinct), true);
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
			
			//--CanMod: Moved links to display specific races from bottom of pods to the header of each pod
			var fullHeader = dojo.query(".divTemplateHeader", dataContainerNode)[0];
            fullHeader.id = "tdContest" + index;
            fullHeader.setAttribute("candidateLinkId", index);
            fullHeader.setAttribute("position", numberOfContests);
            numberOfContests++;

            fullHeader.onclick = function () {
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
			
            var dataContainer = dojo.query(".divContentStyle", dataContainerNode);
            dataContainer[0].id = "div" + index + "container";
            dataContainer[1].id = "div" + index + "content";

            td.appendChild(dataContainerNode);
            dojo.byId("trElectionResults").appendChild(td);
            map.addLayer(CreateDynamicMapServiceLayer(index, electionResultData[index].ServiceURL));

            if (electionResultData[index].DisplayOnLoad && !currentSelectedLayer) {
                map.getLayer(index).show();
                currentSelectedPrecinct = electionResultData[index].Title;
            }
            else {
                map.getLayer(index).hide();
            }
        }
    }

    //Event handler for map click to fetch the contest details for the selected precinct
    dojo.connect(map, "onClick", function (evt) {
        map.infoWindow.hide();
        evt.mapPoint.spatialReference = map.spatialReference;
        FindPrecinctLayer(evt.mapPoint, null, (!currentSelectedLayer) ? true : false);
    });
}

//Internationlization of pre-loaded content
function internationalization() {
	dojo.byId("tdTitle").innerHTML = intl.divisionLabel;
	
	dojo.byId("searchLegend").innerHTML = intl.searchTitle;
	dojo.byId("searchSubmit").title = intl.searchTooltip;
	
	dojo.byId("shareBtn").title = intl.shareTooltip;
	dojo.byId("shareTitle").innerHTML = intl.shareTitle;
	dojo.byId("emailButton").title = intl.emailTooltip;
	
	dojo.byId("divToggle").title = intl.hideTooltip;
	
	dojo.byId("closeSplashButton").innerHTML = intl.closeSplashButton;
	dojo.byId("closeButton").title = intl.closeTooltip;
	dojo.query("#divInfowindowContent img")[0].title = intl.closeTooltip;
	dojo.byId("geoBtn").title = intl.geolocateTooltip;
	dojo.byId("helpBtn").title = intl.helpTooltip;
}

dojo.addOnLoad(init);