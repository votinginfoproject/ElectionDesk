<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Voters extends CI_Controller {
	
	function __construct()
	{
		parent::__construct();

		if (!$this->tank_auth->is_logged_in())
        {
            redirect('/auth/login');
            exit;
        }
        elseif (!$this->tank_auth->account_is_prepared())
        {
            redirect('/settings');
            exit;
        }
        
		$this->stencil->layout('default_layout');
		$this->stencil->slice('head');
		$this->stencil->title('Voters');
	}

	public function index()
	{
	
		$this->output->cache(60 * 30);
	
		$data['body_id'] = 'voters';
		$this->stencil->js('https://www.google.com/jsapi');
		$this->stencil->js('voters');
		$this->stencil->js('wordcloud');

		try {
			$m = new \Mongo('mongodb://' . MONGODB_USERNAME . ':' . MONGODB_PASSWORD . '@' . MONGODB_HOST . '/' . MONGODB_DATABASE);
			$db = $m->selectDB(MONGODB_DATABASE);
		} catch (MongoConnectionException $e) {
			echo json_encode(array('error' => 'Database connection failed, please try again later'));
			exit;
		}

		//states
		$states = array();
		foreach ($this->config->item('states') as $key => $value) {
			$states[$value] = $db->interactions->find(array('internal.location.state' => $key))->count();
		}
		$data['states'] = $states;
		
		//Sentiment
		$sad_face = $db->interactions->find(array('salience.content.sentiment' => array('$lt' => 0)))->count();
		$happy_face = $db->interactions->find(array('salience.content.sentiment' => array('$gt' => 0)))->count();
		$total_face = $sad_face + $happy_face;
		if ($total_face > 0) {
			$data['sad_face'] = round(($sad_face / $total_face) * 100);
			$data['happy_face'] = round(($happy_face / $total_face) * 100);
		} else {
			$data['sad_face'] = 0;
			$data['happy_face'] = 0;
		}
		
		//gender
		$male = $db->interactions->find(array('demographic.gender' => 'male'))->count();
		$female = $db->interactions->find(array('demographic.gender' => 'female'))->count();
		$total_gender = $male + $female;
		if ($total_gender > 0) {
			$data['female'] = round(($female / $total_gender) * 100);
			$data['male'] = round(($male / $total_gender) * 100);
		} else {
			$data['female'] = 0;
			$data['male'] = 0;
		}
		
		//klout
		$keys = array();
		$initial = array("count" => 0, "total" => 0);
		$reduce = "function(doc, out) { out.count++; out.total += doc.klout.score }";
		$condition = array("klout.score" => array('$exists' => true));
		$finalize = "function(out){ out.avg = out.total / out.count }";
		$klout = $db->interactions->group($keys, $initial, $reduce, array('condition' => $condition, 'finalize' => $finalize));
		$data['klout'] = round($klout['retval'][0]['avg']);
		
		
		//tweet texts
		$cursor = $db->interactions->find(array('interaction.type' => 'twitter'))->limit(100);
		
		$tweets = array();
		foreach ($cursor as $tweet) {
			$tweets[] = $tweet['interaction']['content'];
		}
			
		$tweets = implode(",", $tweets);
		
		$words = array();
		preg_match_all('/\w+/', $tweets, $matches);
			
		foreach($matches[0] as $w){
			if (strlen($w) >= 4 && $w != 'this' && $w != 'http' && $w != 'have' && $w != 'that' && $w != 'from' && $w != 'they' && $w != 'just' && $w != 'what') {
				$w = strtolower($w);
				if(!array_key_exists($w, $words)) {
					$words[$w] = 0;
				}
				$words[$w]++;
			}
		}
		arsort($words);
			
		$data['words'] = $words;
					
		
		
		$this->stencil->paint('voters_view', $data);
	}
}

/* End of file voters.php */
/* Location: ./application/controllers/voters.php */
