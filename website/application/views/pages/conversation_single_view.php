<div id="container">
	
	<div class="subhead">
		<h3>Conversations</h3>
		<p>Follow conversations with people.</p>
	</div><!-- end subhead -->
	
	<div class="content">
		<?php
		foreach ($conversations as $conversation):
			if ($conversation['user'] != urldecode($for_user))
				continue;

			$conversation['list'] = array_reverse($conversation['list']); // Show newest messages last

			foreach ($conversation['list'] as $message):
			?>
			<div class="convo">
				<img src="<?php echo $message['picture'] ?>" class="thumbnail" alt="">
				<p class="time-stamp">Posted <?php echo relative_time($message['time']); ?> ago</p>
				<h4><?php echo $message['author']; ?></h4>
				<p><?php echo $message['message']; ?></p>
			</div>
			<?php
			endforeach;
		break;
		endforeach;
		?>

		<form class="reply">
			<p class="error"></p>
			<textarea>@<?php echo $for_user; ?> </textarea>
			<input type="submit" value="Reply"/>
			<p class="word-count">140</p>
			<div class="clear"></div>
		</form>
	</div><!-- end content -->

</div>