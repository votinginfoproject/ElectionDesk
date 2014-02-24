<h2>How many posts to twitter/facebook</h2>
<p>Tweets to Twitter: <?php echo $total_tweets->tweet_count; ?></p>
<p>Posts to Facebook: <?php echo $total_facebook_posts->facebook_post_count; ?></p>
<br>


<h2>How many twitter connects, fb connects, google plus connects</h2>
<p>Facebook Connects: <?php echo $facebook_connects; ?></p>
<p>Twitter Connects: <?php echo $twitter_connects; ?></p>
<p>Google Connects: <?php echo $google_connects; ?></p>
<br>






<h2>Number of tweets/fb posts and google plus (data collected from stream)</h2>
<p>Twitter: <?php echo $twitter_stream_total; ?></p>
<p>Facebook: <?php echo $facebook_stream_total; ?></p>
<p>Google: <?php echo $google_stream_total; ?></p>
<br>



<h2>Number of users</h2>
<p><?php echo $total_users; ?></p>
<br>


<h2># of support tickets sent</h2>
<p><?php echo $tickets_total; ?></p>
<br>


<h2>How many times people log in</h2>
<p>Total Logins: <?php echo $total_logins; ?></p>

<ul>
<?php
foreach ($login_counts as $login):
?>
	<li><?php echo $login->email . ': ' . $login->login_number; ?></li>
<?php
endforeach;
?>
</ul>