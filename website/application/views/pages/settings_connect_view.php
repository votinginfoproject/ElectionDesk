<section class="register">
	<div class="left-col">
	<h3>Connect your social network accounts</h3>

	<p>Last step. Connect your social networks to allow them to integrate with ElectionDesk. </p>
	<p>At a minimum, we require you to connect your official <a href="http://twitter.com">Twitter</a> account to ElectionDesk.  This is the account you will use to engage with voters in your area (e.g. @ElectionOfficial). </p>
	<p>If you don't have a Twitter handle yet, you can sign up <a href="https://twitter.com/signup">here</a>.</p>
	<?php
	$twitter = false;
	if ($accounts) {
		foreach ($accounts as $account) {
			if ($account->type == 'TWITTER') {
				$twitter = true;
				break;
			}
		}
	}
	if ($twitter):
	?>
	<div class="box-completed">
		<h3>You're all set!</h3>
		<p>
			<?php echo anchor('/', 'Get started'); ?>
			<span class="middle">- or -</span><br>
			connect to more social networks
		</p>
	</div>
	<?php
	endif;
	?>

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