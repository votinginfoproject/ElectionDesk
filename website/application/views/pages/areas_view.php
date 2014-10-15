<div class="content">
	<script type="text/javascript">
	window.COORDS = [];
	<?php
	foreach ($polygons as $polygonItem):
		$points = json_decode($polygonItem->points);
		foreach ($points as $polygon):
		?>

		window.COORDS.push([
			<?php
			$str = array();
			foreach ($polygon as $point):
				$str[] = 'new google.maps.LatLng(' . $point->y . ',' . $point->x . ')';
			endforeach;
			echo implode(',', $str);
			?>
		]);
		<?php
		endforeach;
	endforeach;
	?>
	</script>	  
    <div id="map-canvas"></div>

    <?php if ($this->session->flashdata('error')): ?>
    	<h2 class="error-message"><strong>Error:</strong> <?php echo $this->session->flashdata('error'); ?></h2>
    <?php endif; ?>

    <div class="row">
	    <div class="col-md-4">
	    	<h2>Upload boundary file</h2>
			<?php echo form_open_multipart('areas/upload', array('id' => 'areas-form')); ?>
			<label for="shp_file">Shape file (.shp)</label>
			<input type="file" name="shp_file" id="shp_file">
			<input type="submit" class="btn btn-primary" value="Upload" />
			<?php echo form_close(); ?>

			<p><strong>Note:</strong> The boundary file is required to be projected in the <a href="http://spatialreference.org/ref/epsg/4326/" target="_blank">EPSG 4326</a> format.</p>
		</div>

		<div class="col-md-4">
	    	<h2>Create new area</h2>
	    	<?php echo form_open('areas/draw', array('id' => 'draw-form')); ?>
	    	<input type="hidden" name="name" id="drawname" value="">
	    	<input type="hidden" name="points" id="drawpoints" value="">
			<input type="button" class="btn btn-primary" id="drawbtn" value="Start" />
			<input type="button" class="btn btn-danger" id="drawcancelbtn" class="hide" value="Cancel" />
			<?php echo form_close(); ?>

			<p>Click on the map to define points of the polygon, click on a marker to remove it or drag it to change its position.</p>
		</div>

		<div class="col-md-4">
	    	<h2>Areas</h2>
	    	<?php if (count($polygons) > 0): ?>
	    	<ul class="areas-list">
	    		<?php foreach ($polygons as $polygon): ?>
	    		<li><strong><?php echo $polygon->name; ?></strong> <a href="/areas/delete?id=<?php echo $polygon->id; ?>" class="text-danger"><i class="fa fa-trash"></i> Delete</a></li>
		    	<?php endforeach; ?>
	    	</ul>
		    <?php else: ?>
		    	<p>You haven't defined any areas yet.</p>
		    <?php endif; ?>
		</div>
	</div>
</div>