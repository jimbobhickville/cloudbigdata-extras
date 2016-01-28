#!/bin/bash

# we want the log to show the commands run
set -x

HOSTNAME=$(hostname -f)
CBD_ROOT='/opt/cbd/cloudbigdata-extras'
APP_PATH="${CBD_ROOT}/examples/twitter_sentiment_v2"
DATASETS_URL='http://pub.cloudbigdataplatform.com/twitter_datasets'
DATA_PATH='/tmp/data'
HDFS_PATH='/apps/twitter_sentiment'

if [ $HOSTNAME == "gateway-1.local" ]; then
    if [ ! -d $CBD_ROOT ]; then
        echo "Installing dependencies"
        curl https://bintray.com/sbt/rpm/rpm | tee /etc/yum.repos.d/bintray-sbt-rpm.repo
        yum install -y npm nodejs git sbt

        echo "Opening port 80 for HTTP access"
        iptables -A USER -p tcp --dport 80 -j ACCEPT
        service iptables save

        echo "Installing the sentiment app"
        mkdir -p /opt/cbd
        cd /opt/cbd
        git clone https://github.com/rackerlabs/cloudbigdata-extras.git

        echo "Setting up the frontend node.js app"
        cd ${APP_PATH}/frontend
        npm install express socket.io kafka-node underscore forever ini nomnom

        ln -fs ${APP_PATH}/frontend/node_modules/forever/bin/forever /usr/local/bin/

        echo "Setting up the backend Spark job"
        mkdir -p ${APP_PATH}/backend/lib
        cp /usr/lib/spark/lib/spark-examples-*.jar ${APP_PATH}/backend/lib

        echo "Building the FAT JAR"
        cd ${APP_PATH}/backend
        sbt assembly

        echo "Adding application JAR to HDFS"
        sudo -u hdfs hdfs dfs -mkdir $HDFS_PATH
        sudo -u hdfs hdfs dfs -put -f ./target/scala-2.10/sentiment-project_2.10-assembly-1.0.jar $HDFS_PATH

        echo "Downloading the sample data"
        mkdir $DATA_PATH
        for data_file in dataset.csv training.1600000.processed.noemoticon.csv; do
            wget ${DATASETS_URL}/$data_file -O ${DATA_PATH}/$data_file
        done

        echo "Putting the sample data into HDFS"
        sudo -u hdfs hdfs dfs -put -f ${DATA_PATH}/*.csv $HDFS_PATH

        echo "Copying spark-defaults into the app config"
        cat /etc/spark/conf/spark-defaults.conf >> ${APP_PATH}/conf/app.conf

        echo "Done"
    else
        echo "Already installed, nothing to do"
    fi
else
    echo "Not on the gateway node, nothing to do"
fi
