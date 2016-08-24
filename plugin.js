const debug = require('debug')('spotify-plugin');
const getTopMedia = require('./lib/getTopMedia');
const request = require('superagent');
const _ = require('lodash');

const BASE_URI = 'https://api.spotify.com/v1/search?';

var spotifyArtistCache = {};

class SpotifyPlugin {

  search (entityType, query, cb) {

    debug(`performing ${entityType} search w query ${query}`);

    if (entityType === 'artist') {
      return request.get(`${BASE_URI}type=artist&q=${encodeURIComponent(query)}`, (err, res) => {
        if (err) return cb(err);

        let results = res.body;

        // Cherry-pick out just the artists
        var artists = results.artists.items;
        _.each(artists, (item) => {
          item.humanhref = item.external_urls.spotify;
        });
        debug(`found ${artists.length} artists`);
        return cb(null, artists);
      });
    } else if (entityType === 'work') {
      return request.get(`${BASE_URI}type=track&q=${encodeURIComponent(query)}`, (err, res) => {

        let results = res.body;

        var tracks = results.tracks.items;
        _.each(tracks, (item) => {
          item.humanhref = item.external_urls.spotify;
          item.artist = item.artists.length > 0 ? item.artists[0].name : '';
          item.workId = '';
        });
        return tracks;
      });
    }

    return cb(new Error('entity type not supported by spotify search plugin'));
  }

  getDetails (entity, cb) {

    if (! entity.href) return cb(new Error('detail search withtout entity.href not supported by spotify search plugin'));

    debug(`getting details for entity at ${entity.href}`);

    var searchUrl = entity.href + '/top-tracks?country=US';

    if (spotifyArtistCache[searchUrl]) {
      return cb(null, getTopMedia(entity, spotifyArtistCache[searchUrl]));
    } else {
      return request.get(searchUrl, (err, res) => {
        if (err) return cb(err);
        spotifyArtistCache[searchUrl] = res.body;
        return cb(null, getTopMedia(entity, spotifyArtistCache[searchUrl]));
      });
    }

  }

}

module.exports = SpotifyPlugin;