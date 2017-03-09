// Dependencies
const colours = require('colors');
const Promise = require('promise');
const parser = require('rss-parser');
const download = require('download-file');


const cleanJabberURL = (url) => {
  const pod = 'www.podtrac.com/pts/redirect.mp3/';
  const base = 'https://devchat.cachefly.net/javascriptjabber/';

  return url
    .replace('?rss=true', '')
    .replace('http://media.devchat.tv/js-jabber/', base)
    .replace('https://media.devchat.tv/js-jabber/', base)
    .replace('http://devchat.cachefly.net/javascriptjabber/', base)
    .replace(`http://${pod}${pod}${pod}media.devchat.tv/js-jabber/`, base);
};


const cleanAngularURL = (url) => {
  const pod = 'www.podtrac.com/pts/redirect.mp3/';
  const base = 'https://devchat.cachefly.net/adventuresinangular/';

  return url
    .replace('?rss=true', '')
    .replace(`http://${base}media.devchat.tv/angular/`, base)
    .replace(`http://${base}devchat.cachefly.net/angular/`, base)
    .replace(`http://${base}media.devchat.tv/adventures-in-angular/`, base);
};


const cleanURL = (url, type) => {
  if (type === 'jabber') {
    return cleanJabberURL(url);
  }

  if (type === 'angular') {
    return cleanAngularURL(url);
  }

  return url;
};


const cleanFileName = (url) => url.split('/').pop().replace(':', '');


const getPodcasts = (config) => {
  return new Promise((solve) => {
    parser.parseURL(config.url, (err, xml) => {
      const promises = xml.feed.entries.map((row) => {
        return new Promise((resolve) => {
          const url = cleanURL(row.enclosure.url, config.type);

          const options = {
            directory: config.path,
            filename: cleanFileName(url),
          };

          download(url, options, () => {
            console.log(colours.green(`FINISHED ${options.filename}`));
            resolve();
          });
        });
      });

      Promise.all(promises).then(solve);
    });
  });
};


// MAKE SURE THE FOLDERS YOU'LL 'SAVE TO' EXIST AND ARE CHMOD 777
// Due to inconsistency with their urls, the app only caters for jabber and
// angular podcasts, fell free to open a PR that adds more podcasts from
// Devchat.TV and any other feeds, just remember to create a unique type along
// with a cleanURL function
const urls = [{
  type: 'jabber',
  path: 'episodes/jabber',
  url: 'https://feeds.feedwrench.com/JavaScriptJabber.rss',
}, {
  type: 'angular',
  path: 'episodes/angular',
  url: 'https://feeds.feedwrench.com/AdventuresInAngular.rss',
}].map(getPodcasts);

Promise.all(urls).then(() => {
  console.log(colours.rainbow('ALL FILES PROCESSED SUCCESSFULLY'));
  process.exit();
});
