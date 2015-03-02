LanguageCorrelationSparkMllib
=============================

This sample application uses pyspark, sparkSql and mllib to identify correlation of github languages using
Pearson's correlation method based on 'PushEvents' on the repositories belonging to those languages. It creates
and saves the correlation graph.

DATASET:
This is a publicly available dataset and can be downloaded by the steps mentioned here: https://www.githubarchive.org/.
For this particular use case we have filtered the data for one year, 2014-2015 in the format:
'actor, repository_langauge, pushes'

Required libraries:
- matplotlib
- numpy
- spark

Running instructions:

spark-submit --master spark_master_url github_lang_correlations.py


