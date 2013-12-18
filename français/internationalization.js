//FRANÇAIS
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
**/
var intl = {};

function Internationalization(run) {
	//Les valeurs suivantes ainsi que ceux du fichier config.js et errorMessages.xml peuvent êtres changés afin de modifier le texte fixe de l'application
	
	intl.divisionLabel = "Circonscription";
	
	//Recherche
	var searchTitle = "Recherche"; //Titre
	var searchTooltip = "Recherche"; //Infobulle de la recherche
	var locateTooltip = "Rechercher"; //Infobulle du localisateur
	intl.addressPlaceholder = "Saisisez un adresse"; //Paramètre fictif de l'adresse
	intl.divisionPlaceholder = "Saisisez une circonscription (ex: ${0})"; //Paramètre fictif de la circonscription; Le ${0} sera remplacé avec le texte échantillon de config.js
	
	//Partage
	var shareTooltip = "Partager"; //Titre
	var shareTitle = "Partager cet carte"; //Infobulle du partage
	var emailTooltip = "Courriel"; //Infobulle du courriel
	
	//Résultats
	intl.hideTooltip = "Cacher les resultats"; //Infobulle cacher résultats
	intl.showTooltip = "Afficher les resultats"; //Infobulle afficher résultats
	intl.candNotShown = "candidats sont cachés"; //Candidats cachés
	intl.votesCast = "Votes exprimés"; //Votes exprimés
	intl.winCandidate = "Candidat gagnant"; //Candidat gagnant
	intl.winParty = "Parti gagnant"; //Parti gagnant
	intl.voted = "Ont voté"; //Voté
	intl.notVote = "N'ont pas voté"; //Pas voté
	
	//Générale
	var closeTooltip = "Fermer"; //Infobulle fermer
	var geolocateTooltip = "Géolocalisation"; //Infobulle géolocalisation
	var helpTooltip = "Aide"; //Infobulle aide
	intl.lastUpdate = "Dernière mise-à-jour"; //Dernière mise à jour
	intl.dataUnavailable = "Données indisponibles"; //Données indisponibles

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