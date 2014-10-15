<?php
if ($this->uri->segment(2) == 'pending'):
?>
	<h2>Pending users</h2>
<?php
else:
?>
	<h2>Active users</h2>
<?php
endif;
?>

<div class="btn-group">
  <a href="/admin/pending" class="btn btn-info<?php echo ($this->uri->segment(2) == 'pending') ? ' active' : '' ?>">Pending users</a>
  <a href="/admin/users" class="btn btn-info<?php echo ($this->uri->segment(2) != 'pending') ? ' active' : '' ?>">Active users</a>
</div>

<section id="all-users">

	<table class="table">
  	<thead>
  		<tr>
  			<th>Action</th>
  			<th>User Account</th>
  			<th>Date</th>
  		</tr>
  	</thead>
  	<tbody>
			<?php if (!empty($users)) : foreach ($users as $user) : ?>
			<tr>
				<td><?php if ($user->banned == 0): ?>
						<?php echo anchor('admin/disable/'.$user->id, 'Disable', array('class' => 'btn btn-danger btn-disable')); ?>
					<?php else: ?>
						<?php echo anchor('admin/enable/'.$user->id, 'Enable', array('class' => 'btn btn-success btn-disable')); ?>
						<?php echo anchor('admin/delete/'.$user->id, 'Delete', array('class' => 'btn btn-danger btn-disable')); ?>
					<?php endif; ?></td>
				<td><?php echo $user->email; ?></td>
				<td><?php echo date('F j @ g:ia', strtotime($user->created)); ?></td>
			</tr>
			<?php endforeach; endif; ?>
  	</tbody>
	</table>
	
	<?php if (empty($users)) : ?>
	
		<h3>There are currently no users who need accounts enabled.</h3>
		
	<?php endif; ?>
	
	
</section>