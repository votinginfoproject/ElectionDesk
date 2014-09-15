<h2>Enable or Disable Email Accounts</h2>

<section id="all-users">
	
	<?php if (!empty($users)) : foreach ($users as $user) : ?>
			<div class="user">
				<h3>
					<?php if ($user->banned == 0): ?>
						<?php echo anchor('admin/disable/'.$user->id, 'Disable', array('class' => 'disable')); ?>
					<?php else: ?>
						<?php echo anchor('admin/enable/'.$user->id, 'Enable', array('class' => 'enable')); ?>
						<?php echo anchor('admin/delete/'.$user->id, 'Delete', array('class' => 'disable')); ?>
					<?php endif; ?>

					<?php echo $user->email; ?> <span class="date-created">(<?php echo date('F j @ g:ia', strtotime($user->created)); ?>)</span>
				</h3>
			</div>
	<?php endforeach; endif; ?>	
	
</section>