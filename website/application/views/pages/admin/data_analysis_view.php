

<h2>terms that people create (and count)</h2>
<p>Coming soon...</p>
<br>

<h2>how many times topics were clicked</h2>
<p>Coming Soon...</p>
<br>


<h2>how many posts to twitter/facebook</h2>
<p>Tweets to Twitter: <?php echo $total_tweets->tweet_count; ?></p>
<p>Posts to Facebook: <?php echo $total_facebook_posts->facebook_post_count; ?></p>
<br>


<h2>how many twitter connects, fb connects, google plus connects</h2>
<p>Facebook Connects: <?php echo $facebook_connects; ?></p>
<p>Twitter Connects: <?php echo $twitter_connects; ?></p>
<p>Google Connects: <?php echo $google_connects; ?></p>
<br>






<h2>number of tweets/fb posts and google plus (data collected from stream)</h2>
<p>Twitter: <?php echo $twitter_stream_total; ?></p>
<p>Facebook: <?php echo $facebook_stream_total; ?></p>
<p>Google: n/a</p>
<br>



<h2>number of users</h2>
<p><?php echo $total_users; ?></p>
<br>


<h2># of support tickets sent</h2>
<p><?php echo $tickets_total; ?></p>
<br>


<h2>how many times people log in</h2>
<p>Total Logins: <?php echo $total_logins; ?></p>
<code>
	<?php 
	echo '<pre>';
	print_r($login_counts);
	echo '</pre>';
	?>
</code>
<br>