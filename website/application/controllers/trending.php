<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Trending extends CI_Controller {

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

        // Load Twitter library
        $this->load->library('twitter');

        $this->stencil->layout('default_layout');
        $this->stencil->slice('head');
        $this->stencil->slice('modal_reply');
    }

    public function index()
    {
        $this->stencil->title('My Desk');
        $this->stencil->js(array('scripts', 'stream'));
		
        $this->stencil->meta(array(
            'description' => 'The Voting Information Project (VIP) is an innovative and proven service that uses the latest technology to provide voters with the information they need to cast a ballot—when they need it and where they are most likely to look for it.'
        ));

        $data['body_id'] = 'trending-topics';

        // Load filters/topics
        $this->load->model('filters_model');
        $data['filters'] = $this->filters_model->get_paged_list();

        // Load user profile
        $this->load->model('user_profiles_model');
        $user_id = $this->tank_auth->get_user_id();
        $this->user_profiles_model->update_by_user_id($user_id, array('is_active' => 1)); // Make sure user is set to be active
        $data['profile'] = $this->user_profiles_model->get_by_user_id($user_id);

        // Load accounts
        $this->load->model('user_accounts_model');
        $data['accounts'] = $this->user_accounts_model->get_by_user_id($this->tank_auth->get_user_id(), 'TWITTER');

        $this->load->model('user_polygons_model');
        $polygons = $this->user_polygons_model->get_by_user_id($this->tank_auth->get_user_id());
        $polygonsArr = array();
        foreach ($polygons as $polygonItem) {
            $polygonsArr = array_merge($polygonsArr, json_decode($polygonItem->points));
        }
        $data['polygons_object'] = json_encode($polygonsArr);

        $this->load->model('message_bookmarks_model');
        $bookmarks = $this->message_bookmarks_model->get_user_bookmarks($this->tank_auth->get_user_id());
        
        $bookmarkIds = array();
        foreach ($bookmarks as $bookmark) {
            $bookmarkIds[] = $bookmark->message_id;
        }
        $data['bookmark_ids'] = json_encode(array_combine($bookmarkIds, $bookmarkIds));

        // Output view
        $data['states'] = $this->config->item('states');
        $this->stencil->layout('stream_layout');
        $this->stencil->paint('trending_topics_view', $data);
    }

	public function bookmarks() {
		$this->stencil->title('Bookmarks');
        $this->stencil->js('scripts');
        $this->stencil->js('stream');
		$this->stencil->js('bookmark');
		
		
		$this->load->model('message_bookmarks_model');

		$bookmarks = $this->message_bookmarks_model->get_user_bookmarks($this->tank_auth->get_user_id());
		
		$messages = array();
		
		foreach ($bookmarks as $bookmark) {
			$result = file_get_contents($this->config->item('stream_server') . '/message?id='.$bookmark->message_id);
            $result = json_decode($result);

            if (!isset($result->error)) {
                $messages[] = $result;
            }
		}
		
		
		$data['bookmarks'] = $messages;

        // Load accounts
        $this->load->model('user_accounts_model');
        $data['accounts'] = $this->user_accounts_model->get_by_user_id($this->tank_auth->get_user_id(), 'TWITTER');
		
		$this->stencil->paint('bookmarks_view', $data);
	}
	
    public function bookmark()
    {
    	$this->output->set_header('Content-type: application/json');

    	if (!$this->input->post('message')) {
    		echo json_encode(array('error' => 'Invalid message id'));
    		return;
    	}

    	if (!$this->tank_auth->is_logged_in()) {
    		echo json_encode(array('error' => 'User not authenticated'));
    		return;
    	}

    	$this->load->model('message_bookmarks_model');

    	$this->message_bookmarks_model->save(array(
    		'user_id' => $this->tank_auth->get_user_id(),
    		'message_id' => $this->input->post('message')
    	));

    	echo json_encode(array('status' => 'OK'));
    }
	
	public function unbookmark()
    {
    	$this->output->set_header('Content-type: application/json');

    	if (!$this->input->post('message')) {
    		echo json_encode(array('error' => 'Invalid message id'));
    		return;
    	}

    	if (!$this->tank_auth->is_logged_in()) {
    		echo json_encode(array('error' => 'User not authenticated'));
    		return;
    	}

    	$this->load->model('message_bookmarks_model');

    	$this->message_bookmarks_model->delete_bookmark($this->tank_auth->get_user_id(), $this->input->post('message'));

    	echo json_encode(array('status' => 'OK'));
    }

    function lock()
    {
        $this->output->set_header('Content-type: application/json');

        $message_id = $this->input->post('message_id');

        if (!$message_id) {
            echo json_encode(array('error' => 'Invalid message id'));
            return;
        }

        if (!$this->tank_auth->is_logged_in()) {
            echo json_encode(array('error' => 'User not authenticated'));
            return;
        }

        $this->load->model('reply_locks_model');
        
        $reply_lock = $this->reply_locks_model->get_message_id($message_id);

        // If there is a lock
        if ($reply_lock)
        {
            // Calculate time since the lock was created
            $difference = time() - strtotime($reply_lock->access_time);

            // If user is not the same as the current user and less than 5 minutes (300 seconds) has passed
            if ($reply_lock->user_id != $this->tank_auth->get_user_id() && $difference < 300)
            {
                echo json_encode(array('error' => 'Warning: Another user is already replying to this message'));
                return;
            }
        }

        // Delete previous locks if any
        $this->reply_locks_model->delete_by_message_id($message_id);

        // Create a new lock
        $this->reply_locks_model->save(array(
            'user_id' => $this->tank_auth->get_user_id(),
            'message_id' => $message_id
        ));

        // Lock was succesfully applied
        echo json_encode(array('status' => 'OK'));
    }
}

/* End of file trending.php */
/* Location: ./application/controllers/trending.php */
