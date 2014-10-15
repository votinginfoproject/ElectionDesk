<section class="register">
	<div class="col-md-6">
	<h3>Connect your social network accounts</h3>

	<p>Last step. Connect your social networks to allow them to integrate with ElectionDesk. </p>
	<p>At a minimum, we require you to connect your official <a href="http://twitter.com">Twitter</a> account to ElectionDesk.  This is the account you will use to engage with voters in your area (e.g. @ElectionOfficial). </p>
	<p>If you don't have a Twitter handle yet, you can sign up <a href="https://twitter.com/signup">here</a>.</p>

	</div>
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