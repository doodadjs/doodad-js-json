//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: IO_Json_Loader.js - JSON Parser Loader (server-side)
// Project home: https://github.com/doodadjs/
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015-2018 Claude Petit
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//		http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//! END_REPLACE()


//! IF_SET("mjs")
//! INJECT("import {default as jsonparse} from '@doodad-js/json/lib/jsonparse/jsonparse.min.js';")
//! ELSE()
"use strict";

/* eslint import/no-extraneous-dependencies: "off" */  // We self-require the package to reach its root.
const jsonparse = require('@doodad-js/json/lib/jsonparse/jsonparse.min.js');
//! END_IF()

const jsonparseJsonParser = jsonparse.JsonParser;


exports.add = function add(modules) {
	modules = (modules || {});
	modules['Doodad.IO.Json.Loader'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				//nodejs = doodad.NodeJs,
				io = doodad.IO,
				ioJson = io.Json,
				ioJsonLoader = ioJson.Loader;


			//===================================
			// Internal
			//===================================

			//// <FUTURE> Thread context
			//const __Internal__ = {
			//};

			//tools.complete(_shared.Natives, {
			//});


			ioJsonLoader.ADD('getParser', function getParser() {
				return jsonparseJsonParser;
			});


			//===================================
			// Init
			//===================================
			//return function init(/*optional*/options) {
			//};
		},
	};
	return modules;
};

//! END_MODULE()
