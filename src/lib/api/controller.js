import startHarvest from "./start-harvest.js";
import pubsub from "../pubsub.js";
import config from "../config.js";

async function controller(req, res) {
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
}



export default controller;