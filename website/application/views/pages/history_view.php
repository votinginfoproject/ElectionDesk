<script language="javascript">
var geofencePolygons = <?php echo $polygons_object; ?>;
</script>

<div class="content">
	<h3>Find historic posts</h3>
	<p class="muted">Toggle topics:</p>
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

	<section class="trending-topics">
		<section class="feed-controls">
			<p>Toggle social media types:</p>
			<a href="#" class="twitter-toggle on">Twitter</a>
			<a href="#" class="facebook-toggle on">Facebook</a>
			<a href="#" class="google-toggle on">Google+</a>
		</section><!-- end feed-controls -->
	</section><!-- end trending-topics -->

	<section class="limit-distance"><!-- right column -->
		<p class="muted">Limit messages by location</p>
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
	</section>

	<section class="filter-date">
		<p class="muted">Please specify a date range:</p>

		<input type="text" name="from_date" id="from_date" value="<?php echo date('Y'); ?>-01-01 12:00">
		-
		<input type="text" name="to_date" id="to_date" value="<?php echo date('Y-m-d', time()) ?> 12:00">

		<script type="text/javascript">
		$(function(){
		 	$('#to_date').change(function() {
			    $('#from_date').appendDtpicker({
				    maxDate: $('#to_date').val() // when the end time changes, update the maxDate on the start field
			    });
			});
	
			$('#from_date').change(function() {
			    $('#to_date').appendDtpicker({
				    minDate: $('#from_date').val() // when the start time changes, update the minDate on the end field
			    });
			});

			$('#to_date').trigger('change');
			$('#from_date').trigger('change');
		});
		</script>
	</section>

	<section class="search-query">
		<form class="search" id="filter-form">
			<input type="text" class="search-bar" placeholder="Filter with AND/OR operators as well as parenthesis. Ex., ballot OR (vote AND &quot;turned away&quot;)">
			<input type="submit" value="Search" class="submit">
		</form>
	</section>
	
	<div style="clear: both"></div>
		
	<section id="feed-stream" class="feed"><!-- left column -->
		<div id="loading">
			<h3>Searching</h3>
		</div>
		<div id="results"></div>
	</section><!-- end response -->

	<div class="clear"></div>
</div>
   