<!-- Begin Meta -->
	
	<meta charset="utf-8">
	<title><?php echo $title; ?> <?php if (!empty($title)) echo '|'; ?> Election Desk | Voting Information Project</title>
	<meta name="viewport" content="width=960, maximum-scale=1.0" />
	<?php echo $meta; ?>
	<?php echo apple_mobile('black-translucent'); ?>
	<?php echo chrome_frame(); ?>

<!-- End Meta -->



<!-- Begin Icons -->
	<?php echo favicons(array('16' => 'assets/img/favicon.png')); ?>
<!-- End Icons -->



<!-- Begin CSS -->
	
	<link rel="stylesheet" href="<?php echo site_url('assets/css/style.css'); ?>">
	<link rel="stylesheet" href="<?php echo site_url('assets/css/colorbox.css'); ?>">
	<?php echo $css; ?>

<!-- End CSS -->





<!-- Begin JS -->

	<?php echo shiv(); ?>
	<?php echo jquery('1.7.2'); ?>
	<script src="<?php echo site_url('assets/js/scripts.js'); ?>"></script>
	<script src="<?php echo site_url('assets/js/colorbox.js'); ?>"></script>
	<script language="javascript">
	$(function() {
		$(".iframe").colorbox({ iframe: true, width: 650, height: 425 });
	});
	</script>
	<?php echo $js; ?>
<!-- End JS -->

<!-- Begin Tracking -->
	<script>
	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', 'UA-35813518-1']);
	  _gaq.push(['_trackPageview']);

	  (function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();
	</script>
<!-- End Tracking -->