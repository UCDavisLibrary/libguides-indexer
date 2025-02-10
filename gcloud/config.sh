#! /bin/bash

PROJECT_ID=digital-ucdavis-edu
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

IMAGE_NAME=libguides-indexer
IMAGE=us-west1-docker.pkg.dev/digital-ucdavis-edu/website/$IMAGE_NAME:$BRANCH_NAME
DEPLOYMENT_NAME=$CONTAINER_NAME
SUBSCRIPTION_NAME=libguides-indexer-$BRANCH_NAME
TOPIC_NAME=libguides-indexer-worker-$BRANCH_NAME