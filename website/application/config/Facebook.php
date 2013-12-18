<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');


if (ENVIRONMENT == 'development') {
	$config['appId']  = '__FACEBOOK_DEV_APPID_GOES_HERE__'; 
	$config['secret'] = '__FACEBOOK_DEV_APPSECRET_GOES_HERE__';
} else {
	$config['appId']  = '__FACEBOOK_PROD_APPID_GOES_HERE__'; 
	$config['secret'] = '__FACEBOOK_PROD_APPSECRET_GOES_HERE__';
}

//Facebook Config
$config['facebook_login_parameters'] = array(
	'scope' => 'publish_stream, manage_pages'
);


/* End of file Facebook.php */
/* Location: ./application/config/Facebook.php */