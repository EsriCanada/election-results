﻿/** @license
 |
 |ArcGIS for Canadian Municipalities / ArcGIS pour les municipalités canadiennes
 |Election Results v10.2.0.1-Dev / Résultats électoraux v10.2.0.1-Dev
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
dojo.provide("js.date");
dojo.declare("js.date", null, {

    // Veneer for JavaScript Date object that emphasizes that one is working with local time
    localTimestampNow: function () {  // returns Date
        return new Date();
    },

    localTimestampFromMs: function (localMilliseconds) {  // returns Date
        return new Date(localMilliseconds);
    },

    localMsFromTimestamp: function (localTimestamp) {  // returns Number
        return localTimestamp.getTime();
    },

    // Veneer for JavaScript Date object that emphasizes that one is working with UTC time
    utcTimestampNow: function () {  // returns Date
        return this.localToUtc(this.localTimestampNow());
    },

    utcTimestampFromMs: function (utcMilliseconds) {  // returns Date
        return this.localToUtc(new Date(utcMilliseconds));
    },

    utcMsFromTimestamp: function (utcTimestamp) {  // returns Number
        return this.utcToLocal(utcTimestamp).getTime();
    },

    // Convert timestamps from local to UTC and back
    localToUtc: function (localTimestamp) {  // returns Date
        return new Date(localTimestamp.getTime() + (localTimestamp.getTimezoneOffset() * 60000));
    },

    utcToLocal: function (utcTimestamp) {  // returns Date
        return new Date(utcTimestamp.getTime() - (utcTimestamp.getTimezoneOffset() * 60000));
    }

})
