<div class="content">
<section class="settings-general">
	<div class="address col-md-6">
		<div class="form-wrapper-left">
		<?php if (!empty($success_message)) : ?>
		<div class="success-message" id="address-success"><?php echo $success_message; ?></div>
		<?php endif; ?>
		<div class="error-message" id="address-errors"></div>
		
		<?php echo form_open('settings', array('id' => 'location-form')); ?>

		<div class="form-group">
			<label for="address">Address:</label>
			
			<div class="input-group">
				<input type="text" id="address" name="address" class="form-control" value="<?php echo is_null($user->user_location) ? '' : $user->user_location; ?>" placeholder="enter a street address" />
				<span class="input-group-btn">
					<a href="#" class="btn btn-warning"><i class="fa fa-location-arrow"></i></a>
				</span>
			</div>
		</div>
		
		<input type="hidden" name="lat" id="lat" value="" />
		<input type="hidden" name="long" id="long" value="" />
		<input type="hidden" name="county" id="county" value="" />
		<input type="hidden" name="state" id="state" value="" />

		<p>If you have multiple offices, please select the one most central to your election jurisdiction or state.</p>
		<input type="submit" class="btn btn-primary" value="Save" />
		<?php echo form_close(); ?>
	
		</div><!--form wrapper-->
	</div><!--/left column-->



	<div class="col-md-6 accounts">
		<?php
		if (count($accounts) > 0):
		?>
			<h2>Connected accounts</h2>
			<?php
			foreach ($accounts as $account):
			?>
				<h4 class="sm-account">
					<?php
						switch ($account->type) {
					  case "TWITTER":
					    $logo = '<i class="fa fa-twitter"></i>@';
					    break;
					  case "FACEBOOK":
					    $logo = '<i class="fa fa-facebook"></i>';
					    break;
					  case "GOOGLEPLUS":
					    $logo = '<i class="fa fa-google-plus"></i>';
					    break;
					}?>

				 	<?php echo $logo . $account->name; ?><?php echo anchor('settings/delete_account?id=' . $account->id, '<i class="fa fa-trash"></i>', array('class' => 'btn btn-danger btn-del-account')); ?> </h4>
			<?php
			endforeach;
			?>
		<?php
		endif;
		?>

		<h2>Add account</h2>
		<div class="col-md-6">
			<?php echo anchor('settings/twitter', '<i class="fa fa-twitter"></i> Add Twitter account', array('class' => 'btn btn-block btn-info')); ?>
			<?php echo anchor($this->facebook->getLoginUrl($this->config->item('facebook_login_parameters')), '<i class="fa fa-facebook"></i> Add Facebook account', array('class' => 'btn btn-block btn-primary')); ?>
			<?php echo anchor('settings/google', '<i class="fa fa-google-plus"></i> Add Google+ account', array('class' => 'btn btn-block btn-danger')); ?>
		</div>
	</div>	
	<div class="clear"></div>
</section>
</div>