<?php
// Set default timezone
if (function_exists('date_default_timezone_set')) {
	date_default_timezone_set('America/New_York');
}

// Check for CLI request from production server
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : NULL;
$hostname = isset($_SERVER['HOSTNAME']) ? $_SERVER['HOSTNAME'] : NULL;

if (
	(!is_null($hostname) && substr($hostname, 0, 3) == 'ip-') ||
	(!is_null($host) && strpos($host, '.local') === FALSE)
) {
	define('ENVIRONMENT', 'production'); // Default EC2 hostnames start with "ip-"
} else {
	define('ENVIRONMENT', 'development');
}

if (ENVIRONMENT == 'production') {
	// Consumers
	// Valid values: twitter, facebook, google, datasift, gnip
	define('CONSUMERS', 'twitter,facebook,google,gnip');

	// Geocoding
	define('GEOCODING_SERVICE', 'GEOCODIO'); // Can be GEOCODIO or GOOGLE
	define('GEOCODIO_API_KEY', '');

	// Gnip
	define('GNIP_PUBLISHERS', 'automattic,disqus');
	define('GNIP_ACCOUNT', ''); // https://api.gnip.com/accounts/XXX/
	define('GNIP_USERNAME', '');
	define('GNIP_PASSWORD', '');

	// DataSift
	define('DATASIFT_USERNAME', '');
	define('DATASIFT_API_KEY', '');

	// Google API
	define('GOOGLE_API_KEY', '');

	// Twitter API
	define('TWITTER_CONSUMER_KEY', '');
	define('TWITTER_CONSUMER_SECRET', '');
	define('TWITTER_ACCESSTOKEN', '');
	define('TWITTER_ACCESSTOKEN_SECRET', '');

	// MySQL server
	define('MYSQL_HOST', 'localhost');
	define('MYSQL_USERNAME', 'electiondesk');
	define('MYSQL_DATABASE', 'electiondesk');
	define('MYSQL_PASSWORD', ')');

	// MongoDB server
	define('MONGODB_HOST', 'localhost');
	define('MONGODB_USERNAME', 'electiondesk');
	define('MONGODB_DATABASE', 'electiondesk');
	define('MONGODB_PASSWORD', '');

	// ReCAPTCHA
	define('RECAPTCHA_PUBLIC', '');
	define('RECAPTCHA_PRIVATE', '');

	// WebSocket
	define('WEBSOCKET_SERVER', 'electiondesk.us');
	define('WEBSOCKET_SOURCE_PORT', 4244);
	define('WEBSOCKET_DEST_PORT', 4242);
} else {
	// Consumers
	// Valid values: twitter, facebook, google, datasift, gnip
	define('CONSUMERS', 'twitter,facebook,google');

	// Geocoding
	define('GEOCODING_SERVICE', 'GEOCODIO'); // Can be GEOCODIO or GOOGLE
	define('GEOCODIO_API_KEY', '');

	// Gnip
	define('GNIP_PUBLISHERS', 'automattic,disqus');
	define('GNIP_ACCOUNT', ''); // https://api.gnip.com/accounts/XXX/
	define('GNIP_USERNAME', '');
	define('GNIP_PASSWORD', '');

	// DataSift
	define('DATASIFT_USERNAME', '');
	define('DATASIFT_API_KEY', '');

	// Google API
	define('GOOGLE_API_KEY', '');

	// Twitter API
	define('TWITTER_CONSUMER_KEY', '');
	define('TWITTER_CONSUMER_SECRET', '');
	define('TWITTER_ACCESSTOKEN', '');
	define('TWITTER_ACCESSTOKEN_SECRET', '');

	// MySQL server
	define('MYSQL_HOST', 'localhost');
	define('MYSQL_USERNAME', 'electiondesk');
	define('MYSQL_DATABASE', 'electiondesk');
	define('MYSQL_PASSWORD', ')');

	// MongoDB server
	define('MONGODB_HOST', 'localhost');
	define('MONGODB_USERNAME', 'electiondesk');
	define('MONGODB_DATABASE', 'electiondesk');
	define('MONGODB_PASSWORD', '');

	// ReCAPTCHA
	define('RECAPTCHA_PUBLIC', '');
	define('RECAPTCHA_PRIVATE', '');

	// WebSocket
	define('WEBSOCKET_SERVER', 'electiondesk.local');
	define('WEBSOCKET_SOURCE_PORT', 4244);
	define('WEBSOCKET_DEST_PORT', 4242);
}