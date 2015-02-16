TwitterSentimentSparkDemo
=========================
This is a simple demo with spark streaming.

Build instructions:

cd TwitterSentimentSparkDemo

>mvn package

This will create target folder with compiled jar: TwitterSentimentAnalysis-0.0.1.jar. Change directory to target to submit the job with following commands:

Running the spark job in standalone mode
>spark-submit --class com.rackspace.spark.TwitterSentiment TwitterSentimentAnalysis-0.0.1.jar consumerKey consumerSecret accessToken accessTokenSecret hdfs_output_path

Running with Yarn:
>spark-submit --class com.rackspace.spark.TwitterSentiment --master yarn-cluster --num-executors 2 --driver-memory 1g --executor-memory 1g --executor-cores 1 TwitterSentimentAnalysis-0.0.1.jar consumerKey consumerSecret accessToken accessTokenSecret hdfs_output_path
