// ==UserScript==
// @version 2
// @name Bandcamp upload helper
// @description Bandcamp helper for getting info to RED
// @include http*://*.bandcamp.com/album/*
// @include http*://*.redacted.ch/upload.php
// @grant GM.xmlHttpRequest
// @grant GM_xmlHttpRequest
// @grant GM.openInTab
// @grant GM.getValue
// @grant GM.setValue
// @grant GM.listValues
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

function yadgTrack(track) {
  return '[b]' + track.num + '[/b]. ' + track.name + ' [i](' + track.duration + ')[/i]';
}

function yadg(info) {
  
  var res = '';
  
  if (info.desc) {
  	res += '[size=4][b]Description[/b][/size]\n\n';
  	res += info.desc + '\n\n';
  }
  
  res += '[size=4][b]Tracklist[/b][/size]\n\n'
  for (var i=0; i < info.tracks.length; i++) {
    res += yadgTrack(info.tracks[i]) + '\n';
  }
  res += '\n';
  
  res += 'More information: [url]' + info.url + '[/url]';
  
  return res;
}

function trToTrack(idx, tr) {
  var tracknum = $(tr).find('td:nth-child(2)').text().trim();
  tracknum = tracknum.substring(0, tracknum.length - 1);
	var name = $(tr).find('span[itemprop=name]').text().trim();
  var duration = $(tr).find('meta[itemprop=duration]').prop('content').replace(/P(\d+)H(\d+)M(\d+)S/g, '$2:$3');
  
  return {
    num: tracknum,
    name: name,
    duration: duration
  };
}

function saveInfo(info) {
  var markup = yadg(info);

  GM.setValue('artist', info.artist);
  GM.setValue('album', info.album);
  GM.setValue('Year', info.year);
  GM.setValue('desc', markup);

  console.log(GM.listValues());
}

function generateInfo() {
	var tracks = $('#track_table > tbody > tr.track_row_view').map(trToTrack).get();
  
  var description = $('div[itemprop=description]').text().replace(/[\n\r][\n\r][\n\r][\n\r]/g, '\n\n');
  
  var year = $('meta[itemprop=datePublished]').prop('content').substring(0,4);
  
  var album = $('h2[itemprop=name]').text().trim();
  
  var artist = $('span[itemprop=byArtist] > a').text().trim();
  
  if (artist === 'Various Artists') {
  	artist = $('#band-name-location > span .title').text().trim();
  }
  
  var info = {
    tracks: tracks,
    desc: description,
    url: window.location.href,
    year: year,
    album: album,
    artist: artist
  };
  
  console.log(info);
  
  saveInfo(info);

  var uploadUrl = 'https://redacted.ch/upload.php';
  GM.openInTab(uploadUrl);
}

function initBandcamp() {
	var input=document.createElement("input");
	input.type="button";
	input.value="Generate description";
	input.onclick = generateInfo;
	input.setAttribute("style", "font-size:18px;margin-bottom:1rem;top:120px;right:40px;");
  
  $('#track_table').before(input);
}

function initRedacted() {
  console.log(GM.listValues());
  $('#year').prop('value', GM.getValue('year'));
}

$(document).ready(function () {  
  var current = location.href;
  if (current.indexOf('bandcamp') !== -1) {
    initBandcamp();
  } else if (current.indexOf('redacted') !== -1) {
    initRedacted();
  } else {
    alert('Error: href mismatch.');
  }
});