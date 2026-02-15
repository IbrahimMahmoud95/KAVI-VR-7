(function(){
    var script = {
 "scrollBarMargin": 2,
 "class": "Player",
 "children": [
  "this.MainViewer"
 ],
 "id": "rootPlayer",
 "scrollBarOpacity": 0.5,
 "width": "100%",
 "mobileMipmappingEnabled": false,
 "horizontalAlign": "left",
 "defaultVRPointer": "laser",
 "borderSize": 0,
 "start": "this.init(); this.set('mute', true)",
 "paddingRight": 0,
 "paddingLeft": 0,
 "scrollBarWidth": 10,
 "contentOpaque": false,
 "scripts": {
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "registerKey": function(key, value){  window[key] = value; },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "existsKey": function(key){  return key in window; },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "getKey": function(key){  return window[key]; },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "unregisterKey": function(key){  delete window[key]; }
 },
 "minHeight": 20,
 "downloadEnabled": false,
 "layout": "absolute",
 "borderRadius": 0,
 "verticalAlign": "top",
 "propagateClick": false,
 "height": "100%",
 "minWidth": 20,
 "gap": 10,
 "definitions": [{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -178.08,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_74E58317_62A6_B323_41D7_0C5EE101F9AA",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -159.16,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_747EB254_62A6_AD24_41A7_4A5AF2E660E1",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -156.2,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_7834A16D_62A6_AFE7_41D7_E6C8469EB8A4",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 0,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_6BB87AB5_616D_BD67_41D2_748FAA034B54_camera",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 0,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_6BA306B2_616E_957D_41D7_205FB9A9E725_camera",
 "automaticZoomSpeed": 10
},
{
 "items": [
  {
   "media": "this.media_6BB8C56C_616D_97E5_41BD_1DFA2904E540",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 0)",
   "camera": "this.media_6BB8C56C_616D_97E5_41BD_1DFA2904E540_camera",
   "class": "Video360PlayListItem",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer); this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_6BB89F80_616E_731D_41D4_C1F9F22F91AE",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 1, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 1)",
   "camera": "this.media_6BB89F80_616E_731D_41D4_C1F9F22F91AE_camera",
   "class": "Video360PlayListItem",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer); this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 2, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 2)",
   "camera": "this.media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21_camera",
   "class": "Video360PlayListItem",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer); this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_6BA70EF6_616E_92E5_4188_86E3806310BC",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 3, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 3)",
   "camera": "this.media_6BA70EF6_616E_92E5_4188_86E3806310BC_camera",
   "class": "Video360PlayListItem",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer); this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_6BA306B2_616E_957D_41D7_205FB9A9E725",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 4, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 4)",
   "camera": "this.media_6BA306B2_616E_957D_41D7_205FB9A9E725_camera",
   "class": "Video360PlayListItem",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer); this.setEndToItemIndex(this.mainPlayList, 4, 5)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_6AB2DD12_616E_B73D_41C0_26EC485CE65E",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 5, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 5)",
   "camera": "this.media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_camera",
   "class": "Video360PlayListItem",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer); this.setEndToItemIndex(this.mainPlayList, 5, 6)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 6, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 6)",
   "camera": "this.media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_camera",
   "class": "Video360PlayListItem",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_6BA7ED2B_616D_9763_41A6_B8C263438F24",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 7, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 7)",
   "camera": "this.media_6BA7ED2B_616D_9763_41A6_B8C263438F24_camera",
   "class": "Video360PlayListItem",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer); this.setEndToItemIndex(this.mainPlayList, 7, 8)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_6BB94327_616D_B363_41D2_60C6CC6D46EF",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 8, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 8)",
   "camera": "this.media_6BB94327_616D_B363_41D2_60C6CC6D46EF_camera",
   "class": "Video360PlayListItem",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer); this.setEndToItemIndex(this.mainPlayList, 8, 9)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_6BB87AB5_616D_BD67_41D2_748FAA034B54",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 9, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 9)",
   "camera": "this.media_6BB87AB5_616D_BD67_41D2_748FAA034B54_camera",
   "class": "Video360PlayListItem",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer); this.setEndToItemIndex(this.mainPlayList, 9, 0)",
   "player": "this.MainViewerPanoramaPlayer",
   "end": "this.trigger('tourEnded')"
  }
 ],
 "id": "mainPlayList",
 "class": "PlayList"
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -175.99,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_746E821F_62A6_AD23_41D0_AD58F0616FD3",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 67.42,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_74F3A328_62A6_B36D_41D6_CBB5D0B59A30",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 0,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_6BA7ED2B_616D_9763_41A6_B8C263438F24_camera",
 "automaticZoomSpeed": 10
},
{
 "touchControlMode": "drag_rotation",
 "class": "PanoramaPlayer",
 "gyroscopeVerticalDraggingEnabled": true,
 "mouseControlMode": "drag_rotation",
 "id": "MainViewerPanoramaPlayer",
 "viewerArea": "this.MainViewer",
 "displayPlaybackBar": true,
 "gyroscopeEnabled": true
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 140.28,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_78CC7191_62A6_AF3F_4185_35E06D2F3944",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "class": "Video360",
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_6BA70EF6_616E_92E5_4188_86E3806310BC_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 5859,
   "type": "video/mp4",
   "url": "media/media_6BA70EF6_616E_92E5_4188_86E3806310BC.mp4",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 4 -360",
 "id": "media_6BA70EF6_616E_92E5_4188_86E3806310BC",
 "thumbnailUrl": "media/media_6BA70EF6_616E_92E5_4188_86E3806310BC_t.jpg",
 "loop": false,
 "pitch": 0,
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "panorama": "this.media_6BB94327_616D_B363_41D2_60C6CC6D46EF",
   "yaw": 68.29,
   "backwardYaw": -87.45,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6BB87AB5_616D_BD67_41D2_748FAA034B54",
   "yaw": -65.29,
   "backwardYaw": 100.29,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6BA306B2_616E_957D_41D7_205FB9A9E725",
   "yaw": 4.01,
   "backwardYaw": 1.92,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_71530F46_62A5_9325_4198_D0C93B01C63D",
  "this.overlay_70E3C01F_62A2_6D23_41D0_07727797880D",
  "this.overlay_70B11FC0_62AD_931D_41BF_C4345D1B5046"
 ],
 "partial": false
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 0,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_camera",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 10.3,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_7492D35D_62A6_B327_41B0_630CDE425E48",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -168.88,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_7473222F_62A6_AD64_41A9_B88A96AB1968",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -97.95,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_740FA277_62A6_ADE3_41B7_119B6517C69D",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -160.61,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_743462BD_62A6_AD67_41D2_B87F39CD23AD",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -121.59,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_74C832E0_62A6_AD1D_41D8_8522BFD45B92",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "class": "Video360",
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_6BA7ED2B_616D_9763_41A6_B8C263438F24_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 5859,
   "type": "video/mp4",
   "url": "media/media_6BA7ED2B_616D_9763_41A6_B8C263438F24.mp4",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 8 -360",
 "id": "media_6BA7ED2B_616D_9763_41A6_B8C263438F24",
 "thumbnailUrl": "media/media_6BA7ED2B_616D_9763_41A6_B8C263438F24_t.jpg",
 "loop": false,
 "pitch": 0,
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "panorama": "this.media_6BB8C56C_616D_97E5_41BD_1DFA2904E540",
   "yaw": -129.63,
   "backwardYaw": 19.39,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6BA306B2_616E_957D_41D7_205FB9A9E725",
   "yaw": -39.72,
   "backwardYaw": 68.8,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_71B02CF2_62FE_96FD_41AA_1A19675A7957",
  "this.overlay_71CEBED4_62FD_B524_41B0_7DA007928BB5"
 ],
 "partial": false
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 92.55,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_74D6F2F2_62A6_B2FD_41D4_4A1AB6428381",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 0,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_6BB8C56C_616D_97E5_41BD_1DFA2904E540_camera",
 "automaticZoomSpeed": 10
},
{
 "duration": 100,
 "class": "Photo",
 "label": "xxxx",
 "id": "photo_5B9E3656_4277_E22B_41B6_67F431C62416",
 "thumbnailUrl": "media/photo_5B9E3656_4277_E22B_41B6_67F431C62416_t.jpg",
 "width": 4000,
 "image": {
  "levels": [
   {
    "url": "media/photo_5B9E3656_4277_E22B_41B6_67F431C62416.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 2250
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 175.69,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_74FE433A_62A6_B36D_41A7_3F1A9C86238C",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 172.87,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_78C3F17F_62A6_AFE3_41AF_67E0A2C841C1",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 0,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_6BB89F80_616E_731D_41D4_C1F9F22F91AE_camera",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 103.98,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_7821714B_62A6_AF2C_4162_158A79DC8754",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "class": "Video360",
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 5859,
   "type": "video/mp4",
   "url": "media/media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21.mp4",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 5 -360",
 "id": "media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21",
 "thumbnailUrl": "media/media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21_t.jpg",
 "loop": false,
 "pitch": 0,
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "panorama": "this.media_6BB89F80_616E_731D_41D4_C1F9F22F91AE",
   "yaw": 58.41,
   "backwardYaw": 154.91,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6AB2DD12_616E_B73D_41C0_26EC485CE65E",
   "yaw": -112.58,
   "backwardYaw": 20.84,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_70B5CAD7_62AE_BD23_41B7_3F798106F18F",
  "this.overlay_71176988_62E2_9F2D_41D1_D7E31B7D9040"
 ],
 "partial": false
},
{
 "hfovMin": 60,
 "class": "Video360",
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 5859,
   "type": "video/mp4",
   "url": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725.mp4",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 3 -360",
 "id": "media_6BA306B2_616E_957D_41D7_205FB9A9E725",
 "thumbnailUrl": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725_t.jpg",
 "loop": false,
 "pitch": 0,
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "panorama": "this.media_6BB94327_616D_B363_41D2_60C6CC6D46EF",
   "yaw": -11.64,
   "backwardYaw": -7.13,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6BA7ED2B_616D_9763_41A6_B8C263438F24",
   "yaw": 68.8,
   "backwardYaw": -39.72,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6BA70EF6_616E_92E5_4188_86E3806310BC",
   "yaw": 1.92,
   "backwardYaw": 4.01,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6BB87AB5_616D_BD67_41D2_748FAA034B54",
   "yaw": 23.8,
   "backwardYaw": 11.12,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_72A995E4_62BD_B6E5_41D7_8EC243F945E9",
  "this.overlay_73837B06_62A3_9325_41CE_CAE843847375",
  "this.overlay_73375B32_62A2_737D_41C7_C35FB12A5081",
  "this.overlay_73A079A0_62A7_9F1D_41D0_97887265C52C"
 ],
 "partial": false
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 98.12,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_7484134C_62A6_B325_41C7_423D9DD22A07",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 0,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_camera",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -111.71,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_7415B288_62A6_AD2D_41B4_B2574F5770FB",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "class": "Video360",
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 5859,
   "type": "video/mp4",
   "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E.mp4",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 2 -360",
 "id": "media_6AB2DD12_616E_B73D_41C0_26EC485CE65E",
 "thumbnailUrl": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_t.jpg",
 "loop": false,
 "pitch": 0,
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.media_6BB87AB5_616D_BD67_41D2_748FAA034B54"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.media_6BA306B2_616E_957D_41D7_205FB9A9E725"
  },
  {
   "panorama": "this.media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21",
   "yaw": 20.84,
   "backwardYaw": -112.58,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.media_6BB8C56C_616D_97E5_41BD_1DFA2904E540"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.media_6BB94327_616D_B363_41D2_60C6CC6D46EF"
  },
  {
   "panorama": "this.media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80",
   "yaw": -169.7,
   "backwardYaw": -4.31,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_6D6DFD62_62A2_F7E2_41D1_1A2DF8B4F330",
  "this.overlay_6DAC6003_62A3_AD23_41C7_AA2795DDD6DD",
  "this.overlay_7288AA14_62A5_BD25_41AE_E627770A9A02",
  "this.overlay_72A01BDB_62A7_B323_41C5_DB7803A1DCEF",
  "this.overlay_72EBD104_62A2_6F25_41BF_DA4908E78322",
  "this.overlay_733DFBCA_62A2_932D_41CA_A4E330B094CE"
 ],
 "partial": false
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -79.71,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_74DCA304_62A6_B325_41D8_2F3B53F94524",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 0,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_6BA70EF6_616E_92E5_4188_86E3806310BC_camera",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -25.09,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_74742242_62A6_AD1D_41D1_01E643F3A11E",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 114.71,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_782E415C_62A6_AF25_4195_70B8B97697DD",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "class": "Video360",
 "video": [
  {
   "width": 4000,
   "posterURL": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 15000,
   "type": "video/mp4",
   "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80.mp4",
   "height": 2000
  },
  {
   "width": 3840,
   "posterURL": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 13824,
   "type": "video/mp4",
   "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_go.mp4",
   "height": 1920
  },
  {
   "width": 3168,
   "posterURL": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 9408,
   "type": "video/mp4",
   "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_ios.mp4",
   "height": 1584
  }
 ],
 "hfov": 360,
 "label": "Cam 1 -360",
 "id": "media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80",
 "thumbnailUrl": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21"
  },
  {
   "panorama": "this.media_6BB8C56C_616D_97E5_41BD_1DFA2904E540",
   "yaw": 82.05,
   "backwardYaw": -81.88,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.media_6BB94327_616D_B363_41D2_60C6CC6D46EF"
  },
  {
   "panorama": "this.media_6AB2DD12_616E_B73D_41C0_26EC485CE65E",
   "yaw": -4.31,
   "backwardYaw": -169.7,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.media_6BB87AB5_616D_BD67_41D2_748FAA034B54"
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_6FDC0626_62A6_F565_419A_6656ACE2B782",
  "this.overlay_6C9385E4_62A2_96E5_41C3_F2015A108651",
  "this.overlay_6D2C48E8_62A2_9EED_41D0_68765CD336BE",
  "this.overlay_6CCF038F_62AE_9323_41C0_E1B13DB7F928",
  "this.overlay_6DED9A14_62AE_9D25_41BA_18899CEA599B"
 ],
 "partial": false
},
{
 "hfovMin": 60,
 "class": "Video360",
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_6BB8C56C_616D_97E5_41BD_1DFA2904E540_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 5859,
   "type": "video/mp4",
   "url": "media/media_6BB8C56C_616D_97E5_41BD_1DFA2904E540.mp4",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 7 -360",
 "id": "media_6BB8C56C_616D_97E5_41BD_1DFA2904E540",
 "thumbnailUrl": "media/media_6BB8C56C_616D_97E5_41BD_1DFA2904E540_t.jpg",
 "loop": false,
 "pitch": 0,
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "panorama": "this.media_6BA7ED2B_616D_9763_41A6_B8C263438F24",
   "yaw": 19.39,
   "backwardYaw": -129.63,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80",
   "yaw": -81.88,
   "backwardYaw": 82.05,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_713B0711_62FD_933F_41B3_2E92B55865B2",
  "this.overlay_7199F97B_62FE_BFE3_419B_6388B0663FCF"
 ],
 "partial": false
},
{
 "hfovMin": 60,
 "class": "Video360",
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_6BB89F80_616E_731D_41D4_C1F9F22F91AE_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 5859,
   "type": "video/mp4",
   "url": "media/media_6BB89F80_616E_731D_41D4_C1F9F22F91AE.mp4",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 6 -360",
 "id": "media_6BB89F80_616E_731D_41D4_C1F9F22F91AE",
 "thumbnailUrl": "media/media_6BB89F80_616E_731D_41D4_C1F9F22F91AE_t.jpg",
 "loop": false,
 "pitch": 0,
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "panorama": "this.media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21",
   "yaw": 154.91,
   "backwardYaw": 58.41,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80"
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_70F76B60_62E7_931D_41C7_1DA2112EDD0A",
  "this.overlay_71B35EAF_62E2_7563_41C6_D47CD79ACF5A"
 ],
 "partial": false
},
{
 "hfovMin": 60,
 "class": "Video360",
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_6BB94327_616D_B363_41D2_60C6CC6D46EF_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 5859,
   "type": "video/mp4",
   "url": "media/media_6BB94327_616D_B363_41D2_60C6CC6D46EF.mp4",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 9 -360",
 "id": "media_6BB94327_616D_B363_41D2_60C6CC6D46EF",
 "thumbnailUrl": "media/media_6BB94327_616D_B363_41D2_60C6CC6D46EF_t.jpg",
 "loop": false,
 "pitch": 0,
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "panorama": "this.media_6BA70EF6_616E_92E5_4188_86E3806310BC",
   "yaw": -87.45,
   "backwardYaw": 68.29,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6BB87AB5_616D_BD67_41D2_748FAA034B54",
   "yaw": -76.02,
   "backwardYaw": 83.48,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6BA306B2_616E_957D_41D7_205FB9A9E725",
   "yaw": -7.13,
   "backwardYaw": -11.64,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_744970B4_62E2_ED64_41D3_BEECF23CA615",
  "this.overlay_74888DF7_62E2_B6E3_41D0_FDBA82CD4BC5",
  "this.overlay_77315A66_62E2_7DE5_41B1_773A25FEDFB8"
 ],
 "partial": false
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -96.52,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_74238299_62A6_AD2F_41D0_1D0948CD5416",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 50.37,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_7401A265_62A6_ADE7_41D2_3CB3CEAB9ED6",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 0,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21_camera",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "class": "Video360",
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_6BB87AB5_616D_BD67_41D2_748FAA034B54_poster.jpg",
   "framerate": 25,
   "class": "Video360Resource",
   "bitrate": 5859,
   "type": "video/mp4",
   "url": "media/media_6BB87AB5_616D_BD67_41D2_748FAA034B54.mp4",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 10 -360",
 "id": "media_6BB87AB5_616D_BD67_41D2_748FAA034B54",
 "thumbnailUrl": "media/media_6BB87AB5_616D_BD67_41D2_748FAA034B54_t.jpg",
 "loop": false,
 "pitch": 0,
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "panorama": "this.media_6BB94327_616D_B363_41D2_60C6CC6D46EF",
   "yaw": 83.48,
   "backwardYaw": -76.02,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6BA70EF6_616E_92E5_4188_86E3806310BC",
   "yaw": 100.29,
   "backwardYaw": -65.29,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "panorama": "this.media_6BA306B2_616E_957D_41D7_205FB9A9E725",
   "yaw": 11.12,
   "backwardYaw": 23.8,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_74BB0EA2_62E2_751D_41A6_FFC88057FF9D",
  "this.overlay_7A5D8851_62E5_9D3F_41CC_D4444E6044F3",
  "this.overlay_77F5AE1F_62E6_9523_41B7_C12C2E6CE6F2"
 ],
 "partial": false
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 168.36,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_742992AC_62A6_AD65_41C5_ADF36DDD5AF8",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": -111.2,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_74C232CE_62A6_AD25_41D6_1CE5A9F167D7",
 "automaticZoomSpeed": 10
},
{
 "manualZoomSpeed": 1,
 "class": "RotationalCamera",
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "yaw": 0,
  "class": "RotationalCameraPosition",
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_6BB94327_616D_B363_41D2_60C6CC6D46EF_camera",
 "automaticZoomSpeed": 10
},
{
 "playbackBarHeadShadowVerticalLength": 0,
 "class": "ViewerArea",
 "playbackBarHeight": 10,
 "id": "MainViewer",
 "playbackBarHeadWidth": 6,
 "playbackBarRight": 0,
 "toolTipFontWeight": "normal",
 "toolTipShadowColor": "#333333",
 "width": "100%",
 "progressBarBorderSize": 0,
 "playbackBarBackgroundColorDirection": "vertical",
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBorderSize": 0,
 "paddingLeft": 0,
 "minHeight": 50,
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "toolTipFontStyle": "normal",
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderRadius": 0,
 "propagateClick": false,
 "toolTipFontFamily": "Arial",
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarProgressOpacity": 0,
 "height": "100%",
 "minWidth": 100,
 "toolTipTextShadowOpacity": 0,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderSize": 0,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 0,
 "progressLeft": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipBackgroundColor": "#00FF00",
 "playbackBarHeadShadowColor": "#000000",
 "vrPointerSelectionTime": 2000,
 "toolTipFontColor": "#606060",
 "toolTipShadowHorizontalLength": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "progressRight": 0,
 "shadow": false,
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipShadowVerticalLength": 0,
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "progressBottom": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0,
 "toolTipPaddingRight": 6,
 "borderSize": 0,
 "toolTipBorderSize": 1,
 "paddingRight": 0,
 "toolTipPaddingLeft": 6,
 "toolTipPaddingTop": 4,
 "progressBarOpacity": 0,
 "toolTipDisplayTime": 600,
 "progressBorderSize": 0,
 "vrPointerColor": "#FFFFFF",
 "displayTooltipInTouchScreens": true,
 "transitionMode": "blending",
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "playbackBarBorderColor": "#FFFFFF",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "transitionDuration": 500,
 "progressBorderRadius": 0,
 "playbackBarLeft": 0,
 "playbackBarHeadHeight": 15,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "progressBarBorderColor": "#000000",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "paddingTop": 0,
 "playbackBarHeadOpacity": 0,
 "playbackBarBottom": 5,
 "toolTipBorderColor": "#767676",
 "toolTipShadowBlurRadius": 3,
 "progressBorderColor": "#000000",
 "toolTipTextShadowColor": "#000000",
 "paddingBottom": 0,
 "toolTipShadowSpread": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipFontSize": "1.11vmin",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipOpacity": 1,
 "toolTipPaddingBottom": 4,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "progressBackgroundColorDirection": "vertical",
 "toolTipTextShadowBlurRadius": 3,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Main Viewer"
 }
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA306B2_616E_957D_41D7_205FB9A9E725, this.camera_74E58317_62A6_B323_41D7_0C5EE101F9AA); this.mainPlayList.set('selectedIndex', 4); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-3"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -6.24,
     "hfov": 15.89,
     "yaw": 4.01,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA70EF6_616E_92E5_4188_86E3806310BC_HS_0_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_77482183_62DE_EF23_4198_3BDD5F91D8A6",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -6.24,
     "hfov": 15.89,
     "yaw": 4.01,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_71530F46_62A5_9325_4198_D0C93B01C63D",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BB94327_616D_B363_41D2_60C6CC6D46EF, this.camera_74D6F2F2_62A6_B2FD_41D4_4A1AB6428381); this.mainPlayList.set('selectedIndex', 8); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-9"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 35.55,
     "hfov": 11.24,
     "yaw": 68.29,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA70EF6_616E_92E5_4188_86E3806310BC_HS_1_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7748D183_62DE_EF23_41A1_3F926932792E",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 35.55,
     "hfov": 11.24,
     "yaw": 68.29,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_70E3C01F_62A2_6D23_41D0_07727797880D",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BB87AB5_616D_BD67_41D2_748FAA034B54, this.camera_74DCA304_62A6_B325_41D8_2F3B53F94524); this.mainPlayList.set('selectedIndex', 9); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-10"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 25.77,
     "hfov": 11.72,
     "yaw": -65.29,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA70EF6_616E_92E5_4188_86E3806310BC_HS_2_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7748F184_62DE_EF25_41B5_AE682BDA1BAA",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 25.77,
     "hfov": 11.72,
     "yaw": -65.29,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_70B11FC0_62AD_931D_41BF_C4345D1B5046",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BB8C56C_616D_97E5_41BD_1DFA2904E540, this.camera_743462BD_62A6_AD67_41D2_B87F39CD23AD); this.mainPlayList.set('selectedIndex', 0); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-7"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -9.84,
     "hfov": 13.5,
     "yaw": -129.63,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA7ED2B_616D_9763_41A6_B8C263438F24_HS_0_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_77486187_62DE_EF23_41D2_40C81C4102A8",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -9.84,
     "hfov": 13.5,
     "yaw": -129.63,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_71B02CF2_62FE_96FD_41AA_1A19675A7957",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA306B2_616E_957D_41D7_205FB9A9E725, this.camera_74C232CE_62A6_AD25_41D6_1CE5A9F167D7); this.mainPlayList.set('selectedIndex', 4); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-3"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.53,
     "hfov": 14.5,
     "yaw": -39.72,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA7ED2B_616D_9763_41A6_B8C263438F24_HS_1_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_77480188_62DE_EF2D_41AE_6BEFF6A78738",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.53,
     "hfov": 14.5,
     "yaw": -39.72,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_71CEBED4_62FD_B524_41B0_7DA007928BB5",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6AB2DD12_616E_B73D_41C0_26EC485CE65E, this.camera_747EB254_62A6_AD24_41A7_4A5AF2E660E1); this.mainPlayList.set('selectedIndex', 5); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-2"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.06,
     "hfov": 12.98,
     "yaw": -112.58,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21_HS_0_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_77489184_62DE_EF25_41A1_CFDEABE68F6E",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.06,
     "hfov": 12.98,
     "yaw": -112.58,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_70B5CAD7_62AE_BD23_41B7_3F798106F18F",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BB89F80_616E_731D_41D4_C1F9F22F91AE, this.camera_74742242_62A6_AD1D_41D1_01E643F3A11E); this.mainPlayList.set('selectedIndex', 1); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-6"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -12.32,
     "hfov": 16.88,
     "yaw": 58.41,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21_HS_1_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774B2185_62DE_EF27_41A9_0D34F6415FA9",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -12.32,
     "hfov": 16.88,
     "yaw": 58.41,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_71176988_62E2_9F2D_41D1_D7E31B7D9040",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA70EF6_616E_92E5_4188_86E3806310BC, this.camera_746E821F_62A6_AD23_41D0_AD58F0616FD3); this.mainPlayList.set('selectedIndex', 3); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-4"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -2.78,
     "hfov": 13.18,
     "yaw": 1.92,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725_HS_0_0_0_map.gif",
      "width": 32,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774B9181_62DE_EF1F_41B8_0B4A7A88B569",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -2.78,
     "hfov": 13.18,
     "yaw": 1.92,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_72A995E4_62BD_B6E5_41D7_8EC243F945E9",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BB94327_616D_B363_41D2_60C6CC6D46EF, this.camera_78C3F17F_62A6_AFE3_41AF_67E0A2C841C1); this.mainPlayList.set('selectedIndex', 8); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-9"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 14.92,
     "hfov": 14.71,
     "yaw": -11.64,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725_HS_1_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774BB181_62DE_EF1F_41B6_192CDB8EE2E4",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 14.92,
     "hfov": 14.71,
     "yaw": -11.64,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_73837B06_62A3_9325_41CE_CAE843847375",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BB87AB5_616D_BD67_41D2_748FAA034B54, this.camera_7473222F_62A6_AD64_41A9_B88A96AB1968); this.mainPlayList.set('selectedIndex', 9); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-10"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 12.88,
     "hfov": 10.91,
     "yaw": 23.8,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725_HS_2_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_77486182_62DE_EF1D_41D4_0515F6EFE32D",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 12.88,
     "hfov": 10.91,
     "yaw": 23.8,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_73375B32_62A2_737D_41C7_C35FB12A5081",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA7ED2B_616D_9763_41A6_B8C263438F24, this.camera_78CC7191_62A6_AF3F_4185_35E06D2F3944); this.mainPlayList.set('selectedIndex', 7); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-8"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.21,
     "hfov": 12.02,
     "yaw": 68.8,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725_HS_3_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_77480182_62DE_EF1D_41D7_6566618B22BD",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.21,
     "hfov": 12.02,
     "yaw": 68.8,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_73A079A0_62A7_9F1D_41D0_97887265C52C",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80, this.camera_74FE433A_62A6_B36D_41A7_3F1A9C86238C); this.mainPlayList.set('selectedIndex', 6); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-1"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -9.88,
     "hfov": 13.46,
     "yaw": -169.7,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_0_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774AB17E_62DE_EFE5_41CF_0CFB8EA7798A",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -9.88,
     "hfov": 13.46,
     "yaw": -169.7,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_6D6DFD62_62A2_F7E2_41D1_1A2DF8B4F330",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 4); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-3"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 11.89,
     "hfov": 10.49,
     "yaw": -1.06,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_1_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774B617E_62DE_EFE5_41C0_7FFDA0C6CA18",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 11.89,
     "hfov": 10.49,
     "yaw": -1.06,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_6DAC6003_62A3_AD23_41C7_AA2795DDD6DD",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21, this.camera_74F3A328_62A6_B36D_41D6_CBB5D0B59A30); this.mainPlayList.set('selectedIndex', 2); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-5"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -3.39,
     "hfov": 13.22,
     "yaw": 20.84,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_2_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774B017F_62DE_EFE3_41BB_5AAF3BED24C4",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -3.39,
     "hfov": 13.22,
     "yaw": 20.84,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_7288AA14_62A5_BD25_41AE_E627770A9A02",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 0); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-7"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.28,
     "hfov": 12.79,
     "yaw": 143.63,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_3_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774B217F_62DE_EFE3_41B6_59A0C6BE7DF5",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.28,
     "hfov": 12.79,
     "yaw": 143.63,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_72A01BDB_62A7_B323_41C5_DB7803A1DCEF",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 8); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-9"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 17.43,
     "hfov": 11.71,
     "yaw": -12.42,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_4_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774BD180_62DE_EF1D_41D1_A87E07955703",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 17.43,
     "hfov": 11.71,
     "yaw": -12.42,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_72EBD104_62A2_6F25_41BF_DA4908E78322",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 9); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-10"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 16.78,
     "hfov": 9.84,
     "yaw": 10.86,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_5_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774BF180_62DE_EF1D_41C8_6BCCACE8BAE9",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 16.78,
     "hfov": 9.84,
     "yaw": 10.86,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_733DFBCA_62A2_932D_41CA_A4E330B094CE",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6AB2DD12_616E_B73D_41C0_26EC485CE65E, this.camera_7492D35D_62A6_B327_41B0_630CDE425E48); this.mainPlayList.set('selectedIndex', 5); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-2"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -9.22,
     "hfov": 10.66,
     "yaw": -4.31,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_HS_0_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774DC175_62DE_EFE7_41C7_226CF690CA9B",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -9.22,
     "hfov": 10.66,
     "yaw": -4.31,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_6FDC0626_62A6_F565_419A_6656ACE2B782",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BB8C56C_616D_97E5_41BD_1DFA2904E540, this.camera_7484134C_62A6_B325_41C7_423D9DD22A07); this.mainPlayList.set('selectedIndex', 0); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-7"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.43,
     "hfov": 10.77,
     "yaw": 82.05,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_HS_1_0_0_map.gif",
      "width": 32,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774A217B_62DE_EFE3_41C9_2F954872731F",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.43,
     "hfov": 10.77,
     "yaw": 82.05,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_6C9385E4_62A2_96E5_41C3_F2015A108651",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 2); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-5"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.87,
     "hfov": 10.67,
     "yaw": 7.48,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_HS_2_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774AD17C_62DE_EFE5_41D6_9A6F3BCA536F",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.87,
     "hfov": 10.67,
     "yaw": 7.48,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_6D2C48E8_62A2_9EED_41D0_68765CD336BE",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 8); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-9"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 3.83,
     "hfov": 10.18,
     "yaw": -8.94,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_HS_3_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774AF17D_62DE_EFE7_41C3_33D6C95D29AF",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 3.83,
     "hfov": 10.18,
     "yaw": -8.94,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_6CCF038F_62AE_9323_41C0_E1B13DB7F928",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 9); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-10"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 3.4,
     "hfov": 10.29,
     "yaw": 7.58,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_HS_4_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774A917D_62DE_EFE7_41D4_2A42ED42A8E7",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 3.4,
     "hfov": 10.29,
     "yaw": 7.58,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_6DED9A14_62AE_9D25_41BA_18899CEA599B",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80, this.camera_740FA277_62A6_ADE3_41B7_119B6517C69D); this.mainPlayList.set('selectedIndex', 6); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-1"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.8,
     "hfov": 11.35,
     "yaw": -81.88,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BB8C56C_616D_97E5_41BD_1DFA2904E540_HS_0_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774B9186_62DE_EF25_4192_EFC651FA5CD6",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.8,
     "hfov": 11.35,
     "yaw": -81.88,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_713B0711_62FD_933F_41B3_2E92B55865B2",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA7ED2B_616D_9763_41A6_B8C263438F24, this.camera_7401A265_62A6_ADE7_41D2_3CB3CEAB9ED6); this.mainPlayList.set('selectedIndex', 7); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-8"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -0.69,
     "hfov": 13.81,
     "yaw": 19.39,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BB8C56C_616D_97E5_41BD_1DFA2904E540_HS_1_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_77484187_62DE_EF23_41CC_1332B6E86778",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -0.69,
     "hfov": 13.81,
     "yaw": 19.39,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_7199F97B_62FE_BFE3_419B_6388B0663FCF",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21, this.camera_74C832E0_62A6_AD1D_41D8_8522BFD45B92); this.mainPlayList.set('selectedIndex', 2); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-5"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -19.54,
     "hfov": 13.82,
     "yaw": 154.91,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BB89F80_616E_731D_41D4_C1F9F22F91AE_HS_0_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774BD185_62DE_EF27_41C3_1169086DA083",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -19.54,
     "hfov": 13.82,
     "yaw": 154.91,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_70F76B60_62E7_931D_41C7_1DA2112EDD0A",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 6); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-1"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -3.2,
     "hfov": 10.23,
     "yaw": 158.94,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BB89F80_616E_731D_41D4_C1F9F22F91AE_HS_1_0_0_map.gif",
      "width": 27,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_774BF186_62DE_EF25_41CC_F841A615E61A",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -3.2,
     "hfov": 10.23,
     "yaw": 158.94,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_71B35EAF_62E2_7563_41C6_D47CD79ACF5A",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA306B2_616E_957D_41D7_205FB9A9E725, this.camera_742992AC_62A6_AD65_41C5_ADF36DDD5AF8); this.mainPlayList.set('selectedIndex', 4); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-3"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -16.86,
     "hfov": 17.87,
     "yaw": -7.13,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BB94327_616D_B363_41D2_60C6CC6D46EF_HS_0_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_77482188_62DE_EF2D_419B_B734E68390E2",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -16.86,
     "hfov": 17.87,
     "yaw": -7.13,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 50
  }
 ],
 "id": "overlay_744970B4_62E2_ED64_41D3_BEECF23CA615",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA70EF6_616E_92E5_4188_86E3806310BC, this.camera_7415B288_62A6_AD2D_41B4_B2574F5770FB); this.mainPlayList.set('selectedIndex', 3); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-4"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -27.49,
     "hfov": 19.68,
     "yaw": -87.45,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BB94327_616D_B363_41D2_60C6CC6D46EF_HS_1_0_0_map.gif",
      "width": 41,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7748D189_62DE_EF2F_41B6_0957184F5AF5",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -27.49,
     "hfov": 19.68,
     "yaw": -87.45,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 50
  }
 ],
 "id": "overlay_74888DF7_62E2_B6E3_41D0_FDBA82CD4BC5",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BB87AB5_616D_BD67_41D2_748FAA034B54, this.camera_74238299_62A6_AD2F_41D0_1D0948CD5416); this.mainPlayList.set('selectedIndex', 9); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-10"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 0.99,
     "hfov": 12.35,
     "yaw": -76.02,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BB94327_616D_B363_41D2_60C6CC6D46EF_HS_2_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7748F189_62DE_EF2F_41C0_FC8A51D3B7CF",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": 0.99,
     "hfov": 12.35,
     "yaw": -76.02,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_77315A66_62E2_7DE5_41B1_773A25FEDFB8",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA306B2_616E_957D_41D7_205FB9A9E725, this.camera_7834A16D_62A6_AFE7_41D7_E6C8469EB8A4); this.mainPlayList.set('selectedIndex', 4); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-3"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -24.76,
     "hfov": 11.05,
     "yaw": 11.12,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BB87AB5_616D_BD67_41D2_748FAA034B54_HS_0_0_0_map.gif",
      "width": 29,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7748918A_62DE_EF2D_419F_87706CD63736",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -24.76,
     "hfov": 11.05,
     "yaw": 11.12,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 50
  }
 ],
 "id": "overlay_74BB0EA2_62E2_751D_41A6_FFC88057FF9D",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BA70EF6_616E_92E5_4188_86E3806310BC, this.camera_782E415C_62A6_AF25_4195_70B8B97697DD); this.mainPlayList.set('selectedIndex', 3); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-4"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -26.93,
     "hfov": 14.95,
     "yaw": 100.29,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BB87AB5_616D_BD67_41D2_748FAA034B54_HS_1_0_0_map.gif",
      "width": 34,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7749418A_62DE_EF2D_4184_89D99F02E89F",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -26.93,
     "hfov": 14.95,
     "yaw": 100.29,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 50
  }
 ],
 "id": "overlay_7A5D8851_62E5_9D3F_41CC_D4444E6044F3",
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_6BB94327_616D_B363_41D2_60C6CC6D46EF, this.camera_7821714B_62A6_AF2C_4162_158A79DC8754); this.mainPlayList.set('selectedIndex', 8); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "rollOverDisplay": false,
 "data": {
  "label": "cam-9"
 },
 "maps": [
  {
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -7,
     "hfov": 10.8,
     "yaw": 83.48,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_6BB87AB5_616D_BD67_41D2_748FAA034B54_HS_2_0_0_map.gif",
      "width": 16,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "class": "HotspotPanoramaOverlay",
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_7749618B_62DE_EF23_41B0_24F79998EA90",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "timestamp": 0,
     "pitch": -7,
     "hfov": 10.8,
     "yaw": 83.48,
     "class": "PanoramaOverlayPlaybackPosition"
    }
   ],
   "pitch": 0,
   "yaw": 0,
   "distance": 100
  }
 ],
 "id": "overlay_77F5AE1F_62E6_9523_41B7_C12C2E6CE6F2",
 "enabledInCardboard": true
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_77482183_62DE_EF23_4198_3BDD5F91D8A6",
 "levels": [
  {
   "url": "media/media_6BA70EF6_616E_92E5_4188_86E3806310BC_HS_0_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_7748D183_62DE_EF23_41A1_3F926932792E",
 "levels": [
  {
   "url": "media/media_6BA70EF6_616E_92E5_4188_86E3806310BC_HS_1_0.png",
   "width": 800,
   "height": 1200,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_7748F184_62DE_EF25_41B5_AE682BDA1BAA",
 "levels": [
  {
   "url": "media/media_6BA70EF6_616E_92E5_4188_86E3806310BC_HS_2_0.png",
   "width": 800,
   "height": 1200,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_77486187_62DE_EF23_41D2_40C81C4102A8",
 "levels": [
  {
   "url": "media/media_6BA7ED2B_616D_9763_41A6_B8C263438F24_HS_0_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_77480188_62DE_EF2D_41AE_6BEFF6A78738",
 "levels": [
  {
   "url": "media/media_6BA7ED2B_616D_9763_41A6_B8C263438F24_HS_1_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_77489184_62DE_EF25_41A1_CFDEABE68F6E",
 "levels": [
  {
   "url": "media/media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21_HS_0_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774B2185_62DE_EF27_41A9_0D34F6415FA9",
 "levels": [
  {
   "url": "media/media_6BA677D3_616E_7323_41D1_A5A5FB9A7A21_HS_1_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774B9181_62DE_EF1F_41B8_0B4A7A88B569",
 "levels": [
  {
   "url": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725_HS_0_0.png",
   "width": 480,
   "height": 360,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774BB181_62DE_EF1F_41B6_192CDB8EE2E4",
 "levels": [
  {
   "url": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725_HS_1_0.png",
   "width": 800,
   "height": 1200,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_77486182_62DE_EF1D_41D4_0515F6EFE32D",
 "levels": [
  {
   "url": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725_HS_2_0.png",
   "width": 800,
   "height": 1200,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_77480182_62DE_EF1D_41D7_6566618B22BD",
 "levels": [
  {
   "url": "media/media_6BA306B2_616E_957D_41D7_205FB9A9E725_HS_3_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774AB17E_62DE_EFE5_41CF_0CFB8EA7798A",
 "levels": [
  {
   "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_0_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774B617E_62DE_EFE5_41C0_7FFDA0C6CA18",
 "levels": [
  {
   "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_1_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774B017F_62DE_EFE3_41BB_5AAF3BED24C4",
 "levels": [
  {
   "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_2_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774B217F_62DE_EFE3_41B6_59A0C6BE7DF5",
 "levels": [
  {
   "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_3_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774BD180_62DE_EF1D_41D1_A87E07955703",
 "levels": [
  {
   "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_4_0.png",
   "width": 800,
   "height": 1200,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774BF180_62DE_EF1D_41C8_6BCCACE8BAE9",
 "levels": [
  {
   "url": "media/media_6AB2DD12_616E_B73D_41C0_26EC485CE65E_HS_5_0.png",
   "width": 800,
   "height": 1200,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774DC175_62DE_EFE7_41C7_226CF690CA9B",
 "levels": [
  {
   "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_HS_0_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774A217B_62DE_EFE3_41C9_2F954872731F",
 "levels": [
  {
   "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_HS_1_0.png",
   "width": 480,
   "height": 360,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774AD17C_62DE_EFE5_41D6_9A6F3BCA536F",
 "levels": [
  {
   "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_HS_2_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774AF17D_62DE_EFE7_41C3_33D6C95D29AF",
 "levels": [
  {
   "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_HS_3_0.png",
   "width": 800,
   "height": 1200,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774A917D_62DE_EFE7_41D4_2A42ED42A8E7",
 "levels": [
  {
   "url": "media/media_6AD55075_616E_ADE7_41D2_7FAA3CA31E80_HS_4_0.png",
   "width": 800,
   "height": 1200,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774B9186_62DE_EF25_4192_EFC651FA5CD6",
 "levels": [
  {
   "url": "media/media_6BB8C56C_616D_97E5_41BD_1DFA2904E540_HS_0_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_77484187_62DE_EF23_41CC_1332B6E86778",
 "levels": [
  {
   "url": "media/media_6BB8C56C_616D_97E5_41BD_1DFA2904E540_HS_1_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774BD185_62DE_EF27_41C3_1169086DA083",
 "levels": [
  {
   "url": "media/media_6BB89F80_616E_731D_41D4_C1F9F22F91AE_HS_0_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_774BF186_62DE_EF25_41CC_F841A615E61A",
 "levels": [
  {
   "url": "media/media_6BB89F80_616E_731D_41D4_C1F9F22F91AE_HS_1_0.png",
   "width": 480,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_77482188_62DE_EF2D_419B_B734E68390E2",
 "levels": [
  {
   "url": "media/media_6BB94327_616D_B363_41D2_60C6CC6D46EF_HS_0_0.png",
   "width": 520,
   "height": 360,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_7748D189_62DE_EF2F_41B6_0957184F5AF5",
 "levels": [
  {
   "url": "media/media_6BB94327_616D_B363_41D2_60C6CC6D46EF_HS_1_0.png",
   "width": 520,
   "height": 300,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_7748F189_62DE_EF2F_41C0_FC8A51D3B7CF",
 "levels": [
  {
   "url": "media/media_6BB94327_616D_B363_41D2_60C6CC6D46EF_HS_2_0.png",
   "width": 800,
   "height": 1200,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_7748918A_62DE_EF2D_419F_87706CD63736",
 "levels": [
  {
   "url": "media/media_6BB87AB5_616D_BD67_41D2_748FAA034B54_HS_0_0.png",
   "width": 520,
   "height": 420,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_7749418A_62DE_EF2D_4184_89D99F02E89F",
 "levels": [
  {
   "url": "media/media_6BB87AB5_616D_BD67_41D2_748FAA034B54_HS_1_0.png",
   "width": 520,
   "height": 360,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "class": "AnimatedImageResource",
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_7749618B_62DE_EF23_41B0_24F79998EA90",
 "levels": [
  {
   "url": "media/media_6BB87AB5_616D_BD67_41D2_748FAA034B54_HS_2_0.png",
   "width": 800,
   "height": 1200,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24
}],
 "scrollBarColor": "#000000",
 "paddingTop": 0,
 "overflow": "visible",
 "backgroundPreloadEnabled": true,
 "paddingBottom": 0,
 "data": {
  "name": "Player485"
 },
 "shadow": false,
 "scrollBarVisible": "rollOver",
 "mouseWheelEnabled": true,
 "vrPolyfillScale": 0.5,
 "desktopMipmappingEnabled": false
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();
