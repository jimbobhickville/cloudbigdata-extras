Also see install.txt and/or code comments for explanations.

First, take the twitter_demo.tar.gz and tar –xvf it to create the twitter_demo directory which will hold the entire project.

=== Starting Node.js Web Server and GUI
Go to the twitter_demo directory

```
cd gui
sudo node twit_srv.js
```

This is the web server and the user may point the browser to this location to see the d3-based data visualization.

=== Starting the Data Parsing Routines
Go to the twitter_demo directory

```
cd data_parse
./data_loop.sh
```

This will watch for new HDFS data, copy it into a normal file system, parse the data into an aster chart and sends it to the user's web browser via web sockets.

=== Starting Spark
Go to the twitter_demo directory

```
cd TwitterSentimentSparkDemo
hadoop fs -mkdir -p twitter_data/sentiment
mvn package (this creates the target directory with .jars)
cd target
spark-submit --class com.rackspace.spark.TwitterSentiment --master yarn-cluster --num-executors 2 --driver-memory 1g --executor-memory 1g --executor-cores 1 TwitterSentimentAnalysis-0.0.1.jar consumerKey consumerSecret accessToken accessTokenSecret hdfs_output_path
```

consumerKey, consumerSecret, accessToken and accessTokenSecret – these are Twitter account credentials and can be created by following instructions here in section 1.2: http://ampcamp.berkeley.edu/3/exercises/realtime-processing-with-spark-streaming.html
This is the Spark job that pulls down Twitter sentiment data and stores it into HDFS.