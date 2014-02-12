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
<body id="<?php echo $body_id; ?>" class="admin">

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
		<section class="inner">
			<ul>
				<li class="users"><a href="<?php echo site_url('admin/users'); ?>" class="<?php if ($body_id == 'users') echo 'active'; ?>"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="72.065px" height="100px" viewBox="0 0 72.065 100" enable-background="new 0 0 72.065 100" xml:space="preserve">
<path d="M42.762,68.147c0,3.719-3.017,6.735-6.724,6.735c-3.718,0-6.735-3.017-6.735-6.735c0-3.706,3.017-6.724,6.735-6.724  C39.746,61.424,42.762,64.441,42.762,68.147z"/>
<path d="M45.65,85.863c0-5.309-4.314-9.612-9.611-9.612c-5.32,0-9.624,4.304-9.624,9.612l0,0V100H45.65V85.863L45.65,85.863z"/>
<path d="M62.454,61.424c-3.719,0-6.735,3.018-6.735,6.724c0,3.719,3.017,6.735,6.735,6.735c3.707,0,6.724-3.017,6.724-6.735  C69.177,64.441,66.161,61.424,62.454,61.424z"/>
<path d="M72.065,85.863c0-5.309-4.314-9.612-9.611-9.612c-5.309,0-9.612,4.304-9.612,9.612l0,0V100h19.224V85.863L72.065,85.863z"/>
<path d="M9.624,61.424c-3.718,0-6.735,3.018-6.735,6.724c0,3.719,3.017,6.735,6.735,6.735c3.707,0,6.712-3.017,6.712-6.735  C16.335,64.441,13.331,61.424,9.624,61.424z"/>
<path d="M19.224,85.863c0-5.309-4.303-9.612-9.6-9.612C4.303,76.251,0,80.555,0,85.863l0,0V100h19.224V85.863L19.224,85.863z"/>
<path d="M36.039,0c-4.292,0-7.776,3.484-7.776,7.776s3.484,7.776,7.776,7.776c4.291,0,7.765-3.484,7.765-7.776S40.33,0,36.039,0z"/>
<path d="M47.135,27.853c0-6.127-4.97-11.097-11.097-11.097c-6.139,0-11.108,4.97-11.108,11.097l0,0v16.324h22.205V27.853  L47.135,27.853z"/>
<polygon points="36.635,52.298 36.635,47.428 35.431,47.428 35.431,52.298 9.004,52.298 9.004,59.284 10.208,59.284 10.208,53.502   35.431,53.502 35.431,59.284 36.635,59.284 36.635,53.502 61.845,53.502 61.845,59.284 63.049,59.284 63.049,52.298 "/>
</svg> User Management</a></li>
				<li class="data"><a href="<?php echo site_url('admin/data'); ?>" class="<?php if ($body_id == 'data') echo 'active'; ?>"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100px" height="99.987px" viewBox="0 0 100 99.987" enable-background="new 0 0 100 99.987" xml:space="preserve">
<path d="M99.968,0L0,0.026l0.013,99.96L100,99.961L99.968,0z M93.483,93.575H72.168V72.142l21.302-0.02L93.483,93.575z M6.602,6.289  H27.93v21.433H17.272H6.608L6.602,6.289z M28.463,50.195h9.499l-9.499,19.024V50.195z M28.463,49.668l-0.006-10.709V28.249  l21.309-0.013v3.34c-0.267-0.045-0.527-0.156-0.827-0.137c-1.041,0.091-1.973,0.729-2.447,1.673l-8.269,16.556H28.463z M50.3,40.996  l6.504,8.672h-6.498L50.3,40.996z M71.628,50.195v4.928l-1.035,2.761l-5.769-7.689H71.628z M71.628,28.236v21.432h-7.207  L51.66,32.644c-0.358-0.476-0.833-0.781-1.367-0.97v-3.438h10.664H71.628z M49.733,40.248l0.039,0.039l0.006,9.381h-4.746  L49.733,40.248z M57.207,50.195L69.056,65.99c0.612,0.801,1.589,1.179,2.585,1.146v4.479l-21.335,0.013V50.195H57.207z   M72.155,50.195h1.321l-1.321,3.516V50.195z M72.155,49.668V28.236h9.544l-8.021,21.432H72.155z M72.155,27.708L72.142,16.96V6.276  l17.78-0.013l-8.027,21.445H72.155z M71.628,27.708H60.957H50.293V6.276h21.315l0.013,10.684L71.628,27.708z M49.766,27.708  l-21.309,0.013V6.289l21.309-0.013V27.708z M27.93,28.249v10.709l0.006,10.709L6.608,49.681V28.249h10.664H27.93z M27.936,50.195  v20.072l-0.677,1.36h-9.987L6.621,71.641L6.608,50.208L27.936,50.195z M26.999,72.155l-2.383,4.766L6.621,88.932V72.168  L26.999,72.155z M27.943,82.018v0.886l0.02,10.684H10.605L27.943,82.018z M44.772,50.195h5.006v21.432H34.069L44.772,50.195z   M72.168,71.615v-4.544c0.983-0.222,1.81-0.886,2.181-1.843l5.632-15.045H93.47v21.419L72.168,71.615z M80.183,49.655l8.021-21.433  h5.267v21.433H80.183z M88.405,27.708l5.064-13.535v13.522L88.405,27.708z M28.47,82.904v-1.23l0.195-0.124  c0.442-0.293,0.794-0.709,1.028-1.178l4.115-8.217h15.97l0.014,10.71l0.006,10.71l-21.315,0.013L28.47,82.904z M50.306,72.155  l21.335-0.013v21.433H50.325l-0.006-10.71L50.306,72.155z"/>
</svg> Data Analysis</a></li>
			</ul>
		</section>
	</nav>
			</ul>
		</section>
	</nav>
	
	
	<div id="container">
		<div class="content">
			<?php echo $content; ?>
		</div>
	</div>

	<footer>
		<div class="inner">
			<div class="left-col">
				<p class="our-partners">Our Partners</p>
				<a href="http://www.pewtrusts.org" class="pew">PEW</a>
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