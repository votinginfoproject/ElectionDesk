<?php namespace Consumer\IndividualConsumer;

use Consumer\Log;

class GoogleConsumer extends IndividualConsumer {

	private $maxPages = 10;

	public function consume($filter) {
		parent::consume($filter);

	    $query = $filter->query;

	    $url = 'https://www.googleapis.com/plus/v1/activities?query='. urlencode($query) .'&key='. urlencode(GOOGLE_API_KEY) .'&orderBy=recent&maxResults=20';

	    $page_token = null;
	    for ($pageNo = 0; $pageNo < $this->maxPages; $pageNo++)
	    {
	        // Set current url
	        $current_url = $url;
	        if (!is_null($page_token)) {
	            $current_url .= '&pageToken=' . urlencode($page_token);
	        }

	        // Fetch data
	        $data = json_decode(file_get_contents($current_url));

	        foreach ($data->items as $item)
	        {
	            $interaction = array(
	                'interaction' => array(
	                    'schema' => array('version' => 3),
	                    'author' => array(
	                        'username' => $item->actor->displayName,
	                        'name' => $item->actor->displayName,
	                        'id' => $item->actor->id,
	                        'avatar' => $item->actor->image->url,
	                        'link' => $item->actor->url,
	                    ),
	                    'type' => 'googleplus',
	                    'created_at' => new \MongoDate(time() + rand(0, 60*4)), // Necessary when data is not live
	                    'content' => $item->object->content,
	                    'id' => $item->id,
	                    'link' => $item->url
	                ),
	                'googleplus' => $item->object,
	                'internal' => array(
	                    'filter_id' => (int)$filter->id
	                )
	            );

	            \Consumer\Interaction::insert($interaction);
	        }


	        if (isset($data->nextPageToken)) {
	            $page_token = $data->nextPageToken;
	        } else {
	            break;
	        }
	    }	
	}	
}