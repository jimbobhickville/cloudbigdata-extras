LanguageCorrelationSparkMllib
=============================

This sample application uses pyspark, sparkSql and mllib to identify correlation of github languages using
Pearson's correlation method based on 'PushEvents' on the repositories belonging to those languages. It creates
and saves the correlation graph.

Required libraries:
- matplotlib
- numpy
- spark

DATASET:
This is a publicly available dataset and can be downloaded by the steps mentioned here: https://www.githubarchive.org/.
For this particular use case we have filtered the data for one year, 2014-2015 in the format:
'actor, repository_langauge, pushes' which can be downloaded and used with below instructions:

1. Log into your GATEWAY node on the spark cluster
2. Download dataset: wget http://pub.cloudbigdataplatform.com/git_14_15/git_results
3. hdfs dfs -mkdir git_14_15
4. hdfs dfs -copyFromLocal git_results git_14_15/


Running instructions:

Go into your project directory and run following command by replacing spark_master_url with your spark master url based on the mode:

spark-submit --master spark_master_url github_lang_correlations.py


