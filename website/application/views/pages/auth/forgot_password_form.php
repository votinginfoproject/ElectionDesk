<?php
$email = array(
	'name'	=> 'login',
	'id'	=> 'login',
	'value' => set_value('login'),
	'maxlength'	=> 80,
	'size'	=> 30,
	'class' => 'form-control'
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
		<?php echo form_submit('reset', 'Get a new password', 'class="btn btn-primary btn-login"'); ?>
	</div><!--/form wrapper-->
</div><!-- end left-col -->

<div class="col-md-6 register">
	<h3>Remember your password?</h3>
	<p><?php echo anchor('/auth/login', 'Login', array('class' => 'login')); ?> or 
	<?php if ($this->config->item('allow_registration', 'tank_auth')) echo anchor('/auth/register/', 'Register'); ?></p>
</div>

<div class="clear"></div>
<?php echo form_close(); ?>