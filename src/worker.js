import express from 'express';
import config from './lib/config.js';
import storage from './lib/storage.js';
import puppeteer from "./lib/puppeteer.js";
import harvestPage from './lib/tasks/harvest-page.js';
import pubsub from './lib/pubsub.js';
import scheduler from './lib/scheduler.js';

const app = express();
app.use(express.json());

let busy = false;

app.get('/', async (req, res) => {
  // TODO: check auth

  if( busy ) {
    return res.status(503).send(`Busy`);
  }
  busy = true;

  try {
    // process the configured number of messages
    let processCount = await pubsub.process(
      config.pubsub.workerSubscription, 
      config.scheduler.workerProcessing.sitesPerRequest,
      handlePubSubMessage
    );

    console.log('Processed tasks: '+processCount);
    res.send('Success, processed '+processCount+' tasks');

    // check if we should cancel scheduler
    if( processCount === 0 && req.query['job-name'] ) {
      console.log('Appears to be no more tasks in queue and scheduler job name provided.  Canceling scheduler: '+req.query['job-name']);
      scheduler.deleteScheduler(req.query['job-name']);
    }

  } catch(e) {
    console.error('Failed to run task', e.message, e.stack);
    res.status(400).send('Error: '+e.message);
  }

  busy = false;
});

async function handlePubSubMessage(data) {
  try {
    await puppeteer.init();

    let content = await harvestPage(data.payload.url, data.payload.id);

    console.log('writing: '+data.payload.id+'.json');
    await storage.writeJson(data.payload.id+'.json', content);

    await puppeteer.browser.close();
  } catch(e) {
    console.error('Failed to harvest page', data, e);
  }
}


app.listen(config.port, () =>
  console.log(`worker ready, listening on port ${config.port}`)
);
