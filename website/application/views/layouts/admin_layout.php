<!DOCTYPE html>
<html lang="en">
<head>
	<?php echo $head; ?>
</head>
<?php if (empty($body_id)) $body_id = NULL; ?>
<body id="<?php echo $body_id; ?>">

<div class="container wrapper">
  <header>
    <a class="logo" href="/">ElectionDesk</a>

    <nav>
      <ul>
        <li class="active"><a href="/">Home</a></li>
        <li><a href="/admin/users">Users</a></li>
        <li><a href="/admin/data">Data</a></li>
      </ul>
    </nav>
  </header>

	<main>
		<?php echo $content; ?>
	</main>
</div>

<footer>
  <div class="container">
    <img src="/assets/img/vip-logo.png" alt="Voting Information Project">

    <nav>
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/help">Help</a></li>
        <li><a href="/glossary">Glossary</a></li>
        <li><a href="/terms-of-use">Terms of Use</a></li>
        <li><a href="/privacy-policy">Privacy Policy</a></li>
        <?php if ($this->session->userdata('is_admin') == 1) : ?>
				<li><a href="/admin">Admin</a></li>
				<?php endif; ?>
      </ul>
    </nav>

    <span>&copy; Copyright 2012-<?php echo date('Y'); ?> Voting Information Project. All Rights Reserved.</span>
  </div>
</footer>

<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
<script src="/assets/js/script.js"></script>

</body>
</html>