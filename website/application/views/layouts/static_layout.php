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
			</ul>
		</section>
	</header>

	
	<div id="container">

		<div class="content">
			<?php echo $content; ?>
		</div>
		
	</div>

	<footer>
		<div class="inner">
			<div class="left-col">
				<p class="our-partners">Our Partners</p>
				<a href="http://www.foursquare.com" class="pew">PEW</a>
				<a href="https://votinginfoproject.org/" class="vip">Voting Information Project</a>
				<a href="http://www.foursquare.com" class="foursquare">Foursquare</a>
				<a href="http://www.facebook.com" class="facebook">Facebook</a>
				<a href="http://www.google.com" class="google">Google</a>
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
				<p>&copy; Copyright 2012-2013 Voting Information Project. All Rights Reserved.</p>
			</div>
		</div>
	</footer>
</body>
</html>