<div class="row login-heading">
	<div class="col-md-12">
		<h1>Welcome to ElectionDesk!</h1>
		<h3>MONITOR &bull; ENGAGE &bull; DISSEMINATE</h3>
		<p class="tagline">Brought to you by The Voting Information Project</p>
	</div>	
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
	'class' => 'form-control'
);
?>
<?php echo form_open($this->uri->uri_string(), 'class="register"'); ?>
	<div class="signin col-md-6 account-form">
		<div class="form-wrapper-left">
			<h2>Sign in with email</h2>
			<div class="form-group">
				<?php echo form_error($login['name'], '<div class="alert alert-danger">', '</div>'); ?>
				<div class="input-group">
					<div class="input-group-addon"><i class="fa fa-user"></i></div>
					<?php echo form_label('E-mail', $login['id'], array('class' => 'sr-only')); ?>
					<?php echo form_input($login); ?>
				</div><!--/input group-->
			</div>

			<div class="form-group">
				<?php echo form_error($password['name'], '<div class="alert alert-danger">', '</div>'); ?>
				<div class="input-group">
					<div class="input-group-addon"><i class="fa fa-lock"></i></div>
					<?php echo form_label('Password', $password['id'], array('class' => 'sr-only')); ?>
					<?php echo form_password($password); ?>
				</div><!--/input group-->
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

				<div class="form-group">
					<p>Enter the code exactly as it appears:</p>
					<?php echo $captcha_html; ?>
				</div>

				<div class="form-group">
					<?php echo form_error($captcha['name'], '<div class="alert alert-danger">', '</div>'); ?>
					<div class="input-group">
						<div class="input-group-addon"><i class="fa fa-key"></i></div>
						<?php echo form_label('Confirmation Code', $captcha['id'], array('class' => 'sr-only')); ?>
						<?php echo form_input($captcha); ?>
					</div>
				</div>
				<?php endif; ?>
			<?php endif; ?>

			<div class="form-group">
				<?php echo form_submit('submit', 'Log in', 'class="btn btn-primary btn-login"'); ?>
			</div>
		</div><!--/form wrapper-->
	</div><!-- end left-col -->
	
	<div class="register col-md-6">
		<h2>Don't have an account?</h2>
		<?php if ($this->config->item('allow_registration', 'tank_auth')) echo anchor('/auth/register/', 'Register', array('class' => 'btn btn-primary btn-register')); ?>
		<p><?php echo anchor('/auth/forgot_password/', 'Forgot password?'); ?></p>

		<p>Please note that ElectionDesk is a free tool provided to election officials and not available for the general public.</p>
	</div><!-- end right-col -->

<?php echo form_close(); ?>