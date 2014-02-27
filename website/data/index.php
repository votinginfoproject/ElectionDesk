<?php
// Change directory
chdir(dirname(__FILE__));

require(__DIR__ . '/../vendor/autoload.php');
require('endpoints/EndpointBase.php');

// Set default timezone
if (function_exists('date_default_timezone_set')) {
     date_default_timezone_set('America/New_York');
}

// Parse endpoint
list(,,$endpoint) = explode('/', $_SERVER['REQUEST_URI']);
$spl = explode('?', $endpoint); // Strip query parameters
$parameters = '';
$endpoint = $spl[0];
if (count($spl) > 1) {
	$parameters = $spl[1];
}
parse_str($parameters, $_GET);
$endpoint = preg_replace("/[^A-Za-z0-9 ]/", '', $endpoint); // Strip non-alphanumeric characters

$endpointClass = ucfirst(strtolower($endpoint));

if (file_exists('endpoints/' . $endpointClass . '.php'))
{
	require('endpoints/' . $endpointClass . '.php');
	$endpointObj = new $endpointClass();
	$endpointObj->execute();
}
else
{
	header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
	echo '<h1>404</h1><p>Page not found</p>';
}