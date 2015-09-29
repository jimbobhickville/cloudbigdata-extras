function writeTweets(tweets) {
  $( "#negativeTweets" ).empty();
  for (var key in tweets.negative) {
    var tweet = tweets.negative[key];
    var tweetHTML = generateTweetHtml(tweet);
    $( "#negativeTweets" ).prepend(tweetHTML);
  }

  $( "#neutralTweets" ).empty();
  for (var key in tweets.neutral) {
    var tweet = tweets.neutral[key];
    var tweetHTML = generateTweetHtml(tweet);
    $( "#neutralTweets" ).prepend(tweetHTML);
  }

  $( "#positiveTweets" ).empty();
  for (var key in tweets.positive) {
    var tweet = tweets.positive[key];
    var tweetHTML = generateTweetHtml(tweet);
    $( "#positiveTweets" ).prepend(tweetHTML);
  }
}

function generateTweetHtml(tweet) {
  return '<div class="tweet-wrapper clearfix"><div class="twitter-image"><img class="twitter-avatar" src="'+tweet.user.profile_image_url+'" /></div><div class="twitter-text"><div><span class="twitter-display-name">'+tweet.user.name+'</span> <span class="twitter-meta">@'+tweet.user.screen_name+'</span></div><div>'+tweet.text+'</div><div><span class="twitter-meta">'+tweet.created_at+'</span></div></div><div>';
}
