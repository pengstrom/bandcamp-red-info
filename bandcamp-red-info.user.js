// ==UserScript==
// @version 2
// @name Bandcamp upload helper
// @include http*://*.bandcamp.com/album/*
// @include http*://*.redacted.ch/upload.php
// @grant GM.xmlHttpRequest
// @grant GM_xmlHttpRequest
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==



console.log(GM);



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

function getUploadHtml(onload, onerror) {
  var uploadUrl = 'https://redacted.ch/upload.php';
  var setup = {
    url: uploadUrl,
    onload: onload,
    onerror: onerror,
    method: 'GET'
  };

  if (typeof(GM) == 'object' && GM.xmlHttpRequest) {
    GM.xmlHttpRequest(setup);
  } else if (typeof(GM_xmlHttpRequest) == 'function') {
    GM_xmlHttpRequest(setup);
  } else {
    alert('Error: GM xmlHttpRequest not available');
  }
}

function uploadWindow(res) {
  var w = window.open();
  w.document.write(res.responseText);
}

function alertHtml(res) {
  console.log('Error', res.responseText);
}

function generateMarkup() {
	var tracks = $('#track_table > tbody > tr.track_row_view').map(trToTrack).get();
  
  var description = $('div[itemprop=description]').text().replace(/[\n\r][\n\r][\n\r][\n\r]/g, '\n\n');
  
  var year = $('meta[itemprop=datePublished]').prop('content').substring(0,4);
  
  var title = $('h2[itemprop=name]').text().trim();
  
  var artist = $('span[itemprop=byArtist] > a').text().trim();
  
  if (artist === 'Various Artists') {
  	artist = $('#band-name-location > span .title').text().trim();
  }
  
  var info = {
    tracks: tracks,
    desc: description,
    url: window.location.href,
    year: year,
    title: title,
    artist: artist
  };
  
  console.log(info);
  
  var markup = yadg(info);
  
  //alert(markup);

  getUploadHtml(uploadWindow, alertHtml);
}

$(document).ready(function () {  
	var input=document.createElement("input");
	input.type="button";
	input.value="Generate description";
	input.onclick = generateMarkup;
	input.setAttribute("style", "font-size:18px;margin-bottom:1rem;top:120px;right:40px;");
  
  $('#track_table').before(input);
});