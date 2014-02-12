<div class="content">

	<script src="https://maps.googleapis.com/maps/api/js?key=<?php echo GOOGLE_API_KEY; ?>&sensor=false"></script>
	<script language="javascript">
	function initialize() {
		var mapOptions = {
			zoom: 4,
			center: new google.maps.LatLng(41.850033, -87.6500523),
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};

		var map = new google.maps.Map(document.getElementById('map-canvas'),
		  mapOptions);

		var polygon;
		var coords = [];
		<?php
		foreach ($polygons as $polygon):
		?>

		coords = [
			<?php
			foreach ($polygon as $point):
			?>
				new google.maps.LatLng(<?php echo $point['y']; ?>, <?php echo $point['x'] ?>),
			<?php
			endforeach;
			?>
		];

		// Construct the polygon.
		polygon = new google.maps.Polygon({
			paths: coords,
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.35
			});

		polygon.setMap(map);
		<?php
		endforeach;
		?>
	}

	google.maps.event.addDomListener(window, 'load', initialize);
	</script>
	  
    <div id="map-canvas"></div>
</div>