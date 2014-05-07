//FRANÇAIS
/** @license
 |
 |ArcGIS for Canadian Municipalities / ArcGIS pour les municipalités canadiennes
 |Election Results v10.2.0.1 / Résultats électoraux v10.2.0.1
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
dojo.provide("js.config");
dojo.declare("js.config", null, {

    // Ce fichier contient divers options permettant de configurer l'application des résultats électoraux
    //
    // Utiliser ce fichier afin de configurer:
    //
    // 1.  Le titre de l'application et l'icône      - [ Balise(s) HTML: ApplicationName, WindowTitle, ApplicationIcon ]
    // 2.  Le message de l'écran de garde            - [ Balise(s) HTML: SplashScreenMessage ]
    // 3.  L'URL pour la page d'aide                 - [ Balise(s) HTML: HelpURL ]
    //
    // 4.  Les URL pour les fond de cartes           - [ Balise(s) HTML: BaseMapLayers ]
    // 5.  L'étendue initiale de la carte            - [ Balise(s) HTML: DefaultExtent ]
    //
    // 6.  Les services de carte:
    // 6a. Les URL des couches opérationelles
    //                                               - [ Balise(s) HTML: PrecinctLayer, ReferenceOverlayLayer]
    // 6b. Les champs pour les requête               - [ Balise(s) HTML: ElectionResultDataQueryString]
    // 6c. Le format des données                     - [ Balise(s) HTML: ShowNullValueAs]
    //
    // 7.  La recherche par addresse                 - [ Balise(s) HTML: LocatorSettings]
    //
    // 8.  Le service de géométrie                   - [ Balise(s) HTML: GeometryService ]
    //
    // 9.  Les données affichées dans le bas de page - [ Balise(s) HTML: InfoBoxWidth, ElectionResultData, PiechartProportions,
    //                                                                        ColorCodeOfParties, VotedColor, DidNotVoteColor]
    //
    // 10. Les données pour les mises à jour
    //                                               - [Balise(s) HTML: Updates]
    //
    // 11. Le bouton de bascule des langues          - [Balise(s) HTML: LanguageButton]
	//
	// 12. Les URL pour le partage des cartes:
    // 12a.L'URL pour le service TinyURL             - [ Balise(s) HTML: MapSharingOptions (set TinyURLServiceURL, TinyURLResponseAttribute) ]
    // 12b. Les options de partage                   - [ Balise(s) HTML: TwitterStatus, TwitterHashtag, TwitterFollow, EmailSubject ]
    // 12c. L'URL des réseaux sociaux                - [ Balise(s) HTML: FacebookURL, TwitterShareURL ]
    //

    // ------------------------------------------------------------------------------------------------------------------------
    // CONFIGURATION GÉNÉRALE
    // -----------------------------------------------------------------------------------------------------------------------
    // Titre de l'application
    ApplicationName: /*Nom de l'application*/ "Résultats électoraux",
	WindowTitle: /*Titre de la fenêtre*/ "Résultats électoraux",
		
	// Logo de l'application
	ApplicationIcon: "images/appIcon.png",

    // Contenu de l'écran de garde (l'écran qui s'affiche lors du lancement de l'application)
    SplashScreenMessage: "<b>Résultats électoraux</b><br/><hr/><br/>L'application des <b>résultats électoraux</b> permet de visualiser les résultats de chaque circonscription à l'aide d'une carte. Afin d'afficher les résultats vous pouvez sois saisir une adresse ou un numéro de circonscription dans l'outil de recherche ou cliquer un endroit sur la carte. La circonscription sera mise en évidence et les résultats seront affichés dans l'onglet au bas de la page.<br/><br/>",

    // L'URL de la page/du portail d'aide
    HelpURL: "help.htm",

    // ------------------------------------------------------------------------------------------------------------------------
    // CONFIGURATION DES FONDS DE CARTE
    // ------------------------------------------------------------------------------------------------------------------------
    // Configurez les couches de fond de carte
    // Veuillez notez que seul la première couche seras utilisé
    BaseMapLayers: /*Couches de fond de carte*/
               [
                   {
                       Key: /*Clef*/ "baseMapKey",
                       MapURL: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
                   }
               ],


    // Étendu initiale de la carte. Utilisez une virgule afin de séparer chaque valeur (ne supprimez pas la dernière virgule).
	// Les coordonnés devraient être en mètres WGS84 Web Mercator.
    DefaultExtent: "-8846570,5405896,-8824595,5436318",

    // ------------------------------------------------------------------------------------------------------------------------
    // COUCHES OPÉRATIONELLES
    // ------------------------------------------------------------------------------------------------------------------------

    // Configurez les options suivantes pour les couches opérationelles

    //La clef (Key) est utiliser comme identifiant de la couche et doit être unique
    //Le ServiceURL est le point de terminaison REST pour la couche des circonscriptions
    //UseColor annule la symbologie du service de carte et utilise celle défini ci-dessous
    //Color définie la couleur du symbole
    //Alpha défini la transparence du symbole
    //Query est la requête qui est utilisé pour trouver les circonscriptions
    //DivisionId est le nom de champ pour l’identifiant de la circonscription
    //VotingDistrict est le nom de champ qui contient le nom du district

    PrecinctLayer: /*Couche des circonscriptions*/
          {
              Key: "divisionLayer",
              ServiceURL: "http://yourserver:6080/arcgis/rest/services/ElectionResults/MapServer/7",
              UseColor: false,
              Color: "#FFFC17",
              Alpha: 0.50,
              Query: "UPPER(DIVISIONID) LIKE '%${0}%'",
              DivisionId: "DIVISIONID",
              VotingDistrict: "DISTRICTNAME"
          },
          
    //Champ de requête des couches de résultat – Devrais être le champ qui coïncide avec le DivisionID défini ci-dessus
    ElectionResultDataQueryString: "DIVISIONID",

    //Couche de recouvrement
    // Le ServiceURL est les point de terminaison REST du service
    // DisplayOnLoad détermine s'il faut afficher la couche de recouvrement
    ReferenceOverlayLayer:
          {
              ServiceURL: "http://yourserver:6080/arcgis/rest/services/ReferenceOverlay/MapServer",
              DisplayOnLoad: true
          },

    // ------------------------------------------------------------------------------------------------------------------------

    // Le texte utilisé pour remplacer les données nulles
    ShowNullValueAs: "S/O",

    // ------------------------------------------------------------------------------------------------------------------------
    // CONFIGURATION DE LA RECHERCHE PAR ADRESSE
    // ------------------------------------------------------------------------------------------------------------------------

    // Configurez les paramètres du service localisateur d'adresse
    LocatorSettings: {
        Locators: /*Localisateurs*/ [
                {
					DisplayText: /*Texte d'affichage*/ "Rechercher pour une adresse",
					LabelText: /*Texte de l'étiquette*/ "Adresse",
					Example: /*Exemple*/ "Essayez de recherché une adresse tel que «12 Place Concord»",
					LocatorURL: /*URL du localisateur*/ "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
					LocatorParamaters: /*Paramètre du localisateur*/ ["SingleLine"],
					CandidateFields: /*Champs candidates*/ "Loc_name, Score, Match_addr",
					DisplayFieldCML2: /*Champ d'affichage*/ "Match_addr",
					AddressMatchScore: /*Score d'appariement minimum*/ 80,
					LocatorFieldName: /*Nom du champ du localisateur*/ 'Loc_name',
					LocatorFieldValues: /*Valeur du champ du localisateur*/ ["CAN.StreetName" , "CAN.PointAddress", "CAN.StreetAddress", "CAN.PostalExt"],
					//Configurez l'étendue utilisé lors d'une recherche par adresse; saisissez un wkid de 0000 afin
					//de chercher l'Amérique du Nord en entier. CGS_WGS_1984: Utilisez wkid 4326 et des degrées décimaux;
					//WGS_1984_Web_Mercator: Utilisez wkid 3785 et des mètres; Aucun autre système accepté.
					SearchExtent: {xmin: -8865402.789852107, ymin: 5443102.360231639, xmax: -8807068.937666388, ymax: 5400828.978730424, wkid: 3785}
                },
                {
                    DisplayText: /*Texte d'affichage*/ "Rechercher pour une circonscription",
					LabelText: /*Texte de l'étiquette*/ "Circonscription",
					Example: /*Exemple*/ "Les numéros de circonscription consistent de 5 chiffres",
                    SampleSearchString: /*Texte échantillon*/ "01001"
                }
            ]
    },

    // ------------------------------------------------------------------------------------------------------------------------
    // SERVICE DE GÉOMÉTRIE
    // ------------------------------------------------------------------------------------------------------------------------
    // Saisissez l'URL du service de géométrie
    GeometryService: "http://yourserver:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer",

    // ------------------------------------------------------------------------------------------------------------------------
    // CONFIGURATION DES BOITES DANS LE BAS DE PAGE
    // ------------------------------------------------------------------------------------------------------------------------
    // Configurez la largeur des boites
    InfoBoxWidth: 424,

    //Les résultats sont affichés au bas de la page. Chaque section ci-dessous est une boite dans le bas de page.
    //HeaderColor détermine la couleur des entêtes de chaque boite
    //Title détermine le titre du de chaque boite
    //ServiceURL est l’URL pour la couche correspondante
    //ChartData sont les champs qui doivent être affichés dans le graphique
    //ChartType doit soit être "barchart" (graphique à barres) ou "piechart" (graphique circulaire)
    //PartyDetails sont les champs des partis politiques. Ces champs doivent être dans la même séquence que les champs de ChartData. Ces données ne sont pas requises pour les graphiques circulaires.
    //CandidateNames sont les champs des noms des candidats. Ces champs doivent être dans la même séquence que les champs de ChartData. Ces données ne sont pas requises pour les graphiques circulaires.
    //DisplayWinner permet de configurer comment les gagnants sont déterminés
    //    Candidate : lorsque vrai (true), le candidat gagnant seras affiché; lorsque faux (false) le parti gagnant sera affiché.
    //    Field : Si vide (deux guillemets vides), le gagnant sera déterminé automatiquement. Si un champ est inscrit, le gagnant sera obtenu de ce champ.
    //DisplayOnLoad  détermine laquelle des couches sera affiché en premier. Si plus d’une couche est vrai (true), seulement la première seras affiché.
    //TotalBallots est le nom de champ qui contient le nombre de votes exprimés. Ce champ n’est pas requis pour les graphiques circulaires.

    ElectionResultData:
          {
              Mayor:
                    {
                        HeaderColor: "#393939",
                        Title: "Maire/Mairesse de la ville de Toronto",
                        ServiceURL: "http://yourserver:6080/arcgis/rest/services/ElectionResults/MapServer/0",
                        ChartData: ["NUMVOTES1", "NUMVOTES2", "NUMVOTES3", "NUMVOTES4", "NUMVOTES5", "NUMVOTES6", "NUMVOTES7", "NUMVOTES8", "NUMVOTES9", "NUMVOTES10", "NUMVOTES11", "NUMVOTES12", "NUMVOTES13", "NUMVOTES14", "NUMVOTES15", "NUMVOTES16", "NUMVOTES17", "NUMVOTES18", "NUMVOTES19", "NUMVOTES20", "NUMVOTES21", "NUMVOTES22", "NUMVOTES23", "NUMVOTES24", "NUMVOTES25", "NUMVOTES26", "NUMVOTES27", "NUMVOTES28", "NUMVOTES29", "NUMVOTES30", "NUMVOTES31", "NUMVOTES32", "NUMVOTES33", "NUMVOTES34", "NUMVOTES35", "NUMVOTES36", "NUMVOTES37", "NUMVOTES38", "NUMVOTES39", "NUMVOTES40"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2", "PARTY3", "PARTY4", "PARTY5", "PARTY6", "PARTY7", "PARTY8", "PARTY9", "PARTY10", "PARTY11", "PARTY12", "PARTY13", "PARTY14", "PARTY15", "PARTY16", "PARTY17", "PARTY18", "PARTY19", "PARTY20", "PARTY21", "PARTY22", "PARTY23", "PARTY24", "PARTY25", "PARTY26", "PARTY27", "PARTY28", "PARTY29", "PARTY30", "PARTY31", "PARTY32", "PARTY33", "PARTY34", "PARTY35", "PARTY36", "PARTY37", "PARTY38", "PARTY39", "PARTY40"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2", "CANDIDATE3", "CANDIDATE4", "CANDIDATE5", "CANDIDATE6", "CANDIDATE7", "CANDIDATE8", "CANDIDATE9", "CANDIDATE10", "CANDIDATE11", "CANDIDATE12", "CANDIDATE13", "CANDIDATE14", "CANDIDATE15", "CANDIDATE16", "CANDIDATE17", "CANDIDATE18", "CANDIDATE19", "CANDIDATE20", "CANDIDATE21", "CANDIDATE22", "CANDIDATE23", "CANDIDATE24", "CANDIDATE25", "CANDIDATE26", "CANDIDATE27", "CANDIDATE28", "CANDIDATE29", "CANDIDATE30", "CANDIDATE31", "CANDIDATE32", "CANDIDATE33", "CANDIDATE34", "CANDIDATE35", "CANDIDATE36", "CANDIDATE37", "CANDIDATE38", "CANDIDATE39", "CANDIDATE40"],
                        DisplayWinner: {Candidate:true, Field:"WINCANDIDATE"},
                        DisplayOnLoad: true,
                        TotalBallots: "TOTBALLOTS"
                    },
              Councillor:
                    {
                        HeaderColor: "#393939",
                        Title: "Conseillers(ères) du quartier",
                        ServiceURL: "http://yourserver:6080/arcgis/rest/services/ElectionResults/MapServer/1",
                        ChartData: ["NUMVOTES1", "NUMVOTES2", "NUMVOTES3", "NUMVOTES4", "NUMVOTES5", "NUMVOTES6", "NUMVOTES7", "NUMVOTES8", "NUMVOTES9", "NUMVOTES10", "NUMVOTES11", "NUMVOTES12", "NUMVOTES13", "NUMVOTES14", "NUMVOTES15"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2", "PARTY3", "PARTY4", "PARTY5", "PARTY6", "PARTY7", "PARTY8", "PARTY9", "PARTY10", "PARTY11", "PARTY12", "PARTY13", "PARTY14", "PARTY15"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2", "CANDIDATE3", "CANDIDATE4", "CANDIDATE5", "CANDIDATE6", "CANDIDATE7", "CANDIDATE8", "CANDIDATE9", "CANDIDATE10", "CANDIDATE11", "CANDIDATE12", "CANDIDATE13", "CANDIDATE14", "CANDIDATE15"],
                        DisplayWinner: {Candidate:true, Field:"WINCANDIDATE"},
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              TDSB:
                    {
                        HeaderColor: "#393939",
                        Title: "Trustee du TDSB",
                        ServiceURL: "http://yourserver:6080/arcgis/rest/services/ElectionResults/MapServer/2",
                        ChartData: ["NUMVOTES1", "NUMVOTES2", "NUMVOTES3", "NUMVOTES4", "NUMVOTES5", "NUMVOTES6", "NUMVOTES7", "NUMVOTES8"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2", "PARTY3", "PARTY4", "PARTY5", "PARTY6", "PARTY7", "PARTY8"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2", "CANDIDATE3", "CANDIDATE4", "CANDIDATE5", "CANDIDATE6", "CANDIDATE7", "CANDIDATE8"],
                        DisplayWinner: {Candidate:true, Field:"WINCANDIDATE"},
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              TCDSB:
                    {
                        HeaderColor: "#393939",
                        Title: "Trustee du TCDSB",
                        ServiceURL: "http://yourserver:6080/arcgis/rest/services/ElectionResults/MapServer/3",
                        ChartData: ["NUMVOTES1", "NUMVOTES2", "NUMVOTES3", "NUMVOTES4", "NUMVOTES5", "NUMVOTES6", "NUMVOTES7", "NUMVOTES8", "NUMVOTES9"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2", "PARTY3", "PARTY4", "PARTY5", "PARTY6", "PARTY7", "PARTY8", "PARTY9"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2", "CANDIDATE3", "CANDIDATE4", "CANDIDATE5", "CANDIDATE6", "CANDIDATE7", "CANDIDATE8", "CANDIDATE9"],
                        DisplayWinner: {Candidate:true, Field:"WINCANDIDATE"},
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              CSDCSO:
                    {
                        HeaderColor: "#393939",
                        Title: "Conseiller(ères) du CSDCSO",
                        ServiceURL: "http://yourserver:6080/arcgis/rest/services/ElectionResults/MapServer/4",
                        ChartData: ["NUMVOTES1", "NUMVOTES2", "NUMVOTES3"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1", "PARTY2", "PARTY3"],
                        CandidateNames: ["CANDIDATE1", "CANDIDATE2", "CANDIDATE3"],
                        DisplayWinner: {Candidate:true, Field:"WINCANDIDATE"},
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              CSDCCS:
                    {
                        HeaderColor: "#393939",
                        Title: "Conseiller(ères) du CSDCCS",
                        ServiceURL: "http://yourserver:6080/arcgis/rest/services/ElectionResults/MapServer/5",
                        ChartData: ["NUMVOTES1"],
                        ChartType: "barchart",
                        PartyDetails: ["PARTY1"],
                        CandidateNames: ["CANDIDATE1"],
                        DisplayWinner: {Candidate:true, Field:"WINCANDIDATE"},
                        DisplayOnLoad: false,
                        TotalBallots: "TOTBALLOTS"
                    },
              VoterTurnout:
                    {
                        HeaderColor: "#393939",
                        Title: "Participation électorale",
                        ServiceURL: "http://yourserver:6080/arcgis/rest/services/ElectionResults/MapServer/6",
                        ChartData: ["PERCVOTE"],
                        DisplayOnLoad: false,
                        ChartType: "piechart"
                    }
          },
          
    //Si les données des graphiques circulaires sont exprimées en proportions (0-1), utilisez true, si les données sont exprimées en pourcentages, utilisez false.
	PiechartProportions: false,

    //Configurez les couleurs pour chaque partis/candidats, comme ils seront affichés dans les graphiques.
    //Si la couleur du candidate est configuré, elle prendra priorité au-dessus de la couleur du parti.
    //L’entré "Others" permet de configurer une couleur pour les candidats/partis qui ne sont pas configurés autrement.
    ColorCodeOfParties:
         {
             "FORD ROB": { "Color": "#8A5F5F" },
             "SMITHERMAN GEORGE": { "Color": "#808A6B" },
             "PANTALONE JOE": { "Color": "#6E738A" },
             "Others": { "Color": "#9C9C9C" }
         },

    //La couleur pour ceux qui ont voté (dans le graphique circulaire)
    VotedColor: "#CCD9D2",

    //La couleur pour ceux qui n’ont pas voté (dans le graphique circulaire)
    DidNotVoteColor: "#66736D",

    // ------------------------------------------------------------------------------------------------------------------------
    //CONFIGURATION POUR LES MISES À JOUR
    // ------------------------------------------------------------------------------------------------------------------------
    //Configurés les données à afficher pour les mises à jour
    Updates:
          {
              // Le format de la date
              FormatDateAs: "dd MMM yyyy",
              // Le format du temps
              FormatTimeAs: "HH:mm:ss",
              //Le nom du champ contenant le temps de la dernière mise à jour
              FieldName: "LASTUPDATE"
          },

	// ------------------------------------------------------------------------------------------------------------------------
	// BOUTON DE BASCULE DE LA LANGUE
	// ------------------------------------------------------------------------------------------------------------------------
	// Permet d'inclure un bouton dans la barre d'outils afin de changer d'application
	LanguageButton: {
		Enabled: /*Activé*/ false,
		Image: "images/language_EN.png",
		Title: /*Titre*/ "Afficher l'application en anglais",
		AppURL: /*URL de l'application*/ "http://votresiteweb..."
	},
		  
    // ------------------------------------------------------------------------------------------------------------------------
    // CONFIGURATION POUR LE PARTAGE DE LA CARTE
    // ------------------------------------------------------------------------------------------------------------------------
    // Configurez l'URL pour le service TinyURL
    MapSharingOptions:
          {
              TinyURLServiceURL: "http://api.bit.ly/v3/shorten?login=esri&apiKey=R_65fd9891cd882e2a96b99d4bda1be00e&uri=${0}&format=json",
              TinyURLResponseAttribute: /*Attribut réponse*/ "data.url",
              
			  //Configurez les paramètres de partage par réseau sociaux; Laissez une paire de guillemets vides lorsqu’un paramètre n’est
              //pas requis. Veuillez noter que le langage des interfaces est déterminé pas le site web même et ne peut être changé.
              
			  //FacebookText: Facebook ne permet plus de configurer le texte du bulletin. L’utilisateur seras demander de saisir sont propre commentaire.
              
              TwitterText: "Résultats électoraux", //Le texte qui sera ajouté au tweet
              TwitterHashtag: "RésultatsÉlectorauxDeMaVille", //Le hashtag qui seras ajouté au tweet (e.g. RésultatsÉlectorauxToronto)
              TwitterFollow: "EsriCanada", //L'utilisateur seras invité à suivre ce compte sur Twitter (ex: le compte Twitter de la municipalité).
              
              EmailSubject: /*Sujet du courriel*/ "Résultats électoraux",
              
              FacebookShareURL: /*URL de partage de Facebook*/ "http://www.facebook.com/sharer.php",
              TwitterShareURL: /*URL de partage Twitter*/ "http://twitter.com/share"
          }
});
