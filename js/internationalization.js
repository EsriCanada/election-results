//ENGLISH
/**
 |
 |ArcGIS for Canadian Municipalities / ArcGIS pour les municipalités canadiennes
 |Election Results v10.2.0 / Résultats électoraux v10.2.0
 |This file was written by Esri Canada - Copyright 2013 Esri Canada
 |
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
 
INTERNATIONALIZATION FILE: Changes hard-coded text in the web application.
**/
var intl = {};

function Internationalization(run) {
	//The following values along with those found in the config.js file can be changed to alter the text displayed in the application
	
	intl.divisionLabel = "Division";
	
	//Search
	var searchTitle = "Search";
	var searchTooltip = "Search";
	var locateTooltip = "Locate";
	intl.addressPlaceholder = "Enter Address";
	intl.divisionPlaceholder = "Enter Division Number (e.g. ${0})"; //The ${0} will be replaced with SampleSearchString from config.js
	
	//Sharing
	var shareTooltip = "Share";
	var shareTitle = "Share this map";
	var emailTooltip = "Email";
	
	//Results
	intl.hideTooltip = "Hide Results";
	intl.showTooltip = "Show Results";
	intl.candNotShown = "candidates not shown";
	intl.votesCast = "Votes Cast";
	intl.winCandidate = "Winning Candidate";
	intl.winParty = "Winning Party";
	intl.voted = "Voted";
	intl.notVote = "Did not vote";
	
	//General
	var closeTooltip = "Close";
	var geolocateTooltip = "Geolocate";
	var helpTooltip = "Help";
	intl.lastUpdate = "Last Update";
	intl.dataUnavailable = "Data Unavailable";

	//----DO NOT CHANGE CODE BELOW--------------------------------------------------------------------
	if (run) { //Will only execute after all other initialization code (one of the variables set above is require before the initialization code)
		dojo.byId("tdTitle").innerHTML = intl.divisionLabel;
		
		dojo.byId("tdSearchTitle").innerHTML = searchTitle;
		dojo.query("#settings img")[0].title = searchTooltip;
		dojo.byId("imgLocate").title = locateTooltip;
		
		dojo.query("#tdShare img")[0].title = shareTooltip;
		dojo.byId("shareTitle").innerHTML = shareTitle;
		dojo.byId("emailButton").title = emailTooltip;
		
		dojo.byId("divToggle").title = intl.hideTooltip;
		
		dojo.query("#divAddressContent .tblHeader img")[0].title = closeTooltip;
		dojo.byId("closeButton").title = closeTooltip;
		dojo.query("#divInfowindowContent img")[0].title = closeTooltip;
		dojo.query("#tdGps img")[0].title = geolocateTooltip;
		dojo.query("#help img")[0].title = helpTooltip;
	}
}