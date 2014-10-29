<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Settings extends CI_Controller {
  
	function __construct()
	{
		parent::__construct();
		if (!$this->tank_auth->is_logged_in())
        {
            redirect('/auth/login');
            exit;
        }

        $this->stencil->slice('head');
        $this->stencil->slice('modal_post');
	}
  
	function index()
	{
		// Refresh page after authenticating with Twitter
		if (isset($_GET['oauth_token'])) {
			redirect('settings', 'location');
			return;
		}

		$data['body_id'] = 'settings';

		$this->load->model('user_profiles_model');
		$this->load->model('user_accounts_model');

		$user_id = $this->tank_auth->get_user_id();

		// Save location?
		$lat = $this->input->post('lat');
		$long = $this->input->post('long');
		$address = $this->input->post('address');
		$state = $this->input->post('state');
		$county = $this->input->post('county');
		if ($lat && $long && is_numeric($lat) && is_numeric($long))
		{	
			$location = array(
				'user_lat' => $lat,
				'user_lon' => $long,
				'user_location' => $address,
				'user_state' => $state ? $state : null,
				'user_county' => $county ? $county : null
			);
			
			$this->user_profiles_model->update_by_user_id($user_id, $location);
			$data['success_message'] = 'You have successfully updated your location!';
		}

		// Load user profile
		$data['user'] = $this->user_profiles_model->get_by_user_id($user_id);

		$data['accounts'] = $this->user_accounts_model->get_by_user_id($user_id);
		$didUpdate = false;
		foreach ($data['accounts'] as $account) {
			if (is_null($account->name)) {
				if ($account->type == 'TWITTER') {
					$this->twitter->set_db_accesstoken(unserialize($account->access_token));
					$didUpdate = true;
				}
			}
		}

		if ($didUpdate) {
			$data['accounts'] = $this->user_accounts_model->get_by_user_id($user_id);
		}

		// Determine social networks that the user is connected to
		// Twitter
		if (!$this->twitter->is_logged_in()) {
			$this->user_accounts_model->delete_primary($user_id, 'TWITTER');
		}
		
		// Google
		$google_authed = $this->google->is_auth();
		try {
			$profile = $this->google->get_user_profile();
		} catch (Exception $e) {
			if (strpos($e->getMessage(), '(401) Invalid Credentials') !== FALSE || strpos($e->getMessage(), 'Error refreshing the OAuth2 token') !== FALSE) {
				$google_authed = FALSE;
			}
		}

		if (!$google_authed) {
			$this->user_accounts_model->delete_primary($user_id, 'GOOGLE');
		}
		
		// Facebook
		try {
			$facebookUser = $this->facebook->getUser();
			if ($facebookUser) {
				$facebookProfile = $this->facebook->api('/me');
		        $update = array(
		            'access_token' => $this->facebook->getAccessToken(),
		            'account_identifier' => $facebookProfile['id'],
		            'name' => $facebookProfile['name']
		        );

		        $accounts = $this->user_accounts_model->get_by_user_id($user_id, 'FACEBOOK', NULL, true);
		        $account = (count($accounts) > 0) ? $accounts[0] : NULL;

		        if (!$account || (!empty($account->account_identifier) && !empty($update['account_identifier']) && $account->account_identifier != $update['account_identifier'])) {
		        	// Make sure that no other accounts are set to primary
		        	$this->user_accounts_model->update_by_user_id($user_id, array('is_primary' => 0), 'FACEBOOK');

		        	// Make sure that we don't have any duplicates
		            $this->user_accounts_model->delete_by_user_id($user_id, 'FACEBOOK', $update['account_identifier']);

		            $update['user_id'] = $user_id;
		            $update['is_primary'] = 1;
		            $update['type'] = 'FACEBOOK';
		            $this->user_accounts_model->save($update);
		        } else {
		        	$this->user_accounts_model->update($account->id, $update);
		        	
		            // Check if we have any duplicate accounts
		            if (isset($update['account_identifier']) && !empty($update['account_identifier'])) {
		                $accounts = $this->user_accounts_model->get_by_user_id($user_id, 'FACEBOOK', $update['account_identifier']);
		                unset($accounts[0]); // Keep the newest
		                
		                foreach ($accounts as $account) {
		                    $this->user_accounts_model->delete($account->id);
		                }
		            }
		        }
			}
		} catch (Exception $e) {
			$this->user_accounts_model->delete_primary($user_id, 'FACEBOOK');
		}

		// If account is already fully-setup, show the general settings view
		if ($this->tank_auth->account_is_prepared() && $data['user']->is_active == 1)
		{
			$this->stencil->layout('default_layout');
			$this->stencil->title('Settings');
			$this->stencil->paint('settings_view', $data);
		}
		else
		{
			$this->stencil->layout('default_layout');
			$this->stencil->title('Getting started');

			// Did the user fill out their location yet?
			if (is_null($data['user']->user_lat) || is_null($data['user']->user_lon) || is_null($data['user']->user_location))
			{
				$this->stencil->paint('settings_location_view', $data); // Show location settings view
			}
			else
			{
				$this->stencil->paint('settings_connect_view', $data); // Show connect view
			}
		}
	}	
	
	function twitter() {
		$this->twitter->login();
    }
	
	function google($callback = NULL) {	
		if (!is_null($callback) && $callback == 'callback') {
			if(isset($_GET['code'])){ 
				$this->google->request_access_token(); 
				redirect('settings', 'location');
			}else{
				redirect('settings', 'location');
			}
		} else {
			if($this->google->is_auth() === TRUE){
				redirect('settings', 'location');
			}else{
				$this->google->auth();
			}
		}
	}

	function google_logout() {	
		$this->google->logout();
		redirect('/settings');
	}
	
	function facebook_logout() {
		$fb_key = 'fbsr_'.$this->config->item('appId');
		setcookie($fb_key, '', time()-3600);
		$this->facebook->destroySession();
		
		redirect('settings', 'location');
	}

	function select_primary() {
		$this->load->model('user_accounts_model');
		$user_id = $this->tank_auth->get_user_id();

		$account = $this->user_accounts_model->get_by_id_for_user($this->input->get('id'), $user_id);

		if ($account) {
			$this->user_accounts_model->update_by_user_id($user_id, array('is_primary' => 0), $account->type);
			$this->user_accounts_model->update($account->id, array('is_primary' => 1));
		}

		redirect($_SERVER['HTTP_REFERER']);
	}

	function delete_account() {
		$this->load->model('user_accounts_model');
		$account = $this->user_accounts_model->get_by_id_for_user($this->input->get('id'), $this->tank_auth->get_user_id());

		if ($account) {
			$this->user_accounts_model->delete($account->id); // Delete the account

			// Select another account to be primary
			$accounts = $this->user_accounts_model->get_by_user_id($user_id, $account->type);
            if (count($accounts) > 0) {
            	$this->user_accounts_model->update($accounts[0]->id, array('is_primary' => 1));
            }
		}

		redirect($_SERVER['HTTP_REFERER']);
	}
}
/* End of file settings.php */
/* Location: ./application/controllers/settings.php */
