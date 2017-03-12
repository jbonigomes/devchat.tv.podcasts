# RSS FEED Fetcher/Manager for Devchat.tv

I have written this utility to manage the podcasts I listen from Devchat.tv,
because managing them via iTunes or Sticher is a complete nightmare.


## Get started

Make sure Redis is running:

    $ redis-server /usr/local/etc/redis.conf

And that all npm dependencies are met:

    $ npm install

Then:

    $ node index.js

If it works correctly you should be able to navigate to:

    http://localhost:3000

Where you will see a queue of all mp3's being converted, you may manage your
queue via the interface or programatically (refer back to
[https://github.com/Automattic/kue](Kue)).


## Workflow

I envision using this utility like so:

- open config.js and set all podcasts you wish to sync to `true`
- run `$ node index.js` to fetch all the podcasts that you don't already have
- once complete, copy the files you want to your portable device (iPod, etc...)
- run `$ node archive.js <path/to/file.mp3>` for all files you coppied across

Archiving them makes it easier to keep track of what we alredy listened,
obviously :D


## Notes on how the script works

- When downloading new files, we look into the `episodes` and `archive` folders
so that we do not attempt to download files that have been downloaded already.

- When archiving a file via `archive.js` not only we move the file to the
archive folder, but also, we truncate the file, so that only it's reference
stays behind, thus, saving your disk space.

- Take good care of your queue, we do not cater for failures, the web interface
only 'names the shame'.
