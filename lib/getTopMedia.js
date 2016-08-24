const _ = require('lodash');

var getSpotifyImage = function(images){
  if( ! images){
    return '';
  }
  var image = images[images.length - Math.min(2, images.length)];
  return image ? (image.url || '') : '';
};

module.exports = function (entity, results) {
  var result = {};
  var tracks = _.take(results.tracks, 3);
  tracks = _.map(tracks, function(track){
    return {
      name: track.name,
      image: getSpotifyImage(track.album.images),
      href: track.external_urls.spotify
    };
  });

  result.topTracks = tracks;

  var albums = _.map(results.tracks, function(track){
    return track.album;
  });

  albums = _.uniqBy(albums, function(album){
    return album.name;
  });

  albums = _.take(albums, 3);
  
  albums = _.map(albums, function(album){
    return {
      name: album.name,
      image: getSpotifyImage(album.images),
      href: album.external_urls.spotify
    };
  });
  
  result.topAlbums = albums;

  result.image = getSpotifyImage(entity.images);
  result.secondaryText = `${entity.followers.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} followers`;

  return result;
};
