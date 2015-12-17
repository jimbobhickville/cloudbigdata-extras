#!/bin/bash

APP_PATH='/opt/cbd/cloudbigdata-extras/examples/twitter_sentiment_v2'

SPARK_MASTER='master-1.local:7077'
HDFS_PATH='hdfs://master-1.local:8020/apps/twitter_sentiment'


if [ ! -d /opt/cbd/cloudbigdata-extras ]; then
    echo "The app is not installed";
    echo "To install it, download and run this script on your gateway node:";
    echo "https://raw.githubusercontent.com/rackerlabs/cloudbigdata-extras/master/examples/twitter_sentiment_v2/bin/install.sh";
    exit 1;
fi

function stop() {
    # Spark seriously has no way to get the driver id from the app or the command line, so we
    # parse it out of the Spark UI like a sucker
    DRIVER_ID=`curl -s http://master-1.local:8080 | grep 'value="driver' | grep -oP "driver-[\d-]+"`
    if [ "$DRIVER_ID" != "" ]; then
        echo "Killing the running Spark job"
        spark-class org.apache.spark.deploy.Client kill $SPARK_MASTER $DRIVER_ID
    fi

    cd "$APP_PATH/frontend"
    forever stop app.js
}

function start() {
    echo "Submitting the spark job"
    cd "$APP_PATH/backend"

    spark-submit \
        --properties-file "${APP_PATH}/conf/app.conf" \
        --class "com.rackspace.spark.Sentiment" \
        "${HDFS_PATH}/sentiment-project_2.10-assembly-1.0.jar"

    cd "$APP_PATH/frontend"
    forever start app.js --conf="${APP_PATH}/conf/app.conf"
}

function restart() {
    stop
    start
}

function print_usage() {
    echo "Usage: $0 [command]"
    echo "
    Commands :
          start   - Start the sentiment demo app
          stop    - Kill the running sentiment demo app
          restart - Stop the running app, if any, then start it up again
    "
    exit 1
}


function run_command() {
    if [ $# -lt 1 ]; then
        print_usage
    fi

    case "$1" in
        "start" ) shift; start;;
        "stop" ) shift; stop;;
        "restart" ) shift; restart;;
        * )
            echo "'$1' not a valid command"
            exit 1
    esac
}

run_command $@
