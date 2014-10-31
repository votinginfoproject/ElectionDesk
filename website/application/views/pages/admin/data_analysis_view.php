<h2>Collected interactions</h2>
<div id="consumingChart"></div>

<div class="row" id="consumingStats"></div>
<hr>

<h2>Posts created</h2>
<div class="row">
	<div class="col-md-6 well text-center">
		<i class="fa fa-twitter fa-4x text-primary"></i>
		<h1><?php echo $total_tweets->tweet_count; ?></h1>
		Twitter
	</div>
	<div class="col-md-6 well text-center">
		<i class="fa fa-facebook fa-4x text-primary"></i>
		<h1><?php echo $total_facebook_posts->facebook_post_count; ?></h1>
		Facebook
	</div>
</div>
<hr>


<h2>Account connects</h2>
<div class="row">
	<div class="col-md-4 well text-center">
		<i class="fa fa-twitter fa-4x text-primary"></i>
		<h1><?php echo $twitter_connects; ?></h1>
		Twitter
	</div>
	<div class="col-md-4 well text-center">
		<i class="fa fa-facebook fa-4x text-primary"></i>
		<h1><?php echo $facebook_connects; ?></h1>
		Facebook
	</div>
	<div class="col-md-4 well text-center">
		<i class="fa fa-google-plus fa-4x text-primary"></i>
		<h1><?php echo $google_connects; ?></h1>
		Google+
	</div>
</div>
<hr>

<h2>User statistics</h2>
<div class="row">
	<div class="col-md-4 well text-center">
		<i class="fa fa-users fa-4x text-primary"></i>
		<h1><?php echo $total_users; ?></h1>
		Total number of users
	</div>
	<div class="col-md-4 well text-center">
		<i class="fa fa-thumbs-up fa-4x text-primary"></i>
		<h1><?php echo $approved_users; ?></h1>
		Approved users
	</div>
	<div class="col-md-4 well text-center">
		<i class="fa fa-key fa-4x text-primary"></i>
		<h1><?php echo $total_logins; ?></h1>
		Total number of logins
	</div>
</div>
<hr>

<h2>Logins by user</h2>
<ul class="list-unstyled">
<?php
foreach ($login_counts as $email => $count):
?>
	<li>
		<strong><?php echo $email; ?></strong>
		<div class="progress">
		  <div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: <?php echo round($count / $total_logins * 100, 2); ?>%;">
		    <?php echo $count; ?> logins
		  </div>
		</div>
	</li>
<?php
endforeach;
?>
</ul>
