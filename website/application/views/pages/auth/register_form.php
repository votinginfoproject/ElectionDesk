<?php
$email = array(
	'name'	=> 'email',
	'id'	=> 'email',
	'value'	=> set_value('email'),
	'maxlength'	=> 80,
	'size'	=> 30,
	'class' => 'form-control'
);
$password = array(
	'name'	=> 'password',
	'id'	=> 'password',
	'value' => set_value('password'),
	'maxlength'	=> $this->config->item('password_max_length', 'tank_auth'),
	'size'	=> 30,
	'class' => 'form-control'
);
$confirm_password = array(
	'name'	=> 'confirm_password',
	'id'	=> 'confirm_password',
	'value' => set_value('confirm_password'),
	'maxlength'	=> $this->config->item('password_max_length', 'tank_auth'),
	'size'	=> 30,
	'class' => 'form-control'
);
$captcha = array(
	'name'	=> 'captcha',
	'id'	=> 'captcha',
	'maxlength'	=> 8,
);
?>
<?php echo form_open($this->uri->uri_string(), 'class="register"'); ?>
<div class="signin col-md-6 account-form">
	<div class="form-wrapper-left">
		<div class="form-group">
			<?php echo form_label('Email', $email['id']); ?>
			<div class="input-group">
				<div class="input-group-addon"><i class="fa fa-user"></i></div>
				<?php echo form_error($email['name'], '<div class="alert alert-danger">', '</div>'); ?>
				<?php echo form_input($email); ?>
			</div><!--/input group-->
		</div>

		<div class="form-group">
			<?php echo form_label('Password', $password['id']); ?>
			<div class="input-group">
				<div class="input-group-addon"><i class="fa fa-lock"></i></div>
				<?php echo form_error($password['name'], '<div class="alert alert-danger">', '</div>'); ?>
				<?php echo form_input($password); ?>
			</div><!--/input group-->
		</div>

		<div class="form-group">
			<?php echo form_label('Confirm Password', $confirm_password['id']); ?>
			<div class="input-group">
				<div class="input-group-addon"><i class="fa fa-lock"></i></div>
				<?php echo form_error($confirm_password['name'], '<div class="alert alert-danger">', '</div>'); ?>
				<?php echo form_input($confirm_password); ?>
			</div><!--/input group-->
		</div>
		
		<?php echo form_submit('submit', 'Register', 'class="btn btn-primary btn-login"'); ?>
	</div><!--/form-wrapper-->
</div><!-- end left-col -->

<div class="register col-md-6">
	<h3>Already have an account?</h3>
	<p><?php echo anchor('/auth/login', 'Login', array('class' => 'login')); ?> | 
	<?php echo anchor('/auth/forgot_password/', 'Forgot password'); ?></p>
	<p class="register-disclaimer">Please note that ElectionDesk is a free tool provided to election officials and not available for the general public.</p>
</div>

<div class="clear"></div>
<?php echo form_close(); ?>












