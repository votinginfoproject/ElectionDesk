<?php
class Streams extends EndpointBase
{
	private $earthRadius = 3959;

	public function execute()
	{
		parent::execute();

		// Make sure all required parameters are used
		$required_parameters = array('sources', 'after', 'filters');
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
			$m = new \Mongo('mongodb://' . MONGODB_USERNAME . ':' . MONGODB_PASSWORD . '@' . MONGODB_HOST . '/' . MONGODB_DATABASE);
			$db = $m->selectDB(MONGODB_DATABASE);
		} catch (MongoConnectionException $e) {
		    echo json_encode(array('error' => 'Database connection failed, please try again later'));
			exit;
		}

		// Sources
		$sources = $_GET['sources'];
		if ($sources == 'all') {
			$sources = 'twitter,facebook,googleplus';
		}
		$sources = explode(',', $sources);
		$sources_exist = array();
		foreach ($sources as $source)
		{
			$sources_exist[] = array($source => array('$exists' => 'true'));
		}

		// Time
		$time = $_GET['after'];
		if (!is_numeric($time)) {
			$time = strtotime($time);
		}

		// Filters
		$filters = explode(',', $_GET['filters']);
		foreach ($filters as &$filter) {
			$filter = (int)$filter;
		}

		// Subfilters
		if (array_key_exists('subfilters', $_GET)) {
			$subfilters = explode(',', $_GET['subfilters']);
		} else {
			$subfilters = array();
		}

		// Fetch streams from database
		$date = new MongoDate($time);
		$query = array(
			'interaction.created_at' => array('$gt' => $date),
			'internal.filter_id' => array('$in' => $filters),
			'$or' => $sources_exist
		);

		// Apply subfilters
		if (count($subfilters) > 0) {
			$subfiltersQuery = array();
			foreach ($subfilters as $subfilter) {
				$subfiltersQuery[] = array('interaction.content' => new MongoRegex("/". $subfilter ."/i"));
			}
			$query['$and'] = $subfiltersQuery;
		}


		// Geo near
		if (array_key_exists('near', $_GET) && array_key_exists('distance', $_GET) && is_numeric($_GET['distance'])) {
			$near = explode(',', $_GET['near']);

			if (count($near) != 2) {
				echo json_encode(array('error' => '\'near\' location is invalid'));
				exit;
			}

			// Build geoNear command with the existing query
			$command = array(
				'geoNear' => 'interactions',
				'near' => array((float)$near[0], (float)$near[1]),
				'spherical' => true,
				'maxDistance' => $_GET['distance'] / $this->earthRadius,
				'query' => $query
			);

			// Run command and change output to be the same as usual MongoDB queries
			$results = $db->command($command);
			$results = $results['results'];

			foreach ($results as &$result) {
				$dis = $result['dis']; // Save distance
				$result = $result['obj']; // Set result to be the exact object
				$result['internal']['dis'] = $dis * $this->earthRadius; // Store the distance in miles inside the internal part of the output
			}
		} else {
			if (array_key_exists('near', $_GET) && array_key_exists('distance', $_GET)) {
				parse_str($_GET['distance'], $location);

				if (array_key_exists('county', $location) && array_key_exists('state', $location)) {
					$query['internal.location.county'] = $location['county'];
					$query['internal.location.state'] = $location['state'];
				} elseif (array_key_exists('state', $location)) {
					$query['internal.location.state'] = $location['state'];
				}
			}

			$results = $db->interactions->find($query);
		}

		// Output JSON data
		echo '[';
		$i = 0;

		// Results returned via command is an array instead of a MongoCursor object and thus needs to use count(...) instead
		$resultsCount = is_object($results) ? $results->count() : count($results);
		foreach ($results as $result) {
			$this->convertDates($result);
			echo json_encode($result);

			// The last item should not be appended by a comma
			if ((is_object($results) && $results->hasNext()) || $i < $resultsCount - 1) {
				echo ', ';
			}

			$i++;
		}
		echo ']';
	}
}