<h2>Enable or Disable Email Accounts</h2>

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
			<?php if (!empty($banned_users)) : foreach ($banned_users as $user) : ?>
			<tr>
				<td><?php echo anchor('admin/enable/'.$user->id, 'Enable', array('class' => 'btn btn-success btn-enable')); ?></td>
				<td><?php echo $user->email; ?></td>
				<td><?php echo date('F j @ g:ia', strtotime($user->created)); ?></td>
			</tr>
			<?php endforeach; endif; ?>
  	</tbody>
	</table>
	
	<?php if (empty($banned_users)) : ?>
	
		<h3>There are currently no users who need accounts enabled.</h3>
		
	<?php endif; ?>
	
	
</section>