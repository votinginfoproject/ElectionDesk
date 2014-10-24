<h3>Conversations</h3>
<p class="from">Reply from</p>
<select name="accounts" onchange="document.location.href='/settings/select_primary?id=' + this.value;" class="form-control accountswitcher">
	<?php foreach ($accounts as $account): ?>
		<option value="<?php echo $account->id; ?>"<?php if ($account->is_primary == 1) echo ' selected="selected"' ?>>@<?php echo $account->name; ?></option>
	<?php endforeach; ?>
</select>

<a href="#" class="go-back btn btn-warning pull-right">Go Back</a>

<div class="content conversations-container">
	<div id="loading">
		<h3><i class="fa fa-spinner fa-spin"></i> Loading conversations</h3>
	</div>

	<div id="no-conversations">
		<h3>You don't have any conversations yet</h3>
		<p>Start a conversation by replying to a message.</hp>
	</div>

	<div id="conversations-overview"></div>
	<div id="conversations-list"></div>

	<form class="reply">
		<p class="error"></p>
		<textarea class="form-control"></textarea>
		<button type="submit" class="btn btn-primary">Reply</button>
		<p class="word-count">140</p>
		<i id="saving-reply-indicator" class="fa fa-spinner fa-spin"></i>
		<div class="clear"></div>
	</form>
</div><!-- end content -->