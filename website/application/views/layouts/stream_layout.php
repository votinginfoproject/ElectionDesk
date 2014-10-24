<!DOCTYPE html>
<html lang="en">
<head>
	<?php echo $head; ?>
</head>
<?php if (empty($body_id)) $body_id = NULL; ?>
<body id="<?php echo $body_id; ?>" ng-app="electiondesk">

<?php
if (isset($modal_reply)) {
  echo $modal_reply;
}

if (isset($modal_post)) {
  echo $modal_post;
}
?>

<div class="wrapper">
  <header>
    <div class="container">
      <a class="logo" href="/">ElectionDesk</a>
      <nav>
        <ul>
          <li<?php echo (uri_string() == '') ? ' class="active"' : '' ?>><a href="/">Home</a></li>
          <?php
          if ($this->tank_auth->is_logged_in()):
          ?>
          <li<?php echo (uri_string() == 'conversations') ? ' class="active"' : '' ?>><a href="/conversations">Conversations</a></li>
          <li<?php echo (uri_string() == 'settings') ? ' class="active"' : '' ?>><a href="/settings">Settings</a></li>
          <li><a href="/auth/logout">Logout</a></li>
          <li class="btn btn-primary" data-toggle="modal" data-target="#postModal">Post</li>
          <?php
          else:
          ?>
          <li<?php echo (uri_string() == 'help') ? ' class="active"' : '' ?>><a href="/help">Help</a></li>
          <?php
          endif;
          ?>
        </ul>
      </nav>
    </div><!--/container-->
  </header>

  <div class="container" ng-controller="StreamController">
    <?php echo $content; ?>
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
</div><!--/wrapper-->



<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-rc.0/angular.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.0.0/moment.min.js"></script>
<script src="http://electiondesk.us:4242/socket.io/socket.io.js"></script>
<script src="/assets/js/script.js"></script>

</body>
</html>