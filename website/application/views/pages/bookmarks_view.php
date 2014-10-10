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
