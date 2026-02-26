(function(){
    var script = {
 "scrollBarMargin": 2,
 "class": "Player",
 "id": "rootPlayer",
 "children": [
  "this.MainViewer"
 ],
 "scrollBarVisible": "rollOver",
 "start": "this.init(); this.set('mute', true)",
 "layout": "absolute",
 "width": "100%",
 "scripts": {
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "unregisterKey": function(key){  delete window[key]; },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "registerKey": function(key, value){  window[key] = value; },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "getKey": function(key){  return window[key]; },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "existsKey": function(key){  return key in window; },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } }
 },
 "horizontalAlign": "left",
 "scrollBarWidth": 10,
 "shadow": false,
 "defaultVRPointer": "laser",
 "verticalAlign": "top",
 "downloadEnabled": false,
 "paddingRight": 0,
 "minHeight": 20,
 "height": "100%",
 "contentOpaque": false,
 "minWidth": 20,
 "paddingLeft": 0,
 "borderRadius": 0,
 "borderSize": 0,
 "definitions": [{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_camera",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "media_7BBBA45E_70F1_2186_41D3_981E65E575BB_camera",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 174.44,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8BF3E727_994E_5007_41E0_B4EA35FCA8CD",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_camera",
 "automaticZoomSpeed": 10
},
{
 "class": "PlayList",
 "items": [
  {
   "media": "this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 0)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "class": "Video360PlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_camera"
  },
  {
   "media": "this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 1, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 1)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "class": "Video360PlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_camera"
  },
  {
   "media": "this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 2, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 2)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "class": "Video360PlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F_camera"
  },
  {
   "media": "this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 3, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 3)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "class": "Video360PlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_camera"
  },
  {
   "media": "this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 4, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 4)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "class": "Video360PlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB_camera"
  },
  {
   "media": "this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 5, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 5)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "class": "Video360PlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B_camera"
  },
  {
   "media": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 6, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 6)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "class": "Video360PlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_camera"
  },
  {
   "media": "this.media_940F677A_993F_D009_41D0_55F118FF900C",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 7, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 7)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "class": "Video360PlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.media_940F677A_993F_D009_41D0_55F118FF900C_camera"
  },
  {
   "media": "this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 8, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 8)",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "class": "Video360PlayListItem",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_camera"
  },
  {
   "media": "this.media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19",
   "end": "this.trigger('tourEnded')",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 9, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 9)",
   "player": "this.MainViewerPanoramaPlayer",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "class": "Video360PlayListItem",
   "camera": "this.media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_camera"
  }
 ],
 "id": "mainPlayList"
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 157.44,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B65B666_994E_5039_41C1_ADFC639BB60C",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 139.99,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B2F36BE_994E_5009_41E2_928995145168",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -93.65,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_888F15DF_994E_5007_41DD_4AA17CCED111",
 "automaticZoomSpeed": 10
},
{
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -81.63,
   "backwardYaw": 86.35,
   "distance": 1,
   "panorama": "this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 18.95,
   "backwardYaw": -131.92,
   "distance": 1,
   "panorama": "this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1"
  }
 ],
 "label": "Cam 07 -360",
 "id": "media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723",
 "class": "Video360",
 "loop": true,
 "hfov": 360,
 "overlays": [
  "this.overlay_6437DA3A_7133_218E_41AD_8D1E622E9945",
  "this.overlay_65489FB4_7131_7E9A_4187_74CCEDD86660"
 ],
 "pitch": 0,
 "thumbnailUrl": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_t.jpg",
 "partial": false,
 "vfov": 180,
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_poster.jpg",
   "bitrate": 7812,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723.mp4",
   "height": 1250
  }
 ]
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 98.37,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B96E76D_994E_500B_41E3_0C5FE2616644",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "media_7B87C137_70F1_2386_41C8_C4EC15C5443B_camera",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -113.19,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8A5F1811_994E_501B_41D5_C284987B8A26",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -93.07,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8BBB77CF_994E_5007_41CD_F78A0B1D35F2",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_camera",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "media_7AC91CEA_70F3_228E_41DB_75EE084E992F_camera",
 "automaticZoomSpeed": 10
},
{
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 63.12,
   "backwardYaw": -93.48,
   "distance": 1,
   "panorama": "this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 5.36,
   "backwardYaw": 3.86,
   "distance": 1,
   "panorama": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -52.72,
   "backwardYaw": 86.93,
   "distance": 1,
   "panorama": "this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47"
  }
 ],
 "label": "Cam 04 - 360",
 "id": "media_940F677A_993F_D009_41D0_55F118FF900C",
 "class": "Video360",
 "loop": true,
 "hfov": 360,
 "overlays": [
  "this.overlay_97922023_9943_D03F_41D1_3811EF084C49",
  "this.overlay_978C8546_994E_B006_41C4_01AB039F28ED",
  "this.overlay_8985A3D8_9946_B009_41B5_4D92BDADF78C"
 ],
 "pitch": 0,
 "thumbnailUrl": "media/media_940F677A_993F_D009_41D0_55F118FF900C_t.jpg",
 "partial": false,
 "vfov": 180,
 "hfovMin": 60,
 "video": [
  {
   "width": 4000,
   "posterURL": "media/media_940F677A_993F_D009_41D0_55F118FF900C_poster.jpg",
   "bitrate": 20000,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_940F677A_993F_D009_41D0_55F118FF900C.mp4",
   "height": 2000
  },
  {
   "width": 3840,
   "posterURL": "media/media_940F677A_993F_D009_41D0_55F118FF900C_poster.jpg",
   "bitrate": 18432,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_940F677A_993F_D009_41D0_55F118FF900C_go.mp4",
   "height": 1920
  },
  {
   "width": 3168,
   "posterURL": "media/media_940F677A_993F_D009_41D0_55F118FF900C_poster.jpg",
   "bitrate": 12545,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_940F677A_993F_D009_41D0_55F118FF900C_ios.mp4",
   "height": 1584
  }
 ]
},
{
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -131.92,
   "backwardYaw": 18.95,
   "distance": 1,
   "panorama": "this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -40.01,
   "backwardYaw": 66.81,
   "distance": 1,
   "panorama": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550"
  }
 ],
 "label": "Cam 08 -360",
 "id": "media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1",
 "class": "Video360",
 "loop": true,
 "hfov": 360,
 "overlays": [
  "this.overlay_65F92C8D_710F_2285_41D8_8758767F7A78",
  "this.overlay_642F27D2_7111_6E9E_41C9_13F31AE0DCF0"
 ],
 "pitch": 0,
 "thumbnailUrl": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_t.jpg",
 "partial": false,
 "vfov": 180,
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_poster.jpg",
   "bitrate": 7812,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1.mp4",
   "height": 1250
  }
 ]
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 48.08,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_88B495F6_994E_5019_41BC_6D297B8B51BC",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 128.15,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_88BA360D_994E_500A_41D2_A33A7C130B5D",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "media_940F677A_993F_D009_41D0_55F118FF900C_camera",
 "automaticZoomSpeed": 10
},
{
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -114.06,
   "backwardYaw": -22.56,
   "distance": 1,
   "panorama": "this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 70.97,
   "backwardYaw": 121.96,
   "distance": 1,
   "panorama": "this.media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19"
  }
 ],
 "label": "Cam 05 -360",
 "id": "media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E",
 "class": "Video360",
 "loop": true,
 "hfov": 360,
 "overlays": [
  "this.overlay_6182742C_70F3_218A_41D8_C11BE8141C18",
  "this.overlay_60EA9371_70F7_279A_41D9_3948B2406A33"
 ],
 "pitch": 0,
 "thumbnailUrl": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_t.jpg",
 "partial": false,
 "vfov": 180,
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_poster.jpg",
   "bitrate": 7812,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E.mp4",
   "height": 1250
  }
 ]
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -109.03,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8898F5CE_994E_5009_41E1_571AC5B37DEE",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_camera",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -1.88,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8BC23709_994E_500B_41BB_1188F2D641A6",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 65.94,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8BD0D6E7_994E_5007_41B5_29C8A814B2A9",
 "automaticZoomSpeed": 10
},
{
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -93.48,
   "backwardYaw": 63.12,
   "distance": 1,
   "panorama": "this.media_940F677A_993F_D009_41D0_55F118FF900C"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -51.85,
   "backwardYaw": 79.55,
   "distance": 1,
   "panorama": "this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47"
  }
 ],
 "label": "Cam 09 - 360",
 "id": "media_7AC91CEA_70F3_228E_41DB_75EE084E992F",
 "class": "Video360",
 "loop": true,
 "hfov": 360,
 "overlays": [
  "this.overlay_64A25A3C_7113_E18A_41C8_13132652B5E7",
  "this.overlay_8811D33F_995D_F007_41BA_4D65C15BAB50"
 ],
 "pitch": 0,
 "thumbnailUrl": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_t.jpg",
 "partial": false,
 "vfov": 180,
 "hfovMin": 60,
 "video": [
  {
   "width": 4000,
   "posterURL": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_poster.jpg",
   "bitrate": 20000,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F.mp4",
   "height": 2000
  },
  {
   "width": 3840,
   "posterURL": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_poster.jpg",
   "bitrate": 18432,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_go.mp4",
   "height": 1920
  },
  {
   "width": 3168,
   "posterURL": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_poster.jpg",
   "bitrate": 12545,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_ios.mp4",
   "height": 1584
  }
 ]
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -58.04,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B17167A_994E_5009_41D8_A3003833CA82",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_camera",
 "automaticZoomSpeed": 10
},
{
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 79.55,
   "backwardYaw": -51.85,
   "distance": 1,
   "panorama": "this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 11.49,
   "backwardYaw": 37.23,
   "distance": 1,
   "panorama": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 86.93,
   "backwardYaw": -52.72,
   "distance": 1,
   "panorama": "this.media_940F677A_993F_D009_41D0_55F118FF900C"
  }
 ],
 "label": "Cam 10 -360",
 "id": "media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47",
 "class": "Video360",
 "loop": true,
 "hfov": 360,
 "overlays": [
  "this.overlay_66BFB17A_7116_E38E_419B_CABA6B970DC0",
  "this.overlay_65D215D9_7112_E28A_41A3_68E17D2C77CC",
  "this.overlay_64F3EA8D_7112_E68A_41D1_8441BC67A2F1"
 ],
 "pitch": 0,
 "thumbnailUrl": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_t.jpg",
 "partial": false,
 "vfov": 180,
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_poster.jpg",
   "bitrate": 7812,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47.mp4",
   "height": 1250
  }
 ]
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 179.29,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B0C469A_994E_500E_41E1_A5E98590DFD0",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 9.35,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8BE5474A_994E_500E_41C8_28FB5DB95065",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -176.14,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B89E7B1_994E_501A_41DB_B4BC2E0E0E7E",
 "automaticZoomSpeed": 10
},
{
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -22.56,
   "backwardYaw": -114.06,
   "distance": 1,
   "panorama": "this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -0.71,
   "backwardYaw": 178.12,
   "distance": 1,
   "panorama": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -170.65,
   "backwardYaw": -5.56,
   "distance": 1,
   "panorama": "this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB"
  }
 ],
 "label": "Cam 02 - 360",
 "id": "media_7B87C137_70F1_2386_41C8_C4EC15C5443B",
 "class": "Video360",
 "loop": true,
 "hfov": 360,
 "overlays": [
  "this.overlay_7F92B8D9_70F1_228A_41D4_EE38036F0144",
  "this.overlay_60F6582E_70FF_6186_41C8_954456CF1B91",
  "this.overlay_7F3410CD_70F1_E28A_41D3_719DC3E074E3"
 ],
 "pitch": 0,
 "thumbnailUrl": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_t.jpg",
 "partial": false,
 "vfov": 180,
 "hfovMin": 60,
 "video": [
  {
   "width": 4000,
   "posterURL": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_poster.jpg",
   "bitrate": 20000,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B.mp4",
   "height": 2000
  },
  {
   "width": 3840,
   "posterURL": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_poster.jpg",
   "bitrate": 18432,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_go.mp4",
   "height": 1920
  },
  {
   "width": 3168,
   "posterURL": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_poster.jpg",
   "bitrate": 12545,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_ios.mp4",
   "height": 1584
  }
 ]
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_camera",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -142.77,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_88AEC620_994E_503A_41CE_5FD6D63045F9",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -174.64,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B3DB6AC_994E_5009_41BA_F54AC96B0867",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -100.45,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B746654_994E_5019_41BA_5A1B2E9CFB7D",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -116.88,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B424644_994E_5079_41E2_0AB2832B8230",
 "automaticZoomSpeed": 10
},
{
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -5.56,
   "backwardYaw": -170.65,
   "distance": 1,
   "panorama": "this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 86.35,
   "backwardYaw": -81.63,
   "distance": 1,
   "panorama": "this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723"
  }
 ],
 "label": "Cam 01 -360",
 "id": "media_7BBBA45E_70F1_2186_41D3_981E65E575BB",
 "class": "Video360",
 "loop": true,
 "hfov": 360,
 "overlays": [
  "this.overlay_7EA81B79_70F6_E78A_41D7_A7319EE59C8F",
  "this.overlay_7FE8C78E_70F3_2E86_41B4_42680951F947"
 ],
 "pitch": 0,
 "thumbnailUrl": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_t.jpg",
 "partial": false,
 "vfov": 180,
 "hfovMin": 60,
 "video": [
  {
   "width": 4000,
   "posterURL": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_poster.jpg",
   "bitrate": 20000,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB.mp4",
   "height": 2000
  },
  {
   "width": 3840,
   "posterURL": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_poster.jpg",
   "bitrate": 18432,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_go.mp4",
   "height": 1920
  },
  {
   "width": 3168,
   "posterURL": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_poster.jpg",
   "bitrate": 12545,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_ios.mp4",
   "height": 1584
  }
 ]
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -168.51,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B19768A_994E_5009_41A2_C81B7383E483",
 "automaticZoomSpeed": 10
},
{
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 121.96,
   "backwardYaw": 70.97,
   "distance": 1,
   "panorama": "this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E"
  }
 ],
 "label": "Cam 06 - 360",
 "id": "media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19",
 "class": "Video360",
 "loop": true,
 "hfov": 360,
 "overlays": [
  "this.overlay_60924D89_7111_228D_41D6_A31A64243438"
 ],
 "pitch": 0,
 "thumbnailUrl": "media/media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_t.jpg",
 "partial": false,
 "vfov": 180,
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_poster.jpg",
   "bitrate": 7812,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19.mp4",
   "height": 1250
  }
 ]
},
{
 "hfovMax": 140,
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 37.23,
   "backwardYaw": 11.49,
   "distance": 1,
   "panorama": "this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 178.12,
   "backwardYaw": -0.71,
   "distance": 1,
   "panorama": "this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 3.86,
   "backwardYaw": 5.36,
   "distance": 1,
   "panorama": "this.media_940F677A_993F_D009_41D0_55F118FF900C"
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 66.81,
   "backwardYaw": -40.01,
   "distance": 1,
   "panorama": "this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1"
  }
 ],
 "label": "Cam 03 - 360",
 "id": "media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550",
 "class": "Video360",
 "loop": true,
 "hfov": 360,
 "overlays": [
  "this.overlay_60E6CE10_711F_E19A_41D1_42B8D5FA51AA",
  "this.overlay_63266E0A_7111_218E_41C3_D631B63CBD48",
  "this.overlay_63B44F22_7111_7FBE_41CE_4AFC732E888A",
  "this.overlay_94BAEAD3_9946_D01F_41A3_3468A5B831A4"
 ],
 "pitch": 0,
 "thumbnailUrl": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_t.jpg",
 "partial": false,
 "vfov": 180,
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "posterURL": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_poster.jpg",
   "bitrate": 7812,
   "framerate": 25,
   "type": "video/mp4",
   "class": "Video360Resource",
   "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550.mp4",
   "height": 1250
  }
 ]
},
{
 "touchControlMode": "drag_rotation",
 "gyroscopeVerticalDraggingEnabled": true,
 "class": "PanoramaPlayer",
 "mouseControlMode": "drag_rotation",
 "id": "MainViewerPanoramaPlayer",
 "viewerArea": "this.MainViewer",
 "displayPlaybackBar": true,
 "gyroscopeEnabled": true
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 127.28,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B50A632_994E_501E_41D6_634B695A77DB",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": 86.52,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8B878790_994E_5019_41D3_4406E1C76865",
 "automaticZoomSpeed": 10
},
{
 "initialPosition": {
  "class": "RotationalCameraPosition",
  "yaw": -161.05,
  "hfov": 120,
  "pitch": 0
 },
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "class": "RotationalCamera",
 "automaticRotationSpeed": 10,
 "id": "camera_8BACF7EF_994E_5006_41C7_0414768D5EFB",
 "automaticZoomSpeed": 10
},
{
 "toolTipFontSize": "1.11vmin",
 "toolTipOpacity": 1,
 "id": "MainViewer",
 "toolTipShadowBlurRadius": 3,
 "playbackBarHeight": 0,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipTextShadowColor": "#000000",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 0,
 "playbackBarRight": 0,
 "width": "100%",
 "toolTipTextShadowBlurRadius": 3,
 "toolTipFontWeight": "normal",
 "playbackBarProgressBorderSize": 0,
 "toolTipPaddingBottom": 4,
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderRadius": 0,
 "progressBarBorderSize": 0,
 "shadow": false,
 "minHeight": 50,
 "toolTipShadowColor": "#333333",
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "transitionDuration": 500,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadBorderColor": "#000000",
 "paddingRight": 0,
 "toolTipFontStyle": "normal",
 "paddingLeft": 0,
 "height": "100%",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 0,
 "minWidth": 100,
 "progressLeft": 0,
 "borderSize": 0,
 "playbackBarBorderSize": 0,
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "toolTipShadowOpacity": 1,
 "toolTipFontFamily": "Arial",
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowHorizontalLength": 0,
 "vrPointerSelectionTime": 2000,
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipShadowVerticalLength": 0,
 "progressBarBackgroundColorDirection": "vertical",
 "progressBottom": 0,
 "progressHeight": 0,
 "playbackBarHeadShadow": true,
 "toolTipBackgroundColor": "#F6F6F6",
 "class": "ViewerArea",
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 0,
 "toolTipFontColor": "#606060",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "vrPointerColor": "#FFFFFF",
 "progressBarOpacity": 0,
 "playbackBarHeadShadowOpacity": 0,
 "transitionMode": "blending",
 "displayTooltipInTouchScreens": true,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBorderSize": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipBorderSize": 1,
 "toolTipPaddingTop": 4,
 "toolTipPaddingLeft": 6,
 "progressBorderRadius": 0,
 "toolTipPaddingRight": 6,
 "toolTipDisplayTime": 600,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "progressBackgroundColorRatios": [
  0
 ],
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "playbackBarHeadShadowBlurRadius": 0,
 "playbackBarHeadHeight": 0,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "progressBarBorderColor": "#000000",
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "paddingTop": 0,
 "playbackBarHeadOpacity": 0,
 "playbackBarBottom": 5,
 "progressBackgroundColorDirection": "vertical",
 "progressBorderColor": "#000000",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "paddingBottom": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipBorderColor": "#767676",
 "data": {
  "name": "Main Viewer"
 },
 "toolTipShadowSpread": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical"
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB, this.camera_888F15DF_994E_5007_41DD_4AA17CCED111); this.mainPlayList.set('selectedIndex', 4); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -6.33,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -81.63,
     "hfov": 21.47,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 01 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_6932BBB2_7171_269E_41DC_05F776F2D3F3",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -6.33,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -81.63,
     "hfov": 21.47,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_6437DA3A_7133_218E_41AD_8D1E622E9945",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1, this.camera_88B495F6_994E_5019_41BC_6D297B8B51BC); this.mainPlayList.set('selectedIndex', 1); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -2.86,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 18.95,
     "hfov": 21.57,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 08 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_69357BB2_7171_269E_41B3_0F1B62FF0D6F",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -2.86,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 18.95,
     "hfov": 21.57,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_65489FB4_7131_7E9A_4187_74CCEDD86660",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550, this.camera_8B89E7B1_994E_501A_41DB_B4BC2E0E0E7E); this.mainPlayList.set('selectedIndex', 6); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.84,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 5.36,
     "hfov": 13.34,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_940F677A_993F_D009_41D0_55F118FF900C_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam - 3 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_8BD72951_994E_B01A_41E1_5F0D1A7C47A8",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.84,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 5.36,
     "hfov": 13.34,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_97922023_9943_D03F_41D1_3811EF084C49",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47, this.camera_8BBB77CF_994E_5007_41CD_F78A0B1D35F2); this.mainPlayList.set('selectedIndex', 3); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": 30.18,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -52.72,
     "hfov": 3.89,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_940F677A_993F_D009_41D0_55F118FF900C_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam - 10 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": 30.18,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -52.72,
     "hfov": 3.89,
     "opacity": 1
    }
   ],
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_940F677A_993F_D009_41D0_55F118FF900C_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 512,
      "height": 512
     }
    ]
   },
   "pitch": 0,
   "yaw": 0
  }
 ],
 "id": "overlay_978C8546_994E_B006_41C4_01AB039F28ED",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F, this.camera_8B878790_994E_5019_41D3_4406E1C76865); this.mainPlayList.set('selectedIndex', 2); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": 31.39,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 63.12,
     "hfov": 3.84,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_940F677A_993F_D009_41D0_55F118FF900C_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam - 9 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": 31.39,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 63.12,
     "hfov": 3.84,
     "opacity": 1
    }
   ],
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_940F677A_993F_D009_41D0_55F118FF900C_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 512,
      "height": 512
     }
    ]
   },
   "pitch": 0,
   "yaw": 0
  }
 ],
 "id": "overlay_8985A3D8_9946_B009_41B5_4D92BDADF78C",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723, this.camera_8BACF7EF_994E_5006_41C7_0414768D5EFB); this.mainPlayList.set('selectedIndex', 0); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -11.36,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -131.92,
     "hfov": 21.18,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 07 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_6935EBC2_7171_26FE_41D4_0F5AE302026C",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -11.36,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -131.92,
     "hfov": 21.18,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_65F92C8D_710F_2285_41D8_8758767F7A78",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550, this.camera_8A5F1811_994E_501B_41D5_C284987B8A26); this.mainPlayList.set('selectedIndex', 6); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -5.29,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -40.01,
     "hfov": 21.51,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 03 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_6935ABC2_7171_26FE_41AA_B4D9D45C5AD3",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -5.29,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -40.01,
     "hfov": 21.51,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_642F27D2_7111_6E9E_41C9_13F31AE0DCF0",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B, this.camera_8B65B666_994E_5039_41C1_ADFC639BB60C); this.mainPlayList.set('selectedIndex', 5); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -9.28,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -114.06,
     "hfov": 21.32,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 02 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_63A553D0_7117_669A_41CB_645958D8C575",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -9.28,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -114.06,
     "hfov": 21.32,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_6182742C_70F3_218A_41D8_C11BE8141C18",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19, this.camera_8B17167A_994E_5009_41D8_A3003833CA82); this.mainPlayList.set('selectedIndex', 9); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -2.3,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 70.97,
     "hfov": 21.58,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 06 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_63A503D0_7117_669A_41CF_5123D16A639D",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -2.3,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 70.97,
     "hfov": 21.58,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_60EA9371_70F7_279A_41D9_3948B2406A33",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_940F677A_993F_D009_41D0_55F118FF900C, this.camera_8B424644_994E_5079_41E2_0AB2832B8230); this.mainPlayList.set('selectedIndex', 7); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -30.68,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -93.48,
     "hfov": 11.61,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 32,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 04 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_69344BC2_7171_26FE_41CB_7418E3BF45F9",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -30.68,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -93.48,
     "hfov": 11.61,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_64A25A3C_7113_E18A_41C8_13132652B5E7",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47, this.camera_8B746654_994E_5019_41BA_5A1B2E9CFB7D); this.mainPlayList.set('selectedIndex', 3); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": 7.81,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -51.85,
     "hfov": 4.46,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam - 10 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": 7.81,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -51.85,
     "hfov": 4.46,
     "opacity": 1
    }
   ],
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 512,
      "height": 512
     }
    ]
   },
   "pitch": 0,
   "yaw": 0
  }
 ],
 "id": "overlay_8811D33F_995D_F007_41BA_4D65C15BAB50",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_940F677A_993F_D009_41D0_55F118FF900C, this.camera_8B50A632_994E_501E_41D6_634B695A77DB); this.mainPlayList.set('selectedIndex', 7); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -39.11,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 86.93,
     "hfov": 16.76,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 34,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 04 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_6934CBC2_7171_26FE_41D4_8CBC060A5BB8",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -39.11,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 86.93,
     "hfov": 16.76,
     "opacity": 1
    }
   ],
   "distance": 50
  }
 ],
 "id": "overlay_66BFB17A_7116_E38E_419B_CABA6B970DC0",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F, this.camera_88BA360D_994E_500A_41D2_A33A7C130B5D); this.mainPlayList.set('selectedIndex', 2); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.81,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 79.55,
     "hfov": 7.17,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 09 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.81,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 79.55,
     "hfov": 7.17,
     "opacity": 1
    }
   ],
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 512,
      "height": 512
     }
    ]
   },
   "pitch": 0,
   "yaw": 0
  }
 ],
 "id": "overlay_65D215D9_7112_E28A_41A3_68E17D2C77CC",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550, this.camera_88AEC620_994E_503A_41CE_5FD6D63045F9); this.mainPlayList.set('selectedIndex', 6); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -27.32,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 11.49,
     "hfov": 19.19,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 29,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 03 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_69372BC4_7171_26FA_41C0_64172053F251",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -27.32,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 11.49,
     "hfov": 19.19,
     "opacity": 1
    }
   ],
   "distance": 50
  }
 ],
 "id": "overlay_64F3EA8D_7112_E68A_41D1_8441BC67A2F1",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550, this.camera_8BC23709_994E_500B_41BB_1188F2D641A6); this.mainPlayList.set('selectedIndex', 6); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": 9.89,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -0.71,
     "hfov": 13.3,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 03 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_63A473CF_7117_6686_41CE_018307259E4C",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": 9.89,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -0.71,
     "hfov": 13.3,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_7F92B8D9_70F1_228A_41D4_EE38036F0144",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E, this.camera_8BD0D6E7_994E_5007_41B5_29C8A814B2A9); this.mainPlayList.set('selectedIndex', 8); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.14,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -22.56,
     "hfov": 13.36,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 05 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_63A423CF_7117_6686_41CE_998D8BA13AE5",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.14,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -22.56,
     "hfov": 13.36,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_60F6582E_70FF_6186_41C8_954456CF1B91",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB, this.camera_8BF3E727_994E_5007_41E0_B4EA35FCA8CD); this.mainPlayList.set('selectedIndex', 4); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -11.44,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -170.65,
     "hfov": 13.23,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 01 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_63A583D0_7117_669A_41C6_87F3BD091D71",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -11.44,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -170.65,
     "hfov": 13.23,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_7F3410CD_70F1_E28A_41D3_719DC3E074E3",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B, this.camera_8BE5474A_994E_500E_41C8_28FB5DB95065); this.mainPlayList.set('selectedIndex', 5); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -12.13,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -5.56,
     "hfov": 13.2,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 02 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_639B93CC_7117_668A_41D5_7077402E040E",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -12.13,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": -5.56,
     "hfov": 13.2,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_7EA81B79_70F6_E78A_41D7_A7319EE59C8F",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723, this.camera_8B96E76D_994E_500B_41E3_0C5FE2616644); this.mainPlayList.set('selectedIndex', 0); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -5.54,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 86.35,
     "hfov": 13.44,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 07 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_63A493CF_7117_6686_41BE_E32E3760AC38",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -5.54,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 86.35,
     "hfov": 13.44,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_7FE8C78E_70F3_2E86_41B4_42680951F947",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E, this.camera_8898F5CE_994E_5009_41E1_571AC5B37DEE); this.mainPlayList.set('selectedIndex', 8); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.73,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 121.96,
     "hfov": 21.53,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 05 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_63A6E3D0_7117_669A_41C9_A3E288CBBF09",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -4.73,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 121.96,
     "hfov": 21.53,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_60924D89_7111_228D_41D6_A31A64243438",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B, this.camera_8B0C469A_994E_500E_41E1_A5E98590DFD0); this.mainPlayList.set('selectedIndex', 5); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -16.04,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 178.12,
     "hfov": 20.76,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 02 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_65A90C1A_7111_218F_41A3_7F5D63DAB730",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -16.04,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 178.12,
     "hfov": 20.76,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_60E6CE10_711F_E19A_41D1_42B8D5FA51AA",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_940F677A_993F_D009_41D0_55F118FF900C, this.camera_8B3DB6AC_994E_5009_41BA_F54AC96B0867); this.mainPlayList.set('selectedIndex', 7); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -7.37,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 3.86,
     "hfov": 21.42,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 32,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 04 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_67D05F35_7131_1F9A_41B9_C649C62E16A7",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -7.37,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 3.86,
     "hfov": 21.42,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_63266E0A_7111_218E_41C3_D631B63CBD48",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1, this.camera_8B2F36BE_994E_5009_41E2_928995145168); this.mainPlayList.set('selectedIndex', 1); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.93,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 66.81,
     "hfov": 21.34,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 27,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 08 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_67D7FF35_7131_1F9A_419D_E25314D82F32",
   "pitch": 0,
   "yaw": 0,
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": -8.93,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 66.81,
     "hfov": 21.34,
     "opacity": 1
    }
   ],
   "distance": 100
  }
 ],
 "id": "overlay_63B44F22_7111_7FBE_41CE_4AFC732E888A",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47, this.camera_8B19768A_994E_5009_41A2_C81B7383E483); this.mainPlayList.set('selectedIndex', 3); this.MainViewerPanoramaPlayer.play()"
  }
 ],
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": 16.16,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 37.23,
     "hfov": 6.22,
     "opacity": 1
    }
   ],
   "yaw": 0,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 0
  }
 ],
 "data": {
  "label": "Cam- 10 -360"
 },
 "useHandCursor": true,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "playbackPositions": [
    {
     "roll": 0,
     "timestamp": 0,
     "pitch": 16.16,
     "class": "PanoramaOverlayPlaybackPosition",
     "yaw": 37.23,
     "hfov": 6.22,
     "opacity": 1
    }
   ],
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 512,
      "height": 512
     }
    ]
   },
   "pitch": 0,
   "yaw": 0
  }
 ],
 "id": "overlay_94BAEAD3_9946_D01F_41A3_3468A5B831A4",
 "rollOverDisplay": false,
 "enabledInCardboard": true
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_6932BBB2_7171_269E_41DC_05F776F2D3F3",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_69357BB2_7171_269E_41B3_0F1B62FF0D6F",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_940F677A_993F_D009_41D0_55F118FF900C_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_8BD72951_994E_B01A_41E1_5F0D1A7C47A8",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_6935EBC2_7171_26FE_41D4_0F5AE302026C",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_6935ABC2_7171_26FE_41AA_B4D9D45C5AD3",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_63A553D0_7117_669A_41CB_645958D8C575",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 800,
   "height": 1200
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_63A503D0_7117_669A_41CF_5123D16A639D",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 360
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_69344BC2_7171_26FE_41CB_7418E3BF45F9",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 520,
   "height": 360
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_6934CBC2_7171_26FE_41D4_8CBC060A5BB8",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 520,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_69372BC4_7171_26FA_41C0_64172053F251",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_63A473CF_7117_6686_41CE_018307259E4C",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_63A423CF_7117_6686_41CE_998D8BA13AE5",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_63A583D0_7117_669A_41C6_87F3BD091D71",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_639B93CC_7117_668A_41D5_7077402E040E",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_63A493CF_7117_6686_41BE_E32E3760AC38",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 800,
   "height": 1200
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_63A6E3D0_7117_669A_41C9_A3E288CBBF09",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_65A90C1A_7111_218F_41A3_7F5D63DAB730",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 360
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_67D05F35_7131_1F9A_41B9_C649C62E16A7",
 "colCount": 4
},
{
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 480,
   "height": 420
  }
 ],
 "frameCount": 24,
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "id": "AnimatedImageResource_67D7FF35_7131_1F9A_419D_E25314D82F32",
 "colCount": 4
}],
 "scrollBarColor": "#000000",
 "desktopMipmappingEnabled": false,
 "paddingTop": 0,
 "propagateClick": false,
 "gap": 10,
 "mouseWheelEnabled": true,
 "backgroundPreloadEnabled": true,
 "scrollBarOpacity": 0.5,
 "mobileMipmappingEnabled": false,
 "data": {
  "name": "Player485"
 },
 "paddingBottom": 0,
 "overflow": "visible",
 "vrPolyfillScale": 0.5
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
