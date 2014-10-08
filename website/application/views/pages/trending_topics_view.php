<script language="javascript">
var geofencePolygons = <?php echo $polygons_object; ?>;
</script>

<section id="topics">
<ul>
  <li>
    <input type="checkbox" id="topic_wait_time" ng-model="topicQuery[6]">
    <label class="btn btn-default" for="topic_wait_time">Wait Time</label>
  </li>
  <li>
    <input type="checkbox" id="topic_polling_location" ng-model="topicQuery[7]">
    <label class="btn btn-default" for="topic_polling_location">Polling Location</label>
  </li>
  <li>
    <input type="checkbox" id="topic_adm_issues" ng-model="topicQuery[8]">
    <label class="btn btn-default" for="topic_adm_issues">Adm. Issues</label>
  </li>
  <li>
    <input type="checkbox" id="topic_pr_issues" ng-model="topicQuery[9]">
    <label class="btn btn-default" for="topic_pr_issues">PR Issues</label>
  </li>
  <li>
    <input type="checkbox" id="topic_voter_id" ng-model="topicQuery[10]">
    <label class="btn btn-default" for="topic_voter_id">Voter id</label>
  </li>
</ul>
</section>

<section id="feeds">
<h3>Toggle Feeds:</h3>

<div class="btn-group">
  <button type="button" class="btn btn-default">
    <input type="checkbox" id="feed_twitter" ng-model="sourceQuery.twitter">
    <label for="feed_twitter"><i class="fa fa-twitter"></i></label>
  </button>
  <button type="button" class="btn btn-default">
    <input type="checkbox" id="feed_facebook" ng-model="sourceQuery.facebook">
    <label for="feed_facebook"><i class="fa fa-facebook"></i></label>
  </button>
  <button type="button" class="btn btn-default">
    <input type="checkbox" id="feed_googleplus" ng-model="sourceQuery.googleplus">
    <label for="feed_googleplus"><i class="fa fa-google-plus"></i></label>
  </button>
  <button type="button" class="btn btn-default">
    <input type="checkbox" id="feed_wordpress" ng-model="sourceQuery.wordpress">
    <label for="feed_wordpress"><i class="fa fa-wordpress"></i></label>
  </button>
  <button type="button" class="btn btn-default">
    <input type="checkbox" id="feed_disqus" ng-model="sourceQuery.disqus">
    <label for="feed_disqus"><i class="icon-disqus-social"></i></label>
  </button>
</div>

<button type="button" class="btn btn-default btn-playpause">
  <input type="checkbox" id="feed_paused" ng-model="streamIsActive" ng-change="togglePause()">
  <label for="feed_paused" id="feed_paused_label"><i class="fa fa-pause"></i></label>
</button>

<a href="/trending/bookmarks" class="btn btn-warning">Bookmarks</a>
</section>

<section id="stream">
<ul>
  <li ng-repeat="interaction in interactions | sourcefilter:sourceQuery | topicfilter:topicQuery | limitfilter:limitQuery:this.radiusQuery.val | contentfilter:contentQuery | orderByCreated | limitTo:250 as results" class="entry" ng-class="interaction.interaction.type" data-messageid="{{ interaction._id.$id }}" ng-cloak>
    <div ng-switch="interaction.interaction.type">
      <!-- Twitter -->
      <div ng-switch-when="twitter">
        <img ng-src="{{ interaction.twitter.user.profile_image_url_https }}" alt="{{ interaction.twitter.user.name }}" class="profile-picture">
        <i class="fa fa-retweet is-retweet" ng-show="{{ (typeof(interaction.twitter.retweeted_status) !== 'undefined') }}"></i>

        <time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time>
        <a ng-href="{{ interaction.interaction.link }}" target="_blank" class="target-link">@{{ interaction.interaction.author.username }}</a>
        <p class="summary">{{ interaction.twitter.text }}</p>
        
        <ul class="actions">
          <li class="follow"><a href="#"><i class="fa fa-twitter"></i> Follow</a></li>
          <li class="reply"><a href="#"><i class="fa fa-reply"></i> Reply</a></li>
          <li class="retweet"><a href="#"><i class="fa fa-retweet"></i> Retweet</a></li>
          <li class="bookmark"><a href="#"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="#"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <!-- Facebook -->
      <div ng-switch-when="facebook">
        <img ng-src="https://graph.facebook.com/picture?id={{ interaction.facebook.from.id }}" alt="{{ interaction.facebook.from.name }}" class="profile-picture">
        <time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time>
        <a ng-href="http://facebook.com/profile.php?id={{ interaction.facebook.from.id }}" target="_blank" class="target-link">{{ interaction.facebook.from.name }}</a>
        <p ng-show="!show" class="summary">{{ (interaction.facebook.message.length > 0) ? interaction.facebook.message : interaction.facebook.story | limitTo:140 }}</p>
        <p ng-show="show" class="full">{{ (interaction.facebook.message.length > 0) ? interaction.facebook.message : interaction.facebook.story }}</p>

        <a href="" class="expand" ng-click="show = !show" ng-show="interaction.facebook.message.length > 140">{{ show ? 'Collapse' : 'Expand' }}</a>
        <ul class="actions">
          <li class="bookmark"><a href="#"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="#"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <!-- Wordpress -->
      <div ng-switch-when="wordpress">
        <img  ng-src="{{ interaction.interaction.author.avatar }}" alt="{{ interaction.interaction.author.name }}" class="profile-picture">
        <time class="relative" datetime="{{ (interaction.interaction.created_at.sec * 1000) | date:'yyyy-MM-dd HH:mm:ss' }}"></time>
        <a ng-href="{{ interaction.interaction.link }}" target="_blank" class="target-link">{{ interaction.interaction.author.name }}</a>
        <p ng-show="!show" class="summary">{{ interaction.interaction.content | limitTo:140 }}</p>
        <p ng-show="show" class="full">{{ interaction.interaction.content }}</p>

        <a href="" class="expand" ng-click="show = !show" ng-show="interaction.interaction.content.length > 140">{{ show ? 'Collapse' : 'Expand' }}</a>
        <ul class="actions">
          <li class="bookmark"><a href="#"><i class="fa fa-star"></i> Bookmark</a></li>
          <li class="location" ng-if="typeof(interaction.internal.location) !== 'undefined' && typeof(interaction.internal.location.state) != 'undefined' && interaction.internal.location.state.length"><a href="#"><i class="fa fa-map-marker"></i> {{ interaction.internal.location.state }}</a></li>
        </ul>
        <div class="clearfix"></div>
      </div>
      <div ng-switch-default>Default</div>
    </div>
  </li>
	<li class="ng-repeat" ng-if="results.length == 0">
		<strong>No matches</strong> for your current filter.
	</li>
</ul>
</section>

<section id="filters">
<h3>Limit Stream by Location or Distance</h3>

<ul class="limit-options">
  <li>
    <input type="radio" name="limit" value="all" ng-model="limitQuery" id="limit_all_posts">
    <label for="limit_all_posts"><i class="circle"></i> All posts</label>
  </li>
  
  <li>
    <input type="radio" name="limit" value="state" ng-model="limitQuery" id="limit_state" data-state="DC">
    <label for="limit_state"><i class="circle"></i> Within Washington DC</label>
  </li>
  
  <li>
    <input type="radio" name="limit" value="radius" ng-model="limitQuery" id="limit_radius" data-lat="38.8051531" data-lon="-77.0488329">
    <label for="limit_radius"><i class="circle"></i> Within radius</label>
  </li>
  
  <li>
    <input type="radio" name="limit" value="custom" ng-model="limitQuery" id="limit_custom">
    <label for="limit_custom">
      <i class="circle"></i> Within custom area
    </label>
  </li>
</ul>
<p class="custom-area-description"><em>You can define a custom area on the <a href="#">area settings</a> page.</em></p>

<div class="slider-container" ng-class="{'disabled': (limitQuery != 'radius')}">
  <h4>Radius:</h4>

  <slider ng-model="radiusQuery.val" slider-id="radiusSlider" min="1" max="1000" step="1" value="50" tooltip="always" formatter="radiusQuery.formatter" ng-change="radiusQuery.changed()" />
</div>

<h3>Filter</h3>
<div class="form-group filter-query-group">
  <div class="input-group">
    <div class="input-group-addon"><i class="fa fa-search"></i></div>
    <input type="text" id="filter-query" name="" class="form-control" ng-model="contentQuery" placeholder="Filter the current stream">
  </div>
</div>

<div class="clearfix"></div>
</section>

<?php
/*
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
			// Are we logged in
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
*/
?>