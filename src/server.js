import express from 'express';
import config from './lib/config.js';
import controller from './lib/api-controller.js';
const app = express();

app.use(express.json());
app.post('/', controller);

app.listen(config.port, () =>
  console.log(`nodejs-pubsub-tutorial listening on port ${PORT}`)
);
