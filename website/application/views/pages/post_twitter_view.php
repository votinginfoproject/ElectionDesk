<section id="post-options" class="post-pages">

	<h2>Tweet, Post, and Share</h2>
	
	<?php if (count($accounts) > 1): ?>
	<p>Switch account <select name="accounts" onchange="document.location.href='/settings/select_primary?id=' + this.value;">
		<?php foreach ($accounts as $account): ?>
			<<option value="<?php echo $account->id; ?>"<?php if ($account->is_primary == 1) echo ' selected="selected"' ?>>@<?php echo $account->name; ?></option>
		<?php endforeach; ?>
	</select></p>
	<?php endif; ?>

	<p>
		Here you can post directly to your different connected social accounts. If you would like to connect more accounts, <?php echo anchor('settings', 'Click Here', array('target' => '_parent')); ?>
	</p>

	<ul>
		<li id="twitter"><?php echo anchor('post/twitter', 'Twitter', array('class' => 'twitter-toggle on')); ?></li>
		<li id="facebook"><?php echo anchor('post/facebook', 'Facebook', array('class' => 'facebook-toggle off')); ?></li>
	</ul>
	
	<section id="response" style="display: block;">	
		<span id="post-success">Your tweet has successfully been sent!</span>
		
		
		<form id="tweet-form">
			<textarea></textarea>
			<input type="submit" class="submit" value="Reply">
			<p class="word-count">140</p>
		</form>
	</section>
	<div class="clear"></div>
</section>