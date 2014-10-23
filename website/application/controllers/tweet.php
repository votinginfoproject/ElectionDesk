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

        if ($this->input->post('account_id')) {
            $this->select_primary($this->input->post('account_id'));
            $this->twitter->refreshTokens();
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

    private function select_primary($accountId) {
        $this->load->model('user_accounts_model');
        $user_id = $this->tank_auth->get_user_id();

        $account = $this->user_accounts_model->get_by_id_for_user($accountId, $user_id);

        if ($account) {
            $this->user_accounts_model->update_by_user_id($user_id, array('is_primary' => 0), $account->type);
            $this->user_accounts_model->update($account->id, array('is_primary' => 1));
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

        try {
            if (!$this->twitter->follow($this->input->post('username'))) {
                echo json_encode(array('error' => 'You are not connected with Twitter'));
            } else {
                echo json_encode(array('status' => 'OK'));
            }
        } catch (Exception $e) {
           echo json_encode(array('error' => $e->getMessage())); 
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

        try {
            if (!$this->twitter->retweet($this->input->post('message_id'))) {
                echo json_encode(array('error' => 'You are not connected with Twitter'));
            } else {
                echo json_encode(array('status' => 'OK'));
            }
        } catch (Exception $e) {
           echo json_encode(array('error' => $e->getMessage())); 
        }
    }
}