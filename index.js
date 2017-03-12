const fs = require('fs');
const kue = require('kue');
const jobs = kue.createQueue();
const Promise = require('promise');
const download = require('download-file');
const feedparser = require('feedparser-promised');


const config = require('./config');


const feedsURL = 'https://feeds.feedwrench.com/';
const filesURL = 'https://devchat.cachefly.net/';


const fileExist = (name) => {
  const exists = fs.existsSync;
  const isArchived = exists(`./archive/${name}`);
  const isDownload = urls.some((obj) => exists(`episodes/${obj.type}/${name}`));

  return isArchived || isDownload;
};


const urls = config.filter((obj) => obj.active);
const promises = urls.map((obj) => feedparser.parse(`${feedsURL}${obj.rss}`));


Promise.all(promises).then((data) => {
  data.forEach((xml, i) => {
    xml.forEach((item) => {
      const name = item.enclosures[0].url.split('/').pop().replace('?rss=true', '');

      if (!fileExist(name)) {
        const jobConfig = {
          filename: name,
          directory: `./episodes/${urls[i].type}`,
          url: `${filesURL}${urls[i].type}/${name}`,
        };

        jobs.create('convert mp3', jobConfig).removeOnComplete(true).save();
      }
    });
  });

  jobs.process('convert mp3', 1, (job, done) => {
    download(job.data.url, job.data, done);
  });
});


kue.app.listen(3000);
