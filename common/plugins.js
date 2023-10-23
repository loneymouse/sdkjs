/*
 * (c) Copyright Ascensio System SIA 2010-2023
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

(function(window, undefined)
{

	function CPluginData()
	{
		this.privateData = {};
	}

	CPluginData.prototype =
	{
		setAttribute : function(name, value)
		{
			this.privateData[name] = value;
		},

		getAttribute : function(name)
		{
			return this.privateData[name];
		},

		serialize : function()
		{
			var _data = "";
			try
			{
				_data = JSON.stringify(this.privateData);
			}
			catch (err)
			{
				_data = "{ \"data\" : \"\" }";
			}
			return _data;
		},

		deserialize : function(_data)
		{
			try
			{
				this.privateData = JSON.parse(_data);
			}
			catch (err)
			{
				this.privateData = {"data" : ""};
			}
		},

		wrap : function(obj)
		{
			this.privateData = obj;
		}
	};

	function CPluginsManager(api)
	{
		this.plugins          = [];
		this.systemPlugins	  = [];

		this.runnedPluginsMap = {}; // guid => { iframeId: "", currentVariation: 0, currentInit: false, isSystem: false, startData: {}, closeAttackTimer: -1, methodReturnAsync: false }
		this.pluginsMap = {};		// guid => { isSystem: false }

		this.path             = "../../../../sdkjs-plugins/";
		this.systemPath 	  = "";
		this.api              = api;
		this["api"]			  = this.api;

		this.runAndCloseData = null;

		this.isNoSystemPluginsOnlyOne = true;

		this.guidAsyncMethod = "";

		this.sendsToInterface = {};

		this.sendEncryptionDataCounter = 0;

		this.language = "en-EN";

		if (this.api.isCheckCryptoReporter)
			this.checkCryptoReporter();

		// сообщения, которые ДОЛЖНЫ отправиться в каждый плагин один раз
		// например onDocumentContentReady
		// объект - { name : data ] } - список
		this.mainEventTypes = {
			"onDocumentContentReady" : true
		};
		this.mainEvents = {};
	}

	CPluginsManager.prototype =
	{
		unregisterAll : function()
		{
			// удаляем все, кроме запущенного
			var i = 0;
			for (i = 0; i < this.plugins.length; i++)
			{
				if (!this.runnedPluginsMap[this.plugins[i].guid])
				{
					delete this.pluginsMap[this.plugins[i].guid];
					this.plugins.splice(i, 1);
					i--;
				}
			}
		},

		unregister : function(guid)
		{
			if (!this.pluginsMap[guid])
				return null;

			let removedPlugin = null;

			this.close(guid);

			if (this.pluginsMap[guid])
				delete this.pluginsMap[guid];

			let currentArray = this.plugins;
			for (let indexArray = 0; indexArray < 2; indexArray++)
			{
				for (let i = 0, len = currentArray.length; i < len; i++)
				{
					if (guid === currentArray[i].guid)
					{
						removedPlugin = currentArray[i];
						currentArray.splice(i, 1);
						break;
					}
				}
				currentArray = this.systemPlugins;
			}

			return removedPlugin;
		},

		register : function(basePath, plugins, isDelayRun)
		{
			this.path = basePath;

			for (var i = 0; i < plugins.length; i++)
			{
				var guid = plugins[i].guid;
				var isSystem = false;
				if (plugins[i].variations && plugins[i].variations[0] && plugins[i].variations[0].isSystem)
					isSystem = true;

				if (this.runnedPluginsMap[guid])
				{
					// не меняем запущенный
					continue;
				}
				else if (this.pluginsMap[guid])
				{
					// заменяем новым
					for (var j = 0; j < this.plugins.length; j++)
					{
						if (this.plugins[j].guid === guid && this.plugins[j].getIntVersion() < plugins[i].getIntVersion())
						{
							this.plugins[j] = plugins[i];
							break;
						}
					}
				}
				else
				{
					if (!isSystem)
						this.plugins.push(plugins[i]);
					else
						this.systemPlugins.push(plugins[i]);

					this.pluginsMap[guid] = { isSystem : isSystem };
				}

				if (isSystem)
				{
					if (!isDelayRun)
						this.run(guid, 0, "");
					else
					{
						setTimeout(function(){
							window.g_asc_plugins.run(guid, 0, "");
						}, 100);
					}
				}
			}
		},
		registerSystem : function(basePath, plugins)
		{
			this.systemPath = basePath;

			for (var i = 0; i < plugins.length; i++)
			{
				var guid = plugins[i].guid;

				// системные не обновляем
				if (this.pluginsMap[guid])
				{
					continue;
				}

				this.systemPlugins.push(plugins[i]);
				this.pluginsMap[guid] = { isSystem : true };
			}
		},
		runAllSystem : function()
		{
			for (var i = 0; i < this.systemPlugins.length; i++)
			{
				this.run(this.systemPlugins[i].guid, 0, "");
			}
		},
		// pointer events methods -------------------
		enablePointerEvents : function()
		{
			for (var guid in this.runnedPluginsMap)
			{
				var _frame = document.getElementById(this.runnedPluginsMap[guid].frameId);
				if (_frame)
					_frame.style.pointerEvents = "";
			}
		},
		disablePointerEvents : function()
		{
			for (var guid in this.runnedPluginsMap)
			{
				var _frame = document.getElementById(this.runnedPluginsMap[guid].frameId);
				if (_frame)
					_frame.style.pointerEvents = "none";
			}
		},
		// ------------------------------------------
		checkRunnedFrameId : function(id)
		{
			for (var guid in this.runnedPluginsMap)
			{
				if (this.runnedPluginsMap[guid].frameId == id)
					return true;
			}
			return false;
		},
		sendToAllPlugins : function(data)
		{
			for (var guid in this.runnedPluginsMap)
			{
				var _frame = document.getElementById(this.runnedPluginsMap[guid].frameId);
				if (_frame)
					_frame.contentWindow.postMessage(data, "*");
			}
		},
		getPluginByGuid : function(guid)
		{
			if (undefined === this.pluginsMap[guid])
				return null;

			var _array = (this.pluginsMap[guid].isSystem) ? this.systemPlugins : this.plugins;
			for (var i = _array.length - 1; i >= 0; i--)
			{
				if (_array[i].guid == guid)
					return _array[i];
			}
			return null;
		},
		isWorked : function()
		{
			for (var i in this.runnedPluginsMap)
			{
				if (this.pluginsMap[i] && !this.pluginsMap[i].isSystem)
				{
					return true;
				}
			}
			return false;
		},
		stopWorked : function()
		{
		   for (var i in this.runnedPluginsMap)
		   {
			   if (this.pluginsMap[i] && !this.pluginsMap[i].isSystem)
			   {
					this.close(i);
			   }
		   }
		},
		isRunned : function(guid)
		{
			return (undefined !== this.runnedPluginsMap[guid]);
		},
		checkEditorSupport : function(plugin, variation)
		{
			var typeEditor = this.api.getEditorId();
			var typeEditorString = "";
			switch (typeEditor)
			{
				case AscCommon.c_oEditorId.Word:
					typeEditorString = "word";
					break;
				case AscCommon.c_oEditorId.Presentation:
					typeEditorString = "slide";
					break;
				case AscCommon.c_oEditorId.Spreadsheet:
					typeEditorString = "cell";
					break;
				default:
					break;
			}
			var runnedVariation = variation ? variation : 0;
			if (!plugin.variations[runnedVariation] ||
				!plugin.variations[runnedVariation].EditorsSupport ||
				!plugin.variations[runnedVariation].EditorsSupport.includes(typeEditorString))
				return false;
			return true;
		},
		run : function(guid, variation, data, isNoUse_isNoSystemPluginsOnlyOne)
		{
			if (window["AscDesktopEditor"] && window["AscDesktopEditor"]["isSupportPlugins"] && !window["AscDesktopEditor"]["isSupportPlugins"]())
				return;

            var isEnabled = this.api.DocInfo ? this.api.DocInfo.get_IsEnabledPlugins() : true;
			if (false === isEnabled)
				return;

			if (this.runAndCloseData) // run only on close!!!
				return;

			if (this.pluginsMap[guid] === undefined)
				return;

			var plugin = this.getPluginByGuid(guid);
			if (!plugin)
				return;

			if (!this.checkEditorSupport(plugin, variation))
				return;

			var isSystem = this.pluginsMap[guid].isSystem;
			var isRunned = (this.runnedPluginsMap[guid] !== undefined) ? true : false;

			if (isRunned && ((variation == null) || variation == this.runnedPluginsMap[guid].currentVariation))
			{
				// запуск запущенного => закрытие
				this.close(guid);
				return false;
			}

			if ((isNoUse_isNoSystemPluginsOnlyOne !== true) && !isSystem && this.isNoSystemPluginsOnlyOne)
			{
				// смотрим, есть ли запущенный несистемный плагин
				var guidOther = "";
				for (var i in this.runnedPluginsMap)
				{
					if (this.pluginsMap[i] && !this.pluginsMap[i].isSystem)
					{
						guidOther = i;
						break;
					}
				}

				if (guidOther != "")
				{
					// стопим текущий, а после закрытия - стартуем новый.
					this.runAndCloseData = {};
					this.runAndCloseData.guid = guid;
					this.runAndCloseData.variation = variation;
					this.runAndCloseData.data = data;

					this.close(guidOther);
					return;
				}
			}

			var _startData = (data == null || data == "") ? new CPluginData() : data;
			_startData.setAttribute("guid", guid);
			this.correctData(_startData);
			// set theme only on start (big object)
			_startData.setAttribute("theme", AscCommon.GlobalSkin);

			this.runnedPluginsMap[guid] = {
				frameId: "iframe_" + guid,
				currentVariation: Math.min(variation, plugin.variations.length - 1),
				currentInit: false,
				isSystem: isSystem,
				startData: _startData,
				closeAttackTimer: -1,
				methodReturnAsync: false,
				isConnector: plugin.isConnector
			};

			this.show(guid);
		},
		runResize : function(data)
		{
			var guid = data.getAttribute("guid");
			var plugin = this.getPluginByGuid(guid);

			if (!plugin)
				return;

			if (true !== plugin.variations[0].isUpdateOleOnResize)
				return;

			data.setAttribute("resize", true);
			return this.run(guid, 0, data, true);
		},
		close : function(guid)
		{
			var plugin = this.getPluginByGuid(guid);
			var runObject = this.runnedPluginsMap[guid];
			if (!plugin || !runObject)
				return;

			if (runObject.startData && runObject.startData.getAttribute("resize") === true)
				this.endLongAction();

			runObject.startData = null;

			if (true)
			{
				if (this.sendsToInterface[plugin.guid])
				{
					this.api.sendEvent("asc_onPluginClose", plugin, runObject.currentVariation);
					delete this.sendsToInterface[plugin.guid];
				}
				var _div = document.getElementById(runObject.frameId);
				if (_div)
					_div.parentNode.removeChild(_div);
			}

			delete this.runnedPluginsMap[guid];
			this.api.onPluginCloseContextMenuItem(guid);

			if (this.runAndCloseData)
			{
				var _tmp = this.runAndCloseData;
				this.runAndCloseData = null;
				this.run(_tmp.guid, _tmp.variation, _tmp.data);
			}
		},

		show : function(guid)
		{
			var plugin = this.getPluginByGuid(guid);
			var runObject = this.runnedPluginsMap[guid];

			if (!plugin || !runObject)
				return;

			// приходили главные евенты. нужно их послать
			for (var mainEventType in this.mainEvents)
			{
				if (plugin.variations[runObject.currentVariation].eventsMap[mainEventType])
				{
					if (!runObject.waitEvents)
						runObject.waitEvents = [];
					runObject.waitEvents.push({ n : mainEventType, d : this.mainEvents[mainEventType] });
				}
			}

			if (plugin.isConnector)
			{
				runObject.currentInit = true;
				runObject.isInitReceive = true;
				return;
			}

			if (runObject.startData.getAttribute("resize") === true)
				this.startLongAction();

		    if (this.api.WordControl && this.api.WordControl.m_oTimerScrollSelect != -1)
		    {
		        clearInterval(this.api.WordControl.m_oTimerScrollSelect);
                this.api.WordControl.m_oTimerScrollSelect = -1;
		    }

			var urlParams = "?lang=" + this.language + "&theme-type=" + AscCommon.GlobalSkin.type;
			if (plugin.variations[runObject.currentVariation].isVisual && runObject.startData.getAttribute("resize") !== true)
			{
				this.api.sendEvent("asc_onPluginShow", plugin, runObject.currentVariation, runObject.frameId, urlParams);
				this.sendsToInterface[plugin.guid] = true;
			}
			else
			{
				var ifr            = document.createElement("iframe");
				ifr.name           = runObject.frameId;
				ifr.id             = runObject.frameId;
				var _add           = plugin.baseUrl == "" ? this.path : plugin.baseUrl;
				ifr.src            = _add + plugin.variations[runObject.currentVariation].url + urlParams;
				ifr.style.position = (AscCommon.AscBrowser.isIE || AscCommon.AscBrowser.isMozilla) ? 'fixed' : "absolute";
				ifr.style.top      = '-100px';
				ifr.style.left     = '0px';
				ifr.style.width    = '10000px';
				ifr.style.height   = '100px';
				ifr.style.overflow = 'hidden';
				ifr.style.zIndex   = -1000;
				ifr.setAttribute("frameBorder", "0");
				ifr.setAttribute("allow", "autoplay");
				document.body.appendChild(ifr);

				if (runObject.startData.getAttribute("resize") !== true)
				{
					var isSystem = false;
					if (plugin.variations && plugin.variations[runObject.currentVariation].isSystem)
						isSystem = true;

					this.api.sendEvent("asc_onPluginShow", plugin, runObject.currentVariation);

					if (!isSystem)
						this.sendsToInterface[plugin.guid] = true;
				}
			}

			runObject.currentInit = false;

			if (AscCommon.AscBrowser.isIE && !AscCommon.AscBrowser.isIeEdge)
			{
				var ie_frame_id = runObject.frameId;
				var ie_frame_message = {
					data : JSON.stringify({"type" : "initialize", "guid" : guid})
				};

				document.getElementById(runObject.frameId).addEventListener("load", function(){
					setTimeout(function(){

						var channel = new MessageChannel();
						channel["port1"]["onmessage"] = onMessage;

						onMessage(ie_frame_message, channel);
					}, 500);
				});
			}
		},

		buttonClick : function(id, guid, windowId)
		{
			if (guid === undefined)
			{
				// old version support
				for (var i in this.runnedPluginsMap)
				{
					if (this.runnedPluginsMap[i].isSystem)
						continue;
					
					if (this.pluginsMap[i])
					{
						guid = i;
						break;
					}
				}
			}

			if (undefined === guid)
				return;

			var plugin = this.getPluginByGuid(guid);
			var runObject = this.runnedPluginsMap[guid];

			if (!plugin || !runObject)
				return;

			if (runObject.closeAttackTimer != -1)
			{
				clearTimeout(runObject.closeAttackTimer);
				runObject.closeAttackTimer = -1;
			}

			if (-1 === id && !windowId)
			{
				if (!runObject.currentInit)
				{
					this.close(guid);
				}

				// защита от плохого плагина
				runObject.closeAttackTimer = setTimeout(function()
				{
					window.g_asc_plugins.close();
				}, 5000);
			}
			var _iframe = document.getElementById(runObject.frameId);
			if (_iframe)
			{
				var pluginData = new CPluginData();
				pluginData.setAttribute("guid", plugin.guid);
				pluginData.setAttribute("type", "button");
				pluginData.setAttribute("button", "" + id);
				if (windowId)
					pluginData.setAttribute("buttonWindowId", "" + windowId);
				_iframe.contentWindow.postMessage(pluginData.serialize(), "*");
			}
		},

		init : function(guid, raw_data)
		{
			var plugin = this.getPluginByGuid(guid);
			var runObject = this.runnedPluginsMap[guid];

			if (!plugin || !runObject || !runObject.startData)
				return;

			if (undefined === raw_data)
			{
				switch (plugin.variations[runObject.currentVariation].initDataType)
				{
					case Asc.EPluginDataType.text:
					{
						var text_data = {
							data:     "",
							pushData: function (format, value)
									  {
										  this.data = value;
									  }
						};

						this.api.asc_CheckCopy(text_data, 1);
						if (text_data.data == null)
							text_data.data = "";
						runObject.startData.setAttribute("data", text_data.data);
						break;
					}
					case Asc.EPluginDataType.html:
					{
						var text_data = {
							data:     "",
							pushData: function (format, value)
									  {
										  this.data = value ? value.replace(/class="[a-zA-Z0-9-:;+"\/=]*/g,"") : "";
									  }
						};

						this.api.asc_CheckCopy(text_data, 2);
						runObject.startData.setAttribute("data", text_data.data);
						break;
					}
					case Asc.EPluginDataType.ole:
					{
						// теперь выше задается
						break;
					}
					case Asc.EPluginDataType.desktop:
					{
						if (plugin.variations[runObject.currentVariation].initData == "encryption")
						{
							if (this.api.isReporterMode)
							{
                                this.sendEncryptionDataCounter++;
                                if (2 <= this.sendEncryptionDataCounter)
                                {
                                    runObject.startData.setAttribute("data", {
                                        "type": "setPassword",
                                        "password": this.api.currentPassword,
                                        "hash": this.api.currentDocumentHash,
                                        "docinfo": this.api.currentDocumentInfo
                                    });
                                }
                            }

                            // for crypt mode (end waiting all system plugins)
                            if (this.api.asc_initAdvancedOptions_params)
                            {
                            	window["asc_initAdvancedOptions"].apply(window, this.api.asc_initAdvancedOptions_params);
                                delete this.api.asc_initAdvancedOptions_params;
                                // already sended in asc_initAdvancedOptions
                                return;
                            }
						}
						break;
					}
				}
			}
			else
			{
				runObject.startData.setAttribute("data", raw_data);
			}

			var _iframe = document.getElementById(runObject.frameId);
			if (_iframe)
			{
				runObject.startData.setAttribute("type", "init");
				_iframe.contentWindow.postMessage(runObject.startData.serialize(), "*");
			}

			runObject.currentInit = true;
		},
		correctData : function(pluginData)
		{
			pluginData.setAttribute("editorType", this.api._editorNameById());
			pluginData.setAttribute("mmToPx", AscCommon.g_dKoef_mm_to_pix);

			if (undefined == pluginData.getAttribute("data"))
				pluginData.setAttribute("data", "");

            pluginData.setAttribute("isViewMode", this.api.isViewMode);
            pluginData.setAttribute("isMobileMode", this.api.isMobileVersion);
            pluginData.setAttribute("isEmbedMode", this.api.isEmbedVersion);
            pluginData.setAttribute("lang", this.language);
            pluginData.setAttribute("documentId", this.api.documentId);
            pluginData.setAttribute("documentTitle", this.api.documentTitle);
            pluginData.setAttribute("documentCallbackUrl", this.api.documentCallbackUrl);

            if (this.api.User)
            {
                pluginData.setAttribute("userId", this.api.User.id);
                pluginData.setAttribute("userName", this.api.User.userName);
            }
		},
		loadExtensionPlugins : function(_plugins, isDelayRun, isNoUpdateInterface)
		{
			if (!_plugins || _plugins.length < 1)
				return false;

			var _map = {};
			for (let i = 0; i < this.plugins.length; i++)
				_map[this.plugins[i].guid] = this.plugins[i].getIntVersion();

			var _new = [];
			for (let i = 0; i < _plugins.length; i++)
			{
				var _p = new Asc.CPlugin();
				_p["deserialize"](_plugins[i]);

				if (_map[_p.guid] !== undefined)
				{
					if (_map[_p.guid] < _p.getIntVersion())
					{
						// нужно обновить
						for (let j = 0; j < this.plugins.length; j++)
						{
							if (this.plugins[j].guid === _p.guid)
							{
								if (this.pluginsMap[_p.guid])
									delete this.pluginsMap[_p.guid];
								this.plugins.splice(j, 1);
							}
						}
					}
					else
					{
						continue;
					}
				}


				_new.push(_p);
			}

			if (_new.length > 0)
			{
				this.register(this.path, _new, isDelayRun);

				if (true !== isNoUpdateInterface)
					this.updateInterface();

				return true;
			}

			return false;
		},

		updateInterface : function()
		{
			var _pluginsInstall = {"url" : this.path, "pluginsData" : []};
			for (var i = 0; i < this.plugins.length; i++)
			{
				_pluginsInstall["pluginsData"].push(this.plugins[i].serialize());
			}

			this.api.sendEvent("asc_onPluginsInit", _pluginsInstall);
		},

		startLongAction : function()
		{
			//console.log("startLongAction");
			this.api.sync_StartAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.SlowOperation);
		},
		endLongAction   : function()
		{
			//console.log("endLongAction");
			this.api.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.SlowOperation);
		},

		onChangedSelectionData : function()
		{
			for (var guid in this.runnedPluginsMap)
			{
				var plugin = this.getPluginByGuid(guid);
				var runObject = this.runnedPluginsMap[guid];

				if (plugin && plugin.variations[runObject.currentVariation].initOnSelectionChanged === true)
				{
					// re-init
					this.init(guid);
				}
			}
		},

        onPluginEvent : function(name, data)
        {
			if (this.mainEventTypes[name])
				this.mainEvents[name] = data;

			let needsGuids = [];
            for (var guid in this.runnedPluginsMap)
            {
                var plugin = this.getPluginByGuid(guid);
                var runObject = this.runnedPluginsMap[guid];

                if (plugin && plugin.variations[runObject.currentVariation].eventsMap[name])
                {
					needsGuids.push(plugin.guid);
                    if (!runObject.isInitReceive)
                    {
                        if (!runObject.waitEvents)
                            runObject.waitEvents = [];
                        runObject.waitEvents.push({ n : name, d : data });
                        continue;
                    }
                    var pluginData = new CPluginData();
                    pluginData.setAttribute("guid", plugin.guid);
                    pluginData.setAttribute("type", "onEvent");
                    pluginData.setAttribute("eventName", name);
                    pluginData.setAttribute("eventData", data);

					this.sendMessageToFrame(runObject.isConnector ? "" : runObject.frameId, pluginData);
                }
            }
			return needsGuids;
        },

        onPluginEvent2 : function(name, data, guids)
        {
            for (var guid in this.runnedPluginsMap)
            {
                var plugin = this.getPluginByGuid(guid);
                var runObject = this.runnedPluginsMap[guid];

                if (plugin && guids[guid])
                {
                    if (!runObject.isInitReceive)
                    {
                        if (!runObject.waitEvents)
                            runObject.waitEvents = [];
                        runObject.waitEvents.push({ n : name, d : data });
                        continue;
                    }
                    var pluginData = new CPluginData();
                    pluginData.setAttribute("guid", plugin.guid);
                    pluginData.setAttribute("type", "onEvent");
                    pluginData.setAttribute("eventName", name);
                    pluginData.setAttribute("eventData", data);

					this.sendMessageToFrame(runObject.isConnector ? "" : runObject.frameId, pluginData);
                }
            }
        },

		onPluginEventWindow : function(id, name, data)
		{
			var pluginData = new CPluginData();
			pluginData.setAttribute("guid", this.guidAsyncMethod);
			pluginData.setAttribute("type", "onEvent");
			pluginData.setAttribute("eventName", name);
			pluginData.setAttribute("eventData", data);

			this.sendMessageToFrame(id, pluginData);
		},

		onExternalMouseUp : function()
		{
			for (var guid in this.runnedPluginsMap)
			{
				var runObject = this.runnedPluginsMap[guid];
				runObject.startData.setAttribute("type", "onExternalMouseUp");
				this.correctData(runObject.startData);

				var _iframe = document.getElementById(runObject.frameId);
				if (_iframe)
				{
					runObject.startData.setAttribute("guid", guid);
					_iframe.contentWindow.postMessage(runObject.startData.serialize(), "*");
				}
			}
		},

		onEnableMouseEvents : function(isEnable)
		{
			for (var guid in this.runnedPluginsMap)
			{
				var runObject = this.runnedPluginsMap[guid];

				var _pluginData = new Asc.CPluginData();
				_pluginData.setAttribute("type", "enableMouseEvent");
				_pluginData.setAttribute("isEnabled", isEnable);
				this.correctData(_pluginData);

				var _iframe = document.getElementById(runObject.frameId);
				if (_iframe)
				{
					_pluginData.setAttribute("guid", guid);
					_iframe.contentWindow.postMessage(_pluginData.serialize(), "*");
				}
			}
		},

		onThemeChanged : function(obj)
		{
			for (var guid in this.runnedPluginsMap)
			{
				var runObject = this.runnedPluginsMap[guid];
				runObject.startData.setAttribute("type", "onThemeChanged");
				runObject.startData.setAttribute("theme", obj);
				this.correctData(runObject.startData);

				var _iframe = document.getElementById(runObject.frameId);
				if (_iframe)
				{
					runObject.startData.setAttribute("guid", guid);
					_iframe.contentWindow.postMessage(runObject.startData.serialize(), "*");
				}
			}
		},

		onPluginMethodReturn : function(guid, _return)
		{
			var plugin = this.getPluginByGuid(guid);
			var runObject = this.runnedPluginsMap[guid];

			if (!plugin || !runObject)
				return;

			var pluginData = new CPluginData();
			pluginData.setAttribute("guid", plugin.guid);
			pluginData.setAttribute("type", "onMethodReturn");
			pluginData.setAttribute("methodReturnData", _return);

			this.sendMessageToFrame(plugin.isConnector ? "" : runObject.frameId, pluginData);
		},

		setPluginMethodReturnAsync : function()
		{
			if (this.runnedPluginsMap[this.guidAsyncMethod])
				this.runnedPluginsMap[this.guidAsyncMethod].methodReturnAsync = true;
			return this.guidAsyncMethod;
		},

		/* sign methods */
		getSign : function()
		{
			let _count = this.plugins.length;
			for (let i = 0; i < _count; i++)
			{
				var _variation = this.plugins[i].variations[0];
				if (_variation)
				{
					if ("sign" === _variation.initDataType)
						return this.plugins[i];
				}
			}

			return null;
		},

        /* encryption methods ------------- */
        getEncryption : function()
        {
            var _count = this.plugins.length;
            var i = 0;
            for (i = 0; i < _count; i++)
            {
                var _variation = this.plugins[i].variations[0];
                if (_variation)
                {
                    if ("desktop" == _variation.initDataType && "encryption" == _variation.initData)
                        return this.plugins[i];
                }
            }

            _count = this.systemPlugins.length;
            for (i = 0; i < _count; i++)
            {
                var _variation = this.systemPlugins[i].variations[0];
                if (_variation)
                {
                    if ("desktop" == _variation.initDataType && "encryption" == _variation.initData)
                        return this.systemPlugins[i];
                }
            }

            return null;
        },
        isRunnedEncryption : function()
        {
            var _plugin = this.getEncryption();
            if (!_plugin)
            	return false;
            return this.isRunned(_plugin.guid);
        },
        sendToEncryption : function(data)
        {
            var _plugin = this.getEncryption();
            if (!_plugin)
            	return;
            this.init(_plugin.guid, data);
        },
        checkCryptoReporter : function()
        {
            this.sendEncryptionDataCounter++;
            if (2 <= this.sendEncryptionDataCounter)
            {
                this.sendToEncryption({
                    "type" : "setPassword",
                    "password" : this.api.currentPassword,
                    "hash" : this.api.currentDocumentHash,
                    "docinfo" : this.api.currentDocumentInfo
                });
            }
        },

		externalConnectorMessage : function(data)
		{
			switch (data["type"])
			{
				case "register":
				{
					var config = {
						"name" : "connector",
						"guid" : data["guid"],
						"baseUrl" : "",
						"isConnector" : true,

						"variations" : [
							{
								"isViewer"            : true,
								"EditorsSupport"      : ["word", "cell", "slide"],
								"isSystem"            : true,
								"buttons"             : []
							}
						]
					};

					this.unregister(data["guid"]);
					this.loadExtensionPlugins([config], false, true);
					break;
				}
				case "unregister":
				{
					this.unregister(data["guid"]);
					break;
				}
				case "attachEvent":
				{
					var plugin = this.getPluginByGuid(data["guid"]);
					if (plugin && plugin.variations && plugin.variations[0])
					{
						plugin.variations[0].eventsMap[data["name"]] = true;
					}
					break;
				}
				case "detachEvent":
				{
					var plugin = this.getPluginByGuid(data["guid"]);
					if (plugin && plugin.variations && plugin.variations[0])
					{
						if (plugin.variations[0].eventsMap[data["name"]])
							delete plugin.variations[0].eventsMap[data["name"]];
					}
					break;
				}
				case "command":
				{
					onMessage(data, undefined, true);
					break;
				}
				case "method":
				{
					onMessage(data, undefined, true);
					break;
				}
				default:
					break;
			}
		},

		checkOrigin : function(guid, event)
		{
			let windowOrigin = window.origin;
			if (undefined === windowOrigin)
				windowOrigin = window.location.origin;

			if (event.origin === windowOrigin)
				return true;

			// allow chrome extensions
			if (0 === event.origin.indexOf("chrome-extension://"))
				return true;

			// external plugins
			var plugin = this.getPluginByGuid(guid);
			if (plugin && 0 === plugin.baseUrl.indexOf(event.origin))
				return true;

			return false;
		},
        /* -------------------------------- */

		sendMessageToFrame : function(frameId, pluginData)
		{
			if ("" === frameId)
			{
				window.postMessage("{\"type\":\"onExternalPluginMessageCallback\",\"data\":" + pluginData.serialize() + "}", "*");
				return;
			}
			var _iframe = document.getElementById(frameId);
			if (_iframe)
				_iframe.contentWindow.postMessage(pluginData.serialize(), "*");
		}
	};

	// export
	CPluginsManager.prototype["buttonClick"] = CPluginsManager.prototype.buttonClick;

	function checkReturnCommand(obj, recursionDepth)
	{
		let depth = (recursionDepth === undefined) ? 0 : recursionDepth;
		if (depth > 10)
			return false;

		switch (typeof obj)
		{
			case "undefined":
			case "boolean":
			case "number":
			case "string":
			case "symbol":
			case "bigint":
				return true;
			case "object":
			{
				if (!obj)
					return true;

				if (Array.isArray(obj))
				{
					for (let i = 0, len = obj.length; i < len; i++)
					{
						if (!checkReturnCommand(obj[i], depth + 1))
							return false;
					}

					return true;
				}

				if (Object.getPrototypeOf)
				{
					let prot = Object.getPrototypeOf(obj);
					if (prot && prot.__proto__ && prot.__proto__.constructor && prot.__proto__.constructor.name)
					{
						if (prot.__proto__.constructor.name === "TypedArray")
							return true;
					}
				}

				for (let prop in obj)
				{
					if (obj.hasOwnProperty(prop))
					{
						if (!checkReturnCommand(obj[prop], depth + 1))
							return false;
					}
				}

				return true;
			}
			default:
				break;
		}

		return false;
	}

	function onMessage(event, channel, isObj)
	{
		if (!window.g_asc_plugins)
			return;

		if (!isObj && typeof(event.data) != "string")
			return;

		var pluginData = new CPluginData();

		if (true === isObj)
			pluginData.wrap(event);
		else
			pluginData.deserialize(event.data);

		var guid = pluginData.getAttribute("guid");
		var runObject = window.g_asc_plugins.runnedPluginsMap[guid];

		if (!runObject)
			return;

		// check origin
		if (!isObj && !window.g_asc_plugins.checkOrigin(guid, event))
			return;

		var name  = pluginData.getAttribute("type");
		var value = pluginData.getAttribute("data");

		if ("initialize_internal" == name)
		{
			if (pluginData.getAttribute("windowID"))
			{
				var _iframe = document.getElementById(pluginData.getAttribute("windowID"));
				if (_iframe && runObject.startData)
				{
					runObject.startData.setAttribute("data", "");
					runObject.startData.setAttribute("type", "init");
					_iframe.contentWindow.postMessage(runObject.startData.serialize(), "*");
				}
				return;
			}
			window.g_asc_plugins.init(guid);

			runObject.isInitReceive = true;

			setTimeout(function() {
				if (runObject.waitEvents)
				{
					for (var i = 0; i < runObject.waitEvents.length; i++)
					{
						var pluginData = new CPluginData();
						pluginData.setAttribute("guid", guid);
						pluginData.setAttribute("type", "onEvent");
						pluginData.setAttribute("eventName", runObject.waitEvents[i].n);
						pluginData.setAttribute("eventData", runObject.waitEvents[i].d);
						var _iframe = document.getElementById(runObject.frameId);
						if (_iframe)
							_iframe.contentWindow.postMessage(pluginData.serialize(), "*");
					}
					runObject.waitEvents = null;
				}
			}, 100);
		}
		else if ("initialize" == name)
		{
			let iframeID = runObject.frameId;
			if (pluginData.getAttribute("windowID"))
				iframeID = pluginData.getAttribute("windowID");

			var pluginData = new CPluginData();
			pluginData.setAttribute("guid", guid);
			pluginData.setAttribute("type", "plugin_init");
			pluginData.setAttribute("data", /*<code>*/"(function(a,l){var f=[1,1.25,1.5,1.75,2,2.5,3,3.5,4,4.5,5];a.AscDesktopEditor&&a.AscDesktopEditor.GetSupportedScaleValues&&(f=a.AscDesktopEditor.GetSupportedScaleValues());var k=function(){if(0===f.length)return!1;var c=navigator.userAgent.toLowerCase(),e=-1<c.indexOf(\"android\");c=!(-1<c.indexOf(\"msie\")||-1<c.indexOf(\"trident\")||-1<c.indexOf(\"edge\"))&&-1<c.indexOf(\"chrome\");var d=!!a.opera,m=/android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\\/|plucker|pocket|psp|symbian|treo|up\\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent||navigator.vendor||a.opera);return!e&&c&&!d&&!m&&document&&document.firstElementChild&&document.body?!0:!1}();a.AscCommon=a.AscCommon||{};a.AscCommon.checkDeviceScale=function(){var c={zoom:1,devicePixelRatio:a.devicePixelRatio,applicationPixelRatio:a.devicePixelRatio,correct:!1};if(!k)return c;for(var e=a.devicePixelRatio,d=0,m=Math.abs(f[0]-e),h,g=1,p=f.length;g<p&&!(1E-4<Math.abs(f[g]-e)&&f[g]>e-1E-4);g++)h=Math.abs(f[g]-e),h<m-1E-4&&(m=h,d=g);c.applicationPixelRatio=f[d];.01<Math.abs(c.devicePixelRatio-c.applicationPixelRatio)&&(c.zoom=c.devicePixelRatio/c.applicationPixelRatio,c.correct=!0);return c};var b=1;a.AscCommon.correctApplicationScale=function(c){!c.correct&&1E-4>Math.abs(c.zoom-b)||(b=c.zoom,document.firstElementChild.style.zoom=.001>Math.abs(b-1)?\"normal\":1/b)}})(window);(function(a,l){function f(b){this.plugin=b;this.ps;this.items=[];this.isCurrentVisible=this.isVisible=!1}function k(){this.id=a.Asc.generateGuid();this.id=this.id.replace(/-/g,\"\");this._events={};this._register()}f.prototype.createWindow=function(){var b=document.body,c=document.getElementsByTagName(\"head\")[0];b&&c&&(b=document.createElement(\"style\"),b.type=\"text/css\",b.innerHTML='.ih_main { margin: 0px; padding: 0px; width: 100%; height: 100%; display: inline-block; overflow: hidden; box-sizing: border-box; user-select: none; position: fixed; border: 1px solid #cfcfcf; } ul { margin: 0px; padding: 0px; width: 100%; height: 100%; list-style-type: none; outline:none; } li { padding: 5px; font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; color: #373737; } li:hover { background-color: #D8DADC; } .li_selected { background-color: #D8DADC; color: #373737; }.li_selected:hover { background-color: #D8DADC; color: #373737; }',c.appendChild(b),document.body.style.background=\"#FFFFFF\",document.body.style.width=\"100%\",document.body.style.height=\"100%\",document.body.style.margin=\"0\",document.body.style.padding=\"0\",document.body.innerHTML='<div class=\"ih_main\" id=\"ih_area\"><ul id=\"ih_elements_id\" role=\"listbox\"></ul></div>',this.ps=new PerfectScrollbar(document.getElementById(\"ih_area\"),{minScrollbarLength:20}),this.updateScrolls(),this.createDefaultEvents())};f.prototype.setItems=function(b){this.items=b;for(var c=\"\",e=b.length,d=0;d<e;d++)l===b[d].id&&(b[d].id=\"\"+d),c+='<li role=\"option\"',0==d&&(c+=' class=\"li_selected\"'),c+=' id=\"'+b[d].id+'\"',c+=' onclick=\"_private_on_ih_click(event)\">',c+=b[d].text,c+=\"</li>\";document.getElementById(\"ih_elements_id\").innerHTML=c;this.updateScrolls();this.scrollToSelected()};f.prototype.createDefaultEvents=function(){this.plugin.onExternalMouseUp=function(){var c=document.createEvent(\"MouseEvents\");c.initMouseEvent(\"mouseup\",!0,!0,a,1,0,0,0,0,!1,!1,!1,!1,0,null);document.dispatchEvent(c)};var b=this;a.onkeydown=function(c){switch(c.keyCode){case 27:b.isVisible&&(b.isVisible=!1,b.plugin.executeMethod(\"UnShowInputHelper\",[b.plugin.info.guid,!0]));break;case 38:case 40:case 9:case 36:case 35:case 33:case 34:for(var e=document.getElementsByTagName(\"li\"),d=-1,m=0;m<e.length;m++)if(\"li_selected\"==e[m].className){d=m;e[m].className=\"\";break}if(-1==d)d=0;else switch(c.keyCode){case 38:d--;0>d&&(d=0);break;case 40:d++;d>=e.length&&(d=e.length-1);break;case 9:d++;d>=e.length&&(d=0);break;case 36:d=0;break;case 35:d=e.length-1;break;case 33:case 34:m=1;var h=document.getElementById(\"ih_area\").clientHeight/24>>0;1<h&&(m=h);33==c.keyCode?(d-=m,0>d&&(d=0)):(d+=m,d>=e.length&&(d=d=e.length-1))}d<e.length&&(e[d].className=\"li_selected\",m=e[d].offsetTop,e=e[d].offsetHeight,d=document.getElementById(\"ih_area\"),h=d.scrollTop,m<h?d.scrollTo?d.scrollTo(0,m):d.scrollTop=m:h+d.offsetHeight<m+e&&(d.scrollTo?d.scrollTo(0,m-(d.offsetHeight-e)):d.scrollTop=m-(d.offsetHeight-e)));break;case 13:b.onSelectedItem()}c.preventDefault&&c.preventDefault();c.stopPropagation&&c.stopPropagation();return!1};a.onresize=function(c){b.updateScrolls()};a._private_on_ih_click=function(c){for(var e=document.getElementsByTagName(\"li\"),d=0;d<e.length;d++)e[d].className=\"\";c.target.className=\"li_selected\";c.target.getAttribute(\"id\");b.onSelectedItem()};this.plugin.event_onKeyDown=function(c){a.onkeydown({keyCode:c.keyCode})}};f.prototype.updateScrolls=function(){this.ps.update();this.ps.update();var b=document.getElementsByClassName(\"ps__rail-y\")[0],c=document.getElementsByClassName(\"ps__rail-x\")[0];if(c&&b){var e=a.getComputedStyle(b),d=a.getComputedStyle(c);e=e&&\"none\"==e.display?!1:!0;d&&\"none\"==d.display||!e?(\"2px\"!=b.style.marginBottom&&(b.style.marginBottom=\"2px\"),\"2px\"!=c.style.marginRight&&(c.style.marginRight=\"2px\")):(\"13px\"!=b.style.marginBottom&&(b.style.marginBottom=\"13px\"),\"13px\"!=c.style.marginRight&&(c.style.marginRight=\"13px\"))}};f.prototype.scrollToSelected=function(){for(var b=document.getElementsByTagName(\"li\"),c=0;c<b.length;c++)if(\"li_selected\"==b[c].className){var e=document.getElementById(\"ih_area\");e.scrollTo?e.scrollTo(0,b[c].offsetTop):e.scrollTop=b[c].offsetTop;break}};f.prototype.getSelectedItem=function(){for(var b=document.getElementsByTagName(\"li\"),c=-1,e=0;e<b.length;e++)if(\"li_selected\"==b[e].className){c=b[e].getAttribute(\"id\");break}if(-1==c)return null;b=this.items.length;for(e=0;e<b;e++)if(c==this.items[e].id)return this.items[e];return null};f.prototype.onSelectedItem=function(){this.plugin.inputHelper_onSelectItem&&this.plugin.inputHelper_onSelectItem(this.getSelectedItem())};f.prototype.show=function(b,c,e){this.isCurrentVisible=!0;this.plugin.executeMethod(\"ShowInputHelper\",[this.plugin.info.guid,b,c,e],function(){a.Asc.plugin.ih.isVisible=!0})};f.prototype.unShow=function(){if(this.isCurrentVisible||this.isVisible)this.isCurrentVisible=!1,a.Asc.plugin.executeMethod(\"UnShowInputHelper\",[this.plugin.info.guid],function(){a.Asc.plugin.ih.isVisible=!1})};f.prototype.getItemHeight=function(){var b=24,c=document.getElementsByTagName(\"li\");0<c.length&&0<c[0].offsetHeight&&(b=c[0].offsetHeight);return b};f.prototype.getItemsHeight=function(b){return 2+b*this.getItemHeight()};f.prototype.getItems=function(){return this.items};f.prototype.getScrollSizes=function(){var b={w:0,h:0},c=this.getItemHeight(),e=document.getElementById(\"ih_elements_id\");e&&(b.w=e.scrollWidth,b.h=2+this.items.length*c);return b};k.prototype._register=function(){var b=a.Asc.plugin;b._windows||(b._windows={});b._windows[this.id]=this};k.prototype._unregister=function(){var b=a.Asc.plugin;b._windows&&b._windows[this.id]&&delete b._windows[this.id]};k.prototype.show=function(b){var c=b.url;c=-1===c.indexOf(\".html?\")?c+\"?windowID=\":c+\"&windowID=\";b.url=c+this.id;a.Asc.plugin.executeMethod(\"ShowWindow\",[this.id,b])};k.prototype.close=function(){a.Asc.plugin.executeMethod(\"CloseWindow\",[this.id]);this._unregister()};k.prototype.command=function(b,c){a.Asc.plugin.executeMethod(\"SendToWindow\",[this.id,b,c])};k.prototype.attachEvent=function(b,c){this._events[b]=c};k.prototype.detachEvent=function(b){this._events&&this._events[b]&&delete this._events[b]};k.prototype._oncommand=function(b,c){this._events&&this._events[b]&&this._events[b].call(a.Asc.plugin,c)};a.Asc=a.Asc||{};a.Asc.generateGuid=function(){if(a.crypto&&a.crypto.getRandomValues){var b=new Uint16Array(8);a.crypto.getRandomValues(b);var c=0;function d(){return(65536+b[c++]).toString(16).substring(1)}return d()+d()+\"-\"+d()+\"-\"+d()+\"-\"+d()+\"-\"+d()+d()+d()}function e(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return e()+e()+\"-\"+e()+\"-\"+e()+\"-\"+e()+\"-\"+e()+e()+e()};a.Asc.inputHelper=f;a.Asc.PluginWindow=k})(window,void 0);(function(a,l){function f(k){var b=k.metaKey||k.ctrlKey?!0:!1;if(116==k.keyCode)return a.parent.postMessage(JSON.stringify({type:\"reload\",guid:a.Asc.plugin.guid,ctrl:b}),\"*\"),k.preventDefault&&k.preventDefault(),k.stopPropagation&&k.stopPropagation(),!1}a.addEventListener?a.addEventListener(\"keydown\",f,!1):a.attachEvent(\"keydown\",f)})(window,void 0);(function(a,l){function f(h){var g=new XMLHttpRequest;g.open(\"GET\",\"./translations/\"+h+\".json\");g.onreadystatechange=function(){if(4==g.readyState){if(200==g.status||0==location.href.indexOf(\"file:\"))try{k(JSON.parse(g.responseText))}catch(p){k()}404==g.status&&k()}};g.send()}function k(h){a.Asc.plugin.translateManager=h||{};if(a.Asc.plugin.onTranslate)a.Asc.plugin.onTranslate()}function b(){if(!a.Asc.plugin.isStarted){a.Asc.plugin.isStarted=!0;a.startPluginApi();var h=AscCommon.checkDeviceScale();AscCommon.retinaPixelRatio=h.applicationPixelRatio;AscCommon.zoom=h.zoom;AscCommon.correctApplicationScale(h);a.Asc.plugin.onEnableMouseEvent=function(g){var p=document.getElementsByTagName(\"iframe\");p&&p[0]&&(p[0].style.pointerEvents=g?\"none\":\"\")}}}var c={body:{color:\"text-normal\",\"background-color\":\"background-toolbar\"},\".defaultlable\":{color:\"text-normal\"},\".aboutlable\":{color:\"text-normal\"},\"a.aboutlink\":{color:\"text-normal\"},\".form-control, .form-control[readonly], .form-control[disabled]\":{color:\"text-normal\",\"background-color\":\"background-normal\",\"border-color\":\"border-regular-control\"},\".form-control:focus\":{\"border-color\":\"border-control-focus\"},\".form-control[disabled]\":{color:\"text-invers\"},\".btn-text-default\":{\"background-color\":\"background-normal\",\"border-color\":\"border-regular-control\",color:\"text-normal\"},\".btn-text-default:hover\":{\"background-color\":\"highlight-button-hover\"},\".btn-text-default.active,\\t\\t.btn-text-default:active\":{\"background-color\":\"highlight-button-pressed !important\",color:\"text-normal-pressed\"},\".btn-text-default[disabled]:hover,\\t\\t.btn-text-default.disabled:hover,\\t\\t.btn-text-default[disabled]:active,\\t\\t.btn-text-default[disabled].active,\\t\\t.btn-text-default.disabled:active,\\t\\t.btn-text-default.disabled.active\":{\"background-color\":\"background-normal !important\",color:\"text-normal\"},\".select2-container--default .select2-selection--single\":{color:\"text-normal\",\"background-color\":\"background-normal\"},\".select2-container--default .select2-selection--single .select2-selection__rendered\":{color:\"text-normal\"},\".select2-results\":{\"background-color\":\"background-normal\"},\".select2-container--default .select2-results__option--highlighted[aria-selected]\":{\"background-color\":\"highlight-button-hover !important\"},\".select2-container--default .select2-results__option[aria-selected=true]\":{\"background-color\":\"highlight-button-pressed !important\"},\".select2-dropdown, .select2-container--default .select2-selection--single\":{\"border-color\":\"border-regular-control !important\"},\".select2-container--default.select2-container--open .select2-selection--single\":{\"border-color\":\"border-control-focus !important\"},\".select2-container--default.select2-container--focus:not(.select2-container--open) .select2-selection--single\":{\"border-color\":\"border-regular-control !important\"},\".select2-container--default.select2-container--open.select2-container--focus .select2-selection--single\":{\"border-color\":\"border-control-focus !important\"},\".select2-search--dropdown\":{\"background-color\":\"background-normal !important\"},\".select2-container--default .select2-search--dropdown .select2-search__field\":{color:\"text-normal\",\"background-color\":\"background-normal\",\"border-color\":\"border-regular-control\"},\".select2-container--default.select2-container--disabled .select2-selection--single\":{\"background-color\":\"background-normal\"},\".select2-container--default .select2-selection--single .select2-selection__arrow b\":{\"border-color\":\"text-normal !important\"},\".select2-container--default.select2-container--open .select2-selection__arrow b\":{\"border-color\":\"text-normal !important\"},\".ps .ps__rail-y:hover\":{\"background-color\":\"background-toolbar\"},\".ps .ps__rail-y.ps--clicking\":{\"background-color\":\"background-toolbar\"},\".ps__thumb-y\":{\"background-color\":\"background-normal\",\"border-color\":\"Border !important\"},\".ps__rail-y:hover > .ps__thumb-y\":{\"border-color\":\"canvas-scroll-thumb-hover\",\"background-color\":\"canvas-scroll-thumb-hover !important\"},\".ps .ps__rail-x:hover\":{\"background-color\":\"background-toolbar\"},\".ps .ps__rail-x.ps--clicking\":{\"background-color\":\"background-toolbar\"},\".ps__thumb-x\":{\"background-color\":\"background-normal\",\"border-color\":\"Border !important\"},\".ps__rail-x:hover > .ps__thumb-x\":{\"border-color\":\"canvas-scroll-thumb-hover\"},a:{color:\"text-link !important\"},\"a:hover\":{color:\"text-link-hover !important\"},\"a:active\":{color:\"text-link-active !important\"},\"a:visited\":{color:\"text-link-visited !important\"},\"*::-webkit-scrollbar-track\":{background:\"background-normal\"},\"*::-webkit-scrollbar-track:hover\":{background:\"background-toolbar-additional\"},\"*::-webkit-scrollbar-thumb\":{\"background-color\":\"background-toolbar\",\"border-color\":\"border-regular-control\"},\"*::-webkit-scrollbar-thumb:hover\":{\"background-color\":\"canvas-scroll-thumb-hover\"},\".asc-plugin-loader\":{color:\"text-normal\"}},e=!1,d=\"\";a.plugin_sendMessage=function(h){a.Asc.plugin.ie_channel?a.Asc.plugin.ie_channel.postMessage(h):a.parent.postMessage(h,\"*\")};a.plugin_onMessage=function(h){if(a.Asc.plugin&&\"string\"==typeof h.data){var g={};try{g=JSON.parse(h.data)}catch(n){g={}}h=g.type;if(g.guid!=a.Asc.plugin.guid){if(l!==g.guid)return;switch(h){case \"onExternalPluginMessage\":break;default:return}}\"init\"==h&&(a.Asc.plugin.info=g);if(l!==g.theme&&(!a.Asc.plugin.theme||\"onThemeChanged\"===h))if(a.Asc.plugin.theme=g.theme,a.Asc.plugin.onThemeChangedBase||(a.Asc.plugin.onThemeChangedBase=function(n){var q=\"\",t;for(t in c){q+=t+\" {\";var w=c[t],r;for(r in w){var u=w[r],x=u.indexOf(\" !important\");-1<x&&(u=u.substr(0,x));(u=n[u])&&(q+=r+\" : \"+u+(-1===x?\";\":\" !important;\"))}q+=\" }\\n\"}n=document.createElement(\"style\");n.type=\"text/css\";n.innerHTML=q;document.getElementsByTagName(\"head\")[0].appendChild(n)}),a.Asc.plugin.onThemeChanged)a.Asc.plugin.onThemeChanged(a.Asc.plugin.theme);else a.Asc.plugin.onThemeChangedBase(a.Asc.plugin.theme);a.Asc.plugin.tr&&a.Asc.plugin.tr_init||(a.Asc.plugin.tr_init=!0,a.Asc.plugin.tr=function(n){return a.Asc.plugin.translateManager&&a.Asc.plugin.translateManager[n]?a.Asc.plugin.translateManager[n]:n});var p=\"\";a.Asc.plugin.info&&(p=a.Asc.plugin.info.lang);if(\"\"==p||p!=d)if(d=p,\"en-EN\"==d||\"\"==d)k();else{var v=new XMLHttpRequest;v.open(\"GET\",\"./translations/langs.json\");v.onreadystatechange=function(){if(4==v.readyState)if(200==v.status||0==location.href.indexOf(\"file:\"))try{for(var n=JSON.parse(v.responseText),q,t,w=0;w<n.length;w++){var r=n[w];if(r==d){q=r;break}else r.split(\"-\")[0]==d.split(\"-\")[0]&&(t=r)}q||t?f(q||t):k()}catch(u){f(d)}else 404==v.status?f(d):k()};v.send()}switch(h){case \"init\":b();a.Asc.plugin.init(a.Asc.plugin.info.data);break;case \"button\":h=parseInt(g.button);isNaN(h)&&(h=g.button);a.Asc.plugin.button||-1!==h||l!==g.buttonWindowId?a.Asc.plugin.button(h,g.buttonWindowId):a.Asc.plugin.executeCommand(\"close\",\"\");break;case \"enableMouseEvent\":e=g.isEnabled;if(a.Asc.plugin.onEnableMouseEvent)a.Asc.plugin.onEnableMouseEvent(e);break;case \"onExternalMouseUp\":if(a.Asc.plugin.onExternalMouseUp)a.Asc.plugin.onExternalMouseUp();break;case \"onMethodReturn\":a.Asc.plugin.isWaitMethod=!1;if(a.Asc.plugin.methodCallback)h=a.Asc.plugin.methodCallback,a.Asc.plugin.methodCallback=null,h(g.methodReturnData),h=null;else if(a.Asc.plugin.onMethodReturn)a.Asc.plugin.onMethodReturn(g.methodReturnData);a.Asc.plugin.executeMethodStack&&0<a.Asc.plugin.executeMethodStack.length&&(g=a.Asc.plugin.executeMethodStack.shift(),a.Asc.plugin.executeMethod(g.name,g.params,g.callback));break;case \"onCommandCallback\":if(a.Asc.plugin.onCallCommandCallback)a.Asc.plugin.onCallCommandCallback(g.commandReturnData),a.Asc.plugin.onCallCommandCallback=null;else if(a.Asc.plugin.onCommandCallback)a.Asc.plugin.onCommandCallback(g.commandReturnData);break;case \"onExternalPluginMessage\":if(a.Asc.plugin.onExternalPluginMessage&&g.data&&g.data.type)a.Asc.plugin.onExternalPluginMessage(g.data);break;case \"onEvent\":if(a.Asc.plugin[\"event_\"+g.eventName])a.Asc.plugin[\"event_\"+g.eventName](g.eventData);else if(a.Asc.plugin.onEvent)a.Asc.plugin.onEvent(g.eventName,g.eventData);break;case \"onWindowEvent\":a.Asc.plugin._windows&&g.windowID&&a.Asc.plugin._windows[g.windowID]&&a.Asc.plugin._windows[g.windowID]._oncommand(g.eventName,g.eventData)}}};a.onmousemove=function(h){e&&a.Asc.plugin&&a.Asc.plugin.executeCommand&&a.Asc.plugin.executeCommand(\"onmousemove\",JSON.stringify({x:l===h.clientX?h.pageX:h.clientX,y:l===h.clientY?h.pageY:h.clientY}))};a.onmouseup=function(h){e&&a.Asc.plugin&&a.Asc.plugin.executeCommand&&a.Asc.plugin.executeCommand(\"onmouseup\",JSON.stringify({x:l===h.clientX?h.pageX:h.clientX,y:l===h.clientY?h.pageY:h.clientY}))};var m={guid:a.Asc.plugin.guid,type:\"initialize_internal\"};a.Asc.plugin.windowID&&(m.windowID=a.Asc.plugin.windowID);a.plugin_sendMessage(JSON.stringify(m))})(window,void 0);window.startPluginApi=function(){var a=window.Asc.plugin;a._checkPluginOnWindow=function(l){return this.windowID&&!l?(console.log(\"This method does not allow in window frame\"),!0):this.windowID||!0!==l?!1:(console.log(\"This method is allow only in window frame\"),!0)};a.executeCommand=function(l,f,k){if(!this._checkPluginOnWindow()||0===l.indexOf(\"onmouse\")){window.Asc.plugin.info.type=l;window.Asc.plugin.info.data=f;l=\"\";try{l=JSON.stringify(window.Asc.plugin.info)}catch(b){l=JSON.stringify({type:f})}window.Asc.plugin.onCallCommandCallback=k;window.plugin_sendMessage(l)}};a.executeMethod=function(l,f,k){if(!this._checkPluginOnWindow()){if(!0===window.Asc.plugin.isWaitMethod)return void 0===this.executeMethodStack&&(this.executeMethodStack=[]),this.executeMethodStack.push({name:l,params:f,callback:k}),!1;window.Asc.plugin.isWaitMethod=!0;window.Asc.plugin.methodCallback=k;window.Asc.plugin.info.type=\"method\";window.Asc.plugin.info.methodName=l;window.Asc.plugin.info.data=f;l=\"\";try{l=JSON.stringify(window.Asc.plugin.info)}catch(b){return!1}window.plugin_sendMessage(l);return!0}};a.resizeWindow=function(l,f,k,b,c,e){if(!this._checkPluginOnWindow()){void 0===k&&(k=0);void 0===b&&(b=0);void 0===c&&(c=0);void 0===e&&(e=0);l=JSON.stringify({width:l,height:f,minw:k,minh:b,maxw:c,maxh:e});window.Asc.plugin.info.type=\"resize\";window.Asc.plugin.info.data=l;f=\"\";try{f=JSON.stringify(window.Asc.plugin.info)}catch(d){f=JSON.stringify({type:l})}window.plugin_sendMessage(f)}};a.callCommand=function(l,f,k,b){this._checkPluginOnWindow()||(l=\"var Asc = {}; Asc.scope = \"+JSON.stringify(window.Asc.scope)+\"; var scope = Asc.scope; (\"+l.toString()+\")();\",window.Asc.plugin.info.recalculate=!1===k?!1:!0,window.Asc.plugin.executeCommand(!0===f?\"close\":\"command\",l,b))};a.callModule=function(l,f,k){if(!this._checkPluginOnWindow()){var b=new XMLHttpRequest;b.open(\"GET\",l);b.onreadystatechange=function(){if(4==b.readyState&&(200==b.status||0==location.href.indexOf(\"file:\"))){var c=!0===k?\"close\":\"command\";window.Asc.plugin.info.recalculate=!0;window.Asc.plugin.executeCommand(c,b.responseText);f&&f(b.responseText)}};b.send()}};a.loadModule=function(l,f){if(!this._checkPluginOnWindow()){var k=new XMLHttpRequest;k.open(\"GET\",l);k.onreadystatechange=function(){4!=k.readyState||200!=k.status&&0!=location.href.indexOf(\"file:\")||f&&f(k.responseText)};k.send()}};a.createInputHelper=function(){this._checkPluginOnWindow()||(window.Asc.plugin.ih=new window.Asc.inputHelper(window.Asc.plugin))};a.getInputHelper=function(){if(!this._checkPluginOnWindow())return window.Asc.plugin.ih};a.sendToPlugin=function(l,f){if(!this._checkPluginOnWindow(!0)){window.Asc.plugin.info.type=\"messageToPlugin\";window.Asc.plugin.info.eventName=l;window.Asc.plugin.info.data=f;window.Asc.plugin.info.windowID=this.windowID;l=\"\";try{l=JSON.stringify(window.Asc.plugin.info)}catch(k){return!1}window.plugin_sendMessage(l);return!0}}};"/*</code>*/);
			var _iframe = document.getElementById(iframeID);
			if (_iframe)
			{
				if (channel)
					_iframe.contentWindow.postMessage(pluginData.serialize(), "*", [channel["port2"]]);
				else
					_iframe.contentWindow.postMessage(pluginData.serialize(), "*");
			}
			return;
		}
		else if ("reload" == name)
		{
			if (true === pluginData.getAttribute("ctrl"))
			{				
				if (AscCommon.c_oEditorId.Presentation === window.g_asc_plugins.api.getEditorId())
				{
					window.g_asc_plugins.api.sendEvent("asc_onStartDemonstration");
				}
			}
			return;
		}
		else if ("close" == name || "command" == name)
		{
			if (runObject.closeAttackTimer != -1)
			{
				clearTimeout(runObject.closeAttackTimer);
				runObject.closeAttackTimer = -1;
			}

			if (value && value != "")
			{
				var _command_callback_send = ("command" == name);
				var commandReturn = undefined;
				try
				{
					if ( !AscCommon.isValidJs(value) )
					{
						console.error('Invalid JS.');
						return;
					}

					if (pluginData.getAttribute("interface"))
					{
						try
						{
							AscCommon.safePluginEval(value);
						}
						catch (err)
						{
							console.error(err);
						}
					}
					else if (!window.g_asc_plugins.api.isLongAction() && (pluginData.getAttribute("resize") || window.g_asc_plugins.api.asc_canPaste()))
					{
						window.g_asc_plugins.api._beforeEvalCommand();
						AscFonts.IsCheckSymbols = true;
						try
						{
							commandReturn = AscCommon.safePluginEval(value);
						}
						catch (err)
						{
							commandReturn = undefined;
							console.error(err);
						}

						if (!checkReturnCommand(commandReturn))
							commandReturn = undefined;

						AscFonts.IsCheckSymbols = false;

						if (pluginData.getAttribute("recalculate") == true)
						{
							_command_callback_send = false;

							window.g_asc_plugins.api._afterEvalCommand(function(){
								var pluginData = new CPluginData();
								pluginData.setAttribute("guid", guid);
								pluginData.setAttribute("type", "onCommandCallback");
								pluginData.setAttribute("commandReturnData", commandReturn);

								window.g_asc_plugins.sendMessageToFrame(runObject.isConnector ? "" : runObject.frameId, pluginData);
							});
						}
						else
						{
							var editorId = window.g_asc_plugins.api.getEditorId();
							if (AscCommon.c_oEditorId.Spreadsheet === editorId)
							{
								// На asc_canPaste создается точка в истории и startTransaction. Поэтому нужно ее закрыть без пересчета.
								window.g_asc_plugins.api.asc_endPaste();
							}
							else if (AscCommon.c_oEditorId.Word === editorId ||
								AscCommon.c_oEditorId.Presentation === editorId)
							{
								window.g_asc_plugins.api.WordControl.m_oLogicDocument.FinalizeAction();
							}
						}
					}
				} catch (err)
				{
				}

				if (_command_callback_send)
				{
					var pluginData = new CPluginData();
					pluginData.setAttribute("guid", guid);
					pluginData.setAttribute("type", "onCommandCallback");
					pluginData.setAttribute("commandReturnData", commandReturn);

					window.g_asc_plugins.sendMessageToFrame(runObject.isConnector ? "" : runObject.frameId, pluginData);
				}
			}

			if ("close" == name)
			{
				window.g_asc_plugins.close(guid);
			}
		}
		else if ("resize" == name)
		{
			var _sizes = JSON.parse(value);

			window.g_asc_plugins.api.sendEvent("asc_onPluginResize",
				[_sizes["width"], _sizes["height"]],
				[_sizes["minw"], _sizes["minh"]],
				[_sizes["maxw"], _sizes["maxh"]], function() {
				// TODO: send resize end event
			});
		}
		else if ("onmousemove" == name)
		{
			var _pos = JSON.parse(value);
			window.g_asc_plugins.api.sendEvent("asc_onPluginMouseMove", _pos["x"], _pos["y"]);
		}
		else if ("onmouseup" == name)
		{
			var _pos = JSON.parse(value);
			window.g_asc_plugins.api.sendEvent("asc_onPluginMouseUp", _pos["x"], _pos["y"]);
		}
		else if ("method" == name)
		{
			var _apiMethodName = "pluginMethod_" + pluginData.getAttribute("methodName");
			var _return = undefined;

			window.g_asc_plugins.guidAsyncMethod = guid;

			if (window.g_asc_plugins.api[_apiMethodName])
				_return = window.g_asc_plugins.api[_apiMethodName].apply(window.g_asc_plugins.api, value);

			if (!runObject.methodReturnAsync)
			{
				var pluginData = new CPluginData();
				pluginData.setAttribute("guid", guid);
				pluginData.setAttribute("type", "onMethodReturn");
				pluginData.setAttribute("methodReturnData", _return);

				window.g_asc_plugins.sendMessageToFrame(runObject.isConnector ? "" : runObject.frameId, pluginData);
			}
			runObject.methodReturnAsync = false;
			window.g_asc_plugins.guidAsyncMethod = "";
			return;
		}
		else if ("messageToPlugin" == name)
		{
			var winID = pluginData.getAttribute("windowID");

			var pluginData2 = new CPluginData();
			pluginData.setAttribute("guid", guid);
			pluginData.setAttribute("type", "onWindowEvent");
			pluginData.setAttribute("windowID",  pluginData.getAttribute("windowID"));
			pluginData.setAttribute("eventName", pluginData.getAttribute("eventName"));
			pluginData.setAttribute("eventData", value);

			window.g_asc_plugins.sendMessageToFrame(runObject.isConnector ? "" : runObject.frameId, pluginData);
		}
	}

	if (window.addEventListener)
	{
		window.addEventListener("message", onMessage, false);
	}
	else if (window.attachEvent)
	{
		window.attachEvent("onmessage", onMessage);
	}

	window["Asc"]                      = window["Asc"] ? window["Asc"] : {};
	window["Asc"].createPluginsManager = function(api)
	{
		if (window.g_asc_plugins)
			return window.g_asc_plugins;

		window.g_asc_plugins        = new CPluginsManager(api);
		window["g_asc_plugins"]     = window.g_asc_plugins;
		window.g_asc_plugins.api    = api;
		window.g_asc_plugins["api"] = window.g_asc_plugins.api;

		api.asc_registerCallback('asc_onSelectionEnd', function(){
			window.g_asc_plugins.onChangedSelectionData();
		});

		window.g_asc_plugins.api.asc_registerCallback('asc_onDocumentContentReady', function()
		{
			setTimeout(function()
			{
				if (window.g_asc_plugins.api.preSetupPlugins)
				{
					window.g_asc_plugins.register(window.g_asc_plugins.api.preSetupPlugins.path, window.g_asc_plugins.api.preSetupPlugins.plugins);
					delete window.g_asc_plugins.api.preSetupPlugins;

					window.g_asc_plugins.api.checkInstalledPlugins();
				}

			}, 10);

		});

        if (window.location && window.location.search)
        {
            var _langSearch = window.location.search;
            var _pos1 = _langSearch.indexOf("lang=");
            var _pos2 = (-1 != _pos1) ? _langSearch.indexOf("&", _pos1) : -1;
            if (_pos1 >= 0)
            {
                _pos1 += 5;

                if (_pos2 < 0)
                    _pos2 = _langSearch.length;

                var _lang = _langSearch.substr(_pos1, _pos2 - _pos1);
                if (_lang.length == 2)
                {
                    _lang = (_lang.toLowerCase() + "-" + _lang.toUpperCase());
                }

                if (5 == _lang.length)
                    window.g_asc_plugins.language = _lang;
            }
        }

		if (window["AscDesktopEditor"] && window["UpdateSystemPlugins"])
			window["UpdateSystemPlugins"]();

		return window.g_asc_plugins;
	};

	window["Asc"].CPluginData      = CPluginData;
	window["Asc"].CPluginData_wrap = function(obj)
	{
		if (!obj.getAttribute)
			obj.getAttribute = function(name)
			{
				return this[name];
			};
		if (!obj.setAttribute)
			obj.setAttribute = function(name, value)
			{
				return this[name] = value;
			};
	};

    window["Asc"].loadConfigAsInterface = function(url)
	{
        if (url)
        {
            try {
                var xhrObj = new XMLHttpRequest();
                if ( xhrObj )
                {
                    xhrObj.open('GET', url, false);
                    xhrObj.send('');

                    return JSON.parse(xhrObj.responseText);
                }
            } catch (e) {}
        }
        return null;
	};

	window["Asc"].loadPluginsAsInterface = function(api)
	{
		if (window.g_asc_plugins.srcPluginsLoaded)
			return;
        window.g_asc_plugins.srcPluginsLoaded = true;

		var configs = window["Asc"].loadConfigAsInterface("../../../../plugins.json");

        if (!configs)
        	return;

        var pluginsData = configs["pluginsData"];
        if (!pluginsData || pluginsData.length < 1)
        	return;

        var arrPluginsConfigs = [];
        pluginsData.forEach(function(item) {
            var value = window["Asc"].loadConfigAsInterface(item);
            if (value) {
                value["baseUrl"] = item.substring(0, item.lastIndexOf("config.json"));
                arrPluginsConfigs.push(value);
            }
        });

        var arrPlugins = [];
        arrPluginsConfigs.forEach(function(item) {
            var plugin = new Asc.CPlugin();
            plugin["set_Name"](item["name"]);
            plugin["set_Guid"](item["guid"]);
            plugin["set_BaseUrl"](item["baseUrl"]);
            plugin["set_Loader"](item["loader"]);
            var variations = item["variations"];
        	var variationsArr = [];
            variations.forEach(function(itemVar){
                var variation = new Asc.CPluginVariation();
                variation["set_Description"](itemVar["description"]);
                variation["set_Url"](itemVar["url"]);
                variation["set_Icons"](itemVar["icons"]);
                variation["set_Visual"](itemVar["isVisual"]);
                variation["set_CustomWindow"](itemVar["'isCustomWindow"]);
                variation["set_System"](itemVar["isSystem"]);
                variation["set_Viewer"](itemVar["isViewer"]);
                variation["set_EditorsSupport"](itemVar["EditorsSupport"]);
                variation["set_Modal"](itemVar["isModal"]);
                variation["set_InsideMode"](itemVar["isInsideMode"]);
                variation["set_InitDataType"](itemVar["initDataType"]);
                variation["set_InitData"](itemVar["initData"]);
                variation["set_UpdateOleOnResize"](itemVar["isUpdateOleOnResize"]);
                variation["set_Buttons"](itemVar["buttons"]);
                variation["set_Size"](itemVar["size"]);
                variation["set_InitOnSelectionChanged"](itemVar["initOnSelectionChanged"]);
                variation["set_Events"](itemVar["events"]);
                variationsArr.push(variation);
            });
            plugin["set_Variations"](variationsArr);
            arrPlugins.push(plugin);
        });

        window.g_asc_plugins.srcPlugins = arrPluginsConfigs;
        api.asc_pluginsRegister('', arrPlugins);

        api.asc_registerCallback('asc_onPluginShow', function(plugin, variationIndex, frameId) {

        	var _t = window.g_asc_plugins;

        	var srcPlugin = null;
        	for (var i = 0; i < _t.srcPlugins.length; i++)
			{
				if (plugin.guid == _t.srcPlugins[i]["guid"])
				{
					srcPlugin = _t.srcPlugins[i];
					break;
				}
            }

        	var variation = plugin.get_Variations()[variationIndex];

            var _elem = document.createElement("div");
            _elem.id = "parent_" + frameId;
            _elem.setAttribute("style", "user-select:none;z-index:5000;position:fixed;left:10px;top:10px;right:10px;bottom:10px;box-sizing:border-box;z-index:5000;box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);border-radius: 5px;background-color: #fff;border: solid 1px #cbcbcb;");

            var _elemBody = "";
            _elemBody += "<div style=\"box-sizing:border-box;height: 34px;padding: 5px 6px 6px;left:0;right:0;top:0;border-bottom: solid 1px #cbcbcb;background: #ededed;text-align: center;vertical-align: bottom;\">";
            _elemBody += "<span style=\"color: #848484;text-align: center;font-size: 12px;font-weight:700;text-shadow: 1px 1px #f8f8f8;line-height:26px;vertical-align: bottom;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;\">";

            var lang = _t.language;
            var lang2 = _t.language.substr(0, 2);

            var _name = plugin.name;
            if (srcPlugin && srcPlugin["nameLocale"])
			{
				if (srcPlugin["nameLocale"][lang])
					_name = srcPlugin["nameLocale"][lang];
				else if (srcPlugin["nameLocale"][lang2])
                    _name = srcPlugin["nameLocale"][lang2];
			}

            _elemBody += _name;
            _elemBody += "</span></div>";

            _elemBody += "<div style=\"position:absolute;box-sizing:border-box;height:calc(100% - 86px);padding: 0;left:0;right:0;top:34px;background:#FFFFFF;\">";

            var _add = plugin.baseUrl == "" ? _t.path : plugin.baseUrl;
            _elemBody += ("<iframe name=\"" + frameId + "\" id=\"" + frameId + "\" src=\"" + (_add + variation.url) + "\" ");
            _elemBody += "style=\"position:absolute;left:0; top:0px; right: 0; bottom: 0; width:100%; height:100%; overflow: hidden;\" frameBorder=\"0\">";
            _elemBody += "</iframe>";

            _elemBody += "</div>";

            _elemBody += "<div style=\"position:absolute;box-sizing:border-box;height:52px;padding: 15px 15px 15px 15px;left:0;right:0;top:calc(100% - 52px);bottom:0;border-top: solid 1px #cbcbcb;background: #ededed;text-align: center;vertical-align: bottom;\">";

            var buttons = variation["get_Buttons"]();

            for (var i = 0; i < buttons.length; i++)
			{
            	_elemBody += ("<button id=\"plugin_button_id_" + i + "\" style=\"border-radius:1px;margin-right:10px;height:22px;font-weight:bold;background-color:#d8dadc;color:#444444;touch-action: manipulation;border: 1px solid transparent;text-align:center;vertical-align: middle;outline:none;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 12px;\">");

                _name = buttons[i]["text"];
                if (srcPlugin && srcPlugin["variations"][variationIndex]["buttons"][i]["textLocale"])
                {
                    if (srcPlugin["variations"][variationIndex]["buttons"][i]["textLocale"][lang])
                        _name = srcPlugin["variations"][variationIndex]["buttons"][i]["textLocale"][lang];
                    else if (srcPlugin["variations"][variationIndex]["buttons"][i]["textLocale"][lang2])
                        _name = srcPlugin["variations"][variationIndex]["buttons"][i]["textLocale"][lang2];
                }

            	_elemBody += _name;

            	_elemBody += "</button>";
			}

			if (0 == buttons.length)
			{
                _elemBody += ("<button id=\"plugin_button_id_0\" style=\"border-radius:1px;margin-right:10px;height:22px;font-weight:bold;background-color:#d8dadc;color:#444444;touch-action: manipulation;border: 1px solid transparent;text-align:center;vertical-align: middle;outline:none;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 12px;\">");
                _elemBody += "Ok</button>";
			}

            _elemBody += "</div>";

            _elem.innerHTML = _elemBody;

            document.body.appendChild(_elem);

            for (var i = 0; i < buttons.length; i++)
            {
            	var _button = document.getElementById("plugin_button_id_" + i);
            	if (_button)
				{
					_button.onclick = function()
					{
						var nId = this.id.substr("plugin_button_id_".length);
                        window.g_asc_plugins.api.asc_pluginButtonClick(parseInt(nId));
					}
				}
            }

            if (0 == buttons.length)
			{
                var _button = document.getElementById("plugin_button_id_0");
                if (_button)
                {
                    _button.onclick = function()
                    {
                       	window.g_asc_plugins.api.asc_pluginButtonClick(-1);
                    }
                }
			}
        });

        api.asc_registerCallback('asc_onPluginClose', function(plugin, variationIndex) {

        	var _elem = document.getElementById("parent_iframe_" + plugin.guid);
        	if (_elem)
        		document.body.removeChild(_elem);
            _elem = null;
        });
	}
})(window, undefined);
