import { PubSub } from "@google-cloud/pubsub";
import config from './config.js';

class PubSubWrapper {

  constructor() {
    this.client = new PubSub({
      projectId : config.google.projectId
    });
  }

  async ensureTopic(topicName) {
    try {
      const [topic] = await this.client.createTopic(topicName);
      console.log(`Topic ${topic.name} created.`);
    } catch(e) {
      console.warn(`Failed to create topic: ${topicName}`, e);
    }
  }

  send(topic, msg) {
    if( typeof msg === 'object' ) {
      msg = JSON.stringify(msg);
    }
    if( typeof msg === 'string' ) {
      msg = Buffer.from(msg);
    }

    return new Promise((resolve, reject) => {
      this.client.topic(topic).publishMessage({data:msg}, (err, resp) => {
        if( err ) reject(err);
        else resolve(resp);
      });
    });
    
  }

}

const pubsub = new PubSubWrapper();
export default pubsub;