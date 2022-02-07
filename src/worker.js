import express from 'express';
import config from './lib/config.js';
import storage from './lib/storage.js';
import puppeteer from "./lib/puppeteer.js";
import harvestPage from './lib/tasks/harvest-page.js';
import pubsub from './lib/pubsub.js';

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
    let processCount = await pubsub.process(
      config.pubsub.workerSubscription, 
      config.scheduler.workerProcessing.sitesPerRequest,
      handlePubSubMessage
    );

    console.log('Process tasks: '+processCount);
    res.send('Success, processed '+processCount+' tasks');
  } catch(e) {
    console.error('Failed to run task', e.message, e.stack);
    res.status(400).send('Error: '+e.message);
  }

  busy = false;
});

async function handlePubSubMessage(data) {
  await puppeteer.init();

  let content = await harvestPage(data.payload.url, data.payload.id);

  console.log('writing: '+data.payload.id+'.json');
  await storage.writeJson(data.payload.id+'.json', content);

  await puppeteer.browser.close();
}


app.listen(config.port, () =>
  console.log(`worker ready, listening on port ${config.port}`)
);
