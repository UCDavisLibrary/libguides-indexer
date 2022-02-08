#! /bin/bash

PROJECT_ID=digital-ucdavis-edu
GCR_PROJECT_ID=ucdlib-pubreg

BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

CONTAINER_NAME=libguides-indexer-$BRANCH_NAME
IMAGE=gcr.io/$GCR_PROJECT_ID/$CONTAINER_NAME
DEPLOYMENT_NAME=$CONTAINER_NAME
SUBSCRIPTION_NAME=libguides-indexer-$BRANCH_NAME
TOPIC_NAME=libguides-indexer-worker-$BRANCH_NAME