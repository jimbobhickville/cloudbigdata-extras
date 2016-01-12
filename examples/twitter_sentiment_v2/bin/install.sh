#!/bin/bash

HOSTNAME=$(hostname -f)
APP_PATH='/opt/cbd/cloudbigdata-extras/examples/twitter_sentiment_v2'

if [ $HOSTNAME eq "gateway-1.local" ]; then
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

    cd ${APP_PATH}/backend

    echo "Setting up the backend Spark job"
    mkdir lib
    cd lib
    cp /usr/lib/spark/lib/spark-examples-1.5.0-hadoop2.7.1.jar ./

    echo "Building the FAT JAR"
    cd ..
    sbt assembly

    echo "Adding application JAR to HDFS"
    hdfs dfs -mkdir /apps/twitter_sentiment
    hdfs dfs -put -f ./target/scala-2.10/sentiment-project_2.10-assembly-1.0.jar /apps/twitter_sentiment/

    echo "Downloading the sample data"
    # TODO

    echo "Putting the sample data into HDFS"
    # TODO

    echo "Fixing spark-env.sh so --deploy-mode cluster works"
    sed -i s/SPARK_LOCAL_IP/#SPARK_LOCAL_IP/g /etc/spark/conf/spark-env.sh
    echo "SPARK_CLASSPATH=\$(ls /usr/lib/spark/lib/spark-examples-*.jar)" >> /etc/spark/conf/spark-env.sh

    echo "Copying spark-defaults into the app config"
    cat /etc/spark/conf/spark-defaults.conf >> ${APP_PATH}/conf/app.conf

    echo "Done"
fi
