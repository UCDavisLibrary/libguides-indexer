#! /bin/bash

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR

set -e

source ./config.sh

# you only need to run this once.
# make sure you set the correct $CLOUD_RUN_URL before you do
exit -1;

gcloud config set project $PROJECT_ID

# from: https://cloud.google.com/run/docs/tutorials/pubsub

# create the invoker service account
gcloud iam service-accounts create cloud-run-pubsub-invoker \
     --display-name "Cloud Run Pub/Sub Invoker" || true

gcloud run services add-iam-policy-binding $DEPLOYMENT_NAME-worker \
   --member=serviceAccount:cloud-run-pubsub-invoker@$PROJECT_ID.iam.gserviceaccount.com \
   --role=roles/run.invoker || true

gcloud run services add-iam-policy-binding libguides-indexer-main-worker \
   --member=serviceAccount:cloud-run-pubsub-invoker@digital-ucdavis-edu.iam.gserviceaccount.com \
   --role=roles/run.invoker

gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member=serviceAccount:service-$PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com \
     --role=roles/iam.serviceAccountTokenCreator || true

# Create a Pub/Sub subscription with the service account
gcloud pubsub topics create $TOPIC_NAME

gcloud pubsub subscriptions create $SUBSCRIPTION_NAME --topic $TOPIC_NAME \
   --push-endpoint=$CLOUD_RUN_URL \
   --push-auth-service-account=cloud-run-pubsub-invoker@$PROJECT_ID.iam.gserviceaccount.com \
   --dead-letter-topic=libguides-crawler-deadletter \
   --max-retry-delay=300 \ 
   --min-retry-delay=10 \
   --ack-deadline=120 \
   --max-delivery-attempts=5