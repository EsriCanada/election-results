/*FRANÇAIS
 |
 | ArcGIS for Canadian Municipalities / ArcGIS pour les municipalités canadiennes
 | Citizen Service Request v10.2.0.1 / Demande de service municipal v10.2.0.1
 | This file was written by Esri Canada - Copyright 2014 Esri Canada
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
*/

define({
	//Les valeurs suivantes ainsi que ceux du fichier config.js et errorMessages.xml peuvent êtres changés afin de modifier le texte fixe de l'application
	
	divisionLabel: "Circonscription",
	
	//Recherche
	searchTitle: "Rechercher pour :", //Titre
	searchTooltip: "Recherche", //Infobulle de la recherche
	locateTooltip: "Rechercher", //Infobulle du localisateur
	addressPlaceholder: "Saisisez un adresse", //Paramètre fictif de l'adresse
	divisionPlaceholder: "Saisisez une circonscription (ex: ${0})", //Paramètre fictif de la circonscription, Le ${0} sera remplacé avec le texte échantillon de config.js
	
	//Partage
	shareTooltip: "Partager", //Titre
	shareTitle: "Partager cet carte", //Infobulle du partage
	emailTooltip: "Courriel", //Infobulle du courriel
	
	//Résultats
	hideTooltip: "Cacher les resultats", //Infobulle cacher résultats
	showTooltip: "Afficher les resultats", //Infobulle afficher résultats
	candNotShown: "candidats sont cachés", //Candidats cachés
	votesCast: "Votes exprimés", //Votes exprimés
	winCandidate: "Candidat gagnant", //Candidat gagnant
	winParty: "Parti gagnant", //Parti gagnant
	voted: "Ont voté", //Voté
	notVote: "N'ont pas voté", //Pas voté
	
	//Générale
	closeSplashButton: "OK", //Fermer l'écran de garde
	closeTooltip: "Fermer", //Infobulle fermer
	geolocateTooltip: "Géolocalisation", //Infobulle géolocalisation
	helpTooltip: "Aide", //Infobulle aide
	lastUpdate: "Dernière mise-à-jour", //Dernière mise à jour
	dataUnavailable: "Données indisponibles" //Données indisponibles
});