<div class="col-md-12 text-center">
	<h1>Welcome to ElectionDesk!</h1>
	<h3 class="text-muted">MONITOR &bull; ENGAGE &bull; DISSEMINATE</h3>
	<p><em>Brought to you by The Voting Information Project</em></p>
	<hr>
</div>

<?php
$login = array(
	'name'	=> 'login',
	'id'	=> 'login',
	'value' => set_value('login'),
	'class' => 'form-control'
);
$password = array(
	'name'	=> 'password',
	'id'	=> 'password',
	'class' => 'form-control'
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
	<div class="col-md-6">
		<h2>Sign in</h2>
		<div class="form-group">
			<?php echo form_label('E-mail', $login['id']); ?>
			<?php echo form_error($login['name'], '<div class="alert alert-danger">', '</div>'); ?>
			<?php echo form_input($login); ?>
		</div>

		<div class="form-group">
			<?php echo form_label('Password', $password['id']); ?>
			<?php echo form_error($password['name'], '<div class="alert alert-danger">', '</div>'); ?>
			<?php echo form_password($password); ?>
		</div>

		<div class="checkbox">
			<label>
				<input type="checkbox" name="remember" value="1"<?php if (set_value('remember')) echo ' checked'; ?>> Remember me
			</label>
		</div>

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
			
			<?php echo form_label('Confirmation Code', $captcha['id']); ?>
			<?php echo form_input($captcha); ?>
			<?php echo form_error($captcha['name']); ?>
			<?php endif; ?>
		<?php endif; ?>

		<div class="form-group">
			<?php echo form_submit('submit', 'Sign in', 'class="btn btn-primary"'); ?>
		</div>
	</div><!-- end left-col -->
	
	<div class="col-md-6">
		<h2>Don't have an account?</h2>
		<?php if ($this->config->item('allow_registration', 'tank_auth')) echo anchor('/auth/register/', 'Register', array('class' => 'btn btn-primary')); ?>
		<?php echo anchor('/auth/forgot_password/', 'Forgot password'); ?>

		<p>Please note that ElectionDesk is a free tool provided to election officials and not available for the general public.</p>
	</div><!-- end right-col -->

<?php echo form_close(); ?>