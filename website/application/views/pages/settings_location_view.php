<section class="register">
	<h3>Thank you for signing up with ElectionDesk, we just need a few more things to get started.</h3>

	<p>Please provide your office's address so we can provide you with social media content related to your area. If you have multiple offices, please select the one most central to your election jurisdiction or state.</p>
	
	<?php if (!empty($success_message)) : ?>
		<div class="success-message" id="address-success"><?php echo $success_message; ?></div>
	<?php endif; ?>
	<div class="error-message" id="address-errors"></div>
	
	<?php echo form_open('settings', array('id' => 'location-form')); ?>
	<input type="text" id="address" name="address" value="<?php echo is_null($user->user_location) ? '' : $user->user_location; ?>" placeholder="enter a street address" />
	<a href="#"><img src="<?php echo site_url('assets/img/locateme.png'); ?>" alt="Locate me" title="Locate me" /></a>
	<input type="hidden" name="lat" id="lat" value="" />
	<input type="hidden" name="long" id="long" value="" />
	<input type="hidden" name="county" id="county" value="" />
	<input type="hidden" name="state" id="state" value="" />
	<input type="submit" value="Save" />
	<div id="loading">
		<h3><i class="fa fa-spinner fa-spin"></i> Saving location</h3>
	</div>
	<?php echo form_close(); ?>
	<div class="clear"></div>
</section>