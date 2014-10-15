<section class="register">
	<h3>Thank you for signing up with ElectionDesk, we just need a few more things to get started.</h3>

	<p>Please provide your office's address so we can provide you with social media content related to your area. If you have multiple offices, please select the one most central to your election jurisdiction or state.</p>
	
	<?php if (!empty($success_message)) : ?>
		<div class="alert alert-success"><?php echo $success_message; ?></div>
	<?php endif; ?>
	
	<?php echo form_open('settings', array('id' => 'location-form')); ?>
	<div class="form-group">
		<label for="address">Address:</label>
		
		<div class="input-group">
			<input type="text" id="address" name="address" class="form-control" value="<?php echo is_null($user->user_location) ? '' : $user->user_location; ?>" placeholder="enter a street address" />
			<span class="input-group-btn">
				<a href="#" class="btn btn-locate btn-warning"><i class="fa fa-location-arrow"></i></a>
			</span>
		</div>
	</div>
	
	<input type="hidden" name="lat" id="lat" value="" />
	<input type="hidden" name="long" id="long" value="" />
	<input type="hidden" name="county" id="county" value="" />
	<input type="hidden" name="state" id="state" value="" />

	<p>If you have multiple offices, please select the one most central to your election jurisdiction or state.</p>
	<button type="submit" class="btn btn-primary"><i class="fa fa-spinner fa-spin" id="loading"></i> Save</button>
	<?php echo form_close(); ?>
</section>