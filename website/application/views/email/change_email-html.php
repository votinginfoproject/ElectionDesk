<h1>Your new email address on <?php echo $site_name; ?></h1>

<p>You have changed your email address for <?php echo $site_name; ?>.</p>
<p>Follow this link to confirm your new email address:</p>

<h2><a href="<?php echo site_url('/auth/reset_email/'.$user_id.'/'.$new_email_key); ?>" style="color: #3366cc;">Confirm your new email</a></h2>

<p>Link doesn't work? Copy the following link to your browser address bar:</p>
<p><a href="<?php echo site_url('/auth/reset_email/'.$user_id.'/'.$new_email_key); ?>" style="color: #3366cc;"><?php echo site_url('/auth/reset_email/'.$user_id.'/'.$new_email_key); ?></a></p>

<h3>Your email address: <?php echo $new_email; ?></h3>

<p>You received this email, because it was requested by a <a href="<?php echo site_url(''); ?>" style="color: #3366cc;"><?php echo $site_name; ?></a> user. If you have received this by mistake, please DO NOT click the confirmation link, and simply delete this email. After a short time, the request will be removed from the system.</p>