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

var chartInfo = null;
//Add precinct layer
function FindPrecinctLayer(mapPoint, precintName, showBottomPanel, carouselVisible) {
	showHideSearch(true);
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
            alert(messages.getElementsByTagName("noSearchResults")[0].childNodes[0].nodeValue);
            return;
        }
    }, function (err) {
        HideProgressIndicator();
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
	else {
		chartDiv.style.height = "185px";
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

//Locate searched address on map with pushpin graphic, also handles selection of an address
function LocateAddressCML2(suggest,event) {
	
	//On selection of options with arrow keys, do not locate
	if (event) {
		var kc = event.keyCode;
		if (kc == dojo.keys.DOWN_ARROW || kc == dojo.keys.UP_ARROW || kc == dojo.keys.TAB) {
			if(timeouts.autocomplete != null) {clearTimeout(timeouts.autocomplete); timeouts.autocomplete = null;}
			return;
		}
	}
	
	//If search a district/division
	if (searchType == "Division") {
		if (event && event.keyCode != dojo.keys.ENTER) {
			clearAutocomplete();
		}
		if (!(suggest)) {locateDivisionCML2();}
		return;
	}
	
	//If selection made, do not proceed to new locator search
	if (!suggest && document.getElementById("autocompleteSelect") && document.getElementById("autocompleteSelect").selectedIndex >= 0) {
		var zCandidate = lastSearchResults[document.getElementById("autocompleteSelect").selectedIndex];
		lastSearchString = zCandidate.attributes[locatorSettings.Locators[0].DisplayFieldCML2];
		document.getElementById("searchInput").value = lastSearchString;
		clearAutocomplete();
		FindPrecinctLayer(zCandidate.location, null, (!currentSelectedLayer) ? true : false);
		return;
	}
	
	//No autocomplete on mobile devices (too unreliable due to device processing speeds)
	if ((isMobileDevice || isTablet) & suggest) {
		return;
	}

    map.infoWindow.hide();
    selectedGraphic = null;
	var currSearch = dojo.byId("searchInput").value.trim();
    if (currSearch === '' || (currSearch == lastSearchString && suggest) || (currSearch.length < 4 && suggest/*No auto-suggest for small*/)) {
		if (currSearch != lastSearchString) {
			lastSearchString = currSearch;
			clearAutocomplete();
		}
        return;
    }
	if(timeouts.autocomplete != null) {clearTimeout(timeouts.autocomplete); timeouts.autocomplete = null;}
	lastSearchString = currSearch;
	var params = [];
	//CanMod: Modify locator to search in set extent only (makes it uncessary to type city, province, etc in the search field)
	params["address"] = {};
	params["address"][locatorSettings.Locators[0].LocatorParamaters] = currSearch;
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
    var locatorCML2 = new esri.tasks.Locator(locatorSettings.Locators[0].LocatorURL);
    locatorCML2.outSpatialReference = map.spatialReference;
	autocomplete(locatorCML2,currSearch,params,suggest);
}

// Discard searches made obsolete by new typing from user
function autocomplete(locatorCML2,currSearch,params,suggest) {
	locatorCML2.addressToLocations(params, function (candidates) {
		if (currSearch != dojo.byId("searchInput").value.trim()) {
			return;
		}
		ShowLocatedAddressCML2(candidates,suggest);
    },
	function (err) {
		console.error(err);
    });
}

//Populate candidate address list in address container
function ShowLocatedAddressCML2(candidates,suggest) {
	//Keep top 10 candidates that pass minimum score from config file
	candidates = dojo.filter(candidates, function(item) {
		if (dojo.indexOf(locatorSettings.Locators[0].LocatorFieldValues, item.attributes[locatorSettings.Locators[0].LocatorFieldName]) >= 0) {
			return item.score > locatorSettings.Locators[0].AddressMatchScore;
		}
		else {return false;}
	});
	if (candidates.length > 10) {
		candidates = candidates.slice(0,10);
	}

    if (candidates.length > 0) {
		lastSearchResults = candidates;
		
		if (suggest) {
			var sel = document.createElement("select");
			sel.setAttribute("size",String(candidates.length));
			sel.setAttribute("id","autocompleteSelect");
			sel.setAttribute("onclick","LocateAddressCML2(false);");
			sel.setAttribute("onkeyup","if (event.keyCode == dojo.keys.ENTER) {LocateAddressCML2(false);} if (event.keyCode == dojo.keys.ESCAPE) {clearAutocomplete();}");
			dojo.forEach(candidates,function(item,i) {
				var opt = document.createElement("option");
				opt.innerHTML = item.attributes[locatorSettings.Locators[0].DisplayFieldCML2];
				sel.appendChild(opt);
			});
			clearAutocomplete();
			document.getElementById("autocomplete").appendChild(sel);
		}
		else {
			var zCandidate = lastSearchResults[0];
			lastSearchString = zCandidate.attributes[locatorSettings.Locators[0].DisplayFieldCML2];
			clearAutocomplete();
			FindPrecinctLayer(zCandidate.location, null, (!currentSelectedLayer) ? true : false);
		}
    } else {
		var alert = document.createElement("div");
		alert.innerHTML = messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue + "<hr>" + locatorSettings.Locators[0].Example;
		if(timeouts.autocomplete != null) {clearTimeout(timeouts.autocomplete); timeouts.autocomplete = null;}
		if (suggest) {
			timeouts.autocomplete = setTimeout(function() { //Reduce sporadic appearances of "No Results" as user types
				timeouts.autocomplete = null;
				clearAutocomplete();
				document.getElementById("autocomplete").appendChild(alert);
			},1000);
		}
		else {
			alert.setAttribute("role","alert"); //Alert screen reader users on form submission that no results found
			clearAutocomplete();
			document.getElementById("autocomplete").appendChild(alert);
		}
    }
}

//Clear Autocomplete
function clearAutocomplete() {
	document.getElementById("autocomplete").innerHTML = "";
}

//Change autocomplete selection from input using arrow keys
function selectAutocomplete(evt) {
	if (!(dojo.isIE < 9)) {evt.preventDefault();}
	if (document.getElementById("autocompleteSelect")) {
		var sel = document.getElementById("autocompleteSelect");
		var kc = evt.keyCode;
		if (kc == dojo.keys.DOWN_ARROW && sel.selectedIndex != sel.getAttribute("size") -1) {
			sel.selectedIndex ++;
			document.getElementById("searchInput").value = sel.options[sel.selectedIndex].text;
		}
		else if (kc == dojo.keys.UP_ARROW && sel.selectedIndex != -1) {
			sel.selectedIndex --;
			if (sel.selectedIndex == -1) {
				document.getElementById("searchInput").value = lastSearchString;
			}
			else {
				document.getElementById("searchInput").value = sel.options[sel.selectedIndex].text;
			}
		}
	}
	if (evt.keyCode == dojo.keys.ESCAPE) {
		clearAutocomplete();
	}
}

//Changes the label/variable when the search type is changed
function searchChange(lS) {
	if (dojo.byId("searchAddress").checked) {
		dojo.byId("searchInput").setAttribute("placeholder",lS.Locators[0].DisplayText);
		searchType = "Address";
	}
	else {
		dojo.byId("searchInput").setAttribute("placeholder",lS.Locators[1].DisplayText);
		searchType = "Division";
	}
}

//Search for a division
function locateDivisionCML2(urlValue) {
	carouselVisible = false;
	//When precinct name sent in from URL
	if (urlValue != null) {
		var precinctName = urlValue;
		dojo.byId("searchRequest").checked = true;
		searchChange(locatorSettings);
	}
	//When precinct name from the search box
	else {
		var precinctName = dojo.byId("searchInput").value.trim();
	}
    map.infoWindow.hide();
    selectedGraphic = null;
    var query = esri.tasks.Query();
    query.where = dojo.string.substitute(precinctLayer.Query, [dojo.string.trim(precinctName).toUpperCase()]);
    map.getLayer(precinctLayer.Key).queryFeatures(query, function (featureSet) {
		featureSet = featureSet.features;
		if (featureSet.length == 1) {
			var polygon = featureSet[0].geometry;
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
			showHideSearch(true);
		}
		else if (featureSet.length > 1) {
			var sel = document.createElement("select");
			sel.setAttribute("size",String(featureSet.length > 10 ? 10 : featureSet.length));
			sel.setAttribute("id","autocompleteSelect");
			sel.setAttribute("onclick","selectDivision(this);");
			sel.setAttribute("onkeyup","if (event.keyCode == dojo.keys.ENTER) {selectDivision(this);} if (event.keyCode == dojo.keys.ESCAPE) {clearAutocomplete();}");
			dojo.forEach(featureSet,function(item,i) {
				var opt = document.createElement("option");
				opt.innerHTML = item.attributes[electionResultDataQuery];
				sel.appendChild(opt);
			});
			clearAutocomplete();
			document.getElementById("autocomplete").appendChild(sel);
		}
		else {
			var alertDiv = document.createElement("div");
			alertDiv.innerHTML = messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue + "<hr>" + locatorSettings.Locators[1].Example;
			alertDiv.setAttribute("role","alert"); //Alert screen reader users on form submission that no results found
			clearAutocomplete();
			document.getElementById("autocomplete").appendChild(alertDiv);
		}
	}, function (err) {
		console.error(err);
        HideProgressIndicator();
    });
}

//When a division is selected from the division search list
function selectDivision(select) {
	document.getElementById("searchInput").value = select.options[select.selectedIndex].text;
	locateDivisionCML2();
}