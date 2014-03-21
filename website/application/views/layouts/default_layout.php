<!DOCTYPE html> 
<!--[if lt IE 7 ]> <html lang="en" class="ie ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="ie ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="ie ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="ie ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en"> <!--<![endif]--> 
<head>
	<?php echo $head; ?>
</head>
<?php if (empty($body_id)) $body_id = NULL; ?>
<body id="<?php echo $body_id; ?>">
		
	<header>
	
		<section class="inner">
		<h1 class="logo"><a href="/">Election Desk</a></h1>
			<ul class="admin-nav">
				<li><?php echo anchor(base_url(), 'Home'); ?></li>
				<li><?php echo anchor('help', 'Help'); ?></li>
				<?php
				if ($this->tank_auth->is_logged_in()):
				?>
				<li><?php echo anchor('settings', 'Settings'); ?></li>
				<li><?php echo anchor('/auth/logout', 'Logout'); ?></li>
				<?php
				endif;
				?>
				<li class="post-button">
					<a href="/post" class="iframe">Post</a>
				</li>
				<li class="wait-calc-button">
					<a href="#" onClick="return false">Wait Time</a>
				</li>
				
			
				
			</ul>
		</section>
	</header>

	<nav>
		<?php
		if ($this->tank_auth->is_logged_in()):
			$unread_messages_count = $this->read_messages_model->get_unread_messages_count($this->tank_auth->get_user_id());
		endif;
		?>
		<section class="inner">
		<ul>
			<li class="trending-topics"><a href="<?php echo base_url(); ?>" class="<?php if ($body_id == 'trending-topics') echo 'active'; ?>"><?php echo svg('trending-topics'); ?>My Desk</a></li>
			<li class="publish">
				<a href="<?php echo site_url('conversations'); ?>" class="<?php if ($body_id == 'conversations') echo 'active'; ?>">
					<?php echo svg('conversations'); ?>Conversations
					<?php echo (isset($unread_messages_count) && $unread_messages_count > 0) ? '<span class="unread-messages">' . $unread_messages_count . '</span>' : ''; ?>
				</a>
			</li>
			<li class="history"><a href="<?php echo site_url('history'); ?>" class="<?php if ($body_id == 'history') echo 'active'; ?>"><?php echo svg('history'); ?>Historic posts</a></li>
			<li class="voters"><a href="<?php echo site_url('voters'); ?>" class="<?php if ($body_id == 'voters') echo 'active'; ?>"><?php echo svg('voters'); ?>Voters</a></li>
		</ul>
		</section>
	</nav>

<div style="clear: both"></div>
	<div id="container">
		<?php echo $content; ?>
	</div>
	<div style="clear: both"></div>
	<footer class="footer">
		<div class="inner footer">
			<div class="left-col">
				<a href="http://votinginfoproject.org" target="_blank"><img src="/assets/img/vip_logo.png" alt="Voting Information Project"></a>
			</div>
			<div class="right-col">
				<ul>
					<li><?php echo anchor('about', 'About'); ?></li>
					<li><?php echo anchor('glossary', 'Glossary'); ?></li>
					<li><?php echo anchor('terms-of-use', 'Terms of Use'); ?></li>
					<li><?php echo anchor('privacy-policy', 'Privacy Policy'); ?></li>
					<?php if ($this->session->userdata('is_admin') == 1) : ?>
					<li><?php echo anchor('admin', 'Admin'); ?></li>
					<?php endif; ?>
				</ul>
				<p>&copy; Copyright 2012-<?php echo date('Y'); ?> Voting Information Project. All Rights Reserved.</p>
			</div>
		</div>
	</footer>
</body>
</html>