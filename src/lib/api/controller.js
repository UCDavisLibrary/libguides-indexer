import express, { response } from 'express';
import startHarvest from "./start-harvest.js";
import pubsub from "../pubsub.js";
import scheduler from "../scheduler.js";
import config from "../config.js";

const router = express.Router()

router.get('/harvest', async (req, res) => {
  let test = (req.query.test === 'true');
  let data = await startHarvest();

  if( test ) {
    data.test = true;
    data.urls = data.urls.splice(0, 1);
  }

  res.json(data);

  await pubsub.ensureTopic(config.pubsub.workerTopic);

  for( let item of data.urls ) {
    let msg = {task: 'harvest', payload: item};
    console.log('sending pub/sub harvest: ', item.url);
    await pubsub.send(config.pubsub.workerTopic, msg);
  }

  scheduler.startWorkers(data.urls.length);
});

router.post('/stopSchedulers', async (req, res) => {
  let schedulers = req.body.schedulers;

  for( let id of schedulers ) {
    await scheduler.deleteScheduler(id);
  }

  res.json({
    success: true,
    schedulers
  })
});

router.get('/restartSchedulers', async (req, res) => {
  let count = parseInt(req.query.pages || 100)
  scheduler.startWorkers(count);
  res.json({success: true, pages: count});
});


export default router;