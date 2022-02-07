import express from 'express';
import config from './lib/config.js';
import controller from './lib/api/controller.js';
const app = express();

app.use(express.json());
app.use(controller);

app.listen(config.port, () =>
  console.log(`libguides indexer listening on port ${config.port}`)
);
