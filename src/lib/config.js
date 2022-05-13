import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = process.env;
const branch = env.BRANCH || 'sandbox';

let libguides = {};
let libGuidesSecretFile = env.LIBGUIDES_SECRET_FILE || path.resolve(__dirname, '..','..', '.libguides.json');
if( fs.existsSync(libGuidesSecretFile) ) {
  libguides = JSON.parse(fs.readFileSync(libGuidesSecretFile, 'utf-8'));
} else if( env.LIBGUIDES_SECRET_JSON ) {
  libguides = JSON.parse(env.LIBGUIDES_SECRET_JSON);
}

const config = {
  port : env.PORT || 8080,

  google : {
    projectId : env.GOOGLE_PROJECT_ID || 'digital-ucdavis-edu',
    region : 'us-central1'
  },

  libguides : {
    host : env.LIBGUIDES_HOST || 'https://guides.library.ucla.edu',
    sitemap : env.LIBGUIDES_SITEMAP_PATH || '/sitemap.xml',
    api : {
      clientId : env.LIBGUIDES_CLIENT_ID || libguides.clientId,
      clientSecret : env.LIBGUIDES_CLIENT_SECRET || libguides.clientSecret,
      url : env.LIBGUIDES_API_URL || 'https://lgapi-us.libapps.com',
      databasePath : '/1.2/az',
      authPath : '/1.2/oauth/token'
    }
  },

  storage : {
    bucket : 'libguides-indexer-'+branch,
    indexFile : 'index.json',
    databaseFile : 'databases.json'
  },

  pubsub : {
    workerTopic : 'libguides-indexer-worker-'+branch,
    workerSubscription : 'libguides-indexer-'+branch
  },

  scheduler : {
    timeZone : 'Etc/UTC',
    workerProcessing : {
      nameRoot : 'libguides-worker-tasks-',
      url : env.WORKER_URL || '',
      cron : '* * * * *', // every minute
      sitesPerRequest : 10 // number of sites to crawl per GC Scheduler cron request
      // stopBuffer : 10  // number of additional minutes before GC Scheduler is removed
    },
    mainService : {
      url : env.SERVICE_URL || ''
    }
  }
}

export default config;