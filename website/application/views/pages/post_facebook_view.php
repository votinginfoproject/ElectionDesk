<section id="post-options" class="post-pages">

	<h2>Tweet, Post, and Share</h2>

	<?php if (count($accounts) > 1): ?>
	<p>Switch account <select name="accounts" onchange="document.location.href='/settings/select_primary?id=' + this.value;">
		<?php foreach ($accounts as $account): ?>
			<<option value="<?php echo $account->id; ?>"<?php if ($account->is_primary == 1) echo ' selected="selected"' ?>><?php echo $account->name; ?></option>
		<?php endforeach; ?>
	</select></p>
	<?php endif; ?>
	
	<p>
		Here you can post directly to your different connected social accounts. If you would like to connect more accounts, <?php echo anchor('settings', 'Click Here', array('target' => '_parent')); ?>
	</p>

	<ul>
		<li id="twitter"><?php echo anchor('post/twitter', 'Twitter', array('class' => 'twitter-toggle off')); ?></li>
		<li id="facebook"><?php echo anchor('post/facebook', 'Facebook', array('class' => 'facebook-toggle on')); ?></li>
	</ul>
	<div style="clear:both"></div>
	<div class="facebook-post">
	
		<?php echo $this->session->flashdata('message'); ?>
	
		<?php if ($can_post) : ?>
			<?php
				echo form_open('post/facebook');
			
				echo form_label('My Facebook Pages', 'pages');
				
				echo form_dropdown('pages', $pages, set_value('pages'));
				
				$message = array(
					'name' => 'message',
					'id' => 'message',
					'value' => set_value('message')
				);
				
				if (form_error('message')) $message['class'] = 'error';
				echo form_error('message', '<div class="error-message">', '</div>');
				echo form_label('Message', 'message');
				echo form_textarea($message);
		
				echo form_submit(array('name' => 'submit', 'class' => 'submit', 'value' => 'Post on Facebook'));
		
				echo form_close();
			?>
		<?php else : ?>
			<div class="no-facebook-post">
				<p class="reason"><?php echo $fail_reason; ?></p>
			</div>
		<?php endif; ?>
	
	</div>
	
	<div class="clear"></div>
</section>