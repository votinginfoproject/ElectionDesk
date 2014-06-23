<?php namespace Consumer;

use Monolog\Handler\StreamHandler;
use Monolog\Logger;
use Monolog\Handler\RotatingFileHandler;

class Log {
	
	private static $monolog = NULL;

	private static $levels = array(
		'debug',
		'info',
		'notice',
		'warning',
		'error',
		'critical',
		'alert',
		'emergency',
	);

	/**
	 * Initializes the Log classes
	 * @return type
	 */
	private static function boot()
	{		
		self::$monolog = new Logger('Consumer');
		self::$monolog->pushHandler(new StreamHandler('php://stdout'));
		self::$monolog->pushHandler(new RotatingFileHandler(__DIR__ . '/../../logs/consumer.log', 7));
	}

	/**
	 * Magic method for handling static calls
	 * such as Log::error(...), Log::info(...)
	 */
	public static function __callStatic($method, $arguments)
    {
    	if (is_null(self::$monolog)) {
			self::boot();
		}

		if (in_array($method, self::$levels))
		{
			$method = 'add'.ucfirst($method);

			return call_user_func_array(array(self::$monolog, $method), $arguments);
		}

		throw new \BadMethodCallException("Method [$method] does not exist.");
    }
}