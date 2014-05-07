<script language="javascript">
var geofencePolygons = <?php echo $polygons_object; ?>;
</script>

<section class="tab-list">
	<div class="bookmarks"><?php echo anchor('trending/bookmarks', 'Bookmarks'); ?></div>
</section>

<div class="content">
	<div class="alert-message-topics hide"><img src="/assets/img/warning.png" alt="Warning"> Please select one of the topics or create a custom filter to see targeted results.</div>
	<section class="main-topics">
		<?php
		$i = 1;
		$count = count($filters);
		foreach ($filters as $filter):
		?>
		<div class="checkbox<?php if (!$filter->is_running): echo ' inactive'; endif; ?>">
			<input class="input-checkbox" type="checkbox" name="filters" id="filter-<?php echo $filter->id; ?>" value="<?php echo $filter->id; ?>"<?php if (!$filter->is_running): echo ' disabled="disabled"'; endif; ?>>
			<label for="filter-<?php echo $filter->id; ?>"><?php echo $filter->title; ?></label>
			
			

		
		<?php if ($i == $count) : ?>
		<div style="clear: both"><div>

		<?php endif; ?>
		</div>
		<?php
		$i++;
		endforeach;
		?>
	</section>
	
	<div class="alert-message-social hide"><img src="/assets/img/warning.png" alt="Warning"> Please select at least one social media type in order to view results.</div>		
	<section class="trending-topics">
		<section class="feed-controls">
			<p>Toggle social media types:</p>
			<a href="#" class="twitter-toggle on">Twitter</a>
			<a href="#" class="facebook-toggle on">Facebook</a>
			<a href="#" class="google-toggle on">Google+</a>
			<a href="#" class="pause off">Pause</a>
			<a href="#" class="play on">Play</a>
		</section><!-- end feed-controls -->
	</section><!-- end trending-topics -->
	
	<div style="clear: both"></div>
		
		
	<section id="feed-stream" class="feed"><!-- left column -->
		<div id="loading">
			<h3>Waiting for posts that match your filters</h3>
		</div>
			
	</section><!-- end response -->

	<section class="filters-reply"><!-- right column -->
		<div class="distance"><h3>Limit messages by location</h3>
		<select id="distance-select" data-location="<?php echo $profile->user_lon . ',' . $profile->user_lat; ?>">
			<option value="all">Show all messages</option>
			<?php
			if (!is_null($profile->user_state)):
			?>
			<option value="state=<?php echo urlencode($profile->user_state); ?>">Within <?php echo $states[$profile->user_state]; ?></option>
			<?php
			endif;
			?>
			<?php
			if (!is_null($profile->user_county) && !is_null($profile->user_state)):
			?>
			<option value="county=<?php echo urlencode($profile->user_county); ?>&state=<?php echo urlencode($profile->user_state); ?>">Within <?php echo $profile->user_county; ?> County</option>
			<?php
			endif;
			?>
			<option value="1">Within 1 mile</option>
			<option value="5">Within 5 miles</option>
			<option value="10">Within 10 miles</option>
			<option value="25">Within 25 miles</option>
			<option value="50">Within 50 miles</option>
			<option value="100">Within 100 miles</option>
			<?php if ($polygons_object != '[]'): ?>
			<option value="area">Within defined area</option>
			<?php endif; ?>
		</select>
		<p><em>You can define a custom area on the <a href="/areas">area settings</a> page.</em></p><br />
	   </div>

		<h3>Filters</h3>
		<form class="search" id="filter-form">
			<input type="text" class="search-bar" placeholder="Filter the current stream">
			<input type="submit" value="Apply" class="submit">
			<input type="button" value="Reset" class="reset">
		</form>
		<div class="clear"></div>
		<form class="filters">
			<div class="description">You can use AND/OR operators as well as parenthesis. Ex., <code>ballot OR (vote AND "turned away")</code></div>
			<div class="no-filters">No filter is currently applied</div>
			<div class="filter"></div>
		</form>
			
		<section id="response">
			<p>Reply from <select name="accounts" id="accountswitcher">
				<?php foreach ($accounts as $account): ?>
					<option value="<?php echo $account->id; ?>"<?php if ($account->is_primary == 1) echo ' selected="selected"' ?>>@<?php echo $account->name; ?></option>
				<?php endforeach; ?>
			</select></p>

			<h2>Reply to <span class="username">@Username</span></h2>
			<span class="error"></span>

			<?php
			/* Are we logged in */
	        if(!$this->twitter->is_logged_in()):
	        ?>
	    		<?php echo anchor('/tweet/login', '<img src="'. site_url('assets/img/twitter-connect.png') .'" alt="Login with Twitter" />'); ?>
	    	<?php
	    	else:
			?>
			<form id="tweet-form">
				<textarea></textarea>
				<input type="submit" class="submit" value="Reply">
				<p class="word-count">140</p>
			</form>
			<?php
			endif;
			?>

			<section class="entry"></section>
		</section><!-- end response -->
			
	</section>

	<div class="clear"></div>
</div>
   