<?php namespace Consumer;

class Interaction {
	
	private static $db = NULL;

	private static $client = null;

    /**
     * Connect to websocket server listener
     */
    private static function ensureStreamConnected() {
        if (self::$client) {
            return;
        }
        self::$client = @stream_socket_client('tcp://' . WEBSOCKET_SERVER  . ':' . WEBSOCKET_SOURCE_PORT, $errno, $errorMessage, 5);

        if (self::$client === false) {
            self::$client = null;
        }
    }

	private static function boot()
	{
		// Initialize database
		try
		{
		    $m = new \MongoClient('mongodb://' . MONGODB_USERNAME . ':' . MONGODB_PASSWORD . '@' . MONGODB_HOST . '/' . MONGODB_DATABASE);
		    self::$db = $m->selectDB(MONGODB_DATABASE);
		}
		catch (MongoConnectionException $e)
		{
		    throw new Exception('MongoDB connection issue: ' . print_r($e, true));
		}
		
		// Posts needs to be unique per each social network
        self::$db->interactions->ensureIndex(array(
            'interaction.type' => 1,
            'interaction.id' => 1,
        ), array(
            'unique' => true,
            'dropDups' => true
        ));

        // Geospatial index on location
        self::$db->interactions->ensureIndex(array(
            'internal.location.coords' => '2d'
        ));

        // For searching for state and county
        self::$db->interactions->ensureIndex(array(
            'internal.location.state' => 1,
            'internal.location.county' => 1
        ));

        // For searching for county
        self::$db->interactions->ensureIndex(array(
            'internal.location.county' => 1
        ));
	}

	public static function insert($interaction)
	{
		if (is_null(self::$db)) {
			self::boot();
		}
		
		// Logging
		Log::debug($interaction['interaction']['type'] . ': ' . $interaction['interaction']['author']['name']);

		// Insert into database and broadcast to WebSocket server
		self::ensureStreamConnected();

		try {
			// Test
			self::$db->interactions->insert($interaction, array('w' => true));
			@fwrite(self::$client, json_encode($interaction) . "\n");
		} catch (\MongoCursorException $e) {
			if ($e->getCode() != 11000) { // "Duplicate key" errors are ignored
				Log::error($e->getMessage());
			}
		}
	}

	public static function remove($interaction_id)
	{
		if (is_null(self::$db)) {
			self::boot();
		}

		Log::info('Removing #' . $interaction_id);

        self::$db->interactions->remove(array('interaction.id' => $interaction_id), true);
	}
}