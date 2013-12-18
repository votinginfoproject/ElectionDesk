<?php
$login = array(
	'name'	=> 'login',
	'id'	=> 'login',
	'value' => set_value('login'),
);
$password = array(
	'name'	=> 'password',
	'id'	=> 'password',
);
$remember = array(
	'name'	=> 'remember',
	'id'	=> 'remember',
	'value'	=> 1,
	'checked'	=> set_value('remember'),
);
$captcha = array(
	'name'	=> 'captcha',
	'id'	=> 'captcha',
	'maxlength'	=> 8,
);
?>
<?php echo form_open($this->uri->uri_string(), 'class="register"'); ?>
	<div class="left-col">
		<?php echo form_label('E-mail', $login['id']); ?>
		<p class="error-message">
			<?php echo form_error($login['name']); ?>
			<?php echo isset($errors[$login['name']])?$errors[$login['name']]:''; ?>
		</p>
		<?php echo form_input($login); ?></td>

		<?php echo form_label('Password', $password['id']); ?>
		<p class="error-message">
			<?php echo form_error($password['name']); ?>
			<?php echo isset($errors[$password['name']])?$errors[$password['name']]:''; ?>
		</p>
		<?php echo form_password($password); ?></td>

		<?php echo form_checkbox($remember); ?>
		<?php echo form_label('Remember me', $remember['id']); ?>

		<?php if ($show_captcha): ?>
			<?php if ($use_recaptcha): ?>
			<div id="recaptcha_image"></div>
			<a href="javascript:Recaptcha.reload()">Get another CAPTCHA</a>
			<div class="recaptcha_only_if_image"><a href="javascript:Recaptcha.switch_type('audio')">Get an audio CAPTCHA</a></div>
			<div class="recaptcha_only_if_audio"><a href="javascript:Recaptcha.switch_type('image')">Get an image CAPTCHA</a></div>
			
			<div class="recaptcha_only_if_image">Enter the words above</div>
			<div class="recaptcha_only_if_audio">Enter the numbers you hear</div>
			
			<input type="text" id="recaptcha_response_field" name="recaptcha_response_field" />
			<?php echo form_error('recaptcha_response_field'); ?>
			<?php echo $recaptcha_html; ?>
			<?php else: ?>
			<p>Enter the code exactly as it appears:</p>
			<?php echo $captcha_html; ?>
			
			<?php echo form_label('Confirmation Code', $captcha['id']); ?></td>
			<?php echo form_input($captcha); ?>
			<?php echo form_error($captcha['name']); ?>
			<?php endif; ?>
		<?php endif; ?>

		<?php echo form_submit('submit', 'Log in', 'class="submit"'); ?>
	</div><!-- end left-col -->
	
	<div class="right-col">
		<h3>Don't have an account?</h3>
		<?php if ($this->config->item('allow_registration', 'tank_auth')) echo anchor('/auth/register/', 'Register', array('class' => 'login')); ?>
		<?php echo anchor('/auth/forgot_password/', 'Forgot password'); ?>
		<p class="register-disclaimer">Please note that ElectionDesk is a free tool provided to election officials and not available for the general public.</p>
	</div><!-- end right-col -->

<div class="clear"></div>
<?php echo form_close(); ?>