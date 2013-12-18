<section id="help-desk-text">
	<h2>Help Desk</h2>
	<p>
		Our support team is available to help you with any questions, comments or concerns you might have surrounding the use of this application.  To submit a support ticket to us you can either:
	</p>
	<ul>
		<li>Tweet at <a href="http://twitter.com/ElectionDesk">@ElectionDesk</a></li>
		<li>Submit your ticket directly below</li>
	</ul>
</section>

<?php
echo $this->session->flashdata('message');

echo form_open('help', array('class' => 'help-form'));	
 
$first_name = array(
	'name' => 'first_name',
	'id' => 'first_name',
	'value' => set_value('first_name')
);
if (form_error('first_name')) $first_name['class'] = 'error';
echo form_error('first_name', '<div class="error-message">', '</div>');
echo form_label('First Name', 'first_name', array('class' => 'required'));
echo form_input($first_name);

$last_name = array(
	'name' => 'last_name',
	'id' => 'last_name',
	'value' => set_value('last_name')
);
if (form_error('last_name')) $last_name['class'] = 'error';
echo form_error('last_name', '<div class="error-message">', '</div>');
echo form_label('Last Name', 'last_name', array('class' => 'required'));
echo form_input($last_name);


$email = array(
	'name' => 'email',
	'id' => 'email',
	'value' => set_value('email')
);
if (form_error('email')) $email['class'] = 'error';
echo form_error('email', '<div class="error-message">', '</div>');
echo form_label('Email', 'email', array('class' => 'required'));
echo form_input($email);

$priority = NULL;
if (form_error('priority')) $priority = 'error';
echo form_label('Priority', 'priority');
echo form_dropdown('priority', array('low' => 'Low', 'medium' => 'Medium', 'high' => 'High'), set_value('priority'), 'class='.$priority); 

$message = array(
	'name' => 'message',
	'id' => 'message',
	'value' => set_value('message')
);
if (form_error('message')) $message['class'] = 'error';
echo form_label('Message', 'message');
echo form_textarea($message);

echo form_submit(array('name' => 'submit', 'class' => 'submit', 'value' => 'Submit a Ticket'));

echo form_close();
?>

<section id="help-desk-webinar">
	<h2>Watch the Webinar</h2>
	<iframe src="https://player.vimeo.com/video/52235046?badge=0" width="900" height="505" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
</section>