import express from 'express';
import startHarvest from "./start-harvest.js";
import pubsub from "../pubsub.js";
import scheduler from "../scheduler.js";
import config from "../config.js";
import cleanupGCS from "../tasks/cleanup-gcs.js"

const router = express.Router()

router.get('/harvest', async (req, res) => {
  let test = (req.query.test === 'true');

  // crawl the sitemap
  let data = await startHarvest();

  if( test ) {
    data.test = true;
    data.urls = data.urls.splice(0, 1);
  }

  res.json(data);

  // make sure the pub/sub topic exists
  await pubsub.ensureTopic(config.pubsub.workerTopic);

  // send harvest messages
  for( let item of data.urls ) {
    let msg = {task: 'harvest', payload: item};
    console.log('sending pub/sub harvest: ', item.url);
    await pubsub.send(config.pubsub.workerTopic, msg);
  }

  // remove any old url crawles from GCS
  // that is urls that no longer exist in sitemap.xml
  await cleanupGCS(data);

  // schedule the worker cron
  scheduler.startWorkers(data.urls.length);
});

// router.post('/stopSchedulers', async (req, res) => {
//   let schedulers = req.body.schedulers;

//   for( let id of schedulers ) {
//     await scheduler.deleteScheduler(id);
//   }

//   res.json({
//     success: true,
//     schedulers
//   })
// });

router.get('/restartSchedulers', async (req, res) => {
  scheduler.startWorkers();
  res.json({success: true});
});


export default router;