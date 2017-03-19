//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: IO_Json.js - JSON Parser
// Project home: https://github.com/doodadjs/
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015-2017 Claude Petit
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

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.IO.Json'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			dependencies: [
				'Doodad.IO.Json.Loader',
			],
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================
					
				const doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					io = doodad.IO,
					ioJson = io.Json,
					ioJsonLoader = ioJson.Loader;
					
					
				//===================================
				// Internal
				//===================================
					
				//// <FUTURE> Thread context
				//const __Internal__ = {
				//};
					
				//types.complete(_shared.Natives, {
				//});
					
				ioJson.REGISTER(io.Stream.$extend(
									//io.TextInputStream,
									io.TextOutputStream,
				{
					$TYPE_NAME: 'Stream',
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Stream')), true) */,

					__jsonparser: doodad.PROTECTED(null),
					__jsonLevel: doodad.PROTECTED(0),
					__jsonWaitKey: doodad.PROTECTED(false),
					__jsonMode: doodad.PROTECTED(null),
					__jsonModeStack: doodad.PROTECTED(null),

					$Modes: doodad.PUBLIC(doodad.TYPE({
						Value: 0,
						Object: 1,
						Array: 2,
						String: 3,
						Key: 4,
					})),
				
					__jsonparserOnValue: doodad.PROTECTED(function __jsonparserOnValue(/*optional*/value) {
						// TODO: Check MaxSafeInteger for "level"
						// TODO: Combine extracted datas from a chunk of 15K (Node.js's default) to a single "push" call in an Array so that we don't need a buffer size of 100000 !
						
						const raw = {
							value: value,
							isOpenClose: (arguments.length === 0),
							mode: this.__jsonMode,
							level: this.__jsonLevel,
							Modes: types.getType(this).$Modes,
						};

						this.push(new io.Data(raw));
					}),

					reset: doodad.OVERRIDE(function reset() {
						// TODO: Validate with a Schema (http://json-schema.org/)
						
						const JsonParser = ioJsonLoader.getParser();
						const type = types.getType(this);
						this.__jsonparser = new JsonParser({
							onError: doodad.Callback(this, function(err) {
								//this.onError(new doodad.ErrorEvent(err));
								throw err;
							}, true),
							
							onStartObject: doodad.Callback(this, function() {
								this.__jsonLevel++;
								// Check MaxSafeInteger for "__jsonModeStack.length"
								this.__jsonModeStack.push(this.__jsonMode);
								this.__jsonMode = type.$Modes.Object;
								this.__jsonWaitKey = true;
								this.__jsonparserOnValue();
							}, true),
							
							onEndObject: doodad.Callback(this, function() {
								this.__jsonLevel--;
								this.__jsonMode = type.$Modes.Object;
								this.__jsonWaitKey = false;
								this.__jsonparserOnValue();
								this.__jsonMode = this.__jsonModeStack.pop();
							}, true),
							
							onStartArray: doodad.Callback(this, function() {
								this.__jsonLevel++;
								// Check MaxSafeInteger for "__jsonModeStack.length"
								this.__jsonModeStack.push(this.__jsonMode);
								this.__jsonMode = type.$Modes.Array;
								this.__jsonWaitKey = false;
								this.__jsonparserOnValue();
							}, true),
							
							onEndArray: doodad.Callback(this, function() {
								this.__jsonLevel--;
								this.__jsonMode = type.$Modes.Array;
								this.__jsonWaitKey = false;
								this.__jsonparserOnValue();
								this.__jsonMode = this.__jsonModeStack.pop();
							}, true),
							
							onColon: doodad.Callback(this, function() {
								if (this.__jsonWaitKey && (this.__jsonMode === type.$Modes.Object)) {
									this.__jsonWaitKey = false;
								} else {
									// Error
									debugger;
								};
							}, true),
							
							onComma: doodad.Callback(this, function() {
								if (this.__jsonMode === type.$Modes.Object) {
									this.__jsonWaitKey = true;
								} else if (this.__jsonMode === type.$Modes.Array) {
									this.__jsonWaitKey = false;
								} else {
									// Error
									debugger;
								};
							}, true),
							
							onStartString: doodad.Callback(this, function() {
								this.__jsonLevel++;
								this.__jsonModeStack.push(this.__jsonMode);
								this.__jsonMode = (this.__jsonWaitKey ? type.$Modes.Key : type.$Modes.String);
								this.__jsonparserOnValue();
							}, true),
							
							onString: doodad.Callback(this, function(val) {
								this.__jsonparserOnValue(val);
							}, true),
							
							onEndString: doodad.Callback(this, function() {
								this.__jsonLevel--;
								this.__jsonparserOnValue();
								this.__jsonMode = this.__jsonModeStack.pop();
							}, true),
							
							onBoolean: doodad.Callback(this, function(val) {
								this.__jsonparserOnValue(val);
							}, true),
							
							onNull: doodad.Callback(this, function() {
								this.__jsonparserOnValue(null);
							}, true),
							
							onNumber: doodad.Callback(this, function(val) {
								this.__jsonparserOnValue(val);
							}, true),
							
						});
						
						this.__jsonLevel = 0;
						this.__jsonWaitKey = false;
						this.__jsonMode = type.$Modes.Value;
						this.__jsonModeStack = [];
						
						this._super();
					}),

					onWrite: doodad.OVERRIDE(function onWrite(ev) {
						const retval = this._super(ev);

						const data = ev.data;

						ev.preventDefault();

						let dta;

						if (data.raw === io.EOF) {
							this.__jsonparser.finish();
							this.push(new io.Data(io.EOF));
						} else {
							// NOTE: 'parse' is synchronous
							this.__jsonparser.parse(this.transform(data));
						};

						return retval;
					}),
				}));

				
				//===================================
				// Init
				//===================================
				//return function init(/*optional*/options) {
				//};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()