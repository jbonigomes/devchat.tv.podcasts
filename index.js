// Dependencies
const fs = require('fs');
const kue = require('kue');
const jobs = kue.createQueue();
const Promise = require('promise');
const express = require('express');
const download = require('download-file');
const feedparser = require('feedparser-promised');


// MAKE SURE THE FOLDERS YOU'LL 'SAVE TO' EXIST AND ARE CHMOD 777
// WE ALSO ASSUME THAT WHATCHED FILES GO INTO A SUBFOLDER NAMED 'archive'
// VIEW README FOR THE COMPLETE WORKFLOW
// Due to inconsistency with their urls, the app only caters for jabber and
// angular podcasts, fell free to open a PR that adds more podcasts from
// Devchat.TV and/or any other feeds
const urls = [{
  type: 'jabber',
  path: 'episodes/jabber',
  url: 'https://feeds.feedwrench.com/JavaScriptJabber.rss',
}, {
  type: 'angular',
  path: 'episodes/angular',
  url: 'https://feeds.feedwrench.com/AdventuresInAngular.rss',
}];


const fix = (name) => {
  if (name === 'JSJ250_InfoSec_for_Web_Developers_with_Kim_Carter.mp3') {
    return 'JSJ251_InfoSec_for_Web_Developers_with_Kim_Carter.mp3';
  }

  return name;
};


const promises = urls.map((config) => feedparser.parse(config.url));
const getType = (type) => type === 'jabber' ? 'javascriptjabber' : 'angular';
const getURL = (nm, tp) => `https://devchat.cachefly.net/${getType(tp)}/${nm}`;
const getEpisodeName = (url) => fix(url.split('/').pop().replace('?rss=true', ''));


const fileExist = (name) => {
  return urls.some((obj) => {
    const exist = fs.existsSync(`${obj.path}/${name}`);
    const isArchived = fs.existsSync(`${obj.path}/archive/${name}`);

    return exist || isArchived;
  });
};


Promise.all(promises).then((feeds) => {
  feeds.forEach((feed, i) => {
    feed.forEach((xml) => {
      const name = getEpisodeName(xml.enclosures[0].url);

      if (!fileExist(name)) {
        const config = {
          filename: name,
          directory: urls[i].path,
          url: getURL(name, urls[i].type),
        };

        jobs.create('convert mp3', config).removeOnComplete(true).save();
      }
    });
  });

  jobs.process('convert mp3', 1, (job, done) => {
    download(job.data.url, job.data, done);
  });
});


kue.app.listen(3000);


// UNCOMMENT TO USE THIS SAMPLE OF QUEUE MANAGEMENT
// jobs.failed((err, ids) => {
//   ids.forEach(kue.Job.remove);
// });
