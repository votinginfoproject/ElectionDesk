<section class="tab-list">
	<div class="bookmarks"><?php echo anchor('trending', 'Go Back'); ?></div>
</section>

<div class="content">
		
		
	<section id="bookmarks-stream" class="feed"><!-- left column -->
		<?php foreach ($bookmarks as $bookmark) : ?>
					
			<?php if ($bookmark->interaction->type == 'twitter') : ?>
			
				<section class="entry <?php echo $bookmark->interaction->type; ?> bookmarked" data-messageid="<?php echo $bookmark->_id->{'$id'}; ?>" data-twitterid="<?php echo $bookmark->twitter->id; ?>">
					<img src="<?php echo $bookmark->interaction->author->avatar; ?>" alt="Legna Elocin" class="profile-pic">
					<a href="<?php echo $bookmark->interaction->link; ?>" target="_blank">@<?php echo $bookmark->interaction->author->username; ?></a>
					<p><?php echo $bookmark->interaction->content; ?></p>
					<ul class="actions">
						<li class="follow"><a href="#">Follow</a></li>
						<li class="reply"><a href="#">Reply</a></li>
						<li class="retweet"><a href="#">Retweet</a></li>
						<li class="bookmark"><a href="#">Bookmark</a></li>
					</ul>
				</section>
				
			<?php elseif ($bookmark->interaction->type == 'facebook') : ?>
			
				<section class="entry facebook bookmarked" data-messageid="<?php echo $bookmark->_id->{'$id'}; ?>">
					<img src="<?php echo $bookmark->facebook->author->avatar; ?>" alt="<?php echo $bookmark->facebook->author->name; ?>" class="profile-pic">
					<a target="_blank"><?php echo $bookmark->facebook->author->name; ?></a>
					<p>
						<?php echo $bookmark->facebook->message; ?>
					</p>
					<ul class="actions">
						<li class="bookmark">
							<a href="#">Bookmark</a>
						</li>
					</ul>
				</section>
			
			<?php endif; ?>
		<?php endforeach; ?>
			
	</section><!-- end response -->

	<section class="filters-reply"><!-- right column -->
					
		<section id="response">
			<p>Reply from <select name="accounts" id="accountswitcher">
				<?php foreach ($accounts as $account): ?>
					<<option value="<?php echo $account->id; ?>"<?php if ($account->is_primary == 1) echo ' selected="selected"' ?>>@<?php echo $account->name; ?></option>
				<?php endforeach; ?>
			</select></p>

			<h2>Reply to <span class="username">@Username</span></h2>

			<?php
			/* Are we logged in */
	        if(!$this->twitter->is_logged_in()):
	        ?>
	    		<?php echo anchor('/tweet/login', '<img src="https://dev.twitter.com/sites/default/files/images_documentation/sign-in-with-twitter_0.png" alt="Login with Twitter" />'); ?>
	    	<?php
	    	else:
			?>
			<form id="tweet-form">
				<textarea></textarea>
				<input type="submit" class="submit" value="Reply">
				<p class="word-count">140</p>
			</form>
			<?php
			endif;
			?>

			<section class="entry"></section>
		</section><!-- end response -->
			
	</section>

	<section class="clear"></section>
</div>
   