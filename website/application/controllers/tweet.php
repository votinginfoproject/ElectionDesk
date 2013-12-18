<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Tweet extends CI_Controller {
    public function __construct()
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
        
        /* Load the Twitter library */
        $this->load->library('twitter');
        
        /* Set it to show errors */
        //$this->twitter->debug();
    }

    public function index()
    {

    }

    public function login() {
        /* Are we logged in */
        if($this->twitter->is_logged_in()) {
            /* Yes - back to homepage */
            redirect(site_url('/'));
        } else {
            /* No - login */
            $this->twitter->login();
        }
    }

    public function logout()
    {    
        $this->twitter->logout();   
        redirect('/settings');
    }
    
    public function post()
    {
		$this->load->model('user_profiles_model');
		$this->user_profiles_model->count_tweet($this->tank_auth->get_user_id());
	
	
        $this->output->set_header('Content-type: application/json');

        if (!$this->tank_auth->is_logged_in()) {
            echo json_encode(array('error' => 'User not authenticated'));
            return;
        }

        if (!$this->input->post('message')) {
            echo json_encode(array('error' => 'No message supplied'));
            return;
        }
		
        // if (!$this->input->post('message_id')) {
            // echo json_encode(array('error' => 'No message_id supplied'));
            // return;
        // }

        // Add tweet id if available
        if ($this->input->post('tweet_id')) {
            $parameters = array(
                'in_reply_to_status_id' => $this->input->post('tweet_id')
            );
        } else {
            $parameters = array();
        }

        if (!$this->twitter->post_tweet($this->input->post('message'), $parameters)) {
            echo json_encode(array('error' => 'Please try again later'));
        } else {
            if ($this->input->post('message_id')) {
                $this->load->model('message_replies_model');
                $this->message_replies_model->save(array(
                    'reply_to' => $this->input->post('message_id'),
                    'social_type' => 'twitter',
                    'user_id' => $this->tank_auth->get_user_id(),
                    'message' => $this->input->post('message'),
                ));
            }

            echo json_encode(array('status' => 'OK'));
        }
    }

    public function follow()
    {
        $this->output->set_header('Content-type: application/json');

        if (!$this->tank_auth->is_logged_in()) {
            echo json_encode(array('error' => 'User not authenticated'));
            return;
        }

        if (!$this->input->post('username')) {
            echo json_encode(array('error' => 'No username supplied'));
            return;
        }

        if (!$this->twitter->follow($this->input->post('username'))) {
            echo json_encode(array('error' => 'You are not connected with Twitter'));
        } else {
            echo json_encode(array('status' => 'OK'));
        }
    }

    public function retweet()
    {
		$this->load->model('user_profiles_model');
		$this->user_profiles_model->count_tweet($this->tank_auth->get_user_id());
	
        $this->output->set_header('Content-type: application/json');

        if (!$this->tank_auth->is_logged_in()) {
            echo json_encode(array('error' => 'User not authenticated'));
            return;
        }

        if (!$this->input->post('message_id')) {
            echo json_encode(array('error' => 'No message_id supplied'));
            return;
        }

        if (!$this->twitter->retweet($this->input->post('message_id'))) {
            echo json_encode(array('error' => 'You are not connected with Twitter'));
        } else {
            echo json_encode(array('status' => 'OK'));
        }
    }
}