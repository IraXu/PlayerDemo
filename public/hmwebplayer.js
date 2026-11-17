(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.hmwebplayer = factory());
})(this, (function () { 'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var eventemitter3 = createCommonjsModule(function (module) {

	var has = Object.prototype.hasOwnProperty
	  , prefix = '~';

	/**
	 * Constructor to create a storage for our `EE` objects.
	 * An `Events` instance is a plain object whose properties are event names.
	 *
	 * @constructor
	 * @private
	 */
	function Events() {}

	//
	// We try to not inherit from `Object.prototype`. In some engines creating an
	// instance in this way is faster than calling `Object.create(null)` directly.
	// If `Object.create(null)` is not supported we prefix the event names with a
	// character to make sure that the built-in object properties are not
	// overridden or used as an attack vector.
	//
	if (Object.create) {
	  Events.prototype = Object.create(null);

	  //
	  // This hack is needed because the `__proto__` property is still inherited in
	  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
	  //
	  if (!new Events().__proto__) prefix = false;
	}

	/**
	 * Representation of a single event listener.
	 *
	 * @param {Function} fn The listener function.
	 * @param {*} context The context to invoke the listener with.
	 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
	 * @constructor
	 * @private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}

	/**
	 * Add a listener for a given event.
	 *
	 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {*} context The context to invoke the listener with.
	 * @param {Boolean} once Specify if the listener is a one-time listener.
	 * @returns {EventEmitter}
	 * @private
	 */
	function addListener(emitter, event, fn, context, once) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('The listener must be a function');
	  }

	  var listener = new EE(fn, context || emitter, once)
	    , evt = prefix ? prefix + event : event;

	  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
	  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
	  else emitter._events[evt] = [emitter._events[evt], listener];

	  return emitter;
	}

	/**
	 * Clear event by name.
	 *
	 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
	 * @param {(String|Symbol)} evt The Event name.
	 * @private
	 */
	function clearEvent(emitter, evt) {
	  if (--emitter._eventsCount === 0) emitter._events = new Events();
	  else delete emitter._events[evt];
	}

	/**
	 * Minimal `EventEmitter` interface that is molded against the Node.js
	 * `EventEmitter` interface.
	 *
	 * @constructor
	 * @public
	 */
	function EventEmitter() {
	  this._events = new Events();
	  this._eventsCount = 0;
	}

	/**
	 * Return an array listing the events for which the emitter has registered
	 * listeners.
	 *
	 * @returns {Array}
	 * @public
	 */
	EventEmitter.prototype.eventNames = function eventNames() {
	  var names = []
	    , events
	    , name;

	  if (this._eventsCount === 0) return names;

	  for (name in (events = this._events)) {
	    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
	  }

	  if (Object.getOwnPropertySymbols) {
	    return names.concat(Object.getOwnPropertySymbols(events));
	  }

	  return names;
	};

	/**
	 * Return the listeners registered for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @returns {Array} The registered listeners.
	 * @public
	 */
	EventEmitter.prototype.listeners = function listeners(event) {
	  var evt = prefix ? prefix + event : event
	    , handlers = this._events[evt];

	  if (!handlers) return [];
	  if (handlers.fn) return [handlers.fn];

	  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
	    ee[i] = handlers[i].fn;
	  }

	  return ee;
	};

	/**
	 * Return the number of listeners listening to a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @returns {Number} The number of listeners.
	 * @public
	 */
	EventEmitter.prototype.listenerCount = function listenerCount(event) {
	  var evt = prefix ? prefix + event : event
	    , listeners = this._events[evt];

	  if (!listeners) return 0;
	  if (listeners.fn) return 1;
	  return listeners.length;
	};

	/**
	 * Calls each of the listeners registered for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @returns {Boolean} `true` if the event had listeners, else `false`.
	 * @public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) return false;

	  var listeners = this._events[evt]
	    , len = arguments.length
	    , args
	    , i;

	  if (listeners.fn) {
	    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }

	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }

	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;

	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
	        default:
	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments[j];
	          }

	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }

	  return true;
	};

	/**
	 * Add a listener for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {*} [context=this] The context to invoke the listener with.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  return addListener(this, event, fn, context, false);
	};

	/**
	 * Add a one-time listener for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {*} [context=this] The context to invoke the listener with.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  return addListener(this, event, fn, context, true);
	};

	/**
	 * Remove the listeners of a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn Only remove the listeners that match this function.
	 * @param {*} context Only remove the listeners that have this context.
	 * @param {Boolean} once Only remove one-time listeners.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) return this;
	  if (!fn) {
	    clearEvent(this, evt);
	    return this;
	  }

	  var listeners = this._events[evt];

	  if (listeners.fn) {
	    if (
	      listeners.fn === fn &&
	      (!once || listeners.once) &&
	      (!context || listeners.context === context)
	    ) {
	      clearEvent(this, evt);
	    }
	  } else {
	    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
	      if (
	        listeners[i].fn !== fn ||
	        (once && !listeners[i].once) ||
	        (context && listeners[i].context !== context)
	      ) {
	        events.push(listeners[i]);
	      }
	    }

	    //
	    // Reset the array, or remove it completely if we have no more listeners.
	    //
	    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
	    else clearEvent(this, evt);
	  }

	  return this;
	};

	/**
	 * Remove all listeners, or those of the specified event.
	 *
	 * @param {(String|Symbol)} [event] The event name.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  var evt;

	  if (event) {
	    evt = prefix ? prefix + event : event;
	    if (this._events[evt]) clearEvent(this, evt);
	  } else {
	    this._events = new Events();
	    this._eventsCount = 0;
	  }

	  return this;
	};

	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;

	//
	// Expose the prefix.
	//
	EventEmitter.prefixed = prefix;

	//
	// Allow `EventEmitter` to be imported as module namespace.
	//
	EventEmitter.EventEmitter = EventEmitter;

	//
	// Expose the module.
	//
	{
	  module.exports = EventEmitter;
	}
	});

	const PlayerVersion = '0.1.0';
	const FrameType = {
	  YUV: 0x1,
	  //YUV数据
	  JSVideoFrame: 0x2 //js videoFrame格式
	};
	const PixelType = {
	  YUV_I420: 0x1,
	  YUV_NV12: 0x2,
	  RGBA: 0x3,
	  DOM: 0x4
	};
	const WORKER_SEND_TYPE = {
	  init: 'init',
	  setVideoCodec: 'setVideoCodec',
	  decodeVideo: 'decodeVideo',
	  setAudioCodec: 'setAudioCodec',
	  decodeAudio: 'decodeAudio',
	  reset: 'reset',
	  startRecord: 'startRecord',
	  stopRecord: 'stopRecord',
	  switchRender: 'switchRender',
	  initWorkletMesssagePort: 'initWorkletMesssagePort',
	  renderOptionsUpdated: 'renderOptionsUpdated',
	  startTalk: 'startTalk',
	  stopTalk: 'stopTalk',
	  resizeView: 'resizeView',
	  updateRenderOptions: 'updateRenderOptions',
	  startEncWSSStream: 'startEncWSSStream',
	  seekTFCardStream: 'seekTFCardStream',
	  seekCloudStream: 'seekCloudStream',
	  playScaleStream: 'playScaleStream',
	  pauseStream: 'pauseStream',
	  resumeStream: 'resumeStream',
	  screenshot: 'screenshot',
	  destroy: 'destroy'
	};
	const WORKER_EVENT_TYPE = {
	  created: 'created',
	  inited: 'inited',
	  destroyed: 'destroyed',
	  updateRenderOptions: 'updateRenderOptions',
	  videoInfo: 'videoInfo',
	  videoFrame: 'videoFrame',
	  audioInfo: 'audioInfo',
	  pcmData: 'pcmData',
	  recordFinish: 'recordFinish',
	  seekTime: 'seekTime',
	  initSegment: 'initSegment',
	  mediaSegment: 'mediaSegment',
	  updateSAT: 'updateSAT',
	  event: 'event',
	  playAbnormal: 'playAbnormal',
	  requestEncWSSKey: 'requestEncWSSKey',
	  screenshotResult: 'screenshotResult',
	  logData: 'logData'
	};
	const STREAM_BUSI_TYPE = {
	  flv: 'flv',
	  hmLiveStream: 'hmlive',
	  hmTFCardStream: 'hmtfcard',
	  hmCloudStream: 'hmcloud',
	  hmCloudStreamByPlat: 'hmcloudbyplat',
	  hmWebRtc: 'hmWebRtc',
	  hmEncWSSStream: 'hmencwssstream'
	};
	const TALK_BUSI_TYPE = {
	  normalTalk: 'normalTalk',
	  dxTalk: 'dxTalk'
	};
	const ContentFitType = {
	  fill: 0,
	  contain: 1,
	  cover: 2
	};

	const LOG_LEVEL = {
	  debug: 1,
	  info: 2,
	  warn: 3,
	  error: 4
	};
	class Logger extends eventemitter3 {
	  logEnable = false;
	  logLevel = LOG_LEVEL.info;
	  logsCache = [];
	  logsCacheMaxNum = 1000;
	  player;
	  constructor(player) {
	    super();
	    this.player = player;
	  }
	  setLogEnable(logEnable) {
	    this.logEnable = logEnable;
	  }
	  setLogLevel(logLevel) {
	    if (LOG_LEVEL[logLevel]) {
	      this.logLevel = LOG_LEVEL[logLevel];
	    }
	  }
	  getCurrentTime() {
	    let now = new Date();
	    let dateString = now.toISOString().split('T')[0]; // ��ʱ��ת��Ϊ'YYYY-MM-DD'��ʽ
	    let timeString = now.toTimeString().split(' ')[0]; // ��ʱ��ת��Ϊ'hh:mm:ss'��ʽ
	    return `${dateString} ${timeString}`; // �����ں�ʱ��ƴ������
	  }
	  debug(module, ...args) {
	    if (this.logEnable && LOG_LEVEL.debug >= this.logLevel) {
	      let log = `[${this.getCurrentTime()}][HMPlayer-${this.player.options.playerId}][DEBUG][${module}] ${args.join(",")} \n`;
	      console.debug(log);
	      // 主线程的日志之前只进 console，worker 的日志才通过 logdata 进缓存，
	      // 导致 downloadLog 里看不到 MSE/渲染元素这一层的日志
	      this.appendLog(log);
	      this.emit('logdata', log);
	    }
	  }
	  info(module, ...args) {
	    if (this.logEnable && LOG_LEVEL.info >= this.logLevel) {
	      let log = `[${this.getCurrentTime()}][HMPlayer-${this.player.options.playerId}][INFO][${module}] ${args.join(",")} \n`;
	      console.info(log);
	      this.appendLog(log);
	      this.emit('logdata', log);
	    }
	  }
	  warn(module, ...args) {
	    if (this.logEnable && LOG_LEVEL.warn >= this.logLevel) {
	      let log = `[${this.getCurrentTime()}][HMPlayer-${this.player.options.playerId}][WARN][${module}] ${args.join(",")} \n`;
	      console.warn(log);
	      this.appendLog(log);
	      this.emit('logdata', log);
	    }
	  }
	  error(module, ...args) {
	    if (this.logEnable && LOG_LEVEL.error >= this.logLevel) {
	      let log = `[${this.getCurrentTime()}][HMPlayer-${this.player.options.playerId}][ERROR][${module}] ${args.join(",")} \n`;
	      console.error(log);
	      this.appendLog(log);
	      this.emit('logdata', log);
	    }
	  }
	  appendLog(log) {
	    this.logsCache.push(log);
	    if (this.logsCache.length > this.logsCacheMaxNum) {
	      this.logsCache.shift();
	    }
	  }
	  logsHeader() {
	    let gpu = 'unknown';
	    var canvas = document.createElement("canvas");
	    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	    if (gl) {
	      var info = gl.getExtension("WEBGL_debug_renderer_info");
	      if (info) {
	        gpu = gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
	      }
	    }
	    let header = `--------------- Header(S) ---------------
version: ${PlayerVersion}
creationTime: ${new Date().toString()}
userAgent: ${navigator.userAgent}
cookieEnabled: ${navigator.cookieEnabled}
hardwareConcurrency: ${navigator.hardwareConcurrency}
maxTouchPoints: ${navigator.maxTouchPoints}
deviceMemory: ${navigator.deviceMemory}GB
devicePixelRatio: ${window.devicePixelRatio}
viewport: width:${this.player.options.width},height:${this.player.options.height}
screen: width:${window.screen.width},height:${window.screen.height},colorDepth:${window.screen.colorDepth}
gpu: ${gpu}
--------------- Header(E) ---------------

`;
	    return header;
	  }
	  getLogsCache() {
	    return [this.logsHeader(), ...this.logsCache];
	  }
	  destroy() {
	    this.off();
	  }
	}
	let logger = undefined;
	function createLogger(player, logEnable, logLevel) {
	  if (!logger) {
	    logger = new Logger(player);
	  }
	  logger.setLogEnable(logEnable);
	  logger.setLogLevel(logLevel);
	}
	function destroyLogger() {
	  logger?.destroy();
	}

	/*
	 * Copyright (C) 2016 Bilibili. All Rights Reserved.
	 *
	 * @author zheng qian <xqq@xqq.im>
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	let Browser = {};
	function detect() {
	  // modified from jquery-browser-plugin

	  let ua = self.navigator.userAgent.toLowerCase();
	  let match = /(edge)\/([\w.]+)/.exec(ua) || /(opr)[\/]([\w.]+)/.exec(ua) || /(chrome)[ \/]([\w.]+)/.exec(ua) || /(iemobile)[\/]([\w.]+)/.exec(ua) || /(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf('trident') >= 0 && /(rv)(?::| )([\w.]+)/.exec(ua) || ua.indexOf('compatible') < 0 && /(firefox)[ \/]([\w.]+)/.exec(ua) || [];
	  let platform_match = /(ipad)/.exec(ua) || /(ipod)/.exec(ua) || /(windows phone)/.exec(ua) || /(iphone)/.exec(ua) || /(kindle)/.exec(ua) || /(android)/.exec(ua) || /(windows)/.exec(ua) || /(mac)/.exec(ua) || /(linux)/.exec(ua) || /(cros)/.exec(ua) || [];
	  let matched = {
	    browser: match[5] || match[3] || match[1] || '',
	    version: match[2] || match[4] || '0',
	    majorVersion: match[4] || match[2] || '0',
	    platform: platform_match[0] || ''
	  };
	  let browser = {};
	  if (matched.browser) {
	    browser[matched.browser] = true;
	    let versionArray = matched.majorVersion.split('.');
	    browser.version = {
	      major: parseInt(matched.majorVersion, 10),
	      string: matched.version
	    };
	    if (versionArray.length > 1) {
	      browser.version.minor = parseInt(versionArray[1], 10);
	    }
	    if (versionArray.length > 2) {
	      browser.version.build = parseInt(versionArray[2], 10);
	    }
	  }
	  if (matched.platform) {
	    browser[matched.platform] = true;
	  }
	  if (browser.chrome || browser.opr || browser.safari) {
	    browser.webkit = true;
	  }

	  // MSIE. IE11 has 'rv' identifer
	  if (browser.rv || browser.iemobile) {
	    if (browser.rv) {
	      delete browser.rv;
	    }
	    let msie = 'msie';
	    matched.browser = msie;
	    browser[msie] = true;
	  }

	  // Microsoft Edge
	  if (browser.edge) {
	    delete browser.edge;
	    let msedge = 'msedge';
	    matched.browser = msedge;
	    browser[msedge] = true;
	  }

	  // Opera 15+
	  if (browser.opr) {
	    let opera = 'opera';
	    matched.browser = opera;
	    browser[opera] = true;
	  }

	  // Stock android browsers are marked as Safari
	  if (browser.safari && browser.android) {
	    let android = 'android';
	    matched.browser = android;
	    browser[android] = true;
	  }
	  browser.name = matched.browser;
	  browser.platform = matched.platform;
	  for (let key in Browser) {
	    if (Browser.hasOwnProperty(key)) {
	      delete Browser[key];
	    }
	  }
	  Object.assign(Browser, browser);
	}
	detect();

	function clamp(num, a, b) {
	  return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
	}
	function createWorkletModuleUrl(func) {
	  function functionToString(str) {
	    return str.trim().match(/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/)[1];
	  }
	  const funcStr = functionToString(func.toString());
	  const blob = new Blob([funcStr], {
	    type: 'application/javascript'
	  });
	  return URL.createObjectURL(blob);
	}
	function supportOffScreenCanvas() {
	  return !!self.OffscreenCanvas;
	}
	function supportMSE() {
	  return self.MediaSource ? true : false;
	}
	function supportMSEForWorker() {
	  return self.Worker && self.MediaSource && 'canConstructInDedicatedWorker' in self.MediaSource && self.MediaSource['canConstructInDedicatedWorker'] === true ? true : false;
	}
	function GenRandomString(strlen = 32) {
	  let str = 'abcdefghijklmnopqrstuvwxyz0123456789';
	  let pwd = '';
	  for (let i = 0; i < strlen; i++) {
	    pwd += str.charAt(Math.floor(Math.random() * str.length));
	  }
	  return pwd;
	}
	function isDefaultColorOptions(options) {
	  if (options.brightness != 1.0) {
	    return false;
	  }
	  if (options.contrast != 1.0) {
	    return false;
	  }
	  if (options.saturate != 1.0) {
	    return false;
	  }
	  if (options.huerotate != 0) {
	    return false;
	  }
	  return true;
	}

	// 回放/定位的时间格式固定是 "YYYY-MM-DD HH:mm:ss"，
	// wasm 侧按这个格式 sscanf 并原样透传给平台，格式不对不会报错、只会静默失败
	// （比如年份写成 22026，平台收到的定位时间是无效的，画面不会动）。
	function isValidPlayTime(playTime) {
	  if (typeof playTime != 'string') {
	    return false;
	  }
	  let m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(playTime.trim());
	  if (!m) {
	    return false;
	  }
	  let year = Number(m[1]);
	  return year >= 2000 && year <= 2100;
	}

	class AudioPlayer extends eventemitter3 {
	  player = undefined;
	  audioContext = undefined;
	  gainNode = undefined;
	  scriptNode = undefined;
	  playing = false;
	  atype = 0;
	  samplerate = 0;
	  channels = 0;
	  samplesPerPacket = 0;
	  pcmlist = [];
	  init = false;
	  tag = 'AudioPlayer';
	  constructor(player) {
	    super();
	    this.player = player;
	    this.playing = false;
	    this.init = false;
	    logger.info(this.tag, 'created');
	  }
	  async setAudioInfo(atype, samplerate, channels, samplesPerPacket) {
	    this.clear();
	    this.atype = atype;
	    this.samplerate = samplerate;
	    this.channels = channels;
	    this.samplesPerPacket = samplesPerPacket;
	    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
	      sampleRate: samplerate
	    });
	    this.gainNode = this.audioContext.createGain();
	    this.audioEnabled(true);
	    // default setting 0
	    this.gainNode.gain.value = 0;
	    let audioNode;
	    if (this.player.options.audioEngine == 'worklet') {
	      audioNode = await this.createWorkletNode();
	    } else {
	      audioNode = this.createScriptNode();
	    }
	    audioNode.connect(this.gainNode);
	    this.gainNode.connect(this.audioContext.destination);
	    this.init = true;
	  }
	  createScriptNode() {
	    let scriptNode = this.audioContext.createScriptProcessor(this.samplesPerPacket, 0, this.channels);
	    scriptNode.onaudioprocess = audioProcessingEvent => {
	      let outputBuffer = audioProcessingEvent.outputBuffer;
	      let pcmpacket = this.pcmlist.shift();
	      if (!pcmpacket) {
	        for (let i = 0; i < this.channels; i++) {
	          let nowBuffering = outputBuffer.getChannelData(i);
	          nowBuffering.fill(0, 0);
	        }
	        return;
	      }
	      for (let i = 0; i < this.channels; i++) {
	        let b = pcmpacket.datas[i];
	        let nowBuffering = outputBuffer.getChannelData(i);
	        nowBuffering.set(b);
	      }
	    };
	    this.scriptNode = scriptNode;
	    return scriptNode;
	  }
	  async createWorkletNode() {
	    function audiWorkletProcessor() {
	      class WorkletProcessor extends AudioWorkletProcessor {
	        constructor(options) {
	          super();
	          this.samplesPerPacket = options.processorOptions.samplesPerPacket;
	          this.start = false;
	          this.channels = options.outputChannelCount[0];
	          this.pcmlist = [];
	          this.offset = 0;
	          this.port.onmessage = e => {
	            // console.log('WorkletProcessor onmessage', e.data);
	            if (e.data.message === "start") {
	              this.start = true;
	            } else if (e.data.message === "stop") {
	              this.start = false;
	              this.pcmlist = [];
	              this.offset = 0;
	            } else if (e.data.message === "data") {
	              this.pcmlist.push(e.data.pcmpacket);
	            }
	          };
	        }
	        process(inputs, outputs, parameters) {
	          let output = outputs[0];
	          if (this.pcmlist.length > 0) {
	            for (let i = 0; i < this.channels; i++) {
	              let channelData = output[i];
	              let cur = this.pcmlist[0].datas[i];
	              let b = cur.subarray(this.offset, this.offset + 128);
	              channelData.set(b);
	            }
	            this.offset += 128;
	            if (this.offset >= this.samplesPerPacket) {
	              this.offset = 0;
	              this.pcmlist.shift();
	            }
	          }
	          return this.start;
	        }
	      }
	      registerProcessor('worklet-processor', WorkletProcessor);
	    }
	    let workletUrl = createWorkletModuleUrl(audiWorkletProcessor);
	    await this.audioContext.audioWorklet.addModule(workletUrl);
	    URL.revokeObjectURL(this.workletUrl);
	    try {
	      this.workletNode = new AudioWorkletNode(this.audioContext, "worklet-processor", {
	        processorOptions: {
	          samplesPerPacket: this.samplesPerPacket
	        },
	        outputChannelCount: [this.channels]
	      });
	    } catch (e) {
	      //  DOMException: Failed to construct 'AudioWorkletNode': AudioWorkletNode cannot be created:
	      //  The node name 'worklet-processor' is not defined in AudioWorkletGlobalScope.
	      logger.error(this.tag, 'initWorkletScriptNode error', e);
	      this.workletNode = null;
	      return;
	    }
	    this.workletNode.port.postMessage({
	      message: "start"
	    });
	    this.workletNode.port.onmessage = e => {
	      // console.log('workletProcessorNode onmessage', e.data);
	      logger.info(this.tag, `recv msg from worklet process ${e}`);
	    };
	    return this.workletNode;
	  }
	  isPlaying() {
	    return this.playing;
	  }
	  isMute() {
	    return this.gainNode.gain.value === 0 || this.isStateSuspended();
	  }
	  volume() {
	    return this.gainNode.gain.value;
	  }
	  mute() {
	    if (!this.init) {
	      return;
	    }
	    this.setVolumeInner(0);
	    this.audioEnabled(false);
	    this.pcmlist = [];
	  }
	  unMute() {
	    if (!this.init) {
	      return;
	    }
	    this.setVolumeInner(1);
	    this.audioEnabled(true);
	  }
	  setVolumeInner(volume) {
	    volume = parseFloat(volume).toFixed(2);
	    if (isNaN(volume)) {
	      return;
	    }
	    this.audioEnabled(true);
	    volume = clamp(volume, 0, 1);
	    this.gainNode.gain.value = volume;
	    this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
	  }
	  setVolume(num) {
	    this.setVolumeInner(num);
	    this.audioEnabled(true);
	  }

	  // 是否播放。。。
	  audioEnabled(flag) {
	    logger.info(this.tag, `audioEnabled flag ${flag} state ${this.audioContext.state}`);
	    if (flag) {
	      if (this.audioContext.state === 'suspended') {
	        // resume
	        this.audioContext.resume();
	      }
	    } else {
	      if (this.audioContext.state === 'running') {
	        // suspend
	        this.audioContext.suspend();
	      }
	    }
	  }
	  isStateRunning() {
	    return this.audioContext.state === 'running';
	  }
	  isStateSuspended() {
	    return this.audioContext.state === 'suspended';
	  }
	  pushPcmData(pcmpacket) {
	    if (!this.isStateRunning()) {
	      return;
	    }
	    this.pcmlist.push(pcmpacket);
	  }
	  pause() {
	    this.playing = false;
	  }
	  resume() {
	    this.playing = true;
	  }
	  clear() {
	    if (this.ticket) {
	      clearInterval(this.ticket);
	      this.ticket = this.undefined;
	    }
	    if (this.scriptNode) {
	      this.scriptNode.disconnect(this.gainNode);
	      this.scriptNode.onaudioprocess = undefined;
	      this.scriptNode = undefined;
	    }
	    if (this.workletNode) {
	      this.workletNode.port.postMessage({
	        message: "stop"
	      });
	      this.workletNode = undefined;
	    }
	    if (this.gainNode) {
	      this.gainNode.disconnect(this.audioContext.destination);
	      this.gainNode = undefined;
	    }
	    if (this.audioContext) {
	      this.audioContext.close();
	      this.audioContext = null;
	    }
	    this.playing = false;
	    this.init = false;
	    this.pcmlist = [];
	    logger.info(this.tag, 'AudioPlayer clear resouce');
	  }
	  destroy() {
	    this.clear();
	    this.removeAllListeners();
	    logger.info(this.tag, 'AudioPlayer destroy');
	  }
	}

	/* eslint-disable promise/prefer-await-to-then */

	const methodMap = [
		[
			'requestFullscreen',
			'exitFullscreen',
			'fullscreenElement',
			'fullscreenEnabled',
			'fullscreenchange',
			'fullscreenerror',
		],
		// New WebKit
		[
			'webkitRequestFullscreen',
			'webkitExitFullscreen',
			'webkitFullscreenElement',
			'webkitFullscreenEnabled',
			'webkitfullscreenchange',
			'webkitfullscreenerror',

		],
		// Old WebKit
		[
			'webkitRequestFullScreen',
			'webkitCancelFullScreen',
			'webkitCurrentFullScreenElement',
			'webkitCancelFullScreen',
			'webkitfullscreenchange',
			'webkitfullscreenerror',

		],
		[
			'mozRequestFullScreen',
			'mozCancelFullScreen',
			'mozFullScreenElement',
			'mozFullScreenEnabled',
			'mozfullscreenchange',
			'mozfullscreenerror',
		],
		[
			'msRequestFullscreen',
			'msExitFullscreen',
			'msFullscreenElement',
			'msFullscreenEnabled',
			'MSFullscreenChange',
			'MSFullscreenError',
		],
	];

	const nativeAPI = (() => {
		if (typeof document === 'undefined') {
			return false;
		}

		const unprefixedMethods = methodMap[0];
		const returnValue = {};

		for (const methodList of methodMap) {
			const exitFullscreenMethod = methodList?.[1];
			if (exitFullscreenMethod in document) {
				for (const [index, method] of methodList.entries()) {
					returnValue[unprefixedMethods[index]] = method;
				}

				return returnValue;
			}
		}

		return false;
	})();

	const eventNameMap = {
		change: nativeAPI.fullscreenchange,
		error: nativeAPI.fullscreenerror,
	};

	// eslint-disable-next-line import/no-mutable-exports
	let screenfull = {
		// eslint-disable-next-line default-param-last
		request(element = document.documentElement, options) {
			return new Promise((resolve, reject) => {
				const onFullScreenEntered = () => {
					screenfull.off('change', onFullScreenEntered);
					resolve();
				};

				screenfull.on('change', onFullScreenEntered);

				const returnPromise = element[nativeAPI.requestFullscreen](options);

				if (returnPromise instanceof Promise) {
					returnPromise.then(onFullScreenEntered).catch(reject);
				}
			});
		},
		exit() {
			return new Promise((resolve, reject) => {
				if (!screenfull.isFullscreen) {
					resolve();
					return;
				}

				const onFullScreenExit = () => {
					screenfull.off('change', onFullScreenExit);
					resolve();
				};

				screenfull.on('change', onFullScreenExit);

				const returnPromise = document[nativeAPI.exitFullscreen]();

				if (returnPromise instanceof Promise) {
					returnPromise.then(onFullScreenExit).catch(reject);
				}
			});
		},
		toggle(element, options) {
			return screenfull.isFullscreen ? screenfull.exit() : screenfull.request(element, options);
		},
		onchange(callback) {
			screenfull.on('change', callback);
		},
		onerror(callback) {
			screenfull.on('error', callback);
		},
		on(event, callback) {
			const eventName = eventNameMap[event];
			if (eventName) {
				document.addEventListener(eventName, callback, false);
			}
		},
		off(event, callback) {
			const eventName = eventNameMap[event];
			if (eventName) {
				document.removeEventListener(eventName, callback, false);
			}
		},
		raw: nativeAPI,
	};

	Object.defineProperties(screenfull, {
		isFullscreen: {
			get: () => Boolean(document[nativeAPI.fullscreenElement]),
		},
		element: {
			enumerable: true,
			get: () => document[nativeAPI.fullscreenElement] ?? undefined,
		},
		isEnabled: {
			enumerable: true,
			// Coerce to boolean in case of old WebKit.
			get: () => Boolean(document[nativeAPI.fullscreenEnabled]),
		},
	});

	if (!nativeAPI) {
		screenfull = {isEnabled: false};
	}

	var screenfull$1 = screenfull;

	class PlayerUI {
	  player;
	  tag = 'PlayerUI';
	  constructor(player) {
	    this.player = player;
	    const devicePixelRatio = window.devicePixelRatio || 1;
	    logger.info(this.tag, `devicePixelRatio = ${devicePixelRatio}`);
	    if (!player.options.useWebRtcRender && player.options.renderMode == 'canvas') {
	      let canvasElement = document.createElement("canvas");
	      canvasElement.style.position = "absolute";
	      canvasElement.style.top = `${player.options.y}px`;
	      canvasElement.style.left = `${player.options.x}px`;
	      canvasElement.width = player.options.width;
	      canvasElement.height = player.options.height;
	      this.canvasElement = canvasElement;
	      player.container.appendChild(this.canvasElement);
	    } else {
	      const videoElement = document.createElement('video');
	      videoElement.muted = true;
	      videoElement.style.position = "absolute";
	      videoElement.style.top = `${player.options.y}px`;
	      videoElement.style.left = `${player.options.x}px`;
	      videoElement.width = player.options.width;
	      videoElement.height = player.options.height;
	      videoElement.setAttribute('playsinline', '');
	      videoElement.playsinline = true;
	      videoElement.setAttribute('autoplay', '');
	      videoElement.autoplay = true;
	      videoElement.controls = false;
	      this.videoElement = videoElement;
	      this.updateRenderOptions();
	      player.container.appendChild(this.videoElement);
	      if (!player.options.useWebRtcRender) {
	        videoElement.ontimeupdate = () => {
	          this.onVideoTimeUpdate();
	        };
	      }
	    }
	  }
	  onVideoTimeUpdate() {
	    if (this.player.options.playMode == 'live') {
	      if (this.videoElement.buffered.length < 1) {
	        return;
	      }
	      let maxDelay = (this.player.options.videoBuffer + this.player.options.videoBufferDelay) / 1000;
	      let ranges = this.videoElement.buffered;
	      let bufferEnd = ranges.end(ranges.length - 1);
	      if (bufferEnd - this.videoElement.currentTime > maxDelay) {
	        logger.info(this.tag, `video play current time ${this.videoElement.currentTime} is delay lastest buffer ${bufferEnd} too much, max delay ${maxDelay}`);
	        this.videoElement.currentTime = bufferEnd;
	      }
	    }
	  }
	  getCanvas() {
	    return this.canvasElement;
	  }
	  getOffScreenCanvas() {
	    if (this.canvasElement) {
	      return this.canvasElement.transferControlToOffscreen();
	    }
	    return;
	  }
	  getVideo() {
	    return this.videoElement;
	  }
	  resizeView() {
	    if (this.canvasElement) {
	      this.canvasElement.style.top = `${this.player.options.y}px`;
	      this.canvasElement.style.left = `${this.player.options.x}px`;
	      if (!this.player.options.useOffScreenCanvasRender) {
	        this.canvasElement.width = this.player.options.width;
	        this.canvasElement.height = this.player.options.height;
	      }
	    } else {
	      this.videoElement.style.top = `${this.player.options.y}px`;
	      this.videoElement.style.left = `${this.player.options.x}px`;
	      this.videoElement.width = this.player.options.width;
	      this.videoElement.height = this.player.options.height;
	    }
	  }
	  updateRenderOptions() {
	    if (!this.videoElement) {
	      // let renderOptions = this.player.options.renderOptions
	      // this.canvasElement.style.filter = `saturate(${renderOptions.saturate}) brightness(${renderOptions.brightness}) contrast(${renderOptions.contrast})  hue-rotate(${renderOptions.huerotate}deg)`

	      return;
	    }
	    let renderOptions = this.player.options.renderOptions;
	    if (renderOptions.contentFit == ContentFitType.contain) {
	      this.videoElement.style.objectFit = 'contain';
	    } else if (renderOptions.contentFit == ContentFitType.cover) {
	      this.videoElement.style.objectFit = 'cover';
	    } else {
	      this.videoElement.style.objectFit = 'fill';
	    }
	    if (isDefaultColorOptions(renderOptions)) {
	      this.videoElement.style.filter = '';
	    } else {
	      this.videoElement.style.filter = `saturate(${renderOptions.saturate}) brightness(${renderOptions.brightness}) contrast(${renderOptions.contrast})  hue-rotate(${renderOptions.huerotate}deg)`;
	    }
	  }
	  setFullscreen(flag) {
	    if (flag) {
	      screenfull$1.request(this.videoElement ?? this.canvasElement).then(() => {}).catch(e => {
	        logger.error('player', 'fullscreen request error', e);
	      });
	    } else {
	      screenfull$1.exit().then(() => {}).catch(e => {
	        logger.error('player', 'fullscreen exit error', e);
	      });
	    }
	  }
	  isFullscreen() {
	    return screenfull$1.isFullscreen;
	  }
	  destroy() {
	    if (this.canvasElement) {
	      this.player.container.removeChild(this.canvasElement);
	    }
	    if (this.videoElement) {
	      this.videoElement.ontimeupdate = undefined;
	      this.player.container.removeChild(this.videoElement);
	    }
	    logger.info(this.tag, 'PlayerUI destroy');
	  }
	}

	/**
	 * Common utilities
	 * @module glMatrix
	 */
	var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
	if (!Math.hypot) Math.hypot = function () {
	  var y = 0,
	      i = arguments.length;

	  while (i--) {
	    y += arguments[i] * arguments[i];
	  }

	  return Math.sqrt(y);
	};

	/**
	 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
	 * @module mat4
	 */

	/**
	 * Creates a new identity mat4
	 *
	 * @returns {mat4} a new 4x4 matrix
	 */

	function create$1() {
	  var out = new ARRAY_TYPE(16);

	  if (ARRAY_TYPE != Float32Array) {
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	  }

	  out[0] = 1;
	  out[5] = 1;
	  out[10] = 1;
	  out[15] = 1;
	  return out;
	}
	/**
	 * Set a mat4 to the identity matrix
	 *
	 * @param {mat4} out the receiving matrix
	 * @returns {mat4} out
	 */

	function identity(out) {
	  out[0] = 1;
	  out[1] = 0;
	  out[2] = 0;
	  out[3] = 0;
	  out[4] = 0;
	  out[5] = 1;
	  out[6] = 0;
	  out[7] = 0;
	  out[8] = 0;
	  out[9] = 0;
	  out[10] = 1;
	  out[11] = 0;
	  out[12] = 0;
	  out[13] = 0;
	  out[14] = 0;
	  out[15] = 1;
	  return out;
	}
	/**
	 * Multiplies two mat4s
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {ReadonlyMat4} a the first operand
	 * @param {ReadonlyMat4} b the second operand
	 * @returns {mat4} out
	 */

	function multiply$1(out, a, b) {
	  var a00 = a[0],
	      a01 = a[1],
	      a02 = a[2],
	      a03 = a[3];
	  var a10 = a[4],
	      a11 = a[5],
	      a12 = a[6],
	      a13 = a[7];
	  var a20 = a[8],
	      a21 = a[9],
	      a22 = a[10],
	      a23 = a[11];
	  var a30 = a[12],
	      a31 = a[13],
	      a32 = a[14],
	      a33 = a[15]; // Cache only the current line of the second matrix

	  var b0 = b[0],
	      b1 = b[1],
	      b2 = b[2],
	      b3 = b[3];
	  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	  b0 = b[4];
	  b1 = b[5];
	  b2 = b[6];
	  b3 = b[7];
	  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	  b0 = b[8];
	  b1 = b[9];
	  b2 = b[10];
	  b3 = b[11];
	  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	  b0 = b[12];
	  b1 = b[13];
	  b2 = b[14];
	  b3 = b[15];
	  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	  return out;
	}
	/**
	 * Translate a mat4 by the given vector
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {ReadonlyMat4} a the matrix to translate
	 * @param {ReadonlyVec3} v vector to translate by
	 * @returns {mat4} out
	 */

	function translate(out, a, v) {
	  var x = v[0],
	      y = v[1],
	      z = v[2];
	  var a00, a01, a02, a03;
	  var a10, a11, a12, a13;
	  var a20, a21, a22, a23;

	  if (a === out) {
	    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
	    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
	    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
	    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
	  } else {
	    a00 = a[0];
	    a01 = a[1];
	    a02 = a[2];
	    a03 = a[3];
	    a10 = a[4];
	    a11 = a[5];
	    a12 = a[6];
	    a13 = a[7];
	    a20 = a[8];
	    a21 = a[9];
	    a22 = a[10];
	    a23 = a[11];
	    out[0] = a00;
	    out[1] = a01;
	    out[2] = a02;
	    out[3] = a03;
	    out[4] = a10;
	    out[5] = a11;
	    out[6] = a12;
	    out[7] = a13;
	    out[8] = a20;
	    out[9] = a21;
	    out[10] = a22;
	    out[11] = a23;
	    out[12] = a00 * x + a10 * y + a20 * z + a[12];
	    out[13] = a01 * x + a11 * y + a21 * z + a[13];
	    out[14] = a02 * x + a12 * y + a22 * z + a[14];
	    out[15] = a03 * x + a13 * y + a23 * z + a[15];
	  }

	  return out;
	}

	/**
	 * 3 Dimensional Vector
	 * @module vec3
	 */

	/**
	 * Creates a new, empty vec3
	 *
	 * @returns {vec3} a new 3D vector
	 */

	function create() {
	  var out = new ARRAY_TYPE(3);

	  if (ARRAY_TYPE != Float32Array) {
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	  }

	  return out;
	}
	/**
	 * Adds two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {ReadonlyVec3} a the first operand
	 * @param {ReadonlyVec3} b the second operand
	 * @returns {vec3} out
	 */

	function add(out, a, b) {
	  out[0] = a[0] + b[0];
	  out[1] = a[1] + b[1];
	  out[2] = a[2] + b[2];
	  return out;
	}
	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec3} out the receiving vector
	 * @param {ReadonlyVec3} a the first operand
	 * @param {ReadonlyVec3} b the second operand
	 * @returns {vec3} out
	 */

	function subtract(out, a, b) {
	  out[0] = a[0] - b[0];
	  out[1] = a[1] - b[1];
	  out[2] = a[2] - b[2];
	  return out;
	}
	/**
	 * Multiplies two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {ReadonlyVec3} a the first operand
	 * @param {ReadonlyVec3} b the second operand
	 * @returns {vec3} out
	 */

	function multiply(out, a, b) {
	  out[0] = a[0] * b[0];
	  out[1] = a[1] * b[1];
	  out[2] = a[2] * b[2];
	  return out;
	}
	/**
	 * Alias for {@link vec3.subtract}
	 * @function
	 */

	var sub = subtract;
	/**
	 * Alias for {@link vec3.multiply}
	 * @function
	 */

	var mul = multiply;
	/**
	 * Perform some operation over an array of vec3s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */

	(function () {
	  var vec = create();
	  return function (a, stride, offset, count, fn, arg) {
	    var i, l;

	    if (!stride) {
	      stride = 3;
	    }

	    if (!offset) {
	      offset = 0;
	    }

	    if (count) {
	      l = Math.min(count * stride + offset, a.length);
	    } else {
	      l = a.length;
	    }

	    for (i = offset; i < l; i += stride) {
	      vec[0] = a[i];
	      vec[1] = a[i + 1];
	      vec[2] = a[i + 2];
	      fn(vec, vec, arg);
	      a[i] = vec[0];
	      a[i + 1] = vec[1];
	      a[i + 2] = vec[2];
	    }

	    return a;
	  };
	})();

	class BaseRender {
	  width = 0;
	  height = 0;
	  renderOptions = {};
	  tag = 'BaseRender';
	  constructor(width, height, renderOptions) {
	    this.width = width;
	    this.height = height;
	    Object.assign(this.renderOptions, this.renderOptions, renderOptions);
	    this.updateColorMatrix();
	  }
	  updateColorMatrix() {
	    let contrast = this.renderOptions.contrast;
	    contrast -= 1.0;
	    contrast = contrast < 0.0 ? 1.0 / (-contrast + 1.0) : contrast + 1.0;
	    let con_matrix = [contrast, 0.0, 0.0, 0.0, 0.0, contrast, 0.0, 0.0, 0.0, 0.0, contrast, 0.0, 0.0, 0.0, 0.0, 1.0];
	    let brightness = this.renderOptions.brightness;
	    brightness -= 1.0;
	    let bright_matrix = create$1();
	    identity(bright_matrix);
	    // bright_matrix[12] = brightness
	    // bright_matrix[13] = brightness
	    // bright_matrix[14] = brightness

	    translate(bright_matrix, bright_matrix, [brightness, brightness, brightness]);
	    let saturation = this.renderOptions.saturate;
	    const red_weight = 0.299;
	    const green_weight = 0.587;
	    const blue_weight = 0.114;
	    let one_minus_sat_red = (1.0 - saturation) * red_weight;
	    let one_minus_sat_green = (1.0 - saturation) * green_weight;
	    let one_minus_sat_blue = (1.0 - saturation) * blue_weight;
	    let sat_val_red = one_minus_sat_red + saturation;
	    let sat_val_green = one_minus_sat_green + saturation;
	    let sat_val_blue = one_minus_sat_blue + saturation;
	    let sat_matrix = [sat_val_red, one_minus_sat_red, one_minus_sat_red, 0.0, one_minus_sat_green, sat_val_green, one_minus_sat_green, 0.0, one_minus_sat_blue, one_minus_sat_blue, sat_val_blue, 0.0, 0.0, 0.0, 0.0, 1.0];
	    let hue_shift = this.renderOptions.huerotate;
	    const root3 = 0.57735;
	    const M_PI = 3.1415926;
	    /* Hue is the radian of 0 to 360 degrees. */
	    let half_angle = 0.5 * (hue_shift / (180.0 / M_PI));
	    let rot_quad1 = root3 * Math.sin(half_angle);
	    let rot_quaternion = [rot_quad1, rot_quad1, rot_quad1];
	    let rot_quaternion_w = Math.cos(half_angle);
	    let cross = create();
	    mul(cross, rot_quaternion, rot_quaternion);
	    let square = create();
	    mul(square, rot_quaternion, rot_quaternion);
	    let wimag = create();
	    mul(wimag, rot_quaternion, [rot_quaternion_w, rot_quaternion_w, rot_quaternion_w]);
	    mul(square, square, [2.0, 2.0, 2.0]);
	    let diag = create();
	    sub(diag, [0.5, 0.5, 0.5], square);
	    let a_line = create();
	    add(a_line, cross, wimag);
	    let b_line = create();
	    sub(b_line, cross, wimag);
	    let hue_op_matrix = [diag[0] * 2.0, b_line[2] * 2.0, a_line[1] * 2.0, 0.0, a_line[2] * 2.0, diag[1] * 2.0, b_line[0] * 2.0, 0.0, b_line[1] * 2.0, a_line[0] * 2.0, diag[2] * 2.0, 0.0, 0.0, 0.0, 0.0, 1.0];
	    let final_matrix = create$1();
	    multiply$1(final_matrix, con_matrix, bright_matrix);
	    multiply$1(final_matrix, final_matrix, sat_matrix);
	    multiply$1(final_matrix, final_matrix, hue_op_matrix);
	    this.colorMatrix = final_matrix;
	  }

	  //interface

	  resizeView(width, height) {
	    this.width = width;
	    this.height = height;
	    this.doResizeView();
	  }
	  updateRenderOptions(renderOptions) {
	    Object.assign(this.renderOptions, this.renderOptions, renderOptions);
	    this.updateColorMatrix();
	    this.doUpdateRenderOptions();
	  }
	  destroy() {
	    logger.info(this.tag, 'BaseRender destroy');
	  }

	  //subclass implemtaition
	  doResizeView() {}
	  doUpdateRenderOptions() {}
	}

	function initShaderProgram(gl, vsSource, fsSource) {
	  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	  const shaderProgram = gl.createProgram();
	  gl.attachShader(shaderProgram, vertexShader);
	  gl.attachShader(shaderProgram, fragmentShader);
	  gl.linkProgram(shaderProgram);
	  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	    console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
	    return null;
	  }
	  return shaderProgram;
	}
	function loadShader(gl, type, source) {
	  const shader = gl.createShader(type);
	  gl.shaderSource(shader, source);
	  gl.compileShader(shader);
	  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	    console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
	    gl.deleteShader(shader);
	    return null;
	  }
	  return shader;
	}
	function createTexture(gl) {
	  let texture = gl.createTexture();
	  gl.bindTexture(gl.TEXTURE_2D, texture);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	  return texture;
	}

	const vsSource = `
attribute vec4 aVertexPosition;
attribute vec2 aTexturePosition;
varying lowp vec2 vTexturePosition;
void main(void) {
  gl_Position =  aVertexPosition;
  vTexturePosition = aTexturePosition;
}
`;

	// Fragment shader program

	const fsSource = `
precision mediump float;
varying mediump vec2 vTexturePosition;
uniform int pixelType;
uniform sampler2D rgbaTexture; 
uniform sampler2D yTexture; 
uniform sampler2D uTexture; 
uniform sampler2D vTexture; 
uniform sampler2D uvTexture; 
uniform mat4 colorMatrix;

const mat4 YUV2RGB = mat4( 1.1643828125, 0, 1.59602734375, -.87078515625,
                           1.1643828125, -.39176171875, -.81296875, .52959375,
                           1.1643828125, 2.017234375, 0, -1.081390625,
                           0, 0, 0, 1);

vec4 getPixel(vec2 texpos) {

  vec4 pixel;
  if (pixelType == 1) {

      float y = texture2D(yTexture,  texpos).r;
      float u = texture2D(uTexture,  texpos).r;
      float v = texture2D(vTexture,  texpos).r;
      pixel = vec4(y, u, v, 1) * YUV2RGB;

  } else if (pixelType == 2) {

      float y = texture2D(yTexture,  texpos).r;
      vec2 uv = texture2D(uvTexture,  texpos).ra;
      pixel = vec4(y, uv.x, uv.y, 1) * YUV2RGB;

  } else {

      pixel =  texture2D(rgbaTexture, texpos);
  }

  return colorMatrix*pixel;
}


void main(void) {

  gl_FragColor = getPixel(vTexturePosition);
}
`;
	class RectRender extends BaseRender {
	  pixeltype = PixelType.YUV_I420;
	  textureWidth = 0;
	  textureHeight = 0;
	  programInfo = undefined;
	  buffers = undefined;
	  textureHasLoad = false;
	  tag = 'RectRender';
	  constructor(gl, width, height, renderOptions) {
	    super(width, height, renderOptions);
	    this.gl = gl;
	    this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
	    const shaderProgram = initShaderProgram(this.gl, vsSource, fsSource);
	    this.programInfo = {
	      program: shaderProgram,
	      attribLocations: {
	        vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
	        texturePosition: this.gl.getAttribLocation(shaderProgram, 'aTexturePosition')
	      },
	      uniformLocations: {
	        rgbatexture: this.gl.getUniformLocation(shaderProgram, 'rgbaTexture'),
	        ytexture: this.gl.getUniformLocation(shaderProgram, 'yTexture'),
	        utexture: this.gl.getUniformLocation(shaderProgram, 'uTexture'),
	        vtexture: this.gl.getUniformLocation(shaderProgram, 'vTexture'),
	        uvtexture: this.gl.getUniformLocation(shaderProgram, 'uvTexture'),
	        pixelType: this.gl.getUniformLocation(shaderProgram, 'pixelType'),
	        colorMatrix: this.gl.getUniformLocation(shaderProgram, 'colorMatrix')
	      }
	    };
	    this.buffers = this.initBuffers();
	    this.rgbatexture = createTexture(this.gl);
	    this.ytexture = createTexture(this.gl);
	    this.utexture = createTexture(this.gl);
	    this.vtexture = createTexture(this.gl);
	    this.uvtexture = createTexture(this.gl);
	  }
	  initBuffers() {
	    const positionBuffer = this.gl.createBuffer();
	    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
	    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0]), this.gl.STATIC_DRAW);
	    const texpositionBuffer = this.gl.createBuffer();
	    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texpositionBuffer);
	    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0]), this.gl.STATIC_DRAW);
	    const indexBuffer = this.gl.createBuffer();
	    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), this.gl.STATIC_DRAW);
	    return {
	      position: positionBuffer,
	      texposition: texpositionBuffer,
	      indices: indexBuffer
	    };
	  }
	  destroy() {
	    this.gl.deleteProgram(this.programInfo.program);
	    this.gl.deleteBuffer(this.buffers.position);
	    this.gl.deleteBuffer(this.buffers.texposition);
	    this.gl.deleteBuffer(this.buffers.indices);
	    this.gl.deleteTexture(this.rgbatexture);
	    this.gl.deleteTexture(this.ytexture);
	    this.gl.deleteTexture(this.utexture);
	    this.gl.deleteTexture(this.vtexture);
	    this.gl.deleteTexture(this.uvtexture);
	    super.destroy();
	    logger.info(this.tag, 'RectRender destroy');
	  }
	  updateTexture(pixeltype, pixelbuf, width, height) {
	    this.pixeltype = pixeltype;
	    this.textureWidth = width;
	    this.textureHeight = height;
	    if (pixeltype === PixelType.DOM) {
	      let textunit = 3;
	      this.gl.activeTexture(this.gl.TEXTURE0 + textunit);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.rgbatexture);
	      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixelbuf);
	    } else if (pixeltype === PixelType.RGBA) {
	      let textunit = 3;
	      this.gl.activeTexture(this.gl.TEXTURE0 + textunit);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.rgbatexture);
	      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixelbuf);
	    } else if (pixeltype === PixelType.YUV_I420) {
	      let y = pixelbuf.slice(0, width * height);
	      let u = pixelbuf.slice(width * height, width * height * 5 / 4);
	      let v = pixelbuf.slice(width * height * 5 / 4, width * height * 3 / 2);
	      this.gl.activeTexture(this.gl.TEXTURE0);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.ytexture);
	      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, width, height, 0, this.gl.LUMINANCE, this.gl.UNSIGNED_BYTE, y);
	      this.gl.activeTexture(this.gl.TEXTURE1);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.utexture);
	      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, width / 2, height / 2, 0, this.gl.LUMINANCE, this.gl.UNSIGNED_BYTE, u);
	      this.gl.activeTexture(this.gl.TEXTURE2);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.vtexture);
	      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, width / 2, height / 2, 0, this.gl.LUMINANCE, this.gl.UNSIGNED_BYTE, v);
	    } else if (pixeltype === PixelType.YUV_NV12) {
	      let y = pixelbuf.slice(0, width * height);
	      let uv = pixelbuf.slice(width * height, width * height * 3 / 2);
	      this.gl.activeTexture(this.gl.TEXTURE0);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.ytexture);
	      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, width, height, 0, this.gl.LUMINANCE, this.gl.UNSIGNED_BYTE, y);
	      this.gl.activeTexture(this.gl.TEXTURE1);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.uvtexture);
	      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE_ALPHA, width / 2, height / 2, 0, this.gl.LUMINANCE_ALPHA, this.gl.UNSIGNED_BYTE, uv);
	    } else {
	      return;
	    }
	    if (!this.textureHasLoad) {
	      this.textureHasLoad = true;
	    }
	    this.drawScene();
	  }
	  doResizeView() {
	    this.drawScene();
	  }
	  doUpdateRenderOptions() {
	    this.drawScene();
	  }
	  drawScene() {
	    if (!this.textureHasLoad) {
	      return;
	    }
	    if (this.textureWidth === 0 || this.textureHeight === 0) {
	      this.gl.viewport(0, 0, this.width, this.height);
	    } else {
	      let textureAspectRatio = this.textureWidth / this.textureHeight;
	      let aspectRatio = this.width / this.height;
	      if (this.renderOptions.contentFit == ContentFitType.contain) {
	        if (textureAspectRatio > aspectRatio) {
	          let adjustHeight = this.width / textureAspectRatio;
	          this.gl.viewport(0, (this.height - adjustHeight) / 2, this.width, adjustHeight);
	        } else {
	          let adjustWidth = this.height * textureAspectRatio;
	          this.gl.viewport((this.width - adjustWidth) / 2, 0, adjustWidth, this.height);
	        }
	      } else if (this.renderOptions.contentFit == ContentFitType.cover) {
	        if (textureAspectRatio > aspectRatio) {
	          let adjustWidth = this.height * textureAspectRatio;
	          this.gl.viewport((this.width - adjustWidth) / 2, 0, adjustWidth, this.height);
	        } else {
	          let adjustHeight = this.width / textureAspectRatio;
	          this.gl.viewport(0, (this.height - adjustHeight) / 2, this.width, adjustHeight);
	        }
	      } else {
	        this.gl.viewport(0, 0, this.width, this.height);
	      }
	    }
	    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	    this.gl.clearDepth(1.0);
	    this.gl.enable(this.gl.DEPTH_TEST);
	    this.gl.depthFunc(this.gl.LEQUAL);
	    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
	    this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
	    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
	    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texposition);
	    this.gl.vertexAttribPointer(this.programInfo.attribLocations.texturePosition, 2, this.gl.FLOAT, false, 0, 0);
	    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.texturePosition);
	    let rgbatextunit = 2;
	    let ytextunit = rgbatextunit + 1;
	    let utextunit = rgbatextunit + 2;
	    let vtextunit = rgbatextunit + 3;
	    let uvtextunit = rgbatextunit + 4;
	    if (this.pixeltype === PixelType.YUV_I420) {
	      this.gl.activeTexture(this.gl.TEXTURE0 + ytextunit);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.ytexture);
	      this.gl.activeTexture(this.gl.TEXTURE0 + utextunit);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.utexture);
	      this.gl.activeTexture(this.gl.TEXTURE0 + vtextunit);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.vtexture);
	    } else if (this.pixeltype === PixelType.YUV_NV12) {
	      this.gl.activeTexture(this.gl.TEXTURE0 + ytextunit);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.ytexture);
	      this.gl.activeTexture(this.gl.TEXTURE0 + uvtextunit);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.uvtexture);
	    } else {
	      this.gl.activeTexture(this.gl.TEXTURE0 + rgbatextunit);
	      this.gl.bindTexture(this.gl.TEXTURE_2D, this.rgbatexture);
	    }
	    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
	    this.gl.useProgram(this.programInfo.program);
	    this.gl.uniform1i(this.programInfo.uniformLocations.rgbatexture, rgbatextunit);
	    this.gl.uniform1i(this.programInfo.uniformLocations.ytexture, ytextunit);
	    this.gl.uniform1i(this.programInfo.uniformLocations.utexture, utextunit);
	    this.gl.uniform1i(this.programInfo.uniformLocations.vtexture, vtextunit);
	    this.gl.uniform1i(this.programInfo.uniformLocations.uvtexture, uvtextunit);
	    this.gl.uniform1i(this.programInfo.uniformLocations.pixelType, this.pixeltype);
	    this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.colorMatrix, false, this.colorMatrix);
	    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
	  }
	}

	function createContextGL(canvas) {
	  let gl = null;
	  const validContextNames = ["webgl2", "webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
	  let nameIndex = 0;
	  while (!gl && nameIndex < validContextNames.length) {
	    const contextName = validContextNames[nameIndex];
	    try {
	      let contextOptions = {
	        preserveDrawingBuffer: true
	      };
	      gl = canvas.getContext(contextName, contextOptions);
	    } catch (e) {
	      gl = null;
	    }
	    if (!gl || typeof gl.getParameter !== "function") {
	      gl = null;
	    }
	    ++nameIndex;
	  }
	  return gl;
	}
	class CanvasRender {
	  gl;
	  render;
	  player;
	  canvas;
	  canvasRenderMode;
	  canvasRenderAccelerationMode;
	  width;
	  height;
	  wgpu;
	  tag = 'CanvasRender';
	  constructor(player, canvas) {
	    this.player = player;
	    // this.gl = createContextGL(canvas);
	    this.width = canvas.width;
	    this.height = canvas.height;
	    this.canvas = canvas;
	    this.canvasRenderMode = player.options.canvasRenderMode;
	    this.canvasRenderAccelerationMode = player.options.canvasRenderAccelerationMode;
	    this.gl = createContextGL(canvas);
	    this.createRender();
	  }
	  createRender() {
	    if (this.render) {
	      this.render.destroy();
	      this.render = null;
	    }
	    switch (this.canvasRenderMode) {
	      case "normal":
	        {
	          this.render = new RectRender(this.gl, this.width, this.height, this.player.options.renderOptions);
	          break;
	        }
	      default:
	        {
	          this.render = new RectRender(this.gl, this.width, this.height, this.player.options.renderOptions);
	          break;
	        }
	    }
	  }
	  resizeView() {
	    this.width = this.canvas.width;
	    this.height = this.canvas.height;
	    this.render.resizeView(this.width, this.height);
	  }
	  updateRenderOptions() {
	    this.render.updateRenderOptions(this.player.options.renderOptions);
	  }
	  renderOneFrame(videoFrame, ext) {
	    if (videoFrame.frameType == FrameType.JSVideoFrame) {
	      // let yuvBuf = new Uint8Array(videoFrame.dataLength)

	      // videoFrame.jsVideoFrame.copyTo(yuvBuf).then(()=>{

	      //     let pixelType = videoFrame.jsVideoFrame.format == 'NV12' ? PixelType.YUV_NV12: PixelType.YUV_I420

	      //     this.updateTexture(pixelType, yuvBuf, videoFrame.width, videoFrame.height, ext)

	      //     //这里需要close js videoFrame， 不然会泄露
	      //     videoFrame.jsVideoFrame.close()
	      // })

	      this.updateTexture(PixelType.DOM, videoFrame.jsVideoFrame, videoFrame.width, videoFrame.height, ext);
	      videoFrame.jsVideoFrame.close();
	    } else {
	      this.updateTexture(videoFrame.pixelType, videoFrame.data, videoFrame.width, videoFrame.height, ext);
	    }
	  }
	  updateTexture(pixeltype, pixelbuf, width, height, ext) {
	    if (this.render) {
	      this.render.updateTexture(pixeltype, pixelbuf, width, height);
	    }
	  }
	  destroy() {
	    if (this.render) {
	      this.render.destroy();
	      this.render = null;
	    }
	    logger.info(this.tag, 'CanvasRender destroy');
	  }
	}

	class VideoMSERender {
	  player;
	  width;
	  height;
	  tag = 'VideoMSERender';
	  constructor(player, video) {
	    this.player = player;
	    this.video = video;
	    this.width = video.width;
	    this.height = video.height;

	    // 之前只在 appendBuffer 报 "HTMLMediaElement.error is not null" 时才间接发现
	    // 播放元素已经出错，看不到真正的原因。这里把 MediaError 打出来，
	    // 便于判断是 MSE 不支持、解码失败还是数据问题。
	    this.video.addEventListener('error', () => {
	      let err = this.video.error;
	      logger.error(this.tag, `video element error, code ${err?.code}, message ${err?.message}, readyState ${this.video.readyState}, networkState ${this.video.networkState}, currentTime ${this.video.currentTime}`);

	      // 让播放器记住"这个流在这台机器上硬解不了"，下次直接软解，不再黑那一下
	      this.player?.notifyMseDecodeError?.(err);
	    });
	  }
	  setMediaSourceObjectUrl(objecturl) {
	    this.video.src = objecturl;
	    this.startPlayVideo();
	    logger.info(this.tag, 'start MSE render in Main Thread');
	  }
	  setMediaSourceHandle(handle) {
	    this.video.srcObject = handle;
	    this.startPlayVideo();
	    logger.info(this.tag, 'start MSE render in Worker Thread');
	  }
	  startPlayVideo() {
	    this.video.play().then(() => {
	      logger.info(this.tag, 'video label start play');
	    }).catch(e => {
	      logger.info(this.tag, `video label start play err ${e}`);
	    });
	  }
	  seekTime(ms) {
	    this.video.currentTime = ms / 1000;
	    this.startPlayVideo();
	    logger.warn(this.tag, `videl label seek time to ${ms / 1000} s`);
	  }
	  mute() {
	    this.video.muted = true;
	  }
	  isMute() {
	    return this.video?.muted || this.video?.volume === 0;
	  }
	  unMute() {
	    this.video.muted = false;
	  }
	  setVolume(num) {
	    this.video.volume = num;
	  }
	  destroy() {
	    if (this.video) {
	      this.video.pause();
	      this.video.currentTime = 0;
	      if (this.video.srcObject) {
	        this.video.srcObject = null;
	        this.video.removeAttribute('srcObject');
	      }
	      if (this.video.src) {
	        this.video.src = '';
	        this.video.removeAttribute('src');
	      }
	      try {
	        this.video.load();
	      } catch (e) {
	        // ignore
	      }
	    }
	    logger.info(this.tag, 'VideoMSERender destroy');
	  }
	}

	/*
	 * Copyright (C) 2016 Bilibili. All Rights Reserved.
	 *
	 * @author zheng qian <xqq@xqq.im>
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	class RuntimeException {
	  constructor(message) {
	    this._message = message;
	  }
	  get name() {
	    return 'RuntimeException';
	  }
	  get message() {
	    return this._message;
	  }
	  toString() {
	    return this.name + ': ' + this.message;
	  }
	}
	class IllegalStateException extends RuntimeException {
	  constructor(message) {
	    super(message);
	  }
	  get name() {
	    return 'IllegalStateException';
	  }
	}

	/*
	 * Copyright (C) 2016 Bilibili. All Rights Reserved.
	 *
	 * @author zheng qian <xqq@xqq.im>
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	// Media Source Extensions controller
	class MSEController extends eventemitter3 {
	  player;
	  tag = 'MSEController';
	  constructor(player) {
	    super();
	    this.player = player;

	    // 【关键修复】启用自动清理机制，特别是对于高倍速回放和多路播放
	    this.config = {
	      autoCleanupSourceBuffer: true,
	      // 强制启用自动清理
	      autoCleanupMaxBackwardDuration: 30,
	      // 保留30秒历史数据
	      autoCleanupMinBackwardDuration: 10,
	      // 最少保留10秒
	      autoCleanupForHighSpeed: true,
	      // 高倍速模式下更激进的清理
	      maxBufferSize: 100 * 1024 * 1024,
	      // 100MB 缓冲限制
	      maxPendingSegments: 300 // 排队等待 append 的 segment 上限（约 20 秒视频）
	    };

	    // 检测多路播放环境并调整缓冲策略
	    this.isMultiPlayerEnv = this.detectMultiPlayerEnvironment();
	    if (this.isMultiPlayerEnv) {
	      // 多路播放时大幅降低每路的缓冲限制
	      this.config.multiPlayerBufferLimit = 60; // 多路播放时每路最多60秒
	      this.config.multiPlayerCleanupThreshold = 30; // 30秒后开始清理
	      logger.info(this.tag, 'Multi-player environment detected, using optimized buffer limits');
	    }

	    // 检测高倍速模式
	    this.isHighSpeedMode = false;
	    this.currentPlaySpeed = 1.0;
	    this.e = {
	      onSourceOpen: this.onSourceOpen.bind(this),
	      onSourceEnded: this.onSourceEnded.bind(this),
	      onSourceClose: this.onSourceClose.bind(this),
	      onSourceBufferError: this.onSourceBufferError.bind(this),
	      onSourceBufferUpdateEnd: this.onSourceBufferUpdateEnd.bind(this)
	    };
	    this.mediaSource = null;
	    this.mediaSourceObjectURL = null;
	    this.isBufferFull = false;
	    this.hasPendingEos = false;
	    this.requireSetMediaDuration = false;
	    this.pendingMediaDuration = 0;
	    this.pendingSourceBufferInit = [];
	    this.mimeTypes = {
	      video: null,
	      audio: null
	    };
	    this.sourceBuffers = {
	      video: null,
	      audio: null
	    };
	    this.lastInitSegments = {
	      video: null,
	      audio: null
	    };
	    this.pendingSegments = {
	      video: [],
	      audio: []
	    };
	    this.pendingRemoveRanges = {
	      video: [],
	      audio: []
	    };

	    // Worker环境下无法访问DOM获取currentTime，通过跟踪buffer末尾时间来估算
	    this._lastKnownTime = 0;
	    this._hasDOMAccess = typeof document !== 'undefined';

	    // 新增：定期检查和清理缓冲区
	    let cleanupInterval = this.isMultiPlayerEnv ? 15000 : 30000; // 多路播放时15秒检查一次，单路30秒
	    this.bufferCleanupTimer = setInterval(() => {
	      this.proactiveBufferCleanup();
	    }, cleanupInterval);

	    // 高倍速模式下的清理重试定时器（用于在 SourceBuffer 忙碌时快速重试）
	    this.cleanupRetryTimer = null;
	    logger.info(this.tag, `Buffer cleanup timer started: interval=${cleanupInterval}ms, multiPlayer=${this.isMultiPlayerEnv}`);
	    let ms = new self.MediaSource();
	    ms.addEventListener('sourceopen', this.e.onSourceOpen);
	    ms.addEventListener('sourceended', this.e.onSourceEnded);
	    ms.addEventListener('sourceclose', this.e.onSourceClose);
	    this.mediaSource = ms;
	    this.isDestroyed = false;
	  }
	  destroy() {
	    // 清理缓冲区管理定时器
	    if (this.bufferCleanupTimer) {
	      clearInterval(this.bufferCleanupTimer);
	      this.bufferCleanupTimer = null;
	    }
	    if (this.cleanupRetryTimer) {
	      clearTimeout(this.cleanupRetryTimer);
	      this.cleanupRetryTimer = null;
	    }
	    if (this.mediaSource) {
	      this.shutdown();
	    }
	    if (this.mediaSourceObjectURL) {
	      this.revokeObjectURL();
	    }
	    this.e = null;
	    this.isDestroyed = true;
	    this.off();
	    logger.info(this.tag, 'MSE-Controller destroy');
	  }
	  shutdown() {
	    if (this.mediaSource) {
	      let ms = this.mediaSource;
	      for (let type in this.sourceBuffers) {
	        // pending segments should be discard
	        let ps = this.pendingSegments[type];
	        ps.splice(0, ps.length);
	        this.pendingSegments[type] = null;
	        this.pendingRemoveRanges[type] = null;
	        this.lastInitSegments[type] = null;

	        // remove all sourcebuffers
	        let sb = this.sourceBuffers[type];
	        if (sb) {
	          if (ms.readyState !== 'closed') {
	            // ms edge can throw an error: Unexpected call to method or property access
	            try {
	              ms.removeSourceBuffer(sb);
	            } catch (error) {
	              logger.error(this.tag, error.message);
	            }
	            sb.removeEventListener('error', this.e.onSourceBufferError);
	            sb.removeEventListener('updateend', this.e.onSourceBufferUpdateEnd);
	          }
	          this.mimeTypes[type] = null;
	          this.sourceBuffers[type] = null;
	        }
	      }
	      if (ms.readyState === 'open') {
	        try {
	          ms.endOfStream();
	        } catch (error) {
	          logger.error(this.tag, error.message);
	        }
	      }
	      this.mediaElementProxy = null;
	      ms.removeEventListener('sourceopen', this.e.onSourceOpen);
	      ms.removeEventListener('sourceended', this.e.onSourceEnded);
	      ms.removeEventListener('sourceclose', this.e.onSourceClose);
	      this.pendingSourceBufferInit = [];
	      this.isBufferFull = false;
	      this.mediaSource = null;
	    }
	  }
	  getObject() {
	    if (!this.mediaSource) {
	      throw new IllegalStateException('MediaSource has not been initialized yet!');
	    }
	    return this.mediaSource;
	  }
	  getHandle() {
	    if (!this.mediaSource) {
	      throw new IllegalStateException('MediaSource has not been initialized yet!');
	    }
	    return this.mediaSource.handle;
	  }
	  getObjectURL() {
	    if (!this.mediaSource) {
	      throw new IllegalStateException('MediaSource has not been initialized yet!');
	    }
	    if (this.mediaSourceObjectURL == null) {
	      this.mediaSourceObjectURL = URL.createObjectURL(this.mediaSource);
	    }
	    return this.mediaSourceObjectURL;
	  }
	  revokeObjectURL() {
	    if (this.mediaSourceObjectURL) {
	      URL.revokeObjectURL(this.mediaSourceObjectURL);
	      this.mediaSourceObjectURL = null;
	    }
	  }
	  appendInitSegment(initSegment, deferred = undefined) {
	    if (this.isDestroyed) {
	      return;
	    }
	    if (!this.mediaSource || this.mediaSource.readyState !== 'open') {
	      // sourcebuffer creation requires mediaSource.readyState === 'open'
	      // so we defer the sourcebuffer creation, until sourceopen event triggered
	      this.pendingSourceBufferInit.push(initSegment);
	      // make sure that this InitSegment is in the front of pending segments queue
	      this.pendingSegments[initSegment.type].push(initSegment);
	      return;
	    }
	    let is = initSegment;
	    let mimeType = `${is.container}`;
	    if (is.codec && is.codec.length > 0) {
	      mimeType += `;codecs=${is.codec}`;
	    }
	    let firstInitSegment = false;
	    logger.info(this.tag, 'Received Initialization Segment, mimeType: ' + mimeType);
	    this.lastInitSegments[is.type] = is;
	    if (mimeType !== this.mimeTypes[is.type]) {
	      if (!this.mimeTypes[is.type]) {
	        // empty, first chance create sourcebuffer
	        firstInitSegment = true;
	        try {
	          let sb = this.sourceBuffers[is.type] = this.mediaSource.addSourceBuffer(mimeType);
	          sb.addEventListener('error', this.e.onSourceBufferError);
	          sb.addEventListener('updateend', this.e.onSourceBufferUpdateEnd);
	        } catch (error) {
	          logger.error(this.tag, error.message);
	          //this.emit(MSEEvents.ERROR, {code: error.code, msg: error.message});
	          this.emit('playAbnormal', {
	            message: error.message
	          });
	          return;
	        }
	      } else {
	        logger.info(this.tag, `Notice: ${is.type} mimeType changed, origin: ${this.mimeTypes[is.type]}, target: ${mimeType}`);
	      }
	      this.mimeTypes[is.type] = mimeType;
	    }
	    if (!deferred) {
	      // deferred means this InitSegment has been pushed to pendingSegments queue
	      this.pendingSegments[is.type].push(is);
	    }
	    if (!firstInitSegment) {
	      // append immediately only if init segment in subsequence
	      if (this.sourceBuffers[is.type] && !this.sourceBuffers[is.type].updating) {
	        this.doAppendSegments();
	      }
	    }
	    // if (Browser.safari && is.container === 'audio/mpeg' && is.mediaDuration > 0) {
	    //     // 'audio/mpeg' track under Safari may cause MediaElement's duration to be NaN
	    //     // Manually correct MediaSource.duration to make progress bar seekable, and report right duration
	    //     this.requireSetMediaDuration = true;
	    //     this.pendingMediaDuration = is.mediaDuration / 1000;  // in seconds
	    //     this.updateMediaSourceDuration();
	    // }
	  }
	  appendMediaSegment(mediaSegment) {
	    if (this.isDestroyed) {
	      return;
	    }
	    let ms = mediaSegment;
	    let queue = this.pendingSegments[ms.type];

	    // append 一旦被卡住（比如 remove 队列排不空），segment 会一帧一个地堆在这里，
	    // 每帧几十 KB，几分钟就能把标签页内存吃光。这里加上限：超了就丢最旧的，
	    // 丢的是过期数据，总比整个页面崩掉好。
	    if (queue.length >= this.config.maxPendingSegments) {
	      queue.splice(0, queue.length - this.config.maxPendingSegments + 1);
	      logger.warn(this.tag, `pending ${ms.type} segments exceed ${this.config.maxPendingSegments}, drop oldest`);
	    }
	    queue.push(ms);

	    // 【关键修复】启用自动清理
	    if (this.config.autoCleanupSourceBuffer && this.needCleanupSourceBuffer()) {
	      this.doCleanupSourceBuffer();
	    }
	    let sb = this.sourceBuffers[ms.type];
	    if (sb && !sb.updating && !this.hasPendingRemoveRanges()) {
	      this.doAppendSegments();
	    }
	  }
	  flush() {
	    // remove all appended buffers
	    for (let type in this.sourceBuffers) {
	      if (!this.sourceBuffers[type]) {
	        continue;
	      }

	      // abort current buffer append algorithm
	      let sb = this.sourceBuffers[type];
	      if (this.mediaSource.readyState === 'open') {
	        try {
	          // If range removal algorithm is running, InvalidStateError will be throwed
	          // Ignore it.
	          sb.abort();
	        } catch (error) {
	          logger.error(this.tag, error.message);
	        }
	      }

	      // pending segments should be discard
	      let ps = this.pendingSegments[type];
	      ps.splice(0, ps.length);
	      if (this.mediaSource.readyState === 'closed') {
	        // Parent MediaSource object has been detached from HTMLMediaElement
	        continue;
	      }

	      // record ranges to be remove from SourceBuffer
	      for (let i = 0; i < sb.buffered.length; i++) {
	        let start = sb.buffered.start(i);
	        let end = sb.buffered.end(i);
	        this.pendingRemoveRanges[type].push({
	          start,
	          end
	        });
	      }

	      // if sb is not updating, let's remove ranges now!
	      if (!sb.updating) {
	        this.doRemoveRanges();
	      }
	      // Safari 10 may get InvalidStateError in the later appendBuffer() after SourceBuffer.remove() call
	      // Internal parser's state may be invalid at this time. Re-append last InitSegment to workaround.
	      // Related issue: https://bugs.webkit.org/show_bug.cgi?id=159230
	      if (Browser.safari) {
	        let lastInitSegment = this.lastInitSegments[type];
	        if (lastInitSegment) {
	          this.pendingSegments[type].push(lastInitSegment);
	          if (!sb.updating) {
	            this.doAppendSegments();
	          }
	        }
	      }
	    }
	  }
	  endOfStream() {
	    let ms = this.mediaSource;
	    let sb = this.sourceBuffers;
	    if (!ms || ms.readyState !== 'open') {
	      if (ms && ms.readyState === 'closed' && this.hasPendingSegments()) {
	        // If MediaSource hasn't turned into open state, and there're pending segments
	        // Mark pending endOfStream, defer call until all pending segments appended complete
	        this.hasPendingEos = true;
	      }
	      return;
	    }
	    if (sb.video && sb.video.updating || sb.audio && sb.audio.updating) {
	      // If any sourcebuffer is updating, defer endOfStream operation
	      // See _onSourceBufferUpdateEnd()
	      this.hasPendingEos = true;
	    } else {
	      this.hasPendingEos = false;
	      // Notify media data loading complete
	      // This is helpful for correcting total duration to match last media segment
	      // Otherwise MediaElement's ended event may not be triggered
	      ms.endOfStream();
	    }
	  }
	  needCleanupSourceBuffer() {
	    if (!this.config.autoCleanupSourceBuffer) {
	      return false;
	    }
	    let currentTime = this.getCurrentTime();
	    for (let type in this.sourceBuffers) {
	      let sb = this.sourceBuffers[type];
	      if (!sb) continue;

	      // 高倍速模式下适度降低清理阈值
	      let cleanupThreshold = this.isHighSpeedMode ? 60 : 120; // 秒

	      for (let i = 0; i < sb.buffered.length; i++) {
	        let start = sb.buffered.start(i);
	        let end = sb.buffered.end(i);
	        if (currentTime - start > cleanupThreshold) {
	          return true;
	        }

	        // 检查总缓冲时长
	        if (end - start > cleanupThreshold * 2) {
	          return true;
	        }
	      }
	    }
	    return false;
	  }
	  doCleanupSourceBuffer() {
	    if (!this.mediaElementProxy) {
	      // logger.warn(this.tag, 'doCleanupSourceBuffer: mediaElementProxy is null, skipping cleanup');
	      return;
	    }
	    let currentTime;
	    try {
	      currentTime = this.mediaElementProxy.getCurrentTime();
	    } catch (error) {
	      logger.warn(this.tag, `doCleanupSourceBuffer: failed to get currentTime: ${error.message}`);
	      return;
	    }
	    for (let type in this.sourceBuffers) {
	      let sb = this.sourceBuffers[type];
	      if (sb) {
	        let buffered = sb.buffered;
	        let doRemove = false;
	        for (let i = 0; i < buffered.length; i++) {
	          let start = buffered.start(i);
	          let end = buffered.end(i);
	          if (start <= currentTime && currentTime < end + 3) {
	            // padding 3 seconds
	            if (currentTime - start >= this.config.autoCleanupMaxBackwardDuration) {
	              doRemove = true;
	              let removeEnd = currentTime - this.config.autoCleanupMinBackwardDuration;
	              this.pendingRemoveRanges[type].push({
	                start: start,
	                end: removeEnd
	              });
	            }
	          } else if (end < currentTime) {
	            doRemove = true;
	            this.pendingRemoveRanges[type].push({
	              start: start,
	              end: end
	            });
	          }
	        }
	        if (doRemove && !sb.updating) {
	          this.doRemoveRanges();
	        }
	      }
	    }
	  }
	  updateMediaSourceDuration() {
	    let sb = this.sourceBuffers;
	    if (!this.mediaSource || this.mediaSource.readyState !== 'open') {
	      return;
	    }

	    // mediaElementProxy 在 Worker 模式下不会被赋值，这里必须判空：
	    // 它是从 onSourceBufferUpdateEnd 里调用的，一抛异常后面的 append 就不会执行了
	    if (this.mediaElementProxy && this.mediaElementProxy.getReadyState() === 0) {
	      return;
	    }
	    if (sb.video && sb.video.updating || sb.audio && sb.audio.updating) {
	      return;
	    }
	    let current = this.mediaSource.duration;
	    let target = this.pendingMediaDuration;
	    if (target > 0 && (isNaN(current) || target > current)) {
	      logger.info(this.tag, `Update MediaSource duration from ${current} to ${target}`);
	      this.mediaSource.duration = target;
	    }
	    this.requireSetMediaDuration = false;
	    this.pendingMediaDuration = 0;
	  }
	  doRemoveRanges() {
	    for (let type in this.pendingRemoveRanges) {
	      if (!this.sourceBuffers[type] || this.sourceBuffers[type].updating) {
	        continue;
	      }
	      let sb = this.sourceBuffers[type];
	      let ranges = this.pendingRemoveRanges[type];
	      while (ranges.length && !sb.updating) {
	        let range = ranges.shift();

	        // 非法区间（end <= start、超出 mediaSource.duration）会让 remove() 抛异常。
	        // 这里必须校验并捕获：抛出去的异常会顺着 updateend 事件冒出去，
	        // 后面的 doAppendSegments 就不会执行，remove 队列永远排不空，
	        // append 也就永远被 hasPendingRemoveRanges() 挡住 -> segment 无限堆积。
	        if (!isFinite(range.start) || !isFinite(range.end) || range.end <= range.start) {
	          logger.warn(this.tag, `drop invalid ${type} remove range [${range.start}, ${range.end}]`);
	          continue;
	        }
	        let mediaDuration = this.mediaSource?.duration;
	        if (isFinite(mediaDuration) && range.start >= mediaDuration) {
	          logger.warn(this.tag, `drop ${type} remove range [${range.start}, ${range.end}] out of duration ${mediaDuration}`);
	          continue;
	        }
	        try {
	          sb.remove(range.start, range.end);
	        } catch (error) {
	          logger.warn(this.tag, `remove ${type} range [${range.start}, ${range.end}] failed: ${error.message}`);
	        }
	      }
	    }
	    logger.warn(this.tag, 'mse clear all buffer');
	  }
	  doAppendSegments() {
	    if (this.isDestroyed) {
	      return;
	    }
	    let pendingSegments = this.pendingSegments;
	    for (let type in pendingSegments) {
	      if (!this.sourceBuffers[type] || this.sourceBuffers[type].updating) {
	        continue;
	      }
	      if (pendingSegments[type].length > 0) {
	        let segment = pendingSegments[type].shift();

	        // if (segment.timestampOffset) {
	        //     // For MPEG audio stream in MSE, if unbuffered-seeking occurred
	        //     // We need explicitly set timestampOffset to the desired point in timeline for mpeg SourceBuffer.
	        //     let currentOffset = this.sourceBuffers[type].timestampOffset;
	        //     let targetOffset = segment.timestampOffset / 1000;  // in seconds

	        //     let delta = Math.abs(currentOffset - targetOffset);
	        //     if (delta > 0.1) {  // If time delta > 100ms
	        //         Log.v(this.TAG, `Update MPEG audio timestampOffset from ${currentOffset} to ${targetOffset}`);
	        //         this.sourceBuffers[type].timestampOffset = targetOffset;
	        //     }
	        //     delete segment.timestampOffset;
	        // }

	        if (!segment.data || segment.data.byteLength === 0) {
	          // Ignore empty buffer
	          continue;
	        }
	        try {
	          this.sourceBuffers[type].appendBuffer(segment.data);
	          this.isBufferFull = false;
	        } catch (error) {
	          this.pendingSegments[type].unshift(segment);
	          if (error.code === 22) {
	            // QuotaExceededError
	            /* Notice that FireFox may not throw QuotaExceededError if SourceBuffer is full
	             * Currently we can only do lazy-load to avoid SourceBuffer become scattered.
	             * SourceBuffer eviction policy may be changed in future version of FireFox.
	             *
	             * Related issues:
	             * https://bugzilla.mozilla.org/show_bug.cgi?id=1279885
	             * https://bugzilla.mozilla.org/show_bug.cgi?id=1280023
	             */

	            // 【关键修复】SourceBuffer溢出时执行紧急清理
	            logger.error(this.tag, `SourceBuffer full, attempting emergency cleanup`);

	            // 紧急清理策略
	            this.emergencyBufferCleanup();
	            this.isBufferFull = true;

	            // 触发缓冲溢出事件而不是playAbnormal
	            this.emit('bufferOverflow', {
	              type: type,
	              bufferSize: this.getTotalBufferedSize(),
	              playSpeed: this.currentPlaySpeed
	            });
	          } else {
	            logger.error(this.tag, error.message);
	            //this.emit(MSEEvents.ERROR, {code: error.code, msg: error.message});
	            this.emit('playAbnormal', {
	              message: error.message
	            });
	          }
	        }
	        if (segment.firstFrameAfterSeek) {
	          logger.warn(this.tag, `first frame after seek append mse buffer`);
	          this.firstFrameAfterSeek = true;
	          this.seekTime = segment.seekTime;
	        }
	      }
	    }
	  }
	  onSourceOpen() {
	    logger.info(this.tag, 'MediaSource onSourceOpen');
	    this.mediaSource.removeEventListener('sourceopen', this.e.onSourceOpen);
	    // deferred sourcebuffer creation / initialization
	    if (this.pendingSourceBufferInit.length > 0) {
	      let pendings = this.pendingSourceBufferInit;
	      while (pendings.length) {
	        let segment = pendings.shift();
	        this.appendInitSegment(segment, true);
	      }
	    }
	    // there may be some pending media segments, append them
	    if (this.hasPendingSegments()) {
	      this.doAppendSegments();
	    }
	    // this.emit(MSEEvents.SOURCE_OPEN);
	  }
	  onSourceEnded() {
	    // fired on endOfStream
	    logger.info(this.tag, 'MediaSource onSourceEnded');
	  }
	  onSourceClose() {
	    // fired on detaching from media element
	    logger.info(this.tag, 'MediaSource onSourceClose');
	    if (this.mediaSource && this.e != null) {
	      this.mediaSource.removeEventListener('sourceopen', this.e.onSourceOpen);
	      this.mediaSource.removeEventListener('sourceended', this.e.onSourceEnded);
	      this.mediaSource.removeEventListener('sourceclose', this.e.onSourceClose);
	    }
	  }
	  hasPendingSegments() {
	    let ps = this.pendingSegments;
	    return ps.video.length > 0 || ps.audio.length > 0;
	  }
	  hasPendingRemoveRanges() {
	    let prr = this.pendingRemoveRanges;
	    return prr.video.length > 0 || prr.audio.length > 0;
	  }

	  // 新增：主动缓冲区清理
	  proactiveBufferCleanup() {
	    if (!this.mediaSource || this.mediaSource.readyState !== 'open') {
	      logger.debug(this.tag, `Proactive cleanup skipped: mediaSource not ready, readyState: ${this.mediaSource?.readyState}`);
	      return;
	    }

	    // 检查缓冲区大小
	    let totalBuffered = this.getTotalBufferedSize();
	    let currentTime;
	    try {
	      currentTime = this.getCurrentTime();
	    } catch (error) {
	      logger.warn(this.tag, `proactiveBufferCleanup: failed to get currentTime: ${error.message}`);
	      return;
	    }
	    let bufferInfo = this.getDetailedBufferInfo();

	    // 详细的缓冲区健康检查
	    let bufferHealth = this.analyzeBufferHealth();
	    logger.debug(this.tag, `Buffer status - Total: ${totalBuffered}s, CurrentTime: ${currentTime}, HighSpeed: ${this.isHighSpeedMode}, BufferFull: ${this.isBufferFull}`);
	    logger.debug(this.tag, `Detailed buffer info: ${JSON.stringify(bufferInfo)}`);
	    logger.debug(this.tag, `Buffer health: ${JSON.stringify(bufferHealth)}`);
	    let shouldCleanup = false;
	    let cleanupThreshold;

	    // 基于缓冲区健康状况决定清理策略
	    if (bufferHealth.criticalIssues.length > 0) {
	      logger.warn(this.tag, `Critical buffer issues detected: ${bufferHealth.criticalIssues.join(', ')}`);
	      shouldCleanup = true;
	    } else if (this.isMultiPlayerEnv) {
	      // 多路播放模式下更激进的清理策略
	      cleanupThreshold = this.config.multiPlayerCleanupThreshold; // 30秒
	      shouldCleanup = totalBuffered > cleanupThreshold;
	    } else if (this.isHighSpeedMode) {
	      // 高倍速模式下更保守的清理策略
	      cleanupThreshold = 150; // 150秒缓冲
	      shouldCleanup = totalBuffered > cleanupThreshold;
	    } else {
	      // 正常模式
	      cleanupThreshold = 300; // 正常模式300秒
	      shouldCleanup = totalBuffered > cleanupThreshold;
	    }

	    // 动态计算清理触发阈值
	    let triggerThreshold;
	    if (this.isMultiPlayerEnv) {
	      triggerThreshold = this.config.multiPlayerBufferLimit; // 60秒
	    } else if (this.isHighSpeedMode) {
	      triggerThreshold = 180; // 高倍速180秒
	    } else {
	      triggerThreshold = 360; // 正常360秒
	    }

	    // 只有在缓冲区真正满了或者超出限制很多时才清理
	    if (shouldCleanup && totalBuffered > triggerThreshold || this.isBufferFull || bufferHealth.needsEmergencyCleanup) {
	      let reason = this.isBufferFull ? 'BufferFull' : bufferHealth.needsEmergencyCleanup ? 'Emergency' : 'Threshold';
	      logger.info(this.tag, `Proactive buffer cleanup triggered (${reason}) - buffered: ${totalBuffered}s, threshold: ${triggerThreshold}s, multiPlayer: ${this.isMultiPlayerEnv}, highSpeed: ${this.isHighSpeedMode}, health: ${bufferHealth.overallScore}/100`);
	      this.forceCleanupSourceBuffer();

	      // 【高倍速模式】如果检测到紧急情况，且 SourceBuffer 正忙无法立即清理，
	      // 安排快速重试（2-3秒后），避免缓冲区在高倍速下无限增长
	      if (bufferHealth.needsEmergencyCleanup && this.isHighSpeedMode) {
	        this.scheduleCleanupRetry();
	      }
	    } else {
	      logger.debug(this.tag, `No cleanup needed. shouldCleanup: ${shouldCleanup}, totalBuffered: ${totalBuffered}s, threshold: ${triggerThreshold}s, multiPlayer: ${this.isMultiPlayerEnv}, health: ${bufferHealth.overallScore}/100`);
	    }
	  }

	  // 安排清理重试（高倍速模式下，SourceBuffer 忙碌时快速重试）
	  scheduleCleanupRetry() {
	    // 避免重复安排多次重试
	    if (this.cleanupRetryTimer) {
	      return;
	    }

	    // 根据播放速度动态计算重试间隔：速度越快，重试越频繁
	    let retryDelay = this.currentPlaySpeed >= 8 ? 1000 : this.currentPlaySpeed >= 4 ? 2000 : 3000;
	    logger.info(this.tag, `Scheduling cleanup retry in ${retryDelay}ms (speed: ${this.currentPlaySpeed}x)`);
	    this.cleanupRetryTimer = setTimeout(() => {
	      this.cleanupRetryTimer = null;

	      // 重新检查缓冲区状态，如果仍然需要清理则再次尝试
	      if (this.isDestroyed) return;
	      let bufferHealth = this.analyzeBufferHealth();
	      if (bufferHealth.needsEmergencyCleanup) {
	        logger.warn(this.tag, `Retry cleanup - buffer still needs emergency cleanup, health: ${bufferHealth.overallScore}/100`);
	        this.forceCleanupSourceBuffer();

	        // 如果仍然需要清理，继续安排重试
	        if (bufferHealth.overallScore < 50) {
	          this.scheduleCleanupRetry();
	        }
	      } else {
	        logger.info(this.tag, `Retry cleanup - buffer health recovered, score: ${bufferHealth.overallScore}/100`);
	      }
	    }, retryDelay);
	  }

	  // 分析缓冲区健康状况
	  analyzeBufferHealth() {
	    let health = {
	      overallScore: 100,
	      criticalIssues: [],
	      warnings: [],
	      needsEmergencyCleanup: false,
	      bufferGaps: [],
	      largeRanges: []
	    };
	    let currentTime = this.getCurrentTime();
	    for (let type in this.sourceBuffers) {
	      let sb = this.sourceBuffers[type];
	      if (!sb || !sb.buffered) continue;

	      // 检查缓冲区间断
	      if (sb.buffered.length > 1) {
	        for (let i = 0; i < sb.buffered.length - 1; i++) {
	          let gapStart = sb.buffered.end(i);
	          let gapEnd = sb.buffered.start(i + 1);
	          let gapSize = gapEnd - gapStart;
	          if (gapSize > 1) {
	            // 超过1秒的间隙
	            health.bufferGaps.push({
	              type: type,
	              start: gapStart.toFixed(2),
	              end: gapEnd.toFixed(2),
	              duration: gapSize.toFixed(2)
	            });
	            if (gapSize > 10) {
	              health.criticalIssues.push(`Large buffer gap in ${type}: ${gapSize.toFixed(1)}s`);
	              health.overallScore -= 20;
	            } else {
	              health.warnings.push(`Buffer gap in ${type}: ${gapSize.toFixed(1)}s`);
	              health.overallScore -= 5;
	            }
	          }
	        }
	      }

	      // 检查过大的缓冲范围
	      for (let i = 0; i < sb.buffered.length; i++) {
	        let start = sb.buffered.start(i);
	        let end = sb.buffered.end(i);
	        let duration = end - start;
	        if (duration > 300) {
	          // 超过5分钟的单个范围
	          health.largeRanges.push({
	            type: type,
	            start: start.toFixed(2),
	            end: end.toFixed(2),
	            duration: duration.toFixed(2)
	          });
	          if (duration > 600) {
	            // 超过10分钟
	            health.criticalIssues.push(`Extremely large ${type} buffer range: ${(duration / 60).toFixed(1)}min`);
	            health.overallScore -= 30;
	            health.needsEmergencyCleanup = true;
	          } else {
	            health.warnings.push(`Large ${type} buffer range: ${(duration / 60).toFixed(1)}min`);
	            health.overallScore -= 10;
	          }
	        }

	        // 检查是否有太多历史数据
	        if (currentTime > 0 && start < currentTime - 300) {
	          // 超过5分钟的历史数据
	          let historyDuration = currentTime - start;
	          health.warnings.push(`Old ${type} buffer data: ${(historyDuration / 60).toFixed(1)}min ago`);
	          health.overallScore -= 5;
	        }
	      }
	    }

	    // 确保分数不低于0
	    health.overallScore = Math.max(0, health.overallScore);
	    return health;
	  }

	  // 新增：获取总缓冲时长
	  getTotalBufferedSize() {
	    let totalDuration = 0;
	    for (let type in this.sourceBuffers) {
	      let sb = this.sourceBuffers[type];
	      if (sb && sb.buffered.length > 0) {
	        for (let i = 0; i < sb.buffered.length; i++) {
	          totalDuration += sb.buffered.end(i) - sb.buffered.start(i);
	        }
	      }
	    }
	    return totalDuration;
	  }

	  // 新增：强制清理SourceBuffer（优化版）
	  // 使用 pendingRemoveRanges 队列替代直接调用 sb.remove()，避免以下问题：
	  // 1. 循环中多次 sb.remove() 会导致 InvalidStateError（MSE 只允许一个操作在进行中）
	  // 2. 当 sb.updating 为 true 时直接跳过，导致清理被无限延迟
	  // 通过队列机制，即使 sb 正忙，清理范围也会在 onSourceBufferUpdateEnd 中被处理
	  forceCleanupSourceBuffer() {
	    let currentTime = this.getCurrentTime();

	    // 安全检查：如果currentTime无效，跳过清理
	    if (currentTime <= 0) {
	      logger.warn(this.tag, `Invalid currentTime: ${currentTime}, skipping cleanup`);
	      return;
	    }
	    let bufferHealth = this.analyzeBufferHealth();
	    let cleanupPerformed = false;
	    for (let type in this.sourceBuffers) {
	      let sb = this.sourceBuffers[type];
	      if (!sb) continue;

	      // 智能清理策略：根据缓冲区健康状况调整
	      let keepDuration = this.calculateOptimalKeepDuration(type, bufferHealth);
	      let rangesToRemove = this.calculateCleanupRanges(sb, currentTime, keepDuration);
	      for (let range of rangesToRemove) {
	        // 添加安全检查，避免清理正在播放的内容
	        if (range.end < currentTime - 5) {
	          // 至少保留当前时间前5秒的内容
	          // 【关键修复】使用 pendingRemoveRanges 队列替代直接 sb.remove()
	          // 这样即使 sb.updating 为 true，范围也会排队等待处理
	          this.pendingRemoveRanges[type].push(range);
	          logger.info(this.tag, `Queued cleanup ${type} buffer: [${range.start.toFixed(2)}, ${range.end.toFixed(2)}], kept: ${keepDuration}s`);
	          cleanupPerformed = true;
	        } else {
	          logger.debug(this.tag, `Skipped unsafe cleanup range for ${type}: [${range.start.toFixed(2)}, ${range.end.toFixed(2)}]`);
	        }
	      }
	    }
	    if (cleanupPerformed) {
	      this.isBufferFull = false;
	      // 如果 SourceBuffer 空闲，立即开始处理移除队列
	      // 否则，onSourceBufferUpdateEnd 会在 append 完成后自动处理
	      for (let type in this.sourceBuffers) {
	        let sb = this.sourceBuffers[type];
	        if (sb && !sb.updating && this.pendingRemoveRanges[type].length > 0) {
	          this.doRemoveRanges();
	          break; // doRemoveRanges 一次处理一个类型，updateend 会触发后续处理
	        }
	      }
	      logger.info(this.tag, `Force cleanup queued, buffer health score: ${bufferHealth.overallScore}/100`);
	    } else {
	      logger.debug(this.tag, 'No cleanup ranges found or all ranges were unsafe to remove');
	    }
	  }

	  // 计算最优的保留时长
	  calculateOptimalKeepDuration(type, bufferHealth) {
	    let baseDuration = this.isHighSpeedMode ? 30 : 60;

	    // 根据缓冲区健康状况调整
	    if (bufferHealth.overallScore < 50) {
	      // 健康状况差，保留更少内容以便快速恢复
	      baseDuration *= 0.5;
	    } else if (bufferHealth.overallScore > 80) {
	      // 健康状况好，可以保留更多内容
	      baseDuration *= 1.5;
	    }

	    // 高倍速模式下的特殊处理（>= 4倍速使用更激进的保留策略）
	    if (this.isHighSpeedMode && this.currentPlaySpeed >= 4) {
	      baseDuration = Math.min(baseDuration, 15); // 超高倍速最多保留15秒
	    }
	    return Math.max(10, Math.min(baseDuration, 120)); // 限制在10-120秒之间
	  }

	  // 计算需要清理的范围
	  calculateCleanupRanges(sourceBuffer, currentTime, keepDuration) {
	    let ranges = [];
	    let keepStart = currentTime - keepDuration;
	    for (let i = 0; i < sourceBuffer.buffered.length; i++) {
	      let bufferStart = sourceBuffer.buffered.start(i);
	      let bufferEnd = sourceBuffer.buffered.end(i);

	      // 清理策略：
	      // 1. 清理完全在keepStart之前的范围
	      // 2. 清理部分在keepStart之前的范围的早期部分

	      if (bufferEnd < keepStart) {
	        // 整个范围都可以清理
	        ranges.push({
	          start: bufferStart,
	          end: bufferEnd
	        });
	      } else if (bufferStart < keepStart) {
	        // 部分清理：只清理keepStart之前的部分
	        ranges.push({
	          start: bufferStart,
	          end: keepStart
	        });
	      }
	    }
	    return ranges;
	  }

	  // 新增：设置播放速度（从外部调用）
	  setPlaySpeed(playSpeed) {
	    this.currentPlaySpeed = playSpeed;
	    this.isHighSpeedMode = playSpeed > 2.0;
	    if (this.isHighSpeedMode) {
	      // 立即进行一次缓冲清理
	      logger.info(this.tag, `High speed mode activated: ${playSpeed}x`);
	      setTimeout(() => {
	        this.proactiveBufferCleanup();
	      }, 1000);
	    }
	  }

	  // 新增：紧急缓冲清理（增强版）
	  emergencyBufferCleanup() {
	    logger.warn(this.tag, 'Emergency buffer cleanup initiated');
	    let currentTime;
	    try {
	      currentTime = this.getCurrentTime();
	    } catch (error) {
	      logger.warn(this.tag, `emergencyBufferCleanup: failed to get currentTime: ${error.message}, using fallback`);
	      currentTime = 0;
	    }
	    this.getDetailedBufferInfo();

	    // 如果currentTime无效，尝试从缓冲区信息推断
	    if (currentTime <= 0) {
	      logger.warn(this.tag, `Invalid currentTime in emergency cleanup, trying to estimate from buffer`);

	      // 尝试从video缓冲区获取最新的时间点
	      if (this.sourceBuffers.video && this.sourceBuffers.video.buffered.length > 0) {
	        let videoBuffer = this.sourceBuffers.video.buffered;
	        currentTime = videoBuffer.end(videoBuffer.length - 1) - 10; // 使用最新缓冲区结束前10秒
	        currentTime = Math.max(0, currentTime);
	        logger.info(this.tag, `Estimated currentTime from buffer: ${currentTime}`);
	      }
	      if (currentTime <= 0) {
	        logger.error(this.tag, 'Unable to determine valid currentTime, emergency cleanup aborted');
	        this.isBufferFull = false;
	        return;
	      }
	    }
	    let cleanupStats = {
	      totalRangesRemoved: 0,
	      totalDurationRemoved: 0,
	      videoRanges: 0,
	      audioRanges: 0
	    };
	    for (let type in this.sourceBuffers) {
	      let sb = this.sourceBuffers[type];
	      if (!sb || sb.updating) continue;

	      // 紧急情况下的激进清理策略
	      let emergencyKeepDuration = this.isHighSpeedMode ? 10 : 15; // 高倍速只保留10秒
	      let ranges = this.calculateEmergencyCleanupRanges(sb, currentTime, emergencyKeepDuration);
	      for (let range of ranges) {
	        // 额外的安全检查：确保不会删除正在播放附近的内容
	        if (range.end < currentTime - 3) {
	          this.pendingRemoveRanges[type].push(range);
	          cleanupStats.totalRangesRemoved++;
	          cleanupStats.totalDurationRemoved += range.end - range.start;
	          cleanupStats[`${type}Ranges`]++;
	          logger.info(this.tag, `Emergency cleanup queued ${type} range: [${range.start.toFixed(2)}, ${range.end.toFixed(2)}] (${(range.end - range.start).toFixed(1)}s)`);
	        } else {
	          logger.warn(this.tag, `Skipped unsafe emergency cleanup range for ${type}: [${range.start.toFixed(2)}, ${range.end.toFixed(2)}] - too close to currentTime ${currentTime}`);
	        }
	      }
	    }
	    logger.warn(this.tag, `Emergency cleanup summary: ${cleanupStats.totalRangesRemoved} ranges, ${cleanupStats.totalDurationRemoved.toFixed(1)}s total, video: ${cleanupStats.videoRanges}, audio: ${cleanupStats.audioRanges}`);

	    // 立即执行清理（紧急情况不延迟）
	    if (cleanupStats.totalRangesRemoved > 0) {
	      this.doRemoveRanges();
	    } else {
	      logger.warn(this.tag, 'Emergency cleanup found no safe ranges to remove');
	      this.isBufferFull = false; // 重置状态，避免死锁
	    }
	  }

	  // 计算紧急清理范围
	  calculateEmergencyCleanupRanges(sourceBuffer, currentTime, keepDuration) {
	    let ranges = [];
	    let keepStart = currentTime - keepDuration;

	    // 紧急模式下更激进的清理策略
	    for (let i = 0; i < sourceBuffer.buffered.length; i++) {
	      let bufferStart = sourceBuffer.buffered.start(i);
	      let bufferEnd = sourceBuffer.buffered.end(i);
	      if (bufferEnd < keepStart) {
	        // 完全清理超出保留范围的内容
	        ranges.push({
	          start: bufferStart,
	          end: bufferEnd
	        });
	      } else if (bufferStart < keepStart && bufferEnd > keepStart) {
	        // 部分清理：只清理keepStart之前的部分
	        ranges.push({
	          start: bufferStart,
	          end: keepStart
	        });
	      }

	      // 额外策略：如果单个范围过大（超过5分钟），强制分段清理
	      let duration = bufferEnd - bufferStart;
	      if (duration > 300) {
	        // 保留最后1分钟，清理前面的内容
	        let segmentKeepDuration = 60;
	        if (bufferEnd - segmentKeepDuration > bufferStart) {
	          ranges.push({
	            start: bufferStart,
	            end: bufferEnd - segmentKeepDuration
	          });
	        }
	      }
	    }
	    return ranges;
	  }

	  // 获取当前播放时间
	  // 支持两种模式：
	  // 1. 主线程模式：通过 video 元素的 currentTime 获取
	  // 2. Worker 模式：通过 SourceBuffer 的缓冲范围估算（DOM 不可用）
	  getCurrentTime() {
	    // 方式1：尝试从 DOM video 元素获取（主线程模式）
	    if (this._hasDOMAccess) {
	      try {
	        if (this.player && this.player.container) {
	          let videoElement = this.player.container.querySelector('video');
	          if (videoElement && videoElement.currentTime > 0) {
	            this._lastKnownTime = videoElement.currentTime;
	            return this._lastKnownTime;
	          }
	        }
	      } catch (error) {
	        logger.debug(this.tag, `getCurrentTime from DOM failed: ${error.message}`);
	      }
	    }

	    // 方式2：从 SourceBuffer 缓冲范围估算（Worker 模式或 DOM 不可用时）
	    try {
	      if (this.sourceBuffers.video && this.sourceBuffers.video.buffered.length > 0) {
	        let videoBuffer = this.sourceBuffers.video.buffered;
	        let bufferedEnd = videoBuffer.end(videoBuffer.length - 1);

	        // 使用缓冲区末尾减去一个小的偏移量作为当前时间的估算值
	        // 考虑到播放器通常接近缓冲区末尾，减去 keepDuration 是合理的
	        let estimatedTime = bufferedEnd - 5;
	        estimatedTime = Math.max(0, estimatedTime);

	        // 更新已知时间（只在前向移动时更新）
	        if (estimatedTime > this._lastKnownTime) {
	          this._lastKnownTime = estimatedTime;
	        }
	        return this._lastKnownTime;
	      }
	    } catch (error) {
	      logger.debug(this.tag, `getCurrentTime from buffer failed: ${error.message}`);
	    }

	    // 最终回退：使用上次已知的时间
	    return this._lastKnownTime;
	  }

	  // 获取详细的缓冲区信息
	  getDetailedBufferInfo() {
	    let currentTime = 0;
	    try {
	      currentTime = this.getCurrentTime();
	    } catch (error) {
	      logger.warn(this.tag, `getDetailedBufferInfo: failed to get currentTime: ${error.message}`);
	    }
	    let bufferInfo = {
	      video: {
	        ranges: [],
	        totalDuration: 0
	      },
	      audio: {
	        ranges: [],
	        totalDuration: 0
	      },
	      currentTime: currentTime,
	      playSpeed: this.currentPlaySpeed,
	      isHighSpeedMode: this.isHighSpeedMode
	    };
	    for (let type in this.sourceBuffers) {
	      let sb = this.sourceBuffers[type];
	      if (sb && sb.buffered) {
	        let ranges = [];
	        let totalDuration = 0;
	        for (let i = 0; i < sb.buffered.length; i++) {
	          let start = sb.buffered.start(i);
	          let end = sb.buffered.end(i);
	          let duration = end - start;
	          ranges.push({
	            start: start.toFixed(2),
	            end: end.toFixed(2),
	            duration: duration.toFixed(2)
	          });
	          totalDuration += duration;
	        }
	        bufferInfo[type] = {
	          ranges: ranges,
	          totalDuration: totalDuration.toFixed(2),
	          rangeCount: ranges.length
	        };
	      }
	    }
	    return bufferInfo;
	  }

	  // 检测多路播放环境
	  detectMultiPlayerEnvironment() {
	    try {
	      // 检查页面中有多少个播放器实例
	      let playerCount = 0;

	      // 检查video标签数量
	      playerCount += document.querySelectorAll('video').length;

	      // 检查canvas标签数量（可能用于软解渲染）
	      let canvasElements = document.querySelectorAll('canvas');
	      playerCount += canvasElements.length;

	      // 检查是否有播放器相关的容器
	      let playerContainers = document.querySelectorAll('[id*="player"], [class*="player"], [id*="video"], [class*="video"]');

	      // 保守估计：如果有多个相关元素，很可能是多路播放
	      let isMultiPlayer = playerCount >= 4 || playerContainers.length >= 4;
	      logger.info(this.tag, `Player environment detection: video=${document.querySelectorAll('video').length}, canvas=${canvasElements.length}, containers=${playerContainers.length}, isMulti=${isMultiPlayer}`);
	      return isMultiPlayer;
	    } catch (error) {
	      logger.warn(this.tag, `Multi-player detection failed: ${error.message}`);
	      return false;
	    }
	  }
	  onSourceBufferUpdateEnd() {
	    if (this.isDestroyed) {
	      return;
	    }
	    if (this.firstFrameAfterSeek) {
	      logger.warn(this.tag, `first frame after seek update end`);
	      this.emit('seekTime', {
	        time: this.seekTime
	      });
	      this.firstFrameAfterSeek = false;
	    }
	    if (this.requireSetMediaDuration) {
	      this.updateMediaSourceDuration();
	    } else if (this.hasPendingRemoveRanges()) {
	      this.doRemoveRanges();
	    } else if (this.hasPendingSegments()) {
	      this.doAppendSegments();
	    } else if (this.hasPendingEos) {
	      this.endOfStream();
	    }
	    //  this.emit(MSEEvents.UPDATE_END);
	  }
	  onSourceBufferError(e) {
	    logger.error(this.tag, `SourceBuffer Error: ${JSON.stringify(e)}`);
	    // this error might not always be fatal, just ignore it
	  }
	}

	//事件
	const EVENTS = {
	  state: 'state',
	  //播放器生命周期状态
	  videoInfo: 'videoInfo',
	  //视频信息
	  audioInfo: 'audioInfo',
	  //音频信息
	  error: 'error',
	  //出错信息
	  playbackTimestamp: 'playbackTimestamp',
	  //回放时间戳
	  recordState: 'recordState',
	  //录像状态
	  recordingTimestamp: 'recordingTimestamp',
	  //录像时间戳 
	  updateOptions: 'updateOptions',
	  //更新参数
	  talkState: 'talkState',
	  //对讲状态
	  stats: 'stats' //统计信息
	};

	class AudioCollection extends eventemitter3 {
	  player = undefined;
	  audioContext = undefined;
	  collecting = false;
	  userMediaStream = undefined;
	  mediaStreamSource = undefined;
	  hasRegisterTalkProcessor = false;
	  targetTalkSampleRate = 8000;
	  tag = 'AudioCollection';
	  constructor(player) {
	    super();
	    this.player = player;
	    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
	      latencyHint: 'interactive' // 使用浏览器原生采样率采集，最后再统一转 8k G711A
	    });
	    this.registerTalkProcessor();
	    logger.info(this.tag, 'created');
	  }
	  async start() {
	    if (this.collecting) {
	      logger.warn(this.tag, 'start, but now is audio collecting, ingore');
	      throw 'AudioCollection has started, not handle';
	    }

	    // 滤波器链路：高通滤波器 -> 低通滤波器 -> 增益控制
	    // 高通滤波器 - 移除低频干扰和电流声
	    this.highpassFilter = this.audioContext.createBiquadFilter();
	    this.highpassFilter.type = "highpass";
	    this.highpassFilter.frequency.value = 100; // 移除低频噪音，保留语音低频
	    this.highpassFilter.Q.value = 0.707;

	    // 低通滤波器 - G.711 窄带语音有效频段约 300Hz-3400Hz
	    this.biquadFilter = this.audioContext.createBiquadFilter();
	    this.biquadFilter.type = "lowpass";
	    this.biquadFilter.frequency.value = 3400;
	    this.biquadFilter.Q.value = 0.707;

	    // 增益控制 - 给 G.711 量化保留足够电平，同时避免过载
	    this.gainNode = this.audioContext.createGain();
	    this.gainNode.gain.value = 0.55;
	    if (this.player.options.audioEngine == 'worklet') {
	      this.workletNode = await this.createWorkletNode();
	    } else {
	      logger.warn(this.tag, 'now url not https, worklet not work');
	      throw 'url not https or use audio script engine, worklet not work';
	      // this.scriptNode = this.createScriptNode()
	    }
	    if (this.audioContext.state === 'suspended') {
	      await this.audioContext.resume();
	    }
	    logger.info(this.tag, `talk audio context sampleRate ${this.audioContext.sampleRate}`);
	    let stream = await window.navigator.mediaDevices.getUserMedia({
	      audio: {
	        latency: 0.02,
	        // 减少延迟
	        noiseSuppression: true,
	        // 降噪
	        autoGainControl: false,
	        // 关闭自动增益控制，减少电流声
	        echoCancellation: true,
	        // 回声消除
	        googEchoCancellation: true,
	        // Google 回声消除
	        googAutoGainControl: false,
	        // 关闭 Google 自动增益
	        googNoiseSuppression: true,
	        // Google 噪声抑制
	        googHighpassFilter: true,
	        // 高通滤波器
	        googEchoCancellation2: true,
	        // 增强回声消除
	        googDAEchoCancellation: true,
	        // DA回声消除
	        googAecExtendedFilter: true,
	        // 扩展回声滤波器
	        channelCount: 1
	      },
	      video: false
	    });
	    if (stream) {
	      //audiodata : microphone -> biquadfilter -> audionode

	      logger.info(this.tag, 'getUserMedia success');
	      this.userMediaStream = stream;
	      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

	      // 音频链路：麦克风 -> 高通滤波器 -> 低通滤波器 -> 增益控制 -> workletNode
	      this.mediaStreamSource.connect(this.highpassFilter);
	      this.highpassFilter.connect(this.biquadFilter);
	      this.biquadFilter.connect(this.gainNode);
	      this.gainNode.connect(this.workletNode); // 连接到worklet处理，不连接destination避免回音

	      logger.info(this.tag, 'start success');
	      this.collecting = true;
	    } else {
	      logger.info(this.tag, 'start faile, can not get micro stream');
	      throw 'can not get micro stream';
	    }
	  }
	  getMessagePort() {
	    return this.workletNode?.port;
	  }
	  stop() {
	    if (!this.collecting) {
	      logger.warn(this.tag, 'stop, but now audio is not collecting, ingore');
	      return;
	    }
	    if (this.userMediaStream) {
	      this.userMediaStream.getTracks && this.userMediaStream.getTracks().forEach(track => {
	        track.stop();
	      });
	      this.userMediaStream = null;
	    }
	    if (this.workletNode) {
	      this.workletNode.disconnect();
	      this.workletNode = null;
	    }
	    this.collecting = false;

	    // 清理音频节点
	    if (this.gainNode) {
	      this.gainNode.disconnect();
	      this.gainNode = null;
	    }
	    if (this.biquadFilter) {
	      this.biquadFilter.disconnect();
	      this.biquadFilter = null;
	    }
	    if (this.highpassFilter) {
	      this.highpassFilter.disconnect();
	      this.highpassFilter = null;
	    }
	    logger.info(this.tag, 'AudioCollection stop success');
	  }
	  destroy() {
	    this.stop();
	    this.audioContext = null;
	    logger.info(this.tag, 'AudioCollection destroy');
	  }

	  // createScriptNode() {
	  //     this.scriptChannle = new MessageChannel();
	  //     // const createScript = this.audioContext.createScriptProcessor || this.audioContext.createJavaScriptNode;
	  //     // let scriptNode = createScript.apply(this.audioContext, [256, 1, 0])

	  //      let scriptNode =  this.audioContext.createScriptProcessor(256, 1, 1)
	  //     scriptNode.onaudioprocess = (e) => {

	  //         let audioData = fltpToPcmALaw(e.inputBuffer.getChannelData(0))

	  //         this.scriptChannle.port1.postMessage({
	  //             message: "data",
	  //             audioData
	  //         }, [audioData.buffer]);

	  //     };

	  //     return scriptNode
	  // }

	  async registerTalkProcessor() {
	    function workletProcess() {
	      const TARGET_SAMPLE_RATE = 8000;
	      const TALK_FRAME_BYTES = 320; // G.711A 8kHz, 40ms, 1 byte per sample
	      const ALAW_SEG_END = [0xFF, 0x1FF, 0x3FF, 0x7FF, 0xFFF, 0x1FFF, 0x3FFF, 0x7FFF];
	      function linearToAlaw(pcmVal) {
	        let mask;
	        let seg;
	        if (pcmVal >= 0) {
	          mask = 0xD5; // sign (7th) bit = 1
	        } else {
	          mask = 0x55; // sign bit = 0
	          pcmVal = -pcmVal - 1;
	          if (pcmVal < 0) pcmVal = 0;
	        }

	        // 查找段号
	        seg = 0;
	        for (let i = 0; i < 8; i++) {
	          if (pcmVal <= ALAW_SEG_END[i]) {
	            seg = i;
	            break;
	          }
	          if (i === 7) seg = 7;
	        }

	        // 量化
	        let aval;
	        if (seg >= 8) {
	          // 超出范围，返回最大值
	          aval = 0x7F;
	        } else if (seg < 2) {
	          aval = pcmVal >> 4 & 0x0F;
	          aval |= seg << 4;
	        } else {
	          aval = pcmVal >> seg + 3 & 0x0F;
	          aval |= seg << 4;
	        }
	        return aval ^ mask;
	      }
	      function floatToAlaw(sample) {
	        let clipped = sample;
	        if (clipped > 1) {
	          clipped = 1;
	        } else if (clipped < -1) {
	          clipped = -1;
	        }
	        const pcm = clipped < 0 ? Math.round(clipped * 32768) : Math.round(clipped * 32767);
	        return linearToAlaw(pcm);
	      }
	      function concatFloat32(left, right) {
	        if (!left.length) {
	          return new Float32Array(right);
	        }
	        const result = new Float32Array(left.length + right.length);
	        result.set(left, 0);
	        result.set(right, left.length);
	        return result;
	      }
	      class TalkProcessor extends AudioWorkletProcessor {
	        constructor(options) {
	          super();
	          const processorOptions = options && options.processorOptions ? options.processorOptions : {};
	          this.targetSampleRate = processorOptions.targetSampleRate || TARGET_SAMPLE_RATE;
	          this.sourceSampleRate = sampleRate || this.targetSampleRate;
	          this.resampleRatio = this.sourceSampleRate / this.targetSampleRate;
	          this.inputCache = new Float32Array(0);
	          this.readPosition = 0;
	          this.frameBuffer = new Uint8Array(TALK_FRAME_BYTES);
	          this.frameOffset = 0;
	          this.gateGain = 1;
	          this.noiseFloor = 0.0008;
	          this.noiseOpenLevel = 0.004;
	        }
	        process(inputs, outputs, parameters) {
	          if (!inputs.length || !inputs[0].length) {
	            return true;
	          }
	          const input = inputs[0][0];
	          if (!input.length) {
	            return true;
	          }
	          const processedInput = this.preprocess(input);
	          this.inputCache = concatFloat32(this.inputCache, processedInput);
	          this.encodeAvailableSamples();
	          return true;
	        }
	        preprocess(input) {
	          let sumSquares = 0;
	          for (let i = 0; i < input.length; i++) {
	            const val = input[i];
	            sumSquares += val * val;
	          }
	          const rmsLevel = Math.sqrt(sumSquares / input.length);
	          let targetGateGain;
	          if (rmsLevel <= this.noiseFloor) {
	            targetGateGain = 0;
	          } else if (rmsLevel >= this.noiseOpenLevel) {
	            targetGateGain = 1;
	          } else {
	            targetGateGain = (rmsLevel - this.noiseFloor) / (this.noiseOpenLevel - this.noiseFloor);
	          }
	          const output = new Float32Array(input.length);
	          for (let i = 0; i < input.length; i++) {
	            const smooth = targetGateGain > this.gateGain ? 0.18 : 0.025;
	            this.gateGain += (targetGateGain - this.gateGain) * smooth;
	            let sample = input[i] * this.gateGain;
	            if (sample > 0.9) {
	              sample = 0.9;
	            } else if (sample < -0.9) {
	              sample = -0.9;
	            }
	            output[i] = sample;
	          }
	          return output;
	        }
	        encodeAvailableSamples() {
	          while (this.readPosition + 1 < this.inputCache.length) {
	            const index = Math.floor(this.readPosition);
	            const fraction = this.readPosition - index;
	            const current = this.inputCache[index];
	            const next = this.inputCache[index + 1];
	            const sample = current + (next - current) * fraction;
	            this.pushAlawSample(sample);
	            this.readPosition += this.resampleRatio;
	          }
	          const consumed = Math.floor(this.readPosition);
	          if (consumed > 0) {
	            const keepFrom = Math.min(consumed, this.inputCache.length);
	            this.inputCache = this.inputCache.slice(keepFrom);
	            this.readPosition -= keepFrom;
	          }
	        }
	        pushAlawSample(sample) {
	          this.frameBuffer[this.frameOffset++] = floatToAlaw(sample);
	          if (this.frameOffset === this.frameBuffer.length) {
	            const audioData = this.frameBuffer;
	            this.port.postMessage({
	              message: "data",
	              audioData
	            }, [audioData.buffer]);
	            this.frameBuffer = new Uint8Array(TALK_FRAME_BYTES);
	            this.frameOffset = 0;
	          }
	        }
	      }
	      registerProcessor('talk-processor', TalkProcessor);
	    }
	    const workletUrl = createWorkletModuleUrl(workletProcess);
	    await this.audioContext.audioWorklet.addModule(workletUrl);
	    URL.revokeObjectURL(workletUrl);
	    this.hasRegisterTalkProcessor = true;
	  }
	  async createWorkletNode() {
	    let task = new Promise(resolve => {
	      if (this.hasRegisterTalkProcessor) {
	        resolve();
	        return;
	      }
	      let timer = setInterval(() => {
	        if (this.hasRegisterTalkProcessor) {
	          clearInterval(timer);
	          resolve();
	          return;
	        }
	      }, 10);
	    });
	    await task;
	    let workletNode = new AudioWorkletNode(this.audioContext, 'talk-processor', {
	      processorOptions: {
	        targetSampleRate: this.targetTalkSampleRate
	      }
	    });
	    return workletNode;
	  }
	}

	const getUserMediaStat = {
	  NotGet: 1,
	  Getting: 2,
	  GetSucc: 3
	};
	class VideoWebRtcRender {
	  player;
	  width;
	  height;
	  tag = 'VideoWebRtcRender';
	  constructor(player, video) {
	    this.player = player;
	    this.video = video;
	    this.width = video.width;
	    this.height = video.height;
	    this.pc = new RTCPeerConnection({
	      iceServers: [{
	        urls: 'stun:1.13.164.76:3478' // STUN服务器
	      }, {
	        urls: 'turn:1.13.164.76:3478',
	        username: 'hemeng',
	        credential: '123456'
	      }]
	    });
	    this.stream = new MediaStream();
	    this.pc.ontrack = event => {
	      this.stream.addTrack(event.track);
	    };
	    this.video.srcObject = this.stream;
	    this.getState = getUserMediaStat.NotGet;
	  }
	  async createOfferSDP() {
	    // this.pc.addTransceiver("audio", {direction: "recvonly"});
	    this.pc.addTransceiver("audio", {
	      direction: "sendrecv"
	    });
	    this.pc.addTransceiver("video", {
	      direction: "recvonly"
	    });
	    const offer = await this.pc.createOffer();
	    await this.pc.setLocalDescription(offer);
	    this.pc.onicecandidate = function (event) {
	      if (event.candidate) {
	        console.log("收集到候选者信息:", event.candidate);
	      } else {
	        console.log('收集完成');
	      }
	    };

	    // 等待 2 秒后返回 SDP
	    return new Promise(resolve => {
	      setTimeout(() => {
	        let completeSDP = this.pc.localDescription.sdp;
	        console.log(completeSDP, 'completeSDP');
	        resolve(completeSDP);
	      }, 2000);
	    });
	  }
	  async setAnswerSDP(answerSDP) {
	    await this.pc.setRemoteDescription(new RTCSessionDescription({
	      type: 'answer',
	      sdp: answerSDP
	    }));
	    this.startPlayVideo();
	  }
	  startPlayVideo() {
	    this.video.play().then(() => {
	      logger.info(this.tag, 'video label start play');
	    }).catch(e => {
	      logger.info(this.tag, `video label start play err ${e}`);
	    });
	  }
	  mute() {
	    this.video.muted = true;
	  }
	  isMute() {
	    return this.video?.muted || this.video?.volume === 0;
	  }
	  unMute() {
	    this.video.muted = false;
	  }
	  setVolume(num) {
	    this.video.volume = num;
	  }
	  startTalk() {
	    if (this.getState == getUserMediaStat.NotGet) {
	      this.getState = getUserMediaStat.Getting;
	      navigator.mediaDevices.getUserMedia({
	        audio: {
	          echoCancellation: true
	        }
	      }).then(stream => {
	        // console.log(this.pc,'this.pc');
	        this.pc.addStream(stream);
	        this.microphoneStream = stream;
	        this.getState = getUserMediaStat.GetSucc;
	        // let pc = this.pc
	        // stream.getTracks().forEach((track) => pc.addTrack(track, stream))
	        logger.info(this.tag, `start talk, get microphone success and add microphone stream to webrtc`);
	        // stream.getTracks().forEach(track => {
	        //     this.pc.addTrack(track, stream);
	        //   });
	      }).catch(error => {
	        logger.error(this.tag, `start talk, get microphone fail ${error}`);
	        this.getState = getUserMediaStat.NotGet;
	      });
	    } else if (this.getState == getUserMediaStat.Getting) {
	      logger.warn(this.tag, `start talk, is getting microphone, nothing to do`);
	    } else if (this.getState == getUserMediaStat.GetSucc) {
	      this.microphoneStream.getTracks()[0].enabled = true;
	      logger.info(this.tag, `start talk, enable microphone`);
	    } else {
	      logger.error(this.tag, `start talk, but get microphone state ${this.getState} not predefined, some err happen`);
	    }
	    // setInterval(() => {
	    //     this.pc.getStats(null).then(stats => {
	    //         stats.forEach(report => {
	    //           if (report.type === "outbound-rtp" && report.kind === "audio") {
	    //             console.log(`音频发送码率：${report.bytesSent} bytes`);
	    //             console.log(`音频包发送：${report.packetsSent} packets`);
	    //           }
	    //         });
	    //       });
	    // }, 500);
	  }
	  stopTalk() {
	    if (this.getState == getUserMediaStat.NotGet) {
	      logger.warn(this.tag, `stop talk, microphone not get, nothing to do`);
	    } else if (this.getState == getUserMediaStat.Getting) {
	      logger.warn(this.tag, `stop talk, microphone is getting, nothing to do`);
	    } else if (this.getState == getUserMediaStat.GetSucc) {
	      this.microphoneStream.getTracks()[0].enabled = false;
	      logger.info(this.tag, `stop talk, disable microphone`);
	    } else {
	      logger.error(this.tag, `stop talk, but get microphone state ${this.getState} not predefined, some err happen`);
	    }
	  }
	  destroy() {
	    if (this.video) {
	      this.video.pause();
	      this.video.currentTime = 0;
	      if (this.video.srcObject) {
	        this.video.srcObject = null;
	        this.video.removeAttribute('srcObject');
	      }
	      try {
	        this.video.load();
	      } catch (e) {
	        // ignore
	      }
	    }
	    if (this.pc) {
	      this.pc.close();
	    }
	    logger.info(this.tag, 'VideoWebRtcRender destroy');
	  }
	}

	class SRSWebrtc extends eventemitter3 {
	  tag = 'SRSWebrtc';
	  constructor() {
	    super();
	  }
	  async startWebrtc(webrtcUrl, offerSDP) {
	    // var conf = this.prepareUrl(webrtcUrl);

	    var session = await new Promise((resolve, reject) => {
	      var data = {
	        OfferSDP: offerSDP
	      };

	      // logger.info(this.tag ,`Generated offer: ${JSON.stringify(conf)}` );

	      fetch(webrtcUrl, {
	        method: "POST",
	        headers: {
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify(data)
	      }).then(response => response.json()).then(result => {
	        if (result.Code == '0') {
	          resolve(result.Data.AnswerSDP);
	        } else {
	          reject(reason);
	          return;
	        }
	      }).catch(reason => {
	        reject(reason);
	      });
	    });
	    logger.info(this.tag, `Recv session: ${JSON.stringify(session)}`);
	    return session;
	  }
	  destroy() {
	    this.removeAllListeners();
	  }
	  prepareUrl(webrtcUrl) {
	    var urlObject = this.parse(webrtcUrl);
	    let defaultPath = '/webrtc-gateway/rtc/v1/play/';

	    // If user specifies the schema, use it as API schema.
	    var schema = urlObject.user_query.schema;
	    schema = schema ? schema + ':' : window.location.protocol;
	    var port = urlObject.port || 1985;
	    if (schema === 'https:') {
	      port = urlObject.port || 443;
	    }

	    // @see https://github.com/rtcdn/rtcdn-draft
	    var api = urlObject.user_query.play || defaultPath;
	    if (api.lastIndexOf('/') !== api.length - 1) {
	      api += '/';
	    }
	    apiUrl = schema + '//' + urlObject.server + ':' + port + api;
	    for (var key in urlObject.user_query) {
	      if (key !== 'api' && key !== 'play') {
	        apiUrl += '&' + key + '=' + urlObject.user_query[key];
	      }
	    }
	    // Replace /rtc/v1/play/&k=v to /rtc/v1/play/?k=v
	    var apiUrl = apiUrl.replace(api + '&', api + '?');
	    var streamUrl = urlObject.url;
	    return {
	      apiUrl: apiUrl,
	      streamUrl: streamUrl,
	      schema: schema,
	      urlObject: urlObject,
	      port: port,
	      tid: Number(parseInt(new Date().getTime() * Math.random() * 100)).toString(16).substr(0, 7)
	    };
	  }
	  parse(url) {
	    // @see: http://stackoverflow.com/questions/10469575/how-to-use-location-object-to-parse-url-without-redirecting-the-page-in-javascri
	    var a = document.createElement("a");
	    a.href = url.replace("rtmp://", "http://").replace("webrtc://", "http://").replace("rtc://", "http://");
	    var vhost = a.hostname;
	    var app = a.pathname.substr(1, a.pathname.lastIndexOf("/") - 1);
	    var stream = a.pathname.substr(a.pathname.lastIndexOf("/") + 1);

	    // parse the vhost in the params of app, that srs supports.
	    app = app.replace("...vhost...", "?vhost=");
	    if (app.indexOf("?") >= 0) {
	      var params = app.substr(app.indexOf("?"));
	      app = app.substr(0, app.indexOf("?"));
	      if (params.indexOf("vhost=") > 0) {
	        vhost = params.substr(params.indexOf("vhost=") + "vhost=".length);
	        if (vhost.indexOf("&") > 0) {
	          vhost = vhost.substr(0, vhost.indexOf("&"));
	        }
	      }
	    }

	    // when vhost equals to server, and server is ip,
	    // the vhost is __defaultVhost__
	    if (a.hostname === vhost) {
	      var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
	      if (re.test(a.hostname)) {
	        vhost = "__defaultVhost__";
	      }
	    }

	    // parse the schema
	    var schema = "rtmp";
	    if (url.indexOf("://") > 0) {
	      schema = url.substr(0, url.indexOf("://"));
	    }
	    var port = a.port;
	    if (!port) {
	      // Finger out by webrtc url, if contains http or https port, to overwrite default 1985.
	      if (schema === 'webrtc' && url.indexOf(`webrtc://${a.host}:`) === 0) {
	        port = url.indexOf(`webrtc://${a.host}:80`) === 0 ? 80 : 443;
	      }

	      // Guess by schema.
	      if (schema === 'http') {
	        port = 80;
	      } else if (schema === 'https') {
	        port = 443;
	      } else if (schema === 'rtmp') {
	        port = 1935;
	      }
	    }
	    var ret = {
	      url: url,
	      schema: schema,
	      server: a.hostname,
	      port: port,
	      vhost: vhost,
	      app: app,
	      stream: stream
	    };
	    this.fill_query(a.search, ret);

	    // For webrtc API, we use 443 if page is https, or schema specified it.
	    if (!ret.port) {
	      if (schema === 'webrtc' || schema === 'rtc') {
	        if (ret.user_query.schema === 'https') {
	          ret.port = 443;
	        } else if (window.location.href.indexOf('https://') === 0) {
	          ret.port = 443;
	        } else {
	          // For WebRTC, SRS use 1985 as default API port.
	          ret.port = 1985;
	        }
	      }
	    }
	    return ret;
	  }
	  fill_query(query_string, obj) {
	    // pure user query object.
	    obj.user_query = {};
	    if (query_string.length === 0) {
	      return;
	    }

	    // split again for angularjs.
	    if (query_string.indexOf("?") >= 0) {
	      query_string = query_string.split("?")[1];
	    }
	    var queries = query_string.split("&");
	    for (var i = 0; i < queries.length; i++) {
	      var elem = queries[i];
	      var query = elem.split("=");
	      obj[query[0]] = query[1];
	      obj.user_query[query[0]] = query[1];
	    }

	    // alias domain for vhost.
	    if (obj.domain) {
	      obj.vhost = obj.domain;
	    }
	  }
	}

	class MainPlayer extends eventemitter3 {
	  worker = undefined;
	  player;
	  audioplayer = undefined;
	  audiocollection = undefined;
	  render = undefined;
	  mserender = undefined;
	  wrtrender = undefined;
	  srsWebrtc = undefined;
	  isDestoryed = false;
	  tag = 'MainPlayer';
	  constructor(player) {
	    super();
	    this.player = player;
	    logger.info(this.tag, `start worker thread ${player.options.decoderMode}`);
	    if (this.player.options.useWebRtcRender) {
	      this.playerui = new PlayerUI(this.player);
	      this.wrtrender = new VideoWebRtcRender(this.player, this.playerui.getVideo());
	      if (this.player.options.streamBusiType == STREAM_BUSI_TYPE.hmWebRtc) {
	        this.srsWebrtc = new SRSWebrtc();
	        this.wrtrender.createOfferSDP().then(offerSDP => {
	          console.log(offerSDP, 'offerSDP');
	          this.srsWebrtc.startWebrtc(this.player.options.webrtcUrl, offerSDP).then(answerSDP => {
	            this.wrtrender.setAnswerSDP(answerSDP);
	          }).catch(error => {
	            logger.info(this.tag, `SRSWebrtc start fail ${JSON.stringify(error)}`);
	          });
	        });
	      }
	    } else {
	      this.audiocollection = new AudioCollection(player);
	      this.createWorker();
	    }
	  }
	  createWorker() {
	    this.worker = new Worker('worker.js');
	    this.worker.onmessageerror = event => {
	      logger.info(this.tag, `start worker thread err ${event}`);
	    };
	    this.worker.onmessage = event => {
	      const msg = event.data;
	      switch (msg.cmd) {
	        case WORKER_EVENT_TYPE.created:
	          {
	            this.worker.postMessage({
	              cmd: WORKER_SEND_TYPE.init,
	              options: JSON.stringify(this.player.options)
	            });
	            break;
	          }
	        case WORKER_EVENT_TYPE.inited:
	          {
	            break;
	          }
	        case WORKER_EVENT_TYPE.destroyed:
	          {
	            logger.info(this.tag, 'mediacenter receive destroyed msg');
	            this.worker.terminate();
	            if (this.destroyResolve) {
	              logger.info(this.tag, 'mediacenter receive destroyed msg and complete async destroyWorker task');
	              this.destroyResolve();
	              this.destroyResolve = undefined;
	            }
	            break;
	          }
	        case WORKER_EVENT_TYPE.updateRenderOptions:
	          {
	            //这3个属性获取到音视频参数后才能确定
	            this.player.options.renderMode = msg.renderMode;
	            this.player.options.useMSEAudioWhenMSERenderMode = msg.useMSEAudioWhenMSERenderMode;
	            this.player.options.decoderMode = msg.decoderMode;
	            this.emit('event', {
	              event: EVENTS.updateOptions,
	              params: this.player.options
	            });
	            logger.info(this.tag, `updateOptions: ${JSON.stringify(this.player.options)}`);
	            this.initAVRender(msg.mediasourceHandle);
	            let offScreenCanvas;
	            let transferList = [];
	            if (this.player.options.renderMode == 'canvas' && this.player.options.useOffScreenCanvasRender) {
	              offScreenCanvas = this.playerui.getOffScreenCanvas();
	              transferList.push(offScreenCanvas);
	            }
	            this.worker.postMessage({
	              cmd: WORKER_SEND_TYPE.renderOptionsUpdated,
	              offScreenCanvas
	            }, transferList);
	            break;
	          }
	        case WORKER_EVENT_TYPE.videoInfo:
	          {
	            break;
	          }
	        case WORKER_EVENT_TYPE.videoFrame:
	          {
	            if (this.isDestoryed) {
	              return;
	            }
	            this.render.renderOneFrame(msg.videoFrame, msg.ext);
	            break;
	          }
	        case WORKER_EVENT_TYPE.audioInfo:
	          {
	            this.audioplayer?.setAudioInfo(msg.atype, msg.sampleRate, msg.channels, msg.samplesPerPacket).then(() => {
	              if (this.player.options.audioEngine == 'worklet') {
	                this.worker.postMessage({
	                  cmd: WORKER_SEND_TYPE.initWorkletMesssagePort,
	                  port: this.audioplayer.workletNode.port
	                }, [this.audioplayer.workletNode.port]);
	              }
	            });
	            break;
	          }
	        case WORKER_EVENT_TYPE.pcmData:
	          {
	            if (this.isDestoryed) {
	              return;
	            }
	            let packet = {
	              datas: msg.datas,
	              timestamp: msg.timestamp
	            };
	            this.audioplayer.pushPcmData(packet);
	            break;
	          }
	        case WORKER_EVENT_TYPE.recordFinish:
	          {
	            if (this.isDestoryed) {
	              return;
	            }
	            let data = msg.data;

	            // 将数据保存到本地
	            const blob = new Blob([data.buffer], {
	              type: 'video/mp4'
	            });
	            const url = URL.createObjectURL(blob);
	            const link = document.createElement('a');
	            link.href = url;
	            link.download = 'output.mp4';
	            document.body.appendChild(link);
	            link.click();
	            break;
	          }
	        case WORKER_EVENT_TYPE.seekTime:
	          {
	            let time = msg.timeObj.time;
	            this.mserender?.seekTime(time);
	            break;
	          }
	        case WORKER_EVENT_TYPE.initSegment:
	          {
	            this.msectrl.appendInitSegment(msg.segment);
	            break;
	          }
	        case WORKER_EVENT_TYPE.mediaSegment:
	          {
	            if (msg.segment.firstFrameAfterSeek) {
	              this.msectrl.flush();
	            }
	            this.msectrl.appendMediaSegment(msg.segment);
	            break;
	          }
	        case WORKER_EVENT_TYPE.event:
	          {
	            this.emit('event', msg.evtobj);
	            break;
	          }
	        case WORKER_EVENT_TYPE.playAbnormal:
	          {
	            this.emit('playAbnormal', msg.info);
	            break;
	          }
	        case WORKER_EVENT_TYPE.requestEncWSSKey:
	          {
	            this.emit('requestEncWSSKey', msg.encWssKey);
	            break;
	          }
	        case WORKER_EVENT_TYPE.logData:
	          {
	            logger.appendLog(msg.log);
	            break;
	          }
	      }
	    };
	  }
	  initAVRender(mediasourceHandle) {
	    this.playerui = new PlayerUI(this.player);
	    if (this.player.options.renderMode == 'canvas') {
	      if (!this.player.options.useOffScreenCanvasRender) {
	        this.render = new CanvasRender(this.player, this.playerui.getCanvas()); // render yuv
	      }
	    } else {
	      //mse

	      this.mserender = new VideoMSERender(this.player, this.playerui.getVideo());
	      if (!this.player.options.useWorkerForMSE) {
	        this.msectrl = new MSEController(this.player);
	        this.msectrl.on('playAbnormal', info => {
	          this.emit('playAbnormal', info);
	        });

	        // 新增：监听缓冲溢出事件
	        this.msectrl.on('bufferOverflow', info => {
	          logger.warn(this.tag, `Buffer overflow detected at ${info.playSpeed}x speed, performing smart recovery`);
	          this.performBufferRecovery(info);
	        });
	        this.msectrl.on('seekTime', timeObj => {
	          this.mserender?.seekTime(timeObj.time);
	        });
	        this.mserender.setMediaSourceObjectUrl(this.msectrl.getObjectURL());
	      } else {
	        this.mserender.setMediaSourceHandle(mediasourceHandle);
	      }
	    }
	    if (this.player.options.renderMode != 'mse' || !this.player.options.useMSEAudioWhenMSERenderMode) {
	      this.audioplayer = new AudioPlayer(this.player);
	    }
	  }
	  async destroyWorker() {
	    return new Promise(resolve => {
	      this.destroyResolve = resolve;
	      this.worker.postMessage({
	        cmd: WORKER_SEND_TYPE.destroy
	      });
	      setTimeout(() => {
	        if (this.destroyResolve) {
	          this.worker.terminate();
	          this.destroyResolve();
	          this.destroyResolve = undefined;
	          logger.warn(this.tag, 'MainPlayer wait for 3 sec but destroyed msg not received, so force async destroyWorker task complete');
	        }
	      }, 3000);
	    });
	  }
	  async destroy() {
	    this.removeAllListeners();
	    this.isDestoryed = true;
	    if (this.worker) {
	      await this.destroyWorker();
	    }
	    this.srsWebrtc?.destroy();
	    this.wrtrender?.destroy();
	    this.audioplayer?.destroy();
	    this.render?.destroy();
	    this.msectrl?.destroy();
	    this.mserender?.destroy();
	    this.playerui?.destroy();
	    this.audiocollection?.destroy();
	    logger.info(this.tag, 'MainPlayer destroy');
	  }
	  unMute() {
	    if (this.player.options.useWebRtcRender) {
	      this.wrtrender.unMute();
	    } else if (this.player.options.renderMode == 'mse' && this.player.options.useMSEAudioWhenMSERenderMode) {
	      this.mserender.unMute();
	    } else {
	      this.audioplayer.unMute();
	    }
	  }
	  mute() {
	    if (this.player.options.useWebRtcRender) {
	      this.wrtrender.mute();
	    } else if (this.player.options.renderMode == 'mse' && this.player.options.useMSEAudioWhenMSERenderMode) {
	      this.mserender.mute();
	    } else {
	      this.audioplayer.mute();
	    }
	  }
	  setVolume(num) {
	    if (this.player.options.useWebRtcRender) {
	      this.wrtrender.setVolume(num);
	    } else if (this.player.options.renderMode == 'mse' && this.player.options.useMSEAudioWhenMSERenderMode) {
	      this.mserender.setVolume(num);
	    } else {
	      this.audioplayer.setVolume(num);
	    }
	  }
	  isPlaybackMuted() {
	    if (this.player.options.useWebRtcRender) {
	      return this.wrtrender?.isMute?.() ?? true;
	    } else if (this.player.options.renderMode == 'mse' && this.player.options.useMSEAudioWhenMSERenderMode) {
	      return this.mserender?.isMute?.() ?? true;
	    } else {
	      return this.audioplayer?.isMute?.() ?? true;
	    }
	  }
	  switchRender(canvasRenderMode) {
	    if (this.player.options.renderMode != 'canvas') {
	      return;
	    }
	    if (this.player.options.useOffScreenCanvasRender) {
	      this.worker.postMessage({
	        cmd: WORKER_SEND_TYPE.switchRender,
	        canvasRenderMode
	      });
	    } else {
	      this.render.switchRender(canvasRenderMode);
	    }
	  }
	  startRecord(recordAVMode) {
	    this.worker.postMessage({
	      cmd: WORKER_SEND_TYPE.startRecord,
	      recordAVMode
	    });
	  }
	  stopRecord() {
	    this.worker.postMessage({
	      cmd: WORKER_SEND_TYPE.stopRecord
	    });
	  }
	  resizeView() {
	    this.playerui?.resizeView();
	    this.render?.resizeView();
	    this.worker.postMessage({
	      cmd: WORKER_SEND_TYPE.resizeView,
	      params: {
	        x: this.player.options.x,
	        y: this.player.options.y,
	        width: this.player.options.width,
	        height: this.player.options.height
	      }
	    });
	  }
	  updateRenderOptions() {
	    this.playerui?.updateRenderOptions();
	    this.render?.updateRenderOptions();
	    this.worker?.postMessage({
	      cmd: WORKER_SEND_TYPE.updateRenderOptions,
	      renderOptions: this.player.options.renderOptions
	    });
	  }
	  setFullscreen(flag) {
	    this.playerui?.setFullscreen(flag);
	  }
	  isFullscreen() {
	    return this.playerui?.isFullscreen() ?? false;
	  }
	  screenshot(filename, format = 'png', quality = 0.92, type = 'download') {
	    logger.info(this.tag, `screenshot: filename=${filename}, format=${format}, quality=${quality}, type=${type}`);
	    try {
	      // 生成默认文件名
	      if (!filename) {
	        const now = new Date();
	        filename = `screenshot_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
	      }

	      // 验证格式参数
	      const validFormats = ['png', 'jpeg', 'webp'];
	      if (!validFormats.includes(format)) {
	        logger.warn(this.tag, `Invalid format: ${format}, using png`);
	        format = 'png';
	      }

	      // 验证类型参数
	      const validTypes = ['download', 'base64', 'blob'];
	      if (!validTypes.includes(type)) {
	        logger.warn(this.tag, `Invalid type: ${type}, using download`);
	        type = 'download';
	      }

	      // 根据渲染模式进行截图
	      if (this.player.options.useWebRtcRender && this.wrtrender) {
	        // WebRTC 渲染模式
	        return this._screenshotFromVideo(filename, format, quality, type);
	      } else if (this.player.options.renderMode === 'canvas') {
	        if (this.player.options.useOffScreenCanvasRender) {
	          // 离屏 Canvas 渲染模式，需要通过 Worker 获取截图
	          return this._screenshotFromOffscreenCanvas(filename, format, quality, type);
	        } else {
	          // 主线程 Canvas 渲染模式
	          return this._screenshotFromCanvas(filename, format, quality, type);
	        }
	      } else if (this.player.options.renderMode === 'mse' && this.playerui) {
	        // MSE 渲染模式
	        return this._screenshotFromVideo(filename, format, quality, type);
	      } else {
	        logger.warn(this.tag, 'Screenshot failed: no valid render mode found');
	        return null;
	      }
	    } catch (error) {
	      logger.error(this.tag, `Screenshot failed: ${error.message}`);
	      return null;
	    }
	  }
	  _screenshotFromCanvas(filename, format, quality, type) {
	    const canvas = this.playerui?.getCanvas();
	    if (!canvas) {
	      logger.warn(this.tag, 'Screenshot failed: canvas not found');
	      return null;
	    }
	    try {
	      const mimeType = `image/${format}`;
	      let dataURL;
	      if (format === 'png') {
	        dataURL = canvas.toDataURL(mimeType);
	      } else {
	        dataURL = canvas.toDataURL(mimeType, quality);
	      }
	      return this._processScreenshotResult(dataURL, filename, format, type);
	    } catch (error) {
	      logger.error(this.tag, `Canvas screenshot failed: ${error.message}`);
	      return null;
	    }
	  }
	  _screenshotFromVideo(filename, format, quality, type) {
	    const video = this.playerui?.getVideo();
	    if (!video) {
	      logger.warn(this.tag, 'Screenshot failed: video element not found');
	      return null;
	    }
	    if (video.readyState < 2) {
	      logger.warn(this.tag, 'Screenshot failed: video not ready');
	      return null;
	    }
	    try {
	      // 创建临时 canvas
	      const tempCanvas = document.createElement('canvas');
	      tempCanvas.width = video.videoWidth || video.width;
	      tempCanvas.height = video.videoHeight || video.height;
	      const ctx = tempCanvas.getContext('2d');

	      // 将视频当前帧绘制到 canvas
	      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
	      const mimeType = `image/${format}`;
	      let dataURL;
	      if (format === 'png') {
	        dataURL = tempCanvas.toDataURL(mimeType);
	      } else {
	        dataURL = tempCanvas.toDataURL(mimeType, quality);
	      }
	      return this._processScreenshotResult(dataURL, filename, format, type);
	    } catch (error) {
	      logger.error(this.tag, `Video screenshot failed: ${error.message}`);
	      return null;
	    }
	  }
	  _screenshotFromOffscreenCanvas(filename, format, quality, type) {
	    return new Promise((resolve, reject) => {
	      // 创建一个临时的消息处理器来接收截图数据
	      const handleScreenshotResponse = event => {
	        const msg = event.data;
	        if (msg.cmd === WORKER_EVENT_TYPE.screenshotResult) {
	          this.worker.removeEventListener('message', handleScreenshotResponse);
	          if (msg.success) {
	            const result = this._processScreenshotResult(msg.dataURL, filename, format, type);
	            resolve(result);
	          } else {
	            logger.error(this.tag, `Offscreen canvas screenshot failed: ${msg.error}`);
	            reject(new Error(msg.error));
	          }
	        }
	      };
	      this.worker.addEventListener('message', handleScreenshotResponse);

	      // 向 Worker 发送截图请求
	      this.worker.postMessage({
	        cmd: WORKER_SEND_TYPE.screenshot,
	        params: {
	          filename,
	          format,
	          quality,
	          type
	        }
	      });

	      // 设置超时
	      setTimeout(() => {
	        this.worker.removeEventListener('message', handleScreenshotResponse);
	        reject(new Error('Screenshot timeout'));
	      }, 5000);
	    });
	  }
	  _processScreenshotResult(dataURL, filename, format, type) {
	    if (type === 'base64') {
	      return dataURL;
	    }

	    // 将 dataURL 转换为 Blob
	    const byteString = atob(dataURL.split(',')[1]);
	    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
	    const ab = new ArrayBuffer(byteString.length);
	    const ia = new Uint8Array(ab);
	    for (let i = 0; i < byteString.length; i++) {
	      ia[i] = byteString.charCodeAt(i);
	    }
	    const blob = new Blob([ab], {
	      type: mimeString
	    });
	    if (type === 'blob') {
	      return blob;
	    }

	    // 默认为下载
	    const url = URL.createObjectURL(blob);
	    const link = document.createElement('a');
	    link.href = url;
	    link.download = `${filename}.${format}`;
	    document.body.appendChild(link);
	    link.click();
	    document.body.removeChild(link);
	    setTimeout(() => {
	      URL.revokeObjectURL(url);
	    }, 500);
	    logger.info(this.tag, `Screenshot saved: ${filename}.${format}`);
	  }
	  startTalk(talkParams) {
	    if (this.player.options.useWebRtcRender) {
	      this.wrtrender?.startTalk();
	    } else {
	      // 对讲时静音播放端，防止扬声器声音被麦克风采集形成回声/啸叫
	      this._wasMutedBeforeTalk = this.isPlaybackMuted();
	      if (!this._wasMutedBeforeTalk) {
	        this.mute();
	        logger.info(this.tag, 'mute audio playback during talk to prevent echo');
	      }
	      this.audiocollection?.start().then(() => {
	        let port = this.audiocollection.getMessagePort();
	        this.worker.postMessage({
	          cmd: WORKER_SEND_TYPE.startTalk,
	          port,
	          talkParams
	        }, [port]);
	      }).catch(e => {
	        logger.error(this.tag, `startTalk error: ${e}`);
	        // 启动失败时恢复音频
	        if (!this._wasMutedBeforeTalk) {
	          this.unMute();
	        }
	      });
	    }
	  }
	  stopTalk() {
	    if (this.player.options.useWebRtcRender) {
	      this.wrtrender?.stopTalk();
	    } else {
	      this.audiocollection?.stop();
	      this.worker.postMessage({
	        cmd: WORKER_SEND_TYPE.stopTalk
	      });

	      // 对讲结束后恢复播放端音频
	      if (!this._wasMutedBeforeTalk) {
	        this.unMute();
	        logger.info(this.tag, 'unmute audio playback after talk ended');
	      }
	    }
	  }
	  seekTFCardStream(playTime) {
	    this.worker.postMessage({
	      cmd: WORKER_SEND_TYPE.seekTFCardStream,
	      playTime
	    });
	  }
	  seekCloudStream(playTime) {
	    this.worker.postMessage({
	      cmd: WORKER_SEND_TYPE.seekCloudStream,
	      playTime
	    });
	  }
	  startEncWSSStream(playUrl) {
	    this.worker?.postMessage({
	      cmd: WORKER_SEND_TYPE.startEncWSSStream,
	      playUrl
	    });
	  }
	  playScaleStream(playSpeed) {
	    // 通知MSE控制器播放速度变化
	    if (this.msectrl) {
	      this.msectrl.setPlaySpeed(playSpeed);
	    }

	    // 对于worker模式下的MSE渲染，通过worker传递播放速度
	    if (this.player.options.renderMode === 'mse' && this.player.options.useWorkerForMSE) {
	      // Worker会处理MSE相关的播放速度设置
	      this.worker.postMessage({
	        cmd: WORKER_SEND_TYPE.playScaleStream,
	        playSpeed,
	        enableMSESpeedOptimization: true
	      });
	    } else {
	      this.worker.postMessage({
	        cmd: WORKER_SEND_TYPE.playScaleStream,
	        playSpeed
	      });
	    }
	  }
	  pauseStream() {
	    this.worker.postMessage({
	      cmd: WORKER_SEND_TYPE.pauseStream
	    });
	  }
	  resumeStream() {
	    this.worker.postMessage({
	      cmd: WORKER_SEND_TYPE.resumeStream
	    });
	  }

	  // 新增：缓冲恢复方法
	  performBufferRecovery(info) {
	    logger.info(this.tag, 'Performing buffer recovery...');

	    // 暂停数据流
	    this.pauseStream();

	    // 等待缓冲清理完成
	    setTimeout(() => {
	      // 恢复数据流
	      this.resumeStream();
	      logger.info(this.tag, 'Buffer recovery completed');
	    }, 2000);
	  }
	}

	// mse 硬解失败记录（按流），避免每次都先出图再黑一下
	// 播放器逻辑改了（比如这版改 hvc1 + 剥参数集）就把版本号 +1，让老记录失效、自动重试一次硬解
	const MSE_FAIL_CACHE_KEY = 'HMWebPlayerMseDecodeFail';
	const MSE_FAIL_CACHE_VERSION = 2;
	const MSE_FAIL_CACHE_EXPIRE = 7 * 24 * 3600 * 1000;
	const DEFAULT_PLAYER_OPTIONS = {
	  logEnable: false,
	  logLevel: 'info',
	  container: '',
	  //外部容器，用于放置渲染画面

	  playMode: 'live',
	  //live 或者 playback

	  useWebRtcRender: false,
	  // 是否是webrtc，采用独立的渲染方式，不受renderMode控制

	  renderMode: 'canvas',
	  // canvas, mse
	  useOffScreenCanvasRender: false,
	  // 线程里渲染canvas
	  canvasRenderMode: 'normal',
	  // normal:正常
	  canvasRenderAccelerationMode: 'webgl',
	  //webgl
	  useWorkerForMSE: true,
	  //线程里渲染mse
	  disableAudioForMSE: false,
	  //是否禁用mse的音频
	  enableMseFallbackCache: true,
	  //mse 硬解失败过的流，下次直接走 canvas 软解（避免"出图→黑一下→再出图"）
	  useMSEAudioWhenMSERenderMode: true,
	  //当使用MSE 渲染模式时，声音是否使用MSE播放
	  audioEngine: "worklet",
	  //script, worklet,

	  x: 0,
	  y: 0,
	  width: 480,
	  height: 480,
	  renderOptions: {
	    contentFit: ContentFitType.contain,
	    //内容填充模式, 默认是 contain
	    brightness: 1.0,
	    //亮度，默认是1.0, 范围  [0, 2.55]
	    saturate: 1.0,
	    //饱和度，默认是1.0, 范围  [0, 2.55]
	    contrast: 1.0,
	    //对比度，默认是1.0, 范围  [0, 2.55]
	    huerotate: 0 //色度偏移（角度），默认是 0度, 范围  [0, 180]
	  },
	  videoBuffer: 500,
	  //缓冲时长 ms
	  videoBufferDelay: 500,
	  //播放允许的延迟 ms

	  // 新增：缓冲管理选项
	  enableAggressiveBufferCleanup: true,
	  // 启用激进缓冲清理
	  highSpeedBufferLimit: 50,
	  // 高倍速模式缓冲限制(秒)
	  normalBufferLimit: 120,
	  // 正常模式缓冲限制(秒)
	  emergencyBufferLimit: 5,
	  // 紧急情况保留时长(秒)

	  // 多播放器优化选项
	  multiPlayerOptimization: true,
	  // 启用多播放器优化
	  multiPlayerBufferLimit: 30,
	  // 多播放器环境下的缓冲限制(秒)
	  multiPlayerMaxInstances: 8,
	  // 支持的最大播放器实例数

	  retryCnt: -1,
	  //拉流失败重试次数
	  retryDelay: 5,
	  //重试时延 5000

	  decoderMode: "normal",
	  streamBusiType: STREAM_BUSI_TYPE.flv,
	  //'flv', 'hmLiveStream'
	  url: '',
	  //flv播放地址

	  userToken: '',
	  // hmLiveStream 的参数
	  peerId: '',
	  playUrl: '',
	  resourceId: '',
	  encType: 0,
	  encKey: '',
	  encLoad: '',
	  camId: 0,
	  streamId: 0,
	  audioFlag: -1,
	  channelNum: 0,
	  webrtcUrl: ''
	};
	class HMWebPlayer extends eventemitter3 {
	  options = undefined;
	  mainplayer = undefined;
	  tag = 'HMWebPlayer';
	  constructor(options) {
	    super();
	    let renderOptions = Object.assign({}, DEFAULT_PLAYER_OPTIONS.renderOptions, options.renderOptions);
	    this.options = Object.assign({}, DEFAULT_PLAYER_OPTIONS, options);
	    this.options.renderOptions = renderOptions;
	    if (!this.options.playerId) {
	      this.options.playerId = GenRandomString(6);
	    }
	    createLogger(this, this.options.logEnable, this.options.logLevel);

	    // 支持dom id 或者 dom 元素
	    if (typeof this.options.container === 'string') {
	      logger.info(this.tag, `container is dom id`);
	      this.container = document.getElementById(this.options.container);
	    } else {
	      logger.info(this.tag, `container is dom element`);
	      this.container = this.options.container;
	    }
	    this.correctAbility();

	    // 多播放器环境检测和优化
	    this.optimizeForMultiPlayer();
	    logger.info(this.tag, `new player success, options: ${JSON.stringify(this.options)}`);
	  }
	  correctAbility() {
	    //根据浏览器能力矫正一些属性 useOffScreenCanvasRender, useWorkerForMSE, audioEngine

	    if (this.options.useOffScreenCanvasRender) {
	      this.options.useOffScreenCanvasRender = supportOffScreenCanvas();
	    }
	    if (this.options.renderMode == 'mse') {
	      if (!supportMSE()) {
	        this.options.renderMode = 'canvas';
	      }
	    }
	    if (this.options.useWorkerForMSE) {
	      this.options.useWorkerForMSE = supportMSEForWorker();
	    }
	    if (this.options.renderMode != 'mse') {
	      this.options.useMSEAudioWhenMSERenderMode = false;
	    }
	    if (this.options.audioEngine == 'worklet') {
	      if (window.location.protocol != 'https:' && window.location.hostname != '127.0.0.1' && window.location.hostname != 'localhost') {
	        this.options.audioEngine = 'script';
	      }
	    }
	  }

	  // 多播放器环境优化
	  optimizeForMultiPlayer() {
	    if (!this.options.multiPlayerOptimization) {
	      return;
	    }
	    try {
	      // 统计当前播放器实例数
	      let existingPlayers = 0;

	      // 统计video元素数量
	      existingPlayers += document.querySelectorAll('video').length;

	      // 统计canvas元素数量（软解码渲染）
	      existingPlayers += document.querySelectorAll('canvas').length;

	      // 统计播放器相关容器
	      let playerContainers = document.querySelectorAll('[id*="player"], [class*="player"], [id*="video"], [class*="video"]');
	      existingPlayers += playerContainers.length;
	      logger.info(this.tag, `Multi-player optimization: detected ${existingPlayers} existing players`);

	      // 如果检测到多播放器环境，应用优化策略
	      if (existingPlayers >= 4) {
	        // 调整缓冲区设置
	        this.options.videoBuffer = Math.min(this.options.videoBuffer, 200); // 降低到200ms
	        this.options.videoBufferDelay = Math.min(this.options.videoBufferDelay, 200);

	        // 应用多播放器缓冲限制
	        this.options.normalBufferLimit = this.options.multiPlayerBufferLimit;
	        this.options.highSpeedBufferLimit = Math.min(this.options.highSpeedBufferLimit, 20); // 高倍速时更严格

	        // 强制启用激进缓冲清理
	        this.options.enableAggressiveBufferCleanup = true;

	        // 多播放器环境下优先使用软解码以降低GPU压力
	        if (existingPlayers >= 6 && this.options.decoderMode === 'normal') {
	          this.options.decoderMode = 'soft-simd';
	          logger.info(this.tag, `Multi-player: switching to soft-simd decoder mode for better resource usage`);
	        }

	        // 8路以上时进一步优化
	        if (existingPlayers >= 8) {
	          this.options.useOffScreenCanvasRender = false; // 禁用离屏渲染以降低内存消耗
	          this.options.canvasRenderAccelerationMode = 'webgl'; // 确保使用webgl以提高性能
	          logger.info(this.tag, `8+ players detected: applying aggressive optimizations`);
	        }
	        logger.info(this.tag, `Multi-player optimizations applied: bufferMs=${this.options.videoBuffer}, normalLimit=${this.options.normalBufferLimit}, highSpeedLimit=${this.options.highSpeedBufferLimit}`);
	      }
	    } catch (error) {
	      logger.warn(this.tag, `Multi-player optimization failed: ${error.message}`);
	    }
	  }
	  startFlv(url) {
	    this.options.useWebRtcRender = false;
	    this.options.streamBusiType = STREAM_BUSI_TYPE.flv;
	    this.options.url = url;
	    this.start();
	  }
	  startHMLiveStream(userToken, peerId, playUrl, resourceId, encType, encKey, encLoad, camId, streamId, audioFlag, channelNum) {
	    this.options.useWebRtcRender = false;
	    this.options.streamBusiType = STREAM_BUSI_TYPE.hmLiveStream;
	    this.options.userToken = userToken;
	    this.options.peerId = peerId;
	    this.options.playUrl = playUrl;
	    this.options.resourceId = resourceId;
	    this.options.encType = encType;
	    this.options.encKey = encKey;
	    this.options.encLoad = encLoad;
	    this.options.camId = camId;
	    this.options.streamId = streamId;
	    this.options.audioFlag = audioFlag;
	    this.options.channelNum = channelNum;
	    this.start();
	  }
	  startHMTFCardStream(userToken, peerId, playUrl, resourceId, encType, encKey, encLoad, playTime) {
	    this.options.useWebRtcRender = false;
	    this.options.streamBusiType = STREAM_BUSI_TYPE.hmTFCardStream;
	    this.options.userToken = userToken;
	    this.options.peerId = peerId;
	    this.options.playUrl = playUrl;
	    this.options.resourceId = resourceId;
	    this.options.encType = encType;
	    this.options.encKey = encKey;
	    this.options.encLoad = encLoad;
	    this.options.playTime = playTime;
	    this.options.playMode = 'playback';
	    this.start();
	  }

	  /**
	   * 云存回放走流媒体平台（223A/223B），C 层复用卡回放通道
	   * 单目 camId=0；多目每路一个播放器实例，分别传 0..N-1（不支持 65535/0xFFFFF）
	   */
	  startHMCloudStreamByPlat(userToken, peerId, playUrl, resourceId, encType, encKey, encLoad, camId, playTime) {
	    this.options.useWebRtcRender = false;
	    this.options.streamBusiType = STREAM_BUSI_TYPE.hmCloudStreamByPlat;
	    this.options.userToken = userToken;
	    this.options.peerId = peerId;
	    this.options.playUrl = playUrl;
	    this.options.resourceId = resourceId;
	    this.options.encType = encType;
	    this.options.encKey = encKey;
	    this.options.encLoad = encLoad;
	    this.options.camId = camId;
	    this.options.playTime = playTime;
	    this.options.playMode = 'playback';
	    this.start();
	  }
	  startHMWebRtc(webrtcUrl) {
	    this.options.useWebRtcRender = true;
	    this.options.streamBusiType = STREAM_BUSI_TYPE.hmWebRtc;
	    this.options.webrtcUrl = webrtcUrl;
	    this.start();
	  }

	  /**
	   * 旧直连云存切片（COS/HTTP）回放，保留作为兜底；新链路请用 startHMCloudStreamByPlat
	   */
	  startHMCloudStream(peerId, camId, playTime, videoList) {
	    this.options.streamBusiType = STREAM_BUSI_TYPE.hmCloudStream;
	    // this.options.userToken = userToken
	    this.options.peerId = peerId;
	    this.options.camId = camId;
	    this.options.playTime = playTime;
	    this.options.videoList = videoList;
	    this.options.playMode = 'playback';
	    this.start();
	  }
	  async requestEncWSSKey() {
	    this.options.streamBusiType = STREAM_BUSI_TYPE.hmEncWSSStream;
	    return new Promise(resolve => {
	      this.start(encWssKey => {
	        resolve(encWssKey);
	      });
	    });
	  }
	  startHMEncWSSStream(playUrl) {
	    if (this.options.streamBusiType != STREAM_BUSI_TYPE.hmEncWSSStream) {
	      logger.warn(this.tag, `startHMEncWSSStream fail, cur streamBusiType not equal hmEncWSSStream, so return`);
	      return;
	    }
	    if (!this.mainplayer) {
	      logger.warn(this.tag, `startHMEncWSSStream fail, main player not inited`);
	      return;
	    }
	    this.mainplayer.startEncWSSStream(playUrl);
	  }

	  /**
	   * MSE 渲染时 video 元素报 MediaError(code 3 解码失败 / 4 源不支持)，说明这台机器上
	   * 硬解吃不下这路码流（比如 macOS 的 VideoToolbox 对这版设备码流报
	   * kVTVideoDecoderBadDataErr）。播放器随后降级软解重启，用户看到的就是
	   * "出图 → 画面消失 → 再出图"。把这次失败按流记下来，下次同一个流直接走 canvas，
	   * 那一下黑屏就没了。码流换设备/换清晰度时 key 也跟着变，不会把能硬解的流也拦住；
	   * 记录 7 天过期，清 localStorage 也能立刻重试。
	   */
	  mseFailSignature() {
	    let o = this.options;
	    return [o.streamBusiType, o.playUrl || o.url || '', o.peerId || '', o.camId ?? ''].join('|');
	  }
	  mseFailCache() {
	    try {
	      if (typeof localStorage == 'undefined') {
	        return {};
	      }
	      let cache = JSON.parse(localStorage.getItem(MSE_FAIL_CACHE_KEY) || '{}');
	      return cache && typeof cache == 'object' ? cache : {};
	    } catch (e) {
	      return {};
	    }
	  }

	  // mse 渲染时 video 元素解码失败，由 VideoMSERender 调用
	  notifyMseDecodeError(err) {
	    let code = err && err.code;
	    if (!this.options.enableMseFallbackCache || this.options.renderMode != 'mse') {
	      return;
	    }

	    // 3: MEDIA_ERR_DECODE（解码失败） 4: MEDIA_ERR_SRC_NOT_SUPPORTED（码流不支持），其它不记
	    if (code != 3 && code != 4) {
	      return;
	    }
	    let signature = this.mseFailSignature();
	    try {
	      let cache = this.mseFailCache();
	      cache[signature] = {
	        t: Date.now(),
	        v: MSE_FAIL_CACHE_VERSION
	      };
	      localStorage.setItem(MSE_FAIL_CACHE_KEY, JSON.stringify(cache));
	    } catch (e) {}
	    logger.warn(this.tag, `mse decode failed, code ${code}, remember [${signature}], next start of this stream will use canvas`);
	  }
	  applyMseFailHistory() {
	    if (!this.options.enableMseFallbackCache || this.options.renderMode != 'mse') {
	      return;
	    }
	    let signature = this.mseFailSignature();
	    let record = this.mseFailCache()[signature];

	    // 只认当前版本写的记录：播放器改过（比如这版换 hvc1 剥参数集）就作废，
	    // 让它先按新逻辑试一次硬解，真失败再重新记
	    if (!record || record.v != MSE_FAIL_CACHE_VERSION) {
	      return;
	    }
	    let failTime = record.t;
	    if (!failTime || Date.now() - failTime > MSE_FAIL_CACHE_EXPIRE) {
	      return;
	    }
	    this.options.renderMode = 'canvas';
	    this.options.useMSEAudioWhenMSERenderMode = false;
	    if (this.options.decoderMode == 'wcs') {
	      this.options.decoderMode = 'soft-simd';
	    }
	    logger.warn(this.tag, `stream [${signature}] failed on mse decode at ${new Date(failTime).toLocaleString()}, use canvas/soft decode directly`);
	  }
	  start(encWssKeyCB) {
	    this.applyMseFailHistory();
	    this.mainplayer = new MainPlayer(this);
	    this.mainplayer.on('event', evtobj => {
	      logger.debug(this.tag, `pub event: ${evtobj.event}, params: ${JSON.stringify(evtobj.params)}`);
	      this.emit(evtobj.event, evtobj.params);
	    });
	    this.mainplayer.on('playAbnormal', info => {
	      logger.info(this.tag, `playAbnormal reason:${info.message}, will adjust decode params & reload stream`);
	      this.restart();
	    });
	    this.mainplayer.on('requestEncWSSKey', encWssKey => {
	      logger.info(this.tag, `pub requestEncWSSKey params: ${encWssKey}`);
	      if (encWssKeyCB) {
	        encWssKeyCB(encWssKey);
	      }
	    });
	  }
	  restart() {
	    let originRenderMode = this.options.renderMode;
	    this.mainplayer.destroy();
	    if (this.options.renderMode == 'mse') {
	      this.options.renderMode = 'canvas';
	      this.options.useMSEAudioWhenMSERenderMode = false;
	      this.options.decoderMode = 'soft-simd';
	    }
	    if (this.options.renderMode == 'canvas') {
	      if (this.options.decoderMode == 'wcs') {
	        this.options.decoderMode = 'soft-simd';
	      }
	    }

	    // 重启会重建渲染元素（画面会黑一下），日志里标出这次降级，方便定位"首帧闪一下"的来源
	    logger.warn(this.tag, `restart player, renderMode ${originRenderMode} -> ${this.options.renderMode}, decoderMode ${this.options.decoderMode}`);
	    this.start();
	  }
	  async destroy() {
	    this.off();
	    await this.mainplayer?.destroy();
	    destroyLogger();
	    logger.info(this.tag, `avplayer destroy`);
	  }

	  //public interface

	  unMute() {
	    logger.info(this.tag, `unmute audio`);
	    this.mainplayer.unMute();
	  }
	  mute() {
	    logger.info(this.tag, `mute audio`);
	    this.mainplayer.mute();
	  }
	  setVolume(num) {
	    num = Number(num);
	    logger.info(this.tag, `setVolume ${num}`);
	    if (num === 0) {
	      this.mainplayer.mute();
	    } else {
	      num = (num / 100).toFixed(2);
	      this.mainplayer.setVolume(num);
	    }
	  }
	  startRecord() {
	    //1:音视频都录，2：只录视频 3：只录音频
	    logger.info(this.tag, `startRecord`);
	    this.mainplayer.startRecord(1);
	  }
	  stopRecord() {
	    logger.info(this.tag, `stopRecord`);
	    this.mainplayer.stopRecord();
	  }
	  setFullscreen(flag) {
	    logger.info(this.tag, `setFullscreen ${flag}`);
	    this.mainplayer?.setFullscreen(flag);
	  }
	  isFullscreen() {
	    let result = this.mainplayer?.isFullscreen() ?? false;
	    logger.info(this.tag, `isFullscreen ${result}`);
	    return result;
	  }
	  resizeView(x, y, width, height) {
	    logger.info(this.tag, `resizeView x:${x} y:${y} width:${width} height:${height}`);
	    this.options.x = x;
	    this.options.y = y;
	    this.options.width = width;
	    this.options.height = height;
	    this.mainplayer.resizeView();
	  }
	  updateRenderOptions(renderOptions) {
	    logger.info(this.tag, `updateRenderOptions ${JSON.stringify(renderOptions)}`);
	    Object.assign(this.options.renderOptions, this.options.renderOptions, renderOptions);
	    logger.info(this.tag, `updateRenderOptions succ, all options ${JSON.stringify(this.options.renderOptions)}`);
	    this.mainplayer.updateRenderOptions();
	  }
	  startTalk(talkUrl, talkSessionId, talkResourceId, talkEncType, talkEncKey, talkEncLoad) {
	    this.mainplayer.startTalk({
	      talkBusiType: TALK_BUSI_TYPE.normalTalk,
	      talkUrl,
	      talkSessionId,
	      talkResourceId,
	      talkEncType,
	      talkEncKey,
	      talkEncLoad
	    });
	  }
	  startDXTalk(talkUrl, talkToken, talkSessionId, talkLevel) {
	    this.mainplayer.startTalk({
	      talkBusiType: TALK_BUSI_TYPE.dxTalk,
	      talkUrl,
	      talkToken,
	      talkSessionId,
	      talkLevel
	    });
	  }
	  seekHMTFCardStream(playTime) {
	    if (!isValidPlayTime(playTime)) {
	      logger.warn(this.tag, `seekHMTFCardStream invalid play time "${playTime}", expect "YYYY-MM-DD HH:mm:ss"`);
	    }
	    this.mainplayer.seekTFCardStream(playTime);
	  }
	  playScaleStream(playSpeed) {
	    this.mainplayer.playScaleStream(playSpeed);
	  }
	  pauseStream() {
	    this.mainplayer.pauseStream();
	  }
	  resumeStream() {
	    this.mainplayer.resumeStream();
	  }
	  seekHMCloudStream(playTime) {
	    if (!isValidPlayTime(playTime)) {
	      logger.warn(this.tag, `seekHMCloudStream invalid play time "${playTime}", expect "YYYY-MM-DD HH:mm:ss"`);
	    }
	    this.mainplayer.seekCloudStream(playTime);
	  }
	  stopTalk() {
	    this.mainplayer.stopTalk();
	  }

	  /**
	   * 截图功能，支持不同渲染模式
	   * @param {string} filename - 文件名，默认为时间戳
	   * @param {string} format - 图像格式：'png', 'jpeg', 'webp'，默认 'png'
	   * @param {number} quality - 质量参数，仅对 jpeg 和 webp 有效，范围 0-1，默认 0.92
	   * @param {string} type - 输出类型：'download', 'base64', 'blob'，默认 'download'
	   * @returns {string|Blob|Promise<string|Blob>|void} 根据 type 参数返回相应类型的结果，离屏渲染时返回 Promise
	   */
	  screenshot(filename, format = 'png', quality = 0.92, type = 'download') {
	    logger.info(this.tag, `screenshot called: filename=${filename}, format=${format}, quality=${quality}, type=${type}`);
	    if (!this.mainplayer) {
	      logger.warn(this.tag, 'screenshot failed: player not initialized');
	      return null;
	    }
	    const result = this.mainplayer.screenshot(filename, format, quality, type);

	    // 如果返回的是 Promise（离屏渲染情况），添加错误处理
	    if (result && typeof result.then === 'function') {
	      return result.catch(error => {
	        logger.error(this.tag, `Screenshot failed: ${error.message}`);
	        return null;
	      });
	    }
	    return result;
	  }
	  downloadLog() {
	    logger.info(this.tag, `downloadLog`);
	    let logs = logger.getLogsCache();

	    // 将数据保存到本地
	    const blob = new Blob(logs, {
	      type: 'text/plain;charset=utf-8'
	    });
	    const url = URL.createObjectURL(blob);
	    const link = document.createElement('a');
	    link.href = url;
	    link.download = 'text.txt';
	    document.body.appendChild(link);
	    link.click();
	    setTimeout(() => {
	      URL.revokeObjectURL(url);
	    }, 500);
	  }
	}
	window.HMWebPlayer = HMWebPlayer;

	return HMWebPlayer;

}));
//# sourceMappingURL=hmwebplayer.js.map
