<?php
$config['client_id'] = GOOGLE_CLIENT_ID; 
$config['client_secret'] = GOOGLE_CLIENT_SECRET; 
$config['redirect_uri'] = site_url().'settings/google/callback';
$config['developer_key'] = GOOGLE_API_KEY;
$config['scopes'] = 'https://www.googleapis.com/auth/plus.me';
 
/*	End of File google_config.php */
/*	Location: .application/config/google_config.php */