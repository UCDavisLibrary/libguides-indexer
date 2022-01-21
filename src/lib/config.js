const env = process.env;

const branch = env.BRANCH || 'sandbox';

const config = {
  port : env.PORT || 8080,

  google : {
    projectId : env.GOOGLE_PROJECT_ID || 'digital-ucdavis-edu'
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
    workerTopic : 'libguides-indexer-worker-'+branch
  }
}

export default config;