<div class="content">
	<script src="https://maps.googleapis.com/maps/api/js?key=<?php echo GOOGLE_API_KEY; ?>&sensor=false"></script>
	<script language="javascript">
	var map;
	function initialize() {
		var mapOptions = {
			zoom: 4,
			center: new google.maps.LatLng(41.850033, -87.6500523),
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};

		map = new google.maps.Map(document.getElementById('map-canvas'),
		  mapOptions);

		var polygon;
		var coords = [];
		<?php
		foreach ($polygons as $polygonItem):
			$points = json_decode($polygonItem->points);
			foreach ($points as $polygon):
			?>

			coords = [
				<?php
				foreach ($polygon as $point):
				?>new google.maps.LatLng(<?php echo $point->y; ?>,<?php echo $point->x ?>),<?php
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
		endforeach;
		?>
	}

	google.maps.event.addDomListener(window, 'load', initialize);

	$(function () {
		var drawPolyPoints = new google.maps.MVCArray,
			drawPolygon,
			drawClickListener,
			drawMarkers = [];

		$('#drawbtn').click(function () {
			if ($('#drawbtn').data('editing') == true) {
				var name = prompt('What do you want to call this area?');
				if (name) {
					$('#drawname').val(name);
					$('#drawpoints').val(JSON.stringify(drawPolyPoints.getArray()));
					$('#draw-form').submit();
				}

				$('#drawcancelbtn').addClass('hide');
				$('#drawbtn')
					.data('editing', false)
					.val('Saving...');
			} else {
				drawPolygon = new google.maps.Polygon({
					strokeColor: '#0000FF',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#0000FF',
					fillOpacity: 0.35
				});
				drawPolygon.setMap(map);
				drawPolygon.setPaths(new google.maps.MVCArray([drawPolyPoints]));

				drawClickListener = google.maps.event.addListener(map, 'click', mapClicked);

				$('#drawcancelbtn').removeClass('hide');
				$('#drawbtn')
					.data('editing', true)
					.val('Save area');
			}
		});

		$('#drawcancelbtn').click(function () {
			google.maps.event.removeListener(drawClickListener);
			drawPolyPoints = new google.maps.MVCArray;
			drawPolygon = null;
			drawMarkers = [];

			$('#drawbtn')
				.data('editing', false)
				.val('Start');
		});

		function mapClicked(event) {
			drawPolyPoints.insertAt(drawPolyPoints.length, event.latLng);

			var marker = new google.maps.Marker({
				position: event.latLng,
				map: map,
				draggable: true
			});
			drawMarkers.push(marker);
			marker.setTitle("#" + drawPolyPoints.length);

			google.maps.event.addListener(marker, 'click', function() {
			marker.setMap(null);
				for (var i = 0, I = drawMarkers.length; i < I && drawMarkers[i] != marker; ++i);
					drawMarkers.splice(i, 1);
					drawPolyPoints.removeAt(i);
				}
			);

			google.maps.event.addListener(marker, 'dragend', function() {
				for (var i = 0, I = drawMarkers.length; i < I && drawMarkers[i] != marker; ++i);
					drawPolyPoints.setAt(i, marker.getPosition());
				}
			);
		}
	});
	</script>
	  
    <div id="map-canvas"></div>

    <?php if ($this->session->flashdata('error')): ?>
    	<h2 class="error-message"><strong>Error:</strong> <?php echo $this->session->flashdata('error'); ?></h2>
    <?php endif; ?>

    <div class="area-options">
	    <div>
	    	<h2>Upload boundary file</h2>
			<?php echo form_open_multipart('areas/upload', array('id' => 'areas-form')); ?>
			<label for="shp_file">Shape file (.shp)</label>
			<input type="file" name="shp_file" id="shp_file">
			<input type="submit" value="Upload" />
			<?php echo form_close(); ?>

			<p><strong>Note:</strong> The boundary file is required to be projected in the <a href="http://spatialreference.org/ref/epsg/4326/" target="_blank">EPSG 4326</a> format.</p>
		</div>

		<div>
	    	<h2>Create new area</h2>
	    	<?php echo form_open('areas/draw', array('id' => 'draw-form')); ?>
	    	<input type="hidden" name="name" id="drawname" value="">
	    	<input type="hidden" name="points" id="drawpoints" value="">
			<input type="button" id="drawbtn" value="Start" />
			<input type="button" id="drawcancelbtn" class="hide" value="Cancel" />
			<?php echo form_close(); ?>

			<p>Click on the map to define points of the polygon, click on a marker to remove it or drag it to change its position.</p>
		</div>

		<div>
	    	<h2>Areas</h2>
	    	<?php if (count($polygons) > 0): ?>
	    	<ul class="areas-list">
	    		<?php foreach ($polygons as $polygon): ?>
	    		<li><strong><?php echo $polygon->name; ?></strong> <a href="/areas/delete?id=<?php echo $polygon->id; ?>">Delete</a></li>
		    	<?php endforeach; ?>
	    	</ul>
		    <?php else: ?>
		    	<p>You haven't defined any areas yet.</p>
		    <?php endif; ?>
		</div>
	</div>

	<div class="clear"></div>
</div>