<div id="container">
	
	<div class="subhead">
		<h3>All time voter statistics</h3>
	</div><!-- end subhead -->
	
	<div class="content">	
		
		<script>
			google.load('visualization', '1', {packages: ['geomap']});

			function drawVisualization() {
				//0-100 to emulate percent here
				var data = google.visualization.arrayToDataTable([
					['state', 'Messages from state'],
					<?php 
					$i = 0;
					$comma = ',';
					$count = count($states);
					foreach ($states as $key => $val) :
						if ($i == $count - 1)
							$comma = '';
					?>
						['<?php echo $key; ?>', <?php echo round($val); ?>]<?php echo $comma; ?>
					<?php $i++; ?>
					<?php endforeach; ?>	
				]);
				
				var options = {};
				  options['region'] = 'US';
				  options['width'] = 920;
				  options['height'] = 500;
				  options['colors'] = [0x89D0E3, 0x3994B4, 0x356B7A, 0x34565C]; 
				  options['legend'] = 'none';
				var geomap = new google.visualization.GeoMap(
					document.getElementById('visualization'));
					geomap.draw(data, options);
			}    

			google.setOnLoadCallback(drawVisualization);
		</script>
			
			
		<div id="visualization"></div>
		
		<img src="<?php echo base_url('assets/img/loading.gif'); ?>" alt="loading map" class="loading-map">
		
	</div>
	
	

	
	<div class="wordcloud">

		<canvas id="result" width="955" height="450"></canvas>
	
	</div>
	
	<script type="text/javascript">
jQuery(function ($) {

	var $r = $('#result');

	$('#wordCloudSupported').addClass(($.wordCloudSupported?'':'not_') + 'support');

	
	$r.wordCloud({wordList: list_english, wordColor: 'random-light', minSize: 3});
	

});

var list_english = [
	<?php
	$i = 0;
	$comma = ',';
	$count = count($words);
	foreach ($words as $key => $val) :
		if ($i == $count - 1)
			$comma = '';
	?>
		["<?php echo $key; ?>", <?php echo $val * 3; ?>]<?php echo $comma; ?>
	<?php
	$i++;
	endforeach;
	?>
	
	
	
	];
</script>
</div>