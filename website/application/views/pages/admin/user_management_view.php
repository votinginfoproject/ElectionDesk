<h2>Enable or Disable Email Accounts</h2>

<section id="all-users">
	
	<?php if (!empty($banned_users)) : foreach ($banned_users as $user) : ?>
			<div class="user">
				<h3><?php echo anchor('admin/enable/'.$user->id, 'Enable'); ?> <?php echo $user->email; ?> <span class="date-created">(<?php echo date('F j @ g:ia', strtotime($user->created)); ?>)</span></h3>
			</div>
	<?php endforeach; endif; ?>
	
	
	
	
	
	
	<?php if (empty($banned_users)) : ?>
	
		<h3>There are currently no users who need accounts enabled.</h3>
		
	<?php endif; ?>
	
	
</section>