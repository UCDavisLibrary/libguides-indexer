const env = process.env;

const branch = env.BRANCH || 'sandbox';

const config = {
  port : env.PORT || 8080,

  google : {
    projectId : env.GOOGLE_PROJECT_ID || 'digital-ucdavis-edu',
    region : 'us-central1'
  },

  libguides : {
    host : env.LIBGUIDES_HOST || 'https://guides.library.ucla.edu',
    sitemap : env.LIBGUIDES_SITEMAP_PATH || '/sitemap.xml'
  },

  storage : {
    bucket : 'libguides-indexer-'+branch,
    indexFile : 'index.json'
  },

  pubsub : {
    workerTopic : 'libguides-indexer-worker-'+branch,
    workerSubscription : 'libguides-indexer-'+branch
  },

  scheduler : {
    serviceAccount : env.SCHEDULER_SERVICE_ACCOUNT || '',
    timeZone : 'Etc/UTC',
    workerProcessing : {
      nameRoot : 'libguides-worker-tasks-',
      url : env.WORKER_URL || '',
      cron : '* * * * *', // every minute
      sitesPerRequest : 10, // number of sites to crawl per GC Scheduler cron request
      stopBuffer : 2  // number of additional minutes before GC Scheduler is removed
    },
    mainService : {
      url : env.SERVICE_URL || ''
    }
  }
}

export default config;