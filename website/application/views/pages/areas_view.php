<div class="content">
	<?php echo form_open_multipart('areas/upload', array('id' => 'areas-form')); ?>
	<label for="address">Upload boundaries:</label>
	<input type="file" name="shp_file">
	<p>Shape file (.shp)</p>
	<input type="file" name="dbf_file">
	<p>Shape Attribute Format file (.dbf)</p>
	<input type="submit" value="Upload" />
	<?php echo form_close(); ?>
</div>