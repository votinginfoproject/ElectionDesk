<?php
$email = array(
	'name'	=> 'email',
	'id'	=> 'email',
	'value'	=> set_value('email'),
	'maxlength'	=> 80,
	'size'	=> 30,
);
$password = array(
	'name'	=> 'password',
	'id'	=> 'password',
	'value' => set_value('password'),
	'maxlength'	=> $this->config->item('password_max_length', 'tank_auth'),
	'size'	=> 30,
);
$confirm_password = array(
	'name'	=> 'confirm_password',
	'id'	=> 'confirm_password',
	'value' => set_value('confirm_password'),
	'maxlength'	=> $this->config->item('password_max_length', 'tank_auth'),
	'size'	=> 30,
);
$captcha = array(
	'name'	=> 'captcha',
	'id'	=> 'captcha',
	'maxlength'	=> 8,
);
?>
<?php echo form_open($this->uri->uri_string(), 'class="register"'); ?>
<div class="left-col">
	<?php echo form_label('E-mail', $email['id']); ?>
	<p class="error-message">
		<?php echo form_error($email['name']); ?>
		<?php echo isset($errors[$email['name']])?$errors[$email['name']]:''; ?>
	</p>
	<?php echo form_input($email); ?></td>

	<?php echo form_label('Password', $password['id']); ?>
	<p class="error-message">
		<?php echo form_error($password['name']); ?>
		<?php echo isset($errors[$password['name']])?$errors[$password['name']]:''; ?>
	</p>
	<?php echo form_password($password); ?></td>

	<?php echo form_label('Confirm Password', $password['id']); ?>
	<p class="error-message">
		<?php echo form_error($confirm_password['name']); ?>
		<?php echo isset($errors[$confirm_password['name']])?$errors[$confirm_password['name']]:''; ?>
	</p>
	<?php echo form_password($confirm_password); ?></td>

	<?php echo form_submit('submit', 'Register', 'class="submit"'); ?>
</div><!-- end left-col -->

<div class="right-col">
	<h3>Already have an account?</h3>
	<?php echo anchor('/auth/login', 'Login', array('class' => 'login')); ?>
	<?php echo anchor('/auth/forgot_password/', 'Forgot password'); ?>
	<p class="register-disclaimer">Please note that ElectionDesk is a free tool provided to election officials and not available for the general public.</p>
</div>

<div class="clear"></div>
<?php echo form_close(); ?>