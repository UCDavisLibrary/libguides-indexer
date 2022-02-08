import scheduler from '@google-cloud/scheduler';
import config from "./config.js";

class GCSScheduler {

  constructor() {
    this.client = new scheduler.CloudSchedulerClient();
  }

  async startWorkers() {
    // Construct the fully qualified location path.
    const parent = this.client.locationPath(
      config.google.projectId, 
      config.google.region
    ); 

    // Construct the request body.
    let name = config.scheduler.workerProcessing.nameRoot + Date.now();
    const job = {
      name : parent+'/jobs/'+name,
      httpTarget: {
        uri: config.scheduler.workerProcessing.url+'?job-name='+encodeURIComponent(name),
        httpMethod: 'GET'
      },
      schedule: config.scheduler.workerProcessing.cron,
      timeZone: config.scheduler.timeZone,
    };

    const request = {
      parent: parent,
      job: job,
    };

    // Use the client to send the job creation request.
    const [response] = await this.client.createJob(request);
    console.log(`Created worker job: ${response.name}`);

  //  this.scheduleWorkComplete(name, taskCount); 
  }

  /**
   * @method scheduleWorkComplete
   * @deprecated 
   * 
   * @param {*} workerSchedulerName 
   * @param {*} taskCount 
   */
  async scheduleWorkComplete(workerSchedulerName, taskCount) {
    // we are running sitesPerRequest every minute, so we need to expire
    // after taskCount/sitesPerRequest.  A ten minute buffer is added for
    // saftey.  Finally convert to ms and add to current time;

    let expireTime = new Date(
      Date.now() + 
      (
        (Math.ceil(taskCount/config.scheduler.workerProcessing.sitesPerRequest) + config.scheduler.workerProcessing.stopBuffer ) * 1000 * 60
      )  
    );
    let cron = (expireTime.getUTCMinutes()+1)+' '+expireTime.getUTCHours()+' '+expireTime.getUTCDate()+' '+(expireTime.getUTCMonth()+1)+' *';


    // Construct the fully qualified location path.
    const parent = this.client.locationPath(
      config.google.projectId, 
      config.google.region
    ); 

    // Construct the request body.
    let name = config.scheduler.workerProcessing.nameRoot + 'stop-' + Date.now();
    const job = {
      name: parent+'/jobs/'+name,
      httpTarget: {
        uri: config.scheduler.mainService.url+'/stopSchedulers',
        httpMethod: 'POST',
        headers : {
          'content-type' : 'application/json'
        },
        body: Buffer.from(JSON.stringify({
          schedulers: [name, workerSchedulerName]
        })),
      },
      schedule: cron,
      timeZone: config.scheduler.timeZone,
    };

    const request = {
      parent: parent,
      job: job,
    };

    // Use the client to send the job creation request.
    const [response] = await this.client.createJob(request);
    console.log(`Created stop job at (${expireTime.toISOString()}, ${cron}): ${response.name}`);
  }

  async deleteScheduler(jobId) {
    const job = this.client.jobPath(config.google.projectId, config.google.region, jobId);

    // Use the client to send the job creation request.
    await this.client.deleteJob({name: job});
    console.log(`Job deleted: ${jobId}`);
  }

}

const instance = new GCSScheduler();
export default instance;