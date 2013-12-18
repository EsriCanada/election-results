/** @license
 |
 |ArcGIS for Canadian Municipalities / ArcGIS pour les municipalités canadiennes
 |Election Results v10.2.0 / Résultats électoraux v10.2.0
 |This file was modified by Esri Canada - Copyright 2013 Esri Canada
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

var chartInfo = null;
//Locate an address or precinct
function LocateAddress() {
    var thisSearchTime = lastSearchTime = (new Date()).getTime();
    dojo.byId("imgSearchLoader").style.display = "block";
    if (dojo.byId("tdsearchAddress").className == "tdSearchByAddress") {
        RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
        if (dojo.byId("txtAddress").value.trim() == '') {
            dojo.byId("imgSearchLoader").style.display = "none";
            RemoveChildren(dojo.byId('tblAddressResults'));
            CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
            if (dojo.byId("txtAddress").value != '') {
                alert(messages.getElementsByTagName("blankAddress")[0].childNodes[0].nodeValue);
            }
            return;
        }
		var params = [];
		//CanMod: Modify locator to search in set extent only (makes it uncessary to type city, province, etc in the search field)
		params["address"] = {};
		params["address"][locatorSettings.Locators[0].LocatorParamaters] = dojo.byId('txtAddress').value;
		se = locatorSettings.Locators[0].SearchExtent;
		params.outFields = [locatorSettings.Locators[0].CandidateFields];
		if (se.wkid == 4326) {
			params.searchExtent = new esri.geometry.Extent(se.xmin,se.ymin,se.xmax,se.ymax, new esri.SpatialReference({ wkid:se.wkid }));
		}
		else if (se.wkid == 3785) {
			require(["esri/geometry/webMercatorUtils"], function(webMercatorUtils) {
				var se_Original = new esri.geometry.Extent(se.xmin, se.ymin, se.xmax, se.ymax, new esri.SpatialReference({ wkid:se.wkid }));
				params.searchExtent = webMercatorUtils.webMercatorToGeographic(se_Original);
			});
		}
		locator.outSpatialReference = map.spatialReference;
		locator.addressToLocations(params, function (candidates) {
            // Discard searches made obsolete by new typing from user
            if (thisSearchTime < lastSearchTime) {
                return;
            }
            ShowLocatedAddress(candidates);
        }, function (err) {
            dojo.byId("imgSearchLoader").style.display = "none";
        });
    }
    else {
        RemoveChildren(dojo.byId('tblAddressResults'));
        CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
        if (dojo.byId("txtAddress").value.trim() == '') {
            dojo.byId("imgSearchLoader").style.display = "none";
            RemoveChildren(dojo.byId('tblAddressResults'));
            alert(dojo.string.substitute(messages.getElementsByTagName("blankPrecinct")[0].childNodes[0].nodeValue,[intl.divisionLabel])); //CanMod
            return;
        }
        SearchPrecinctName(dojo.byId("txtAddress").value);
    }
}

//search desired precinct
function SearchPrecinctName(precinctName, carouselVisible) {
    var thisSearchTime = lastSearchTime = (new Date()).getTime();
    RemoveChildren(dojo.byId('tblAddressResults'));
    map.infoWindow.hide();
    selectedGraphic = null;
    var query = esri.tasks.Query();
    query.where = dojo.string.substitute(precinctLayer.Query, [dojo.string.trim(precinctName).toUpperCase()]);
    map.getLayer(precinctLayer.Key).queryFeatures(query, function (featureset) {
        if (dojo.byId("txtAddress").value != '') {
            // Discard searches made obsolete by new typing from user
            if (thisSearchTime < lastSearchTime) {
                return;
            }
            var featureSet = [];
            for (j in featureset.features) {
                featureSet.push({ name: featureset.features[j].attributes[precinctLayer.DivisionId], //CanMod: PrecinctName-->DivisionId
                    attributes: featureset.features[0].attributes,
                    polygon: featureset.features[j].geometry
                });
            }
            featureSet.sort(function (a, b) {
                var x = a.name;
                var y = b.name;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
            RemoveChildren(dojo.byId('tblAddressResults'));
            var table = dojo.byId("tblAddressResults");
            var tBody = document.createElement("tbody");
            table.appendChild(tBody);

            setTimeout(function () {
                if (featureSet.length == 0) {
                    dojo.byId("imgSearchLoader").style.display = "none";
                    var tr = document.createElement("tr");
                    tBody.appendChild(tr);
                    var td1 = document.createElement("td");
                    td1.className = 'bottomborder';
                    td1.innerHTML = messages.getElementsByTagName("noSearchResults")[0].childNodes[0].nodeValue;
                    tr.appendChild(td1);
                    dojo.byId("imgSearchLoader").style.display = "none";
                    return;
                }
                if (featureSet.length == 1) {
                    dojo.byId("txtAddress").blur();
                    if (!carouselVisible) {
                        dojo.byId('txtAddress').setAttribute("defaultPrecinct", featureSet[0].attributes[precinctLayer.DivisionId]); //CanMod: PrecinctName-->DivisionId
                        dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultPrecinct");
                    }
                    var polygon = featureSet[0].polygon;
                    var mapPoint = polygon.getExtent().getCenter();
                    if (!polygon.contains(mapPoint)) {
                        mapPoint = polygon.getPoint(0, 0);
                    }
                    if (carouselVisible) {
                        FindPrecinctLayer(mapPoint, featureSet[0].attributes[precinctLayer.DivisionId], true, carouselVisible); //CanMod: PrecinctName-->DivisionId
                    }
                    else {
                        FindPrecinctLayer(mapPoint, featureSet[0].attributes[precinctLayer.DivisionId], (!currentSelectedLayer) ? true : false); //CanMod: PrecinctName-->DivisionId
                    }
                    HideAddressContainer();
                }
                else {
                    for (var i = 0; i < featureSet.length; i++) {
                        var tr = document.createElement("tr");
                        tBody.appendChild(tr);
                        var td1 = document.createElement("td");
                        td1.innerHTML = featureSet[i].name;
                        td1.setAttribute("index", i);
                        td1.className = 'bottomborder';
                        td1.style.cursor = "pointer";
                        td1.height = 20;
                        td1.onclick = function () {
                            HideAddressContainer();
                            dojo.byId('txtAddress').setAttribute("defaultPrecinct", this.innerHTML);
                            dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultPrecinct");
                            lastSearchString = dojo.byId("txtAddress").value.trim();
                            var polygon = featureSet[this.getAttribute("index")].polygon;
                            var mapPoint = polygon.getExtent().getCenter();
                            if (!polygon.contains(mapPoint)) {
                                mapPoint = polygon.getPoint(0, 0);
                            }
                            FindPrecinctLayer(mapPoint, this.innerHTML, (!currentSelectedLayer) ? true : false);
                        }
                        tr.appendChild(td1);
                    }
                    SetHeightAddressResults();
                }
                dojo.byId("imgSearchLoader").style.display = "none";

            }, 100);
        }
    }, function (err) {
        HideProgressIndicator();
    });
}

//search desired Address
function ShowLocatedAddress(candidates) {
	console.log(candidates);
    map.infoWindow.hide();
    selectedGraphic = null;
    RemoveChildren(dojo.byId('tblAddressResults'));
    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
    var table = dojo.byId("tblAddressResults");
    var tBody = document.createElement("tbody");
    table.appendChild(tBody);
    if (candidates.length > 0) {
        var counter = 0;
        for (var i in candidates) {
            if (candidates[i].score > locatorSettings.Locators[0].AddressMatchScore) {
                if (candidates[i].score > locatorSettings.Locators[0].AddressMatchScore) {
                    for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
                        if (map.getLayer(baseMapLayers[bMap].Key).visible) {
                            var bmap = baseMapLayers[bMap].Key;
                        }
                    }
                    if (map.getLayer(bmap).fullExtent.contains(candidates[i].location)) {
                        for (j in locatorSettings.Locators[0].LocatorFieldValues) {
                            if (candidates[i].attributes[locatorSettings.Locators[0].LocatorFieldName] == locatorSettings.Locators[0].LocatorFieldValues[j]) {
                                counter++;
                                var candidate = candidates[i];
                                var tr = document.createElement("tr");
                                tBody.appendChild(tr);
                                var td1 = document.createElement("td");
                                td1.innerHTML = candidates[i].address;
                                td1.className = 'bottomborder';
                                td1.style.cursor = "pointer";
                                td1.height = 20;
                                td1.setAttribute("index", i);
                                td1.onclick = function () {
                                    HideAddressContainer();
                                    dojo.byId('txtAddress').setAttribute("defaultAddress", this.innerHTML);
                                    dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
                                    lastSearchString = dojo.byId("txtAddress").value.trim();
                                    FindPrecinctLayer(candidates[this.getAttribute("index")].location, null, (!currentSelectedLayer) ? true : false);
                                }
                                tr.appendChild(td1);
                            }
                        }
                    }
                }
            }
        }
        //Display error message if there are no valid candidate addresses
        if (counter == 0) {
            var tr = document.createElement("tr");
            tBody.appendChild(tr);
            var td1 = document.createElement("td");
            td1.className = 'bottomborder';
            td1.innerHTML = messages.getElementsByTagName("noSearchResults")[0].childNodes[0].nodeValue;
            tr.appendChild(td1);
            dojo.byId("imgSearchLoader").style.display = "none";
            return;
        }
        dojo.byId("imgSearchLoader").style.display = "none";
        SetHeightAddressResults();
    }
    else {
        var tr = document.createElement("tr");
        tBody.appendChild(tr);
        var td1 = document.createElement("td");
        td1.className = 'bottomborder';
        td1.innerHTML = messages.getElementsByTagName("noSearchResults")[0].childNodes[0].nodeValue;
        tr.appendChild(td1);
        dojo.byId("imgSearchLoader").style.display = "none";
    }
}

//Add precinct layer
function FindPrecinctLayer(mapPoint, precintName, showBottomPanel, carouselVisible) {
    if (dojo.hasClass('divShareContainer', "showContainerHeight")) {
        dojo.replaceClass("divShareContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divShareContainer').style.height = '0px';
    }
    ShowProgressIndicator('map');
    var query = new esri.tasks.Query();

    if (precintName) {
        query.where = dojo.string.substitute(precinctLayer.Query, [precintName.toUpperCase()]);
    }
    else {
        query.geometry = mapPoint;
        query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_WITHIN;
    }

    map.getLayer(precinctLayer.Key).selectFeatures(query, esri.layers.FeatureLayer.SELECTION_ADD, function (features) {
        HideProgressIndicator();
        if (features.length > 0) {
            var selectedFeatures = map.getLayer(precinctLayer.Key).getSelectedFeatures();
            var removeOID = null;
            for (var i in selectedFeatures) {
                if (selectedFeatures[i].attributes[map.getLayer(precinctLayer.Key).objectIdField] != features[0].attributes[map.getLayer(precinctLayer.Key).objectIdField]) {
                    removeOID = selectedFeatures[i].attributes[map.getLayer(precinctLayer.Key).objectIdField];
                    break;
                }
            }
            if (removeOID) {
                map.getLayer(precinctLayer.Key)._unSelectFeatureIIf(removeOID, map.getLayer(precinctLayer.Key)._mode);
                map.getLayer(precinctLayer.Key)._mode._removeFeatureIIf(removeOID);
            }

            dojo.byId("spanAddress").innerHTML = intl.divisionLabel + " - " + features[0].attributes[precinctLayer.DivisionId]; //CanMod: PrecinctName-->DivisionId

            if (!isMobileDevice) {
                leftOffsetCarosuel = 0;
                dojo.byId("divElectionResultsContent").style.left = "0px";
                ResetSlideControls();

                WipeInBottomPanel(features[0].attributes[precinctLayer.DivisionId], null, showBottomPanel, carouselVisible); //CanMod: PrecinctName-->DivisionId

                //if (currentSelectedLayer && mapPoint) { //CanMod: Prevent popup from showing up on map click since all info already displayed in panel
                    //ShowInfoWindow(mapPoint, precintName, carouselVisible);
                //}
                //else {
                    if (!carouselVisible) {
                        map.setExtent(features[0].geometry.getExtent().expand(4));
                    }
                //}
            }
            else {
                if (!mapPoint) {
                    var polygon = features[0].geometry;
                    mapPoint = polygon.getExtent().getCenter();
                    if (!polygon.contains(mapPoint)) {
                        mapPoint = polygon.getPoint(0, 0);
                    }
                }
                selectedGraphic = mapPoint;
                if (!carouselVisible) {
                    map.setExtent(GetMobileExtent(mapPoint, features[0].geometry.getExtent().expand(4)));
                }
                ShowDetails(mapPoint, features[0].attributes[precinctLayer.DivisionId], features[0].attributes[precinctLayer.VotingDistrict]); //CanMod: PrecinctName-->DivisionId / County --> VotingDistrict
            }
        }
        else {
            dojo.byId("imgSearchLoader").style.display = "none";
            var tr = document.createElement("tr");
            tBody.appendChild(tr);
            var td1 = document.createElement("td");
            td1.className = 'bottomborder';
            td1.innerHTML = messages.getElementsByTagName("noSearchResults")[0].childNodes[0].nodeValue;
            tr.appendChild(td1);
            dojo.byId("imgSearchLoader").style.display = "none";
            return;
        }
    }, function (err) {
        HideProgressIndicator();
        dojo.byId("imgSearchLoader").style.display = "none";
        alert(dojo.string.substitute(messages.getElementsByTagName("unableToLocatePrecinct")[0].childNodes[0].nodeValue,[intl.divisionLabel])); //CanMod;
    });
}

//show pods with wipe-in animation
function WipeInBottomPanel(searchParameter, mapPoint, showBottomPanel, carouselVisible) {
    for (var index in electionResultData) {
        dojo.byId("div" + index).style.display = "block";
        FetchContestData(electionResultData[index], index, mapPoint, searchParameter, false, showBottomPanel, carouselVisible);
    }
}

//Fetch the data for pods
function FetchContestData(layer, index, mapPoint, searchParameter, isInfoWindow, showBottomPanel, carouselVisible) {
    var queryTask = new esri.tasks.QueryTask(layer.ServiceURL);
    ShowProgressIndicator(null);
    var query = new esri.tasks.Query();
    if (mapPoint) {
        query.geometry = mapPoint;
    }
    else {
        query.where = electionResultDataQuery + "='" + searchParameter + "'";
    }
    query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_WITHIN;
    query.outFields = ["*"];
    queryTask.execute(query, function (features) {

        HideProgressIndicator();
        if (isMobileDevice) {
            var chartDiv = document.createElement("div");
            chartDiv.id = "chartDiv";
            var table = document.createElement("table");
            table.style.marginTop = "5px";
            table.style.width = "100%";
            var tbody = document.createElement("tbody");
            table.appendChild(tbody);
            var tr = document.createElement("tr");
            tbody.appendChild(tr);
            var td = document.createElement("td");
            tr.appendChild(td);
            td.innerHTML = layer.Title;
            td.align = "left";
            td.style.fontWeight = "bold";
            td.style.paddingLeft = "10px";
            dojo.byId('divRepresentativeScrollContent').appendChild(table);
            dojo.byId('divRepresentativeScrollContent').appendChild(chartDiv);
        }
        else {
            RemoveChildren(dojo.byId('div' + index + 'content'));
            var chartDiv = document.createElement("div");
            chartDiv.className = "divContentStyle";
            dojo.byId('div' + index + 'content').appendChild(chartDiv);
        }
        if (features.features.length > 0) {
            PopulateChartData(layer.ChartType, layer.ChartData, layer.PartyDetails, chartDiv, features, layer.CandidateNames, layer.TotalBallots, layer.DisplayWinner); //CanMod: Display Win Party
            if (isMobileDevice) {
                chartInfo = {};
                chartInfo.ChartType = layer.ChartType;
                chartInfo.ChartData = layer.ChartData;
                chartInfo.PartyDetails = layer.PartyDetails;
                chartInfo.features = features;
                chartInfo.CandidateNames = layer.CandidateNames;
				//CanMod: Line deleted (relic)
                chartInfo.TotalBallots = layer.TotalBallots;
                SetHeightRepresentativeResults();
            }
        }
        else {
            if (isInfoWindow) {
                var table = document.createElement("table");
                table.style.width = "100%";
                table.style.height = "100%";
                var tbody = document.createElement("tbody");
                table.appendChild(tbody);
                var tr = document.createElement("tr");
                tbody.appendChild(tr);
                var td = document.createElement("td");
                td.align = "center";
                td.innerHTML = intl.dataUnavailable; //CanMod
                td.style.fontColor = "#ffffff"
                tr.appendChild(td);
                chartDiv.appendChild(table);
            }
            else {
                dojo.byId("div" + index).style.display = "none";
            }
        }
        if (showBottomPanel) {
            if (!isMobileDevice) {
                setTimeout(function () {
                    dojo.byId("imgToggle").src = "images/down.png";
                    dojo.byId("imgToggle").style.cursor = "pointer";
                    dojo.byId("imgToggle").setAttribute("state", "maximized");
                    dojo.byId("esriLogo").style.bottom = "250px";
                    dojo.byId("divBottomPanelHeader").style.visibility = "visible";
                    dojo.byId("divBottomPanelHeader").style.bottom = "250px";
                    dojo.replaceClass("divBottomPanelHeader", "showHeaderContainer", "hideHeaderContainer");
                    dojo.byId('divBottomPanelBody').style.height = "250px";
                    dojo.replaceClass("divBottomPanelBody", "showBottomContainer", "hideBottomContainer");
                    if (carouselVisible && currentSelectedLayer) {
                        dojo.addClass(dojo.byId('div' + currentSelectedLayer), "border");
                        if (dojo.byId('div' + currentSelectedLayer).style.display == "block") {
                            var hiddenContests = 0;
                            for (var index in electionResultData) {
                                if (index == currentSelectedLayer)
                                    break;
                                if (dojo.byId('div' + index).style.display == "none") {
                                    hiddenContests++;
                                }
                            }
                            var position = Number(dojo.byId("tdContest" + index).getAttribute("position")) - hiddenContests;
                            SlideLeft((position * infoBoxWidth) + (position * 4));
                        }
                        carouselVisible = false;
                    }
                }, 500);
            }
        }
    });
}

//Sort according to value
function SortResultFeatures(a, b) {
    var x = a.y;
    var y = b.y;
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

//Fetch data for charts
function PopulateChartData(chartType, chartData, partyDetails, chartDiv, features, candidateNames, totalBallots, DisplayWinner) { //CanMod: Display Win Party
    if (isMobileDevice) {
        chartDiv.style.width = screen.width;
        chartDiv.style.height = "190px";
    }
    switch (chartType) {
        case "barchart":
            jsonValues = [];
            myLabelSeriesarray = [];
            myParallelLabelSeriesarray = [];
            var party;
            var ballots = features.features[0].attributes[totalBallots];
            var totalBallots = 0;
            for (var i in chartData) {
                totalBallots += features.features[0].attributes[chartData[i]];
            }
            for (var i in chartData) {
                var votes = features.features[0].attributes[chartData[i]];
                var candidateName = features.features[0].attributes[candidateNames[i]];
                var percentVote = ((votes / totalBallots) * 100).toFixed(0) + "%";
				//CanMod: If no votes cast, replace error message with 0%
				if (percentVote == "NaN%") {
					percentVote = "0%";
				}
                if (candidateName && candidateName != "") {
                    var jsonItem = {};
                    jsonItem.label = candidateName;
                    jsonItem.parallelLabel = percentVote;
                    jsonItem.y = Number(((votes / totalBallots) * 100).toFixed(0));
                    jsonItem.party = (features.features[0].attributes[partyDetails[i]]);
					//CanMod: Use candidate colours as well as party colours
					var fillColor = colorCodeOfParties[jsonItem.label]||colorCodeOfParties[jsonItem.party]||colorCodeOfParties["Others"]||{"Color": "#9C9C9C"};
                    jsonItem.fill = fillColor.Color;
                    jsonItem.stroke = "";
                    jsonValues.push(jsonItem);
                }
            }

            jsonValues.sort(SortResultFeatures);

            for (var i in jsonValues) {
                var labelItem = {};
                labelItem.value = Number(i) + 1;
                labelItem.text = jsonValues[i].label;
                myLabelSeriesarray.push(labelItem);
                party = jsonValues[i].party;
				candidate = jsonValues[i].label; //CanMod: Display Win Party
            }

            for (var i in jsonValues) {
                var parallelLabelItem = {};
                parallelLabelItem.value = Number(i) + 1;
                parallelLabelItem.text = jsonValues[i].parallelLabel;
                myParallelLabelSeriesarray.push(parallelLabelItem);
            }
			
			//CanMod: Function to determine whether to pass the winning candidate or party to the ShowBarChart function OR retreive the field value
			if (DisplayWinner.Candidate) {
				winner = candidate;
				winString = intl.winCandidate;
			}
			else {
				winner = party;
				winString = intl.winParty;
			}
			//If field is set, replace automatically determined winner with the field value
			if (DisplayWinner.Field != "") {
				winner = features.features[0].attributes[DisplayWinner.Field];
			}

            ShowBarChart(jsonValues, chartDiv, myLabelSeriesarray, myParallelLabelSeriesarray, winner, ballots, winString); //CanMod: Display Win Party
            break;
        case "piechart":
            var jsonValues = [];
            if (piechartProportions) {var percentVoted = Number((features.features[0].attributes[chartData[0]] * 100).toFixed(0));}
			else {var percentVoted = Number((features.features[0].attributes[chartData[0]]).toFixed(0));}
            var nonVoters = 100 - percentVoted;

            var jsonItemVoted = {};
            jsonItemVoted.y = percentVoted;
            jsonItemVoted.stroke = "#000000";
            jsonItemVoted.text = intl.voted + ": " + percentVoted + "%"; //CanMod
            jsonItemVoted.color = votedColor;
            jsonValues.push(jsonItemVoted);

            var jsonItemNonVoted = {};
            jsonItemNonVoted.y = nonVoters;
            jsonItemNonVoted.stroke = "#000000";
            jsonItemNonVoted.text = intl.notVote + ": " + nonVoters + "%"; //CanMod
            jsonItemNonVoted.color = didNotVoteColor;
            jsonValues.push(jsonItemNonVoted);

            ShowPieChart(jsonValues, chartDiv);
            break;
    }
}
