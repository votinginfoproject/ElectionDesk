<?php
namespace Consumer\IndividualConsumer;

use Consumer\Log;
use Consumer\Model\Filter;

class TwitterConsumer extends IndividualConsumer
{
	private $maxPages = 20;

	public function consume($filter) {
		parent::consume($filter);

		$twitter = new \Endroid\Twitter\Twitter(
			TWITTER_CONSUMER_KEY,
			TWITTER_CONSUMER_SECRET,
			TWITTER_ACCESSTOKEN,
			TWITTER_ACCESSTOKEN_SECRET
		);

		$requestsPerFilter = 0;
		$requestsCount = 0;

		$parameters = array(
			'q' => str_replace(PHP_EOL, ' ', $filter->query),
			'result_type' => 'recent',
			'count' => 100
		);

		do {
			try {
				$response = $twitter->query('search/tweets', 'GET', 'json', $parameters);
			} catch (Exception $e) {
				Log::error('Request failed: ' . $e->getMessage());
				break;
			}

			$requestsCount++;

			if ($requestsPerFilter <= 0) {
				$limit = $response->getHeader('x-rate-limit-limit');
				$intervalMinutes = 4; // We perform query every 4 minutes
				$requestsPerRun = ($limit / 15) * $intervalMinutes;
				$activeFilters = Filter::where('active', 1)->count();
				$requestsPerFilter = floor($requestsPerRun / $activeFilters);

				// Internal max so the requests doesn't take to long time to run
				if ($requestsPerFilter > 2) {
					$requestsPerFilter = 2;
				}
			}

			$response = json_decode($response->getContent());

			foreach ($response->statuses as $status)
			{
				$interaction = array(
		            'interaction' => array(
		                'schema' => array('version' => 3),
		                'author' => array(
		                    'username' => $status->user->screen_name,
		                    'name' => $status->user->name,
		                    'id' => $status->user->id_str,
		                    'avatar' => $status->user->profile_image_url_https,
		                    'link' => 'http://twitter.com/' . $status->user->screen_name
		                ),
		                'type' => 'twitter',
		                'created_at' => new \MongoDate(time() + rand(0, 60*4)), // Necessary when data is not live
		                'content' => $status->text,
		                'id' => $status->id_str,
		                'link' => 'http://twitter.com/' . $status->user->screen_name . '/status/' . $status->id_str
		            ),
		            'twitter' => $status,
		            'internal' => array(
		                'filter_id' => (int)$filter->id
		            )
		        );

	            // If we have a tweet location
	            if (!is_null($status->geo)) {        
	                $location = $this->reverse_geocode(
	                	$status->geo->coordinates[0],
	                	$status->geo->coordinates[1]
	                );

	                $interaction['internal']['location'] = array(
	                    'source' => 'tweet',
	                    'coords' => array(
	                        $status->geo->coordinates[0],
	                        $status->geo->coordinates[1]
	                    ),
	                    'state' => $location['state'],
	                    'county' => $location['county'],
	                    'country' => $location['country'],
	                );

	            // Else get lat/lon from users bio location if available
	            } elseif (!is_null($status->user->location)) {           
	                $location = $this->geocode($status->user->location);

	                if (!is_null($location)) {
	                    $interaction['internal']['location'] = array(
	                        'source' => 'bio',
	                        'coords' => array(
	                            (float)$location['lon'],
	                            (float)$location['lat']
	                        ),
	                        'state' => $location['state'],
	                        'county' => $location['county'],
	                        'country' => $location['country'],
	                    );
	                }
	            }

		        \Consumer\Interaction::insert($interaction);
			}
		} while ($requestsCount < $requestsPerFilter);
	}	
}