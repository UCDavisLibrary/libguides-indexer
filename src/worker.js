import express from 'express';
import config from './lib/config.js';
import storage from './lib/storage.js';
import puppeteer from "./lib/puppeteer.js";
import harvestPage from './lib/tasks/harvest-page.js';

const app = express();


app.use(express.json());

app.post('/', async (req, res) => {
  try {
    if (!req.body) {
      const msg = 'no Pub/Sub message received';
      console.error(`error: ${msg}`);
      res.status(400).send(`Bad Request: ${msg}`);
      return;
    }

    if (!req.body.message) {
      const msg = 'invalid Pub/Sub message format';
      console.error(`error: ${msg}`);
      res.status(400).send(`Bad Request: ${msg}`);
      return;
    }

    const pubSubMessage = req.body.message;
    let data = Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    console.log('Running messsage', data);
    data = JSON.parse(data);

    await puppeteer.init();

    console.log('harvesting: '+data.payload.url);
    let content = await harvestPage(data.payload.url);
    console.log('writing: '+data.payload.id+'.json');
    await storage.writeJson(data.payload.id+'.json', content);

    await puppeteer.browser.close();

    res.status(204).send();
  } catch(e) {
    console.error('Failed to run task', e.message, e.stack);
    res.status(400).send('Error: '+e.message);
  }
});

app.listen(config.port, () =>
  console.log(`worker ready, listening on port ${config.port}`)
);
