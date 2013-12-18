<h1>Create a new password</h1>

<p>Forgot your password, huh? No big deal.</p>
<p>To create a new password, just follow this link:</p>

<h2><a href="<?php echo site_url('/auth/reset_password/'.$user_id.'/'.$new_pass_key); ?>" style="color: #3366cc;">Create a new password</a></h2>

<p>Link doesn't work? Copy the following link to your browser address bar:</p>
<p><a href="<?php echo site_url('/auth/reset_password/'.$user_id.'/'.$new_pass_key); ?>" style="color: #3366cc;"><?php echo site_url('/auth/reset_password/'.$user_id.'/'.$new_pass_key); ?></a></p>

<p>You received this email, because it was requested by a <a href="<?php echo site_url(''); ?>" style="color: #3366cc;"><?php echo $site_name; ?></a> user. This is part of the procedure to create a new password on the system. If you DID NOT request a new password then please ignore this email and your password will remain the same.</p>