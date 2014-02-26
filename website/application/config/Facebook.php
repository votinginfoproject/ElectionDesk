<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

// App credentials
$config['appId']  = FACEBOOK_APP_ID;
$config['secret'] = FACEBOOK_APP_SECRET;

//Facebook Config
$config['facebook_login_parameters'] = array(
	'scope' => 'publish_stream, manage_pages'
);


/* End of file Facebook.php */
/* Location: ./application/config/Facebook.php */