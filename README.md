# libguides-indexer
LibGuides crawler for indexing sites into ElasticSearch

# Cloud Architecture

The LibGuides Indexer leverages the follow Google Cloud Services:
 - Scheduler 
 - Run (GCR)
 - Pub/Sub 
 - Storage (GCS)
 - Build (GCB)
 - Container Registery

The indexer has two services, the main `server` and the `worker` service.  Both serivces are baked into the same Dockerfile.  Google Cloud Build and Google Cloud Container Registery are used to build and store the Docker image.

The `server` service:
 - Crawls the `sitemap.xml` file, writing the discovered urls to the GCS bucket as index.json.  
   - the MD5 of each url is used as the url, filesystem friendly, `id`.
 - Sends a Pub/Sub message for each url to be crawled
 - Crawls all existing *.json files in the GCS bucket, removing any url files that no longer exist in the current sitemap.xml
 - Starts a Google Cloud Scheduler job, which runs every minute.
   - The job makes a call to the worker GCR service url, starting page crawling

The `worker` service:
  - Receives requests from the Google Cloud Scheduler job, instructing the worker to start crawling
  - The crawler then pulls a message from the Pub/Sub queue
    - If no message is found, the worker deletes the Google Cloud Scheduler job and the crawling process is completed.
  - The crawler crawls the url/guide (and all linked child pages for the guide)
  - A [id].json file is written to the GCS bucket with the crawled and transformed libguide data.
  - This process is repeated `scheduler.workerProcessing.sitesPerRequest` (see `config.js`) times (defaults to 10).
  - After there `sitesPerRequest` limit is reached or there are not more messages in the queue, the worker stops crawling.

Notes.
 
Why the `sitesPerRequest`?
 - You can wire up GCR to Pub/Sub push requests, but there is no flow control (well, very limited and out of our control).  So the workers are overwhelmed with url crawl requests and 1) can't handle it 2) spam the requested libguide host.
 - Google Cloud Run can work on a HTTP request model but the amount of time a worker can 'do work' is limited by a timeout.
 - To work around the HTTP timeout, and to be a nice web citizen, we use Google Cloud Scheduler with `sitesPerRequest` to batch crawling, defaulting to 10 libguides every minute (that is 10 root pages + children).
 - Once all messages have been consumed, the worker kills off the Google Cloud Scheduler crawling job.
   
A, forever living, Google Cloud Scheduler job kicks off the crawling process off at 3am (ish) every morning by poking the main services `/harvest` url.

# Development

This section explains how to add/remove/fix functionality on the harvester.  The directory structure is broken out into a scriptable sections.
  - `api` contains the main http controllers for the services
  - `task` contains the worker or server tasks.  Really there are two; `crawl-sitemap.js` which the server runs to find the libguides to crawl and `harvest-page` which is responsible for extracting content from a libguide, including crawling the libguides child pages.
  - `harvest-page` contains individual scripts that are responsible for extracting different parts of the libguides DOM content.  Examples include DublinCore metadata extracting, OpenGraph extracting, breadcrumb crawling, etc.  Note each one of the tasks gets its own script file and is then registered in `harvest-page`


## Editing the guide harvest

To change/edit how and what is extracted from a libguide, you:
 - Make changes to the script files in `src/lib/harvest-page/`.  
 - The harvest script should import the `puppeteer` module, which is a wrapper around the global instance of chrome (`puppeteer.browser` and `puppeteer.page`).  
 - The `puppeteer.page` is already loaded to the current page, so everything is ready to go.  All you need to do is extact the data and return the extracted data.
 - It is recommended you use `puppeteer.page.evaluate` which lets you run any JavaScript you want in side the browsers page context.  Then returns the serializable JavaScript objects back to the NodeJS context.
   - Please read documentation on this.  You can pass variables into the `evaluate` function and return data as well.  But these variables are passing through different JS contexts and therefore must be serializable (think JSON.stringify, JSON.parse).  So you can't, for example, return a DOM element from the `evaluate` script. https://pptr.dev/#?product=Puppeteer&version=v13.2.0&show=api-pageevaluatepagefunction-args

Example extracting DublinCore metadata that is stored in the `head` tag as `meta` tags.
```js
import puppeteer from '../puppeteer.js';

async function dcMetatags() {
  // This code is running in NodeJS runtime
  let resp = await puppeteer.page.evaluate(() => 
    // Note, this code is running IN CHROME! :)
    Array.from(document.querySelectorAll('meta'))
      // filter metatags whos name attribute starts with 'DC.'
      .filter(tag => (tag.getAttribute('name') || '').match(/^DC\./))
      // create an array of objects with name/value with value from content attribute
      .map(tag => ({
        name: tag.getAttribute('name').replace(/^DC\./, '').toLowerCase(),
        value: tag.getAttribute('content')  
      }))
  );

  // map the return array to an object and return
  let data = {};
  resp.forEach(item => data[item.name] = item.value);

  return data;
}

export default dcMetatags;
```

Once your data harvester changes are complete, you just need to register the extracted data in the main data response object (if you have created a new script).  See `src/tasks/harvest-page.js`.  Comments will lead the way.  It's a simple script.  

`harvestPage()` is a recursive function, that uses the special `child-pages` script to find child pages of the libguide and set their content in the `children` array.

## Local Harvest

You can test out the harvesting on your local machine using the sample `src/harvest-local.js` script.

# API

 - Server
   - GET `/harvest`.  Starts the libguide crawling process. This url is requested nightly by the Google Cloud Scheduler.  Note, you can pass an optional `?test=true` parameter and the main service will only send one url to be harvested.
   - GET `/restartSchedulers`.  If there are unread messages in the Pub/Sub queue and the workers Scheduler job is not running for some reason (badness), this endpoint will recreate the Google Cloud Scheduler process.

 - Worker
   - GET `/`.  Start the worker process, reading tasks from the PubSub queue.
