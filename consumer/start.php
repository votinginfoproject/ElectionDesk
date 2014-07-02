<?php
require('vendor/autoload.php');

use Consumer\Model\Filter;
use Consumer\Log;
use Illuminate\Database\Capsule\Manager;

// Connect to MySQL database 
$capsule = new Manager; 
 
$capsule->addConnection(array(
    'driver'    => 'mysql',
    'host'      => MYSQL_HOST,
    'database'  => MYSQL_DATABASE,
    'username'  => MYSQL_USERNAME,
    'password'  => MYSQL_PASSWORD,
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => ''
));
 
$capsule->bootEloquent();

// Build array of valid consumers
if (USE_DATASIFT) {
    $consumers = array(
        new Consumer\DatasiftConsumer()
    );

    // Get all active filters
    $filters = Filter::where('active', 1)->where('is_running', 0)->get();

    foreach ($filters as $filter) {
        $filter->is_running = true;
        $filter->save();

        Log::info('Consuming "'. $filter->title .'": ' . $filter->query);

        foreach ($consumers as $consumer) {
            $consumer->consume($filter); // Run the consume procedure
        }
        
        $filter->is_running = false;
        $filter->save();
    }

} else {
    $consumers = array(
        new Consumer\IndividualConsumer\GoogleConsumer(),
        new Consumer\IndividualConsumer\FacebookConsumer(),
        new Consumer\IndividualConsumer\TwitterConsumer()
    );

    // Get all active filters
    $filters = Filter::where('active', 1)->get();

    foreach ($filters as $filter) {
        
        Log::info('Consuming "'. $filter->title .'": ' . $filter->query);

        foreach ($consumers as $consumer) {
            $consumer->consume($filter); // Run the consume procedure
        }
    }
}