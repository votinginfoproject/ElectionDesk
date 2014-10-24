<?php namespace Consumer;

use Model\Filter;
use Log;

class Application extends \Symfony\Component\Console\Application {

	public function __construct() {
        parent::__construct('ElectionDesk Consumer', '0.1');
 
        $this->addCommands(array(
            new Command\ListenCommand,
            new Command\WorkCommand
        ));

        $this->boot();
    }

    private function boot() {
		// Connect to MySQL database 
		$capsule = new \Illuminate\Database\Capsule\Manager; 
		 
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
	}

}