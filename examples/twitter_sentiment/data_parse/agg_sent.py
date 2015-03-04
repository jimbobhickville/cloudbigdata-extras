#    Copyright 2014 Rackspace Inc.
#    All Rights Reserved
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.
#
# This SOFTWARE PRODUCT is provided by THE PROVIDER "as is" and "with
# all faults." THE PROVIDER makes no representations or warranties of any
# kind concerning the safety, suitability, lack of viruses, inaccuracies,
# typographical errors, or other harmful components of this SOFTWARE
# PRODUCT. There are inherent dangers in the use of any software, and you
# are solely responsible for determining whether this SOFTWARE PRODUCT is
# compatible with your equipment and other software installed on your
# equipment. You are also solely responsible for the protection of your
# equipment and backup of your data, and THE PROVIDER will not be liable
# for any damages you may suffer in connection with using, modifying, or
# distributing this SOFTWARE PRODUCT.


import os
from subprocess import call

CHECKPOINT = True  # Track the last HDFS data parsed to avoid re-parsing
HDFS_SOURCE_DIR = "twitter_data/sentiment"  # The HDFS result directory
# The location to copy HDFS data into for parsing in a normal file system
DEST_DIR = "../hdfs_results"
# Where the HDFS data is parsed
ROOT_DATA_DIR = "../hdfs_results/sentiment/"
GUI_TWEET_FILE = "../gui/tweets.txt"  # This holds the latest tweets received
GUI_CHART_FILE = "../gui/aster_data.csv"
# This contains the data to be rendered by d3 on the browser. Search
# terms are the hashtags or just plain search key words desired to
# be tracked and displayed in the user's web browswer.  Examples may
# include "#twitter" or "hadoop".  The GUI is currently hard coded
# to use exactly 10 search terms.  This is certainly an areas for
# improvement.
SEARCH_TERMS = [
    ["rackspace", []],
    ["hadoop", []],
    ["hadoopworld", []],
    ["spark", []],
    ["strata", []],
    ["nyc", []],
    ["twittersentimentdemo", []],
    ["bigdata", []],
    ["onmetal", []],
    ["cloudbigdata", []]
]
TWEETS = []  # Holds the tweet data read in from files
LAST_DIR_POS = 0  # The last twitter data directory parsed
HIGH_CURR_DIR = 0  # The most recent twitter data directory parsed


def get_tweet_data(file_path):
    """Read the tweet data from file."""
    with open(file_path, "r") as fptr:
        for line in fptr:
            line = line.strip()
            word_list = line.split(",")
            list_len = len(word_list)
            if list_len < 5:
                continue
            # get score delta
            try:
                score_delta = float(word_list[list_len-3]) - (
                    float(word_list[list_len-2]))
            except:
                score_delta = 0

            # get the tweet text
            start_loc = line.index(',') + 1
            end_loc = line.index(word_list[list_len-3], start_loc) - 1
            tweet = line[start_loc:end_loc]
            TWEETS.append(tweet + "\n")

            # find term matches
            low_tweet = tweet.lower()
            for list_entry in SEARCH_TERMS:
                if list_entry[0] in low_tweet:
                    list_entry[1].append(score_delta)


def create_gui_data():
    """Create the SVG GUI data and write it to file."""
    # handle tweets
    num_tweets = len(TWEETS)
    if num_tweets > 0:
        with open(GUI_TWEET_FILE, "w") as fptr:
            for tweet in TWEETS:
                fptr.write(tweet)
    # handle aster chart
    # find highest number of hits
    highest_hits = 0
    for entry in SEARCH_TERMS:
        list_len = len(entry[1])
        if list_len > highest_hits:
            highest_hits = list_len
    if highest_hits > 100:
        highest_hits = 100
    if highest_hits <= 0:
        print("Found no hits...")
        return
    hit_mult = 100 / highest_hits

    # Write the CSV data used to generate the d3 GUI on the user's web browser
    with open(GUI_CHART_FILE, "w") as fptr:
        fptr.write('"id","order","score","weight","color","label"\n')
        entry_count = 0
        for entry in SEARCH_TERMS:
            entry_count += 1
            tot_score = 0.0
            num_score = 0
            for score in entry[1]:
                tot_score += score
                num_score += 1
            if num_score > 0:
                tot_score = tot_score / num_score
            #  make top one 100 and scale others
            final_score = int(num_score * hit_mult)
            if final_score < 10:
                final_score = 10

            # set color by sentiment from -1 to 1
            color = "#0000FF"
            if tot_score < -0.6:
                color = "#0011EE"
            elif tot_score < -0.4:
                color = "#0022DD"
            elif tot_score < -0.3:
                color = "#0033CC"
            elif tot_score < -0.2:
                color = "#0044BB"
            elif tot_score < -0.1:
                color = "#0055AA"
            elif tot_score < -0.05:
                color = "#006699"
            elif tot_score < -0.025:
                color = "#007788"
            elif tot_score < 0.025:
                color = "#008888"
            elif tot_score < 0.05:
                color = "#009977"
            elif tot_score < 0.1:
                color = "#00AA66"
            elif tot_score < 0.2:
                color = "#00BB55"
            elif tot_score < 0.3:
                color = "#00CC44"
            elif tot_score < 0.4:
                color = "#00DD33"
            elif tot_score < 0.6:
                color = "#00EE22"
            elif tot_score < 0.8:
                color = "#00F011"
            else:
                color = "#00FF00"

            out_str = '"?",%d,%d,1,"%s","%s"\n' % (entry_count, final_score,
                                                   color, entry[0])
            fptr.write(out_str)


def should_parse_dir(dir_path):
    """Determine if this dir of results should be parsed or not."""
    global HIGH_CURR_DIR
    try:
        dir_list = dir_path.split('_')
        dir_len = len(dir_list)
        if dir_len < 2:
            return False
        timestamp = dir_list[dir_len - 1]
        time_ms = long(timestamp)
        if HIGH_CURR_DIR < time_ms:
            HIGH_CURR_DIR = time_ms
        if LAST_DIR_POS >= time_ms:
            return False
        return True
    except Exception:
        return False
    return False


def aggregate_sentiment():
    """Copy the HDFS data into a normal file system."""
    # Copy HDFS data to normal file system
    print("Starting to copy HDFS data...")
    command = "hadoop fs -copyToLocal" + " " + HDFS_SOURCE_DIR + " " + DEST_DIR
    call(command.split())
    print("Finished copying HDFS data")

    # Read in last position
    global LAST_DIR_POS
    if CHECKPOINT:
        try:
            with open("./dir.pos", "r") as fptr:
                data_str = fptr.read()
                LAST_DIR_POS = long(data_str)
                print("Using file position %d and on..." % LAST_DIR_POS)
        except Exception:
            print("Didn't find a starting dir position...")

    for subdir, _, files in os.walk(ROOT_DATA_DIR):
        flag = should_parse_dir(subdir)
        if flag is False:
            continue
        if "_SUCCESS" in files:
            for file_name in files:
                if file_name != "_SUCCESS":
                    file_path = "%s/%s" % (subdir, file_name)
                    print("Processing %s" % file_path)
                    get_tweet_data(file_path)
    create_gui_data()
    if HIGH_CURR_DIR > LAST_DIR_POS:
        with open("./dir.pos", "w") as fptr:
            pos_str = str(HIGH_CURR_DIR)
            fptr.write(pos_str)
            print("Saved dir pos %s" % pos_str)


if __name__ == "__main__":
    aggregate_sentiment()
