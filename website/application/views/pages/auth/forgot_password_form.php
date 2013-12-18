<?php
$email = array(
	'name'	=> 'login',
	'id'	=> 'login',
	'value' => set_value('login'),
	'maxlength'	=> 80,
	'size'	=> 30,
);
?>
<?php echo form_open($this->uri->uri_string(), 'class="register"'); ?>
<div class="left-col">
	<?php echo form_label('E-mail', $email['id']); ?>
	<p class="error-message">
		<?php echo form_error($email['name']); ?>
		<?php echo isset($errors[$email['name']])?$errors[$email['name']]:''; ?>
	</p>
	<?php echo form_input($email); ?>

	<?php echo form_submit('reset', 'Get a new password', 'class="submit"'); ?>
</div><!-- end left-col -->

<div class="right-col">
	<h3>Remember your password?</h3>
	<?php echo anchor('/auth/login', 'Login', array('class' => 'login')); ?>
	<?php if ($this->config->item('allow_registration', 'tank_auth')) echo anchor('/auth/register/', 'or Register'); ?>
</div>

<div class="clear"></div>
<?php echo form_close(); ?>