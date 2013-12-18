/** @license
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
function getWebMapInfo(webmapUniqueKey, webmapId) {
    var webmapDataURL = "http://www.arcgis.com/sharing/content/items/${0}/data?f=json";
    var webmapBaseURL = "http://www.arcgis.com/sharing/content/items/${0}?f=json";
    var url = dojo.string.substitute(webmapBaseURL, [webmapId]);
    var webmapInfo = {};
    webmapInfo.key = webmapUniqueKey;
    var deferred = new dojo.Deferred();
    dojo.io.script.get({
        url: url,
        callbackParamName: "callback",
        load: function (data) {
            if (data.url) {
                webmapInfo.url = data.url;
            }
            url = dojo.string.substitute(webmapDataURL, [webmapId]);
            dojo.io.script.get({
                url: url,
                callbackParamName: "callback",
                load: function (data) {
                    webmapInfo.basemap = data.baseMap.baseMapLayers[0];
                    if (!webmapInfo.url) {
                        webmapInfo.operationalLayers = data.operationalLayers;
                    }
                    else {
                        webmapInfo.layerInfo = data.layers;
                    }
                    deferred.callback(webmapInfo);
                }
            });
        }
    });
    return deferred;
}
