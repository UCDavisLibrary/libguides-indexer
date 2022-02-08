// Imports the Google Cloud client library. v1 is for the lower level
// proto access.
import { PubSub, v1 } from "@google-cloud/pubsub";
import config from './config.js';

class PubSubWrapper {

  constructor() {
    this.client = new PubSub({
      projectId : config.google.projectId
    });
    this.subClient = new v1.SubscriberClient({
      projectId : config.google.projectId
    });
  }

  async ensureTopic(topicName) {
    try {
      const [topic] = await this.client.createTopic(topicName);
      console.log(`Topic ${topic.name} created.`);
    } catch(e) {}
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

  /**
   * @method process
   * @description process pub sub messages.  Pulls a given number of pub/sub
   * messages from topic, calls the callback function.  The callback
   * function should return a promise, which is resolved when message
   * processing is complete.  After the callback function completes
   * this method will ack the message and return, resolving the returned
   * function promise.
   * 
   * @param {String} topicName 
   * @param {String} callback 
   */
  async process(topicName, count, callback) {
    if( typeof count === 'function' ) {
      callback = count;
      count = 10;
    }

    const formattedSubscription = this.subClient.subscriptionPath(
      config.google.projectId,
      topicName
    );

    // The maximum number of messages returned for this request.
    // Pub/Sub may return fewer than the number specified.
    const request = {
      subscription: formattedSubscription,
      maxMessages: count,
    };

    // The subscriber pulls a specified number of messages.
    const [response] = await this.subClient.pull(request);

    // Process the messages.
    for (const message of response.receivedMessages) {
      let data = Buffer.from(message.message.data, 'base64').toString().trim();
      console.log(`Running message: ${data}`);
      await callback(JSON.parse(data));

      let ackRequest = {
        subscription: formattedSubscription,
        ackIds: [message.ackId],
      };
  
      await this.subClient.acknowledge(ackRequest);
    }

    return response.receivedMessages.length;
  }

}

const pubsub = new PubSubWrapper();
export default pubsub;