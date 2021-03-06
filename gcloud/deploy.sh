#! /bin/bash

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR/..

set -e

source ./gcloud/config.sh

gcloud config set project $PROJECT_ID
gcloud builds submit --tag $IMAGE

gcloud beta run deploy $DEPLOYMENT_NAME-server \
  --image $IMAGE \
  --platform managed \
  --memory=1Gi \
  --region=us-central1 \
  --allow-unauthenticated \
  --max-instances=1 \
  --command="node" \
  --args="src/server.js" \
  --set-env-vars=BRANCH=$BRANCH_NAME \
  --update-secrets=SERVICE_URL=libguides-indexer-main-server-url:latest,WORKER_URL=libguides-indexer-main-worker-url:latest,LIBGUIDES_SECRET_JSON=libguides-api-client-id-secret:latest

gcloud beta run deploy $DEPLOYMENT_NAME-worker \
  --image $IMAGE \
  --platform managed \
  --memory=1Gi \
  --region=us-central1 \
  --allow-unauthenticated \
  --timeout=90 \
  --max-instances=5 \
  --command="node" \
  --args="src/worker.js" \
  --set-env-vars=BRANCH=$BRANCH_NAME \
  --update-secrets=SERVICE_URL=libguides-indexer-main-server-url:latest,WORKER_URL=libguides-indexer-main-worker-url:latest