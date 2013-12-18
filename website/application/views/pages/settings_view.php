<div class="content">
<section class="register settings-general">
	<div class="left-col">
		<?php if (!empty($success_message)) : ?>
		<div class="success-message" id="address-success"><?php echo $success_message; ?></div>
		<?php endif; ?>
		<div class="error-message" id="address-errors"></div>
		
		<?php echo form_open('settings', array('id' => 'location-form')); ?>
		<label for="address">Address:</label>
		<input type="text" id="address" name="address" value="<?php echo is_null($user->user_location) ? '' : $user->user_location; ?>" placeholder="enter a street address" />
		<a href="#"><img src="<?php echo site_url('assets/img/locateme.png'); ?>" alt="Locate me" title="Locate me" /></a>
		<input type="hidden" name="lat" id="lat" value="" />
		<input type="hidden" name="long" id="long" value="" />
		<input type="hidden" name="county" id="county" value="" />
		<input type="hidden" name="state" id="state" value="" />
		<p>If you have multiple offices, please select the one most central to your election jurisdiction or state.</p>
		<input type="submit" value="Save" />
		<div id="loading">
			<h3>Saving location</h3>
		</div>
		<?php echo form_close(); ?>
		<div class="clear"></div>
	</div>
	<div class="right-col">
		<?php
		foreach ($accounts as $account) {
		?>
			<div id="<?php echo strtolower($account->type); ?>" class="account-disconnect">
				<p class="connected-<?php echo strtolower($account->type); ?>">
					<?php if ($account->type == 'TWITTER') echo '@'; ?><?php echo $account->name; ?>
					<?php echo anchor('settings/delete_account?id=' . $account->id, 'Remove'); ?>
				</p>
			</div>
		<?php
		}
		?>
		<div id="twitter">
			<?php echo anchor('settings/twitter', 'Add Twitter account', array('class' => 'twitter-connect')); ?>
		</div>

		<div id="facebook">
			<?php echo anchor($this->facebook->getLoginUrl($this->config->item('facebook_login_parameters')), 'Add Facebook account', array('class' => 'facebook-connect')); ?>
		</div>

		<div id="google-plus">
			<?php echo anchor('settings/google', 'Add Google+ account', array('class' => 'google-connect')); ?>
		</div>
	</div>	
	<div class="clear"></div>
</section>
</div>