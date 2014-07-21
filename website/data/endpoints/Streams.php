<?php

use Engage\QueryTextParser\Parser;
use Engage\QueryTextParser\Exceptions\ParserException;
use Engage\QueryTextParser\Data\Group;
use Engage\QueryTextParser\Data\GroupComparison;
use Engage\QueryTextParser\Data\Partial;

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

		// Filters
		$filters = explode(',', $_GET['filters']);
		foreach ($filters as &$filter) {
			$filter = (int)$filter;
		}
		$query = array(
			'internal.filter_id' => array('$in' => $filters)
		);

		// Time
		$after = $_GET['after'];
		if (!is_numeric($after)) {
			$after = strtotime($after);
		}
		$after = new MongoDate($after);

		if (isset($_GET['before'])) {
			$before = $_GET['before'];
			if (!is_numeric($before)) {
				$before = strtotime($before);
			}
			$before = new MongoDate($before);
			$query['interaction.created_at'] = array('$gt' => $after, '$lt' => $before);
		} else {
			$query['interaction.created_at'] = array('$gt' => $after);
		}

		// Apply subfilter
		if (array_key_exists('subfilter', $_GET) && !empty($_GET['subfilter'])) {
			$parser = new Parser();
			$result = $parser->parse($_GET['subfilter']);
			$subfilterQuery = $this->buildSubfilterQuery($result);

			$query['$and'] = array($subfilterQuery, array('$or' => $sources_exist));
		} else {
			$query['$or'] = $sources_exist;
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
				'query' => $query,
				'limit' => 500 // Hard limit to 500 entries in one query
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

			$results = $db->interactions->find($query)->sort(array('interaction.created_at' => 1))->limit(500); // Hard limit to 500 entries at the time
		}

		// Output JSON data
		echo '[';
		$i = 0;

		// Results returned via command is an array instead of a MongoCursor object and thus needs to use count(...) instead
		if (is_object($results)) {
			$results = iterator_to_array($results);

		}
		$resultsCount = count($results);
		foreach ($results as $result) {
			$this->convertDates($result);
			echo json_encode($result);

			// The last item should not be appended by a comma
			if ($i < $resultsCount - 1) {
				echo ', ';
			}

			$i++;
		}
		echo ']';
	}

	/**
	 * Recursively build a mongodb-compatible
	 * filter query based on a query text
	 * parsed search query
	 * @param  Engage\QueryTextParser\Data\Group or Engage\QueryTextParser\Data\Partial $result Group or Partial object
	 * @return array Array for mongodb query
	 */
	private function buildSubfilterQuery($result) {
		if ($result instanceof Group) {
			$key = '$' . strtolower($result->type);

			$return = array($key => array());

			foreach ($result->children as $child) {
				$return[$key][] = $this->buildSubfilterQuery($child);
			}

			return $return;
		} elseif ($result instanceof Partial) {
			return array('interaction.content' => new MongoRegex("/". $result->text ."/i"));
		}
	}
}