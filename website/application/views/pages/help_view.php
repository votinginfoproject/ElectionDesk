
	<div class="row">
		<div class="help-desk-text col-md-6">
			<h2>Help Desk</h2>
			<p>
				Our support team is available to help you with any questions, comments or concerns you might have surrounding the use of this application.  To submit a support ticket to us you can either:
			</p>
			<ul>
				<li>Tweet at <a href="http://twitter.com/ElectionDesk">@ElectionDesk</a></li>
				<li>Submit your ticket by using the form on this page</li>
			</ul>
		</div>
		<div class="help-desk-form col-md-6">
			 <script type="text/javascript">
			 var RecaptchaOptions = {
			    theme : 'clean'
			 };
			 </script>
			<?php
			echo $this->session->flashdata('message');

			echo form_open('help', array('class' => 'help-form'));	
			 
			$first_name = array(
				'name' => 'first_name',
				'id' => 'first_name',
				'value' => set_value('first_name'),
				'class' => 'form-control'
			);
			echo '<div class="form-group'. (form_error('first_name') ? ' has-error' : '') .'">';
			echo form_error('first_name', '<div class="error-message">', '</div>');
			echo form_label('First Name', 'first_name', array('class' => 'required'));
			echo form_input($first_name);
			echo '</div>';

			$last_name = array(
				'name' => 'last_name',
				'id' => 'last_name',
				'value' => set_value('last_name'),
				'class' => 'form-control'
			);
			echo '<div class="form-group'. (form_error('first_name') ? ' has-error' : '') .'">';
			echo form_error('last_name', '<div class="error-message">', '</div>');
			echo form_label('Last Name', 'last_name', array('class' => 'required'));
			echo form_input($last_name);
			echo '</div>';


			$email = array(
				'name' => 'email',
				'id' => 'email',
				'value' => set_value('email'),
				'class' => 'form-control'
			);
			echo '<div class="form-group'. (form_error('first_name') ? ' has-error' : '') .'">';
			echo form_error('email', '<div class="error-message">', '</div>');
			echo form_label('Email', 'email', array('class' => 'required'));
			echo form_input($email);
			echo '</div>';

			$priority = "form-control";
			echo '<div class="form-group'. (form_error('first_name') ? ' has-error' : '') .'">';
			echo form_label('Priority', 'priority');
			echo form_dropdown('priority', array('low' => 'Low', 'medium' => 'Medium', 'high' => 'High'), set_value('priority'), 'class='.$priority); 
			echo '</div>';

			$message = array(
				'name' => 'message',
				'id' => 'message',
				'value' => set_value('message'),
				'class' => 'form-control'
			);
			echo '<div class="form-group'. (form_error('first_name') ? ' has-error' : '') .'">';
			echo form_label('Message', 'message');
			echo form_textarea($message);
			echo '</div>';

			echo recaptcha_get_html(RECAPTCHA_PUBLIC);

			echo form_submit(array('name' => 'submit', 'class' => 'btn btn-primary', 'value' => 'Submit a Ticket'));

			echo form_close();
			?>





		</div>
		




	</div><!--/row-->






<section id="help-desk-webinar">
	<h2>Watch the Webinar</h2>
	<div class="webinar-video">
		<div class="embed-responsive embed-responsive-16by9">
			<iframe src="//player.vimeo.com/video/110388380" width="500" height="263" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
		</div>
	</div>
</section>















