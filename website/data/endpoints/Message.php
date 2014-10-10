<?php
class Message extends EndpointBase
{
	public function execute()
	{
		parent::execute();

		// Make sure all required parameters are used
		$required_parameters = array('id');
		foreach ($required_parameters as $parameter)
		{
			if (!array_key_exists($parameter, $_GET))
			{
				echo json_encode(array('error' => 'Missing parameter: \'' . $parameter . '\''));
				exit;
			}
		}

		// Initialize database
		try {
			$m = new \MongoClient('mongodb://' . MONGODB_USERNAME . ':' . MONGODB_PASSWORD . '@' . MONGODB_HOST . '/' . MONGODB_DATABASE);
			$db = $m->selectDB(MONGODB_DATABASE);
		} catch (MongoConnectionException $e) {
		    echo json_encode(array('error' => 'Database connection failed, please try again later'));
			exit;
		}

		// Query database
		$result = $db->interactions->findOne(array('_id' => new MongoId($_GET['id'])));

		// Output JSON data
		if (is_null($result)) {
		    echo json_encode(array('error' => 'Message doesn\'t exist'));
		} else {		
			$this->convertDates($result);
			echo json_encode($result);
		}
	}
}