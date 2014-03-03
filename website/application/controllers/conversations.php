<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Conversations extends CI_Controller {
	
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
		$this->stencil->title('Conversations');
	}
	
	public function data()
	{
		$this->output->set_header('Content-type: application/json');

		$this->load->model('read_messages_model');
		$this->load->model('message_replies_model');
		$this->load->helper('relative_time_helper');

		// Initialize database
		try {
		    $m = new \Mongo('mongodb://' . MONGODB_USERNAME . ':' . MONGODB_PASSWORD . '@' . MONGODB_HOST . '/' . MONGODB_DATABASE);
			$db = $m->selectDB(MONGODB_DATABASE);
		} catch (MongoConnectionException $e) {
		    echo json_encode(array('error' => 'Database connection failed, please try again later'));
			exit;
		}

		$user_id = $this->tank_auth->get_user_id();

        if (!$this->twitter->is_logged_in()) {
            echo json_encode(array('error' => 'You are not connected with Twitter'));
            return;
        }

		$conversations_data = array();

		// Fetch messages that the user sent
		$replies = $this->message_replies_model->get_by_user_id($user_id);
		foreach ($replies as $reply) {
			// Query database
			$message = $db->interactions->findOne(array('_id' => new MongoId($reply->reply_to)));

			// Skip invalid messages
			if (!$message) {
				continue;
			}
			// Tweet by a Twitter user
			$time = $message['interaction']['created_at']->sec;
			$conversations_data[$message['interaction']['author']['username']]['list'][] = array(
				'id' => $message['_id'],
				'message' => $message['interaction']['content'],
				'author' => '@'. $message['interaction']['author']['username'],
				'picture' => $message['interaction']['author']['avatar'],
				'time' => $time,
				'reltime' => relative_time($time)
			);

			// Tweet by this user account
			$time = strtotime($reply->reply_time);
			$conversations_data[$message['interaction']['author']['username']]['list'][] = array(
				'message' => $reply->message,
				'author' => 'Me',
				'picture' => site_url('assets/img/user.png'),
				'time' => $time,
				'reltime' => relative_time($time)
			);
		}

		// Fetch messages that the user received since last time we received messages
		$twitter_username = $this->twitter->get_username();
		$params = array();
		$latest_message = $this->read_messages_model->get_latest_message($user_id);
		if ($latest_message) {
			$params['since_id'] = $latest_message->message_id;
		}

        $mentions = $this->twitter->fetch_mentions($params);
        if (array_key_exists('errors', $mentions)) {
        	echo json_encode(array('error' => 'Twitter rate limit exceeded. Please try again in a few minutes.'));
        	return;
        }

        foreach ($mentions as $mention) {
        	$sender = $mention['user']['screen_name'];
        	if (!array_key_exists($sender, $conversations_data)) { // Only include users we already have replied to
        		continue;
        	}

        	// Save message in the database for tracking read status
        	// (index will prevent creation of already existing messages)
        	$read_id = $this->read_messages_model->save(array(
        		'user_id' => $user_id,
        		'message_id' => $mention['id_str']
        	));

        	// @ (AT) tweets to this user account
        	$sender = $mention['user']['screen_name'];
        	$time = strtotime($mention['created_at'])->sec;
        	$conversations_data[$sender]['list'][] = array(
        		'twitter_message_id' => $mention['id_str'],
				'message' => $mention['text'],
				'author' => '@' . $mention['user']['screen_name'],
				'picture' => $mention['user']['profile_image_url'],
				'time' => $time,
				'reltime' => relative_time($time),
				'is_read' => $this->read_messages_model->is_message_read($user_id, $mention['id_str'])
			);
        }

        // Sort messages in each conversation by time
		foreach ($conversations_data as $user => &$conversation) {
			$conversation['user'] = $user;

			usort($conversation['list'], function ($a, $b) {
				return strcmp($a['time'], $b['time']);
			});
		}

		// Sort conversations by time
		usort($conversations_data, function ($a, $b) {
			return strcmp($b['list'][0]['time'], $a['list'][0]['time']);
		});

		// Output data
		echo json_encode($conversations_data);
	}

	public function read_messages()
	{
		$this->output->set_header('Content-type: application/json');

		$this->load->model('read_messages_model');

		if (!$this->twitter->is_logged_in()) {
            echo json_encode(array('error' => 'You are not connected with Twitter'));
            return;
        }

        if (!$this->input->get('ids')) {
            echo json_encode(array('error' => 'No message id\'s supplied'));
            return;
        }

		$user_id = $this->tank_auth->get_user_id();

		$messages = explode(',', $this->input->get('ids'));

		$changedCount = 0;
		foreach ($messages as $message_id) {
			$changedCount += $this->read_messages_model->set_message_read($user_id, $message_id);
		}

		echo json_encode(array(
			'status' => 'OK',
			'changed' => $changedCount
		));
	}

	public function index()
	{
		// Make sure we are authenticated with Twitter
		if (!$this->twitter->is_logged_in()) {
            $this->twitter->login();
            return;
        }

        $this->load->model('user_accounts_model');
        $data['accounts'] = $this->user_accounts_model->get_by_user_id($this->tank_auth->get_user_id(), 'TWITTER');

		// Output view
		$data['body_id'] = 'conversations';

		//$data['body_id'] = 'conversations-single';
		$this->stencil->js(array('scripts', 'conversations'));
		$this->stencil->paint('conversations_view', $data); // All conversations
	}
}

/* End of file conversations.php */
/* Location: ./application/controllers/conversations.php */
