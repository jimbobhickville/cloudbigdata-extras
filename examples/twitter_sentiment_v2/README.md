# Twitter Sentiment Analysis Demo

A sample application to showcase some basic Twitter Sentiment Analysis.  There
are a few prerequisites that you'll need in order to utilize this sample app.
It is designed to run on Rackspace's Cloud Big Data Platform, so if you're
attempting to run it elsewhere, you will have to figure some things out to get it working.
To start, create a cluster with the following options in Rackspace's Cloud Control Panel:

    Stack: Kafka + Spark 1.5
    Post-install Script: https://raw.githubusercontent.com/rackerlabs/cloudbigdata-extras/master/examples/twitter_sentiment_v2/bin/install.sh

If you're using the ``lava`` command-line client, you'll need to add the script and then create 
the cluster.  Copy the id returned by the script create to fill in <script-id> in the cluster 
create call:

    lava scripts create sentiment-demo-install https://raw.githubusercontent.com/rackerlabs/cloudbigdata-extras/master/examples/twitter_sentiment_v2/bin/install.sh post_init
    lava clusters create <cluster-name> KAFKA_SPARK_1_5 --node-groups "slave(flavor=hadoop1-7,count=3) --user-script <script-id>

This will ensure that all the required pieces are installed for you.  Once your
cluster is up, you'll need to do a few additional steps:

## Configure the app

Log in to the gateway node on your cluster:

    $ ssh <my-username>@<gateway-public-ip>

Or use the ``lava`` cli:

    $ lava ssh <cluster_id> --node-name gateway-1

Get root access:

    $ sudo su -

Go to the sentiment app demo folder (if this folder doesn't exist, the post-install script 
failed, you can attempt to download it and run it manually):

    [root@gateway-1 ~]# cd /opt/cbd/cloudbigdata-extras/examples/twitter_sentiment_v2/

Edit the configuration file and enter any missing values:

    [root@gateway-1 twitter_sentiment_v2]# vi conf/app.conf

You'll need to enter your twitter API credentials:

    # Twitter Credentials
    spark.sentimentApp.apiKey=
    spark.sentimentApp.apiSecret=
    spark.sentimentApp.accessToken=
    spark.sentimentApp.accessTokenSecret= 

More information about how to get these credentials can be found here:

    https://dev.twitter.com/oauth/overview/application-owner-access-tokens

And the keywords you want to monitor for sentiment:

    # Comma-separated keywords list used for filtering tweets
    spark.sentimentApp.keywords=pizza,beer,curry,pho

## Start the app

There are 2 components to the app, a node.js webapp and a spark job.  There is a single script 
that manages both of them cleanly for you:

    [root@gateway-1 twitter_sentiment_v2]# ./bin/manage.sh start

## Restart the app

If the app crashes or you need to make configuration changes, you can use the same script to 
restart it:

    [root@gateway-1 twitter_sentiment_v2]# ./bin/manage.sh restart


## Stop the app

And if you just want to stop it entirely:

    [root@gateway-1 twitter_sentiment_v2]# ./bin/manage.sh stop

# View the app

Now that the app is running, you can view it in your browser by finding the public IP of your 
gateway node and loading it in your browser on port 8080 ``http://ip-address:8080``.  You can 
also use the lava ssh proxy to set up a SOCKS Proxy and load the website by visiting 
``http://gateway-1.local:8080``

More info about the proxy options can be found here:

    http://python-lavaclient.readthedocs.org/en/latest/access.html
    
# Update the Spark job

If you want to modify the source code to adjust how the app works, there's a few steps you'll
need to take before you can run it again.

## Get to the right folder

    [root@gateway-1 ~]# cd /opt/cbd/cloudbigdata-extras/examples/twitter_sentiment_v2/backend

## Edit the scala source code

    [root@gateway-1 backend]# vi src/main/scala/com/rackspace/spark/Sentiment.scala

## Re-build and restart the app

    [root@gateway-1 backend]# ../bin/manage.sh rebuild
