#!/bin/bash

# Define variables
REPO_DIR="."   # Replace with the path to your cloned repo
DOCKER_IMAGE_NAME="dpxproject"  # Replace with your desired Docker image name
DOCKER_CONTAINER_NAME="dpxproject"  # Replace with your desired container name
LOG_FILE="deploy.log"  # Log file to store script output
CHECK_INTERVAL=10              # Time interval in seconds (e.g., 300s = 5 minutes)

echo "$(date): Starting update and deployment monitoring" >> $LOG_FILE

# Infinite loop for continuous monitoring
while true; do
    echo "$(date): Checking for updates..." >> $LOG_FILE

    # Navigate to the repository directory
    cd $REPO_DIR || { echo "Repository directory not found!"; exit 1; }

    # Fetch the latest updates from the remote repository
    git fetch origin >> $LOG_FILE 2>&1

    # Check if the local branch is behind the remote branch
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/master)  # Replace 'main' with your branch name

    if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
        echo "$(date): New commits detected, pulling changes..." >> $LOG_FILE

        # Pull the changes
        git pull origin master >> $LOG_FILE 2>&1

        # Build the new Docker image
        echo "$(date): Building Docker image..." >> $LOG_FILE
        docker build -t $DOCKER_IMAGE_NAME . >> $LOG_FILE 2>&1

        # Stop and remove the old container (if running)
        if [ "$(docker ps -q -f name=$DOCKER_CONTAINER_NAME)" ]; then
            echo "$(date): Stopping existing container..." >> $LOG_FILE
            docker stop $DOCKER_CONTAINER_NAME >> $LOG_FILE 2>&1
            docker rm $DOCKER_CONTAINER_NAME >> $LOG_FILE 2>&1
        fi

        # Start the new container
        echo "$(date): Starting new container..." >> $LOG_FILE
        docker run -d --name $DOCKER_CONTAINER_NAME -p 80:3000 $DOCKER_IMAGE_NAME >> $LOG_FILE 2>&1
    else
        echo "$(date): No updates detected." >> $LOG_FILE
    fi

    # Sleep for the specified interval
    echo "$(date): Sleeping for $CHECK_INTERVAL seconds..." >> $LOG_FILE
    sleep $CHECK_INTERVAL
done
