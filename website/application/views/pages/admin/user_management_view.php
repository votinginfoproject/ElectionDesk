<?php
if ($this->uri->segment(2) == 'pending'):
?>
	<h2>Pending users</h2>
	<a href="/admin/users" class="toggle-pending-users">View active users</a>
<?php
else:
?>
	<h2>Active users</h2>
	<a href="/admin/pending" class="toggle-pending-users">View pending users</a>
<?php
endif;
?>

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