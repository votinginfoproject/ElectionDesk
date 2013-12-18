<h1>>Welcome to <?php echo $site_name; ?>!</h1>
<h3>Thanks for joining <?php echo $site_name; ?>. We listed your sign in details below, make sure you keep them safe.</h3>

<h2><a href="<?php echo site_url('/auth/activate/'.$user_id.'/'.$new_email_key); ?>" style="color: #3366cc;">Finish your registration...</a></h2>

<p>Link doesn't work? Copy the following link to your browser address bar:</p>
<p><a href="<?php echo site_url('/auth/activate/'.$user_id.'/'.$new_email_key); ?>" style="color: #3366cc;"><?php echo site_url('/auth/activate/'.$user_id.'/'.$new_email_key); ?></a></p>

<p>Please verify your email within <?php echo $activation_period; ?> hours, otherwise your registration will become invalid and you will have to register again.</p>