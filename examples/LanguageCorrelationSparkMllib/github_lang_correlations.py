# Copyright Rackspace Inc.
# All Rights Reserved
#
#
# The code in this project is made available as free and open source software under the terms and
# conditions of the GNU Public License. For more information, please refer to the LICENSE text file included with this project,
# or visit gnu.org if the license file was not included.
# This SOFTWARE PRODUCT is provided by THE PROVIDER "as is" and "with all faults."
# THE PROVIDER makes no representations or warranties of any kind concerning the
# safety, suitability, lack of viruses, inaccuracies, typographical errors, or
# other harmful components of this SOFTWARE PRODUCT. There are inherent dangers
# in the use of any software, and you are solely responsible for determining
# whether this SOFTWARE PRODUCT is compatible with your equipment and other
# software installed on your equipment. You are also solely responsible for the
# protection of your equipment and backup of your data, and THE PROVIDER will
# not be liable for any damages you may suffer in connection with using,
# modifying, or distributing this SOFTWARE PRODUCT.

import sys
import numpy as np
import matplotlib.pyplot as plt

from collections import OrderedDict
from pyspark import SparkContext
from pyspark.sql import SQLContext
from pyspark.mllib.stat import Statistics
from pyspark.mllib.linalg import Vectors

LANG = ["Java", "C", "C++", "Python", "ActionScript", "JavaScript", "Ruby", "C#", "Matlab", "Lua", "Objective-C", "PHP", 
        "Perl", "R", "Shell", "Scala", "Go", "CoffeeScript", "Clojure", "Erlang", "XSLT", "Rust", "CSS", "Julia", "ASP"]

def plot_graph(corr_matrix):
    """
        plots the graph from correlation matrix
    """
    tick_indices = np.arange(0.5, len(LANG) + 0.5)
    plt.figure()
    plt.pcolor(corr_matrix, cmap='RdBu', vmin=-0.2, vmax=0.2)
    colorbar = plt.colorbar()
    plt.title("Github Language Correlation")
    plt.xticks(tick_indices, sorted(LANG), rotation='vertical')
    plt.yticks(tick_indices, sorted(LANG))
    plt.savefig("Correlation")

def merge_lang_dict(s):
    """
        merges the list of dictionaires into single ordered dictionary
        to get the languages and pushes per user sorted by languages.
    """
    lang_dict = {}
    for lang in list(s):
        lang_dict[lang.keys()[0]] = lang.values()[0]
    for lang in LANG:
        if lang not in lang_dict:
            lang_dict[lang] = '0'
    return OrderedDict(sorted(lang_dict.items()))

def get_language_correlation():
    """
        calculates the correlation between github languages
    """
    #Create Spark Context
    sc = SparkContext(appName="LanguageCorrelations")

    #Create SQL Context
    sqlCtx = SQLContext(sc)

    #Create a schemaRDD from json datasets stored in HDFS
    pushes = sqlCtx.jsonFile('git_14_15/git_results')

    #Register the schemaRDD as a Table
    pushes.registerTempTable('pushes')

    #filter the data to get the pushes for the languages from LANG
    filtered = sqlCtx.sql('select * from pushes where repository_language in ' + str(tuple(LANG)))

    #perform map transformation to get the rdd in the format (actor, {lang : pushes})
    f_pair = filtered.map(lambda s: (s.actor, {s.repository_language:s.pushes}))

    #group the RDD's based on actor to get the RDD of the format (actor, [{lang1 : pushes},{lang2 : pushes}...])
    f_group = f_pair.groupByKey()

    #merge lang dictionries to get single orderd dict per actor
    f_merged = f_group.map(lambda s: merge_lang_dict(s[1]))

    #created rdd of vectors from the pushes values, which is required for the correlation algorithm
    vectors = f_merged.map(lambda s: Vectors.dense(map(float, s.values())))  
    
    #call the correlation function
    matrix = Statistics.corr(vectors)
    print matrix
    plot_graph(matrix)
    sc.stop()

if __name__ == "__main__":
    get_language_correlation()
