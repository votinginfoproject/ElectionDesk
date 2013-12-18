<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Post extends CI_Controller {

	public function __construct()
    {
        parent::__construct();

		$this->stencil->layout('plain_layout');
		$this->stencil->slice('head');
		$this->stencil->css('plain');
		
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
	
	public function index() {
		$this->twitter();
	}
	
	public function twitter() {
		$this->stencil->title('Post to Twitter');
		$this->stencil->js(array('post'));

        $this->load->model('user_accounts_model');
        $data['accounts'] = $this->user_accounts_model->get_by_user_id($this->tank_auth->get_user_id(), 'TWITTER');
		
		$this->stencil->paint('post_twitter_view', $data);
	}
	
	function facebook() {
		$this->stencil->title('Post to Your Facebook Pages');

        $this->load->model('user_accounts_model');
        $data['accounts'] = $this->user_accounts_model->get_by_user_id($this->tank_auth->get_user_id(), 'FACEBOOK');
		
		$this->form_validation->set_rules('pages', 'Pages', 'required');
		$this->form_validation->set_rules('message', 'Message', 'required|trim|strip_tags|xss_clean|max_length[2000]');
		
		if ($this->form_validation->run() == FALSE) {
			$data['can_post'] = TRUE;
	
			//check to see if logged in
			$account = null;
			$accounts = $this->user_accounts_model->get_by_user_id($this->tank_auth->get_user_id(), 'FACEBOOK', NULL, true);
			if ($accounts && is_array($accounts) && count($accounts) > 0) {
				$account = $accounts[0];
			}

			if (is_null($account)) {
				$data['can_post'] = FALSE;
				$data['fail_reason'] = 'Your Facebook account is not yet connected. To connect, please <a href="'.site_url('settings').'" target="_parent">click here</a>.'; 
				$this->stencil->paint('post_facebook_view', $data);
				return;
			}
			
			//check to see if extended permissions were revoked
			$permissions = file_get_contents('https://graph.facebook.com/'.$account->account_identifier.'/permissions?access_token='.$account->access_token);
			$permissions = json_decode($permissions);
			if (!isset($permissions->data[0]->publish_stream) || !isset($permissions->data[0]->manage_pages) || $permissions->data[0]->publish_stream != 1 || $permissions->data[0]->manage_pages != 1) {
				$data['can_post'] = FALSE;
				$data['fail_reason'] = 'Your Facebook is connected, but you don\'t have the extended privileges to post! You must <a href="https://www.facebook.com/settings?tab=applications" target="_parent">disconnect this app</a> from Facebook and then reconnect with Facebook and accept all permissions if you would like to use this feature.';
				$this->stencil->paint('post_facebook_view', $data);
				return;
			}
			
			//get pages
			$ch = curl_init();  
			curl_setopt($ch, CURLOPT_URL, 'https://graph.facebook.com/'.$account->account_identifier.'/accounts?access_token='.$account->access_token);  
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  
			$output = curl_exec($ch);  
			curl_close($ch);  
			$result = json_decode($output);
			
			$pages = array();
			$dropdown = array();
			foreach ($result->data as $page) {
				if ($page->category != 'Application') {
					$pages[$page->id] = array(
									'name' => $page->name,
									'access_token' => $page->access_token
									);
					$dropdown[$page->id] = $page->name;
				}
			}
			
			$this->session->set_userdata('pages', $pages);
			$data['pages'] = $dropdown;
			
			$this->stencil->paint('post_facebook_view', $data);
		} else {
			$this->load->model('user_profiles_model');
			$this->user_profiles_model->count_facebook_post($this->tank_auth->get_user_id());
		
			$page_id = $this->input->post('pages');
			$message = $this->input->post('message');
			
			$pages = $this->session->userdata('pages');
			
			$access_token = $pages[$page_id]['access_token'];
			
			
			$attachment = array(
				'access_token' => $access_token,
				'message'=> $message
			);

			try {
				$this->facebook->api('/'.$page_id.'/feed', 'POST', $attachment);
				
				$this->session->set_flashdata('message', '<div class="success-message flash-message">Your Facebook message was successfully posted to '.$pages[$page_id]['name'].'!</div>');
				redirect('post/facebook', 'location');
				
			} catch (Exception $e) {
				$this->session->set_flashdata('message', '<div class="error-message flash-message">Sorry there was an error: '.$e->getMessage().'</div>');
				redirect('post/facebook', 'location');
			}
		}	
	}
}