<div id="container">
	
	<div class="subhead">
		<h3>Conversations</h3>
		<p>Follow conversations with people.</p>
		<p>Switch account to reply from <select name="accounts" onchange="document.location.href='/settings/select_primary?id=' + this.value;">
			<?php foreach ($accounts as $account): ?>
				<option value="<?php echo $account->id; ?>"<?php if ($account->is_primary == 1) echo ' selected="selected"' ?>>@<?php echo $account->name; ?></option>
			<?php endforeach; ?>
		</select></p>
	</div><!-- end subhead -->

	<section class="tab-list go-back-tab">
		<div class="bookmarks"><a href="#">Go Back</a></div>
	</section>
	
	<div class="content">
		<div id="loading">
			<h3>Loading conversations</h3>
		</div>

		<div id="no-conversations">
			<h3>You don't have any conversations yet</h3>
			<p>Start a conversation by replying to a message.</hp>
		</div>

		<div id="conversations-overview"></div>
		<div id="conversations-list"></div>

		<form class="reply">
			<p class="error"></p>
			<textarea></textarea>
			<input type="submit" value="Reply"/>
			<p class="word-count">140</p>
			<img id="saving-reply-indicator" src="<?php echo site_url('/assets/img/loading.gif'); ?>" alt="Loading..." />
			<div class="clear"></div>
		</form>
	</div><!-- end content -->

</div>