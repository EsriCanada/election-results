//ENGLISH
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
dojo.provide("js.config");
dojo.declare("js.config", null, {

    // This file contains various configuration settings for "Election Results" template
    //
    // Use this file to perform the following:
    //
    // 1.  Specify application title                  - [ Tag(s) to look for: ApplicationName, WindowTitle ]
    // 2.  Set splash screen message                  - [ Tag(s) to look for: SplashScreenMessage ]
    // 3.  Set URL for help page                      - [ Tag(s) to look for: HelpURL ]
    //
    // 4.  Specify URL(s) for basemaps                - [ Tag(s) to look for: BaseMapLayers ]
    // 5.  Set initial map extent                     - [ Tag(s) to look for: DefaultExtent ]
    //
    // 6.  Web Mapping Services:
    // 6a. Specify URL(s) for operational and overlay layers
    //                                                - [ Tag(s) to look for: PrecinctLayer, ReferenceOverlayLayer]
    // 6b. Specify the query field                    - [ Tag(s) to look for: ElectionResultDataQueryString]
    // 6c. Customize data formatting                  - [ Tag(s) to look for: ShowNullValueAs]
    //
    // 7.  Customize address search settings          - [ Tag(s) to look for: LocatorSettings]
    //
    // 8.  Set URL for geometry service               - [ Tag(s) to look for: GeometryService ]
    //
    // 9.  Configure data to be displayed on the bottom panel
    //                                                - [ Tag(s) to look for: InfoBoxWidth, ElectionResultData, PiechartProportions,
    //                                                                        ColorCodeOfParties, VotedColor, DidNotVoteColor]
    //
    // 10. Configure data to be displayed for election updates
    //                                                - [Tag(s) to look for: Updates]
    //
    // 11. Specify URLs for map sharing:
    // 11a.In case of changing the TinyURL service
    //      Specify URL for the new service           - [ Tag(s) to look for: MapSharingOptions (set TinyURLServiceURL, TinyURLResponseAttribute) ]
    // 11b. Specify the share settings                - [ Tag(s) to look for: TwitterStatus, TwitterHashtag, TwitterFollow, EmailSubject ]
    // 11c. Specify the Facebook/Twitter URL in case of change to URL
    //                                                - [ Tag(s) to look for: FacebookURL, TwitterShareURL ]
    //

    // ------------------------------------------------------------------------------------------------------------------------
    // GENERAL SETTINGS
    // -----------------------------------------------------------------------------------------------------------------------
    // Set application title
    ApplicationName: "Election Results",
	WindowTitle: "Election Results",

    // Set splash window content - Message that appears when the application starts
    SplashScreenMessage: "<b>Election Results</b><br/><hr/><br/>The <b>Election Results</b> application provides a map-based view of voting results tabulated on election night for each polling division. To display the results, enter an address or polling division number in the search box or click on the map. The polling division will be highlighted and the voting results will be displayed in the tab along the bottom of the map.<br/><br/>",

    // Set URL of help page/portal
    HelpURL: "help.htm",

    // ------------------------------------------------------------------------------------------------------------------------
    // BASEMAP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set baseMap layers
    // Please note: This application will only load the first basemap
    BaseMapLayers:
               [
                   {
                       Key: "baseMapKey",
                       MapURL: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
                   }
               ],


    // Initial map extent. Use comma (,) to separate values and don't delete the last comma
	// Extent should be in WGS 1984 Web Mercator meters
    DefaultExtent: "-8846570,5405896,-8824595,5436318",

    // ------------------------------------------------------------------------------------------------------------------------
    // OPERATIONAL DATA SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Set the following options for the configuration of operational layers

    // Key is used as an layerId while adding this layer to the map and has to be unique
    // ServiceURL is the REST end point for the DivisionLayer
    // UseColor used to override the default symbology defined in the map service
    // Color used to define the renderer colour of the symbol
    // Alpha used to define the transparency of the renderer
    // Query is used to query the map server for fetching divison's (in the search box)
    // DivisionId is the field name for divison id in the Division Layer
    // VotingDistrict is the Voting District field name from the division layer
    PrecinctLayer:
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
          
    //Query field for Election Results Data layers - Should be the field whose data matches the DivisionID field set above
    ElectionResultDataQueryString: "DIVISIONID",

    //Set ReferenceOverlay Layer
    // ServiceURL is the REST end point for the reference overlay layer
    // DisplayOnLoad setting this will show the reference overlay layer on load
    ReferenceOverlayLayer:
          {
              ServiceURL: "http://yourserver:6080/arcgis/rest/services/ReferenceOverlay/MapServer",
              DisplayOnLoad: true
          },

    // ------------------------------------------------------------------------------------------------------------------------

    // Set string value to be shown for null or blank values
    ShowNullValueAs: "N/A",

    // ------------------------------------------------------------------------------------------------------------------------
    // ADDRESS SEARCH SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Set locator settings such as locator symbol, size, zoom level, display fields, match score
    LocatorSettings: {
        Locators: [
                {
                    DisplayText: "Address ",
                    LocatorParamaters: ["SingleLine"],
                    LocatorURL: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
                    CandidateFields: "Loc_name, Score, Match_addr",
                    DisplayField: "${Match_addr}",
                    ZoomLevel: 7,
                    AddressMatchScore: 80,
                    LocatorFieldName: 'Loc_name',
                    LocatorFieldValues: ["CAN.StreetName" , "CAN.PointAddress", "CAN.StreetAddress", "CAN.PostalExt"],
                    //CanMod: Set the extent to be used when searching for an address, set wkid to 0000 in order to search whole of North America
                    //CGS_WGS_1984: Use wkid 4326 and decimal degrees; WGS_1984_Web_Mercator: Use wkid 3785 and metres; Other systems not supported
                    SearchExtent: {xmin: -8865402.789852107, ymin: 5443102.360231639, xmax: -8807068.937666388, ymax: 5400828.978730424, wkid: 3785}
                },
                {
                    DisplayText: "Division ",
                    SampleSearchString: "01001"
                }
            ]
    },

    // ------------------------------------------------------------------------------------------------------------------------
    // GEOMETRY SERVICE SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set geometry service URL
    GeometryService: "http://yourserver:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer",

    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR INFO-PODS ON THE BOTTOM PANEL
    // ------------------------------------------------------------------------------------------------------------------------
    // Set width of the pods in the bottom panel
    InfoBoxWidth: 424,

    // Election Results contest data shown in the bottom panel. Every section is a pod in the bottom panel
    // HeaderColor will set the colour of the header of the info pod in the bottom panel
    // Title will set the contest name of the info pod in the bottom panel
    // ServiceURL is the map service URL for the contest
    // ChartData is the field information for the contest used in rendering charts
    // ChartType "barchart" (or) "piechart"
    // PartyDetails are the field names used to render party colour in the charts. This has to be in the same sequence as the ChartData attribute sequence. This data is not required for piechart
    // CandidateNames are the field names used to display Candidate name in the charts and to render candidate colour. This has to be in the same sequence as the ChartData attribute sequence. This data is not required for piechart
    // DisplayWinner sets how the winner is determined. This is not required for pie-charts.
        //Candidate: when true, the winning candidate will be displayed; when false, the winning party will be shown
        //Field: if left blank (an empty set of quotations), the winner will be determined automatically. If a field name is set, it will read the winner from the field
    // DisplayOnLoad setting this will show the contest layer on load. If this is set true for multiple contests, only the first occurrence is considered
    // TotalBallots is the field name which gives the total votes casted. This is not required for pie-chart
    ElectionResultData:
          {
              Mayor:
                    {
                        HeaderColor: "#393939",
                        Title: "Mayor",
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
                        Title: "Councillor",
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
                        Title: "TDSB Trustee",
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
                        Title: "TCDSB Trustee",
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
                        Title: "CSDCSO",
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
                        Title: "CSDCCS",
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
                        Title: "Voter Turnout",
                        ServiceURL: "http://yourserver:6080/arcgis/rest/services/ElectionResults/MapServer/6",
                        ChartData: ["PERCVOTE"],
                        DisplayOnLoad: false,
                        ChartType: "piechart"
                    }
          },
     
	//Set to true if piechart data is in proportions (0-1), set to false if in percentages (0-100)
    PiechartProportions: false,

    //Set the colour for different parties and/or candidates, as they will appear in the charts
    //If a colour is defined for a candidate, it will overide the party colour.
    //The "Others" entry will define all other entries that are not otherwise defined.
    ColorCodeOfParties:
         {
             "FORD ROB": { "Color": "#8A5F5F" },
             "SMITHERMAN GEORGE": { "Color": "#808A6B" },
             "PANTALONE JOE": { "Color": "#6E738A" },
             "Others": { "Color": "#9C9C9C" }
         },

    //Set the colour for those who voted (in the pie chart)
    VotedColor: "#CCD9D2",

    //Set the colour for those who did not vote (in the pie chart)
    DidNotVoteColor: "#66736D",

    // ------------------------------------------------------------------------------------------------------------------------
    //SETTING FOR ELECTION UPDATES
    // ------------------------------------------------------------------------------------------------------------------------
    //Set data to be displayed for election updates
    Updates:
          {
              // Set date format
              FormatDateAs: "dd MMM yyyy",
              // Set time format
              FormatTimeAs: "HH:mm:ss",
              //Specify the field name for last update
              FieldName: "LASTUPDATE"
          },

    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR MAP SHARING
    // ------------------------------------------------------------------------------------------------------------------------
    // Set URL for TinyURL service, and URLs for social media
    MapSharingOptions:
          {
              TinyURLServiceURL: "http://api.bit.ly/v3/shorten?login=esri&apiKey=R_65fd9891cd882e2a96b99d4bda1be00e&uri=${0}&format=json",
              TinyURLResponseAttribute: "data.url",
              
              //Set the default settings when sharing the app; Leave an empty set of quotation marks when a setting is not required.
              //The language displayed by the APIs is determined by the website and cannot be changed
              
              //FacebookText: Facebook has removed the option to include text. The user will instead by prompted for his own comment.
              
              TwitterText: "Election Results", //The text that will be added to the tweet
              TwitterHashtag: "MyCitiesElectionResults", //Hashtag to append to the tweet (e.g. TorontoElections).
              TwitterFollow: "EsriCanada", //Allows user to follow a Twitter account (e.g. the municipalities twitter account).
              
              EmailSubject: "Election Results",
              
              FacebookShareURL: "http://www.facebook.com/sharer.php",
              TwitterShareURL: "http://twitter.com/share"
          },
          
    //-------------------------------------------------------------------------------------------------------------------------
    // WEBMAPS ARE NOT SUPPORTED AT 10.2, SEE DETAILS BELOW
    //-------------------------------------------------------------------------------------------------------------------------
    // WebMaps are not supported with the 10.2 version of the Polling Place Locator application. Please use Map Services for operational layers. Do not change the "UseWebmap" and "WebMapId" parameters.
    UseWebmap: false,
    WebMapId: ""
});
