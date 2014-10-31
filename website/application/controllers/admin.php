<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Admin extends CI_Controller {

	function __construct()
    {
        parent::__construct();
        if (!$this->tank_auth->is_logged_in() || $this->session->userdata('is_admin') != 1)
        {
            redirect('/auth/login');
            exit;
        }
		

		
		
		$this->stencil->layout('admin_layout');
		$this->stencil->slice('head');
        $this->stencil->slice('modal_post');
		
    }
	
	function index() {
		$this->users();
	}
	
	function users() {
		$data['body_id'] = 'users';
		$this->stencil->title('User Management');
		
		$this->load->model('tank_auth/users');
		
		$data['users'] = $this->users->get_unbanned_users();
		
		
		
		$this->stencil->paint('admin/user_management_view', $data);
	}

	function pending() {
		$data['body_id'] = 'users';
		$this->stencil->title('User Management');
		
		$this->load->model('tank_auth/users');
		
		$data['users'] = $this->users->get_banned_users();
		
		
		
		$this->stencil->paint('admin/user_management_view', $data);
	}

	function consumingstats() {
		try {
			$m = new \MongoClient('mongodb://' . MONGODB_USERNAME . ':' . MONGODB_PASSWORD . '@' . MONGODB_HOST . '/' . MONGODB_DATABASE);
			$db = $m->selectDB(MONGODB_DATABASE);
		} catch (MongoConnectionException $e) {
			echo json_encode(array('error' => 'Database connection failed, please try again later'));
			exit;
		}

		// Number of interactions for each interaction type
		$results = $db->interactions->aggregate([
			[ '$group' => [ '_id' => '$interaction.type', 'total' => [ '$sum' => 1 ] ] ],
			[ '$sort' => [ 'total' => -1 ] ]
		]);
		$interactionTypesCount = [];
		foreach ($results['result'] as $result) {
			if (!empty($result['_id'])) {
				$interactionTypesCount[$result['_id']] = $result['total'];
			}
		}

		// Number of interactions for each interaction type, over time
		$interactionTypesTime = [];
		foreach ($interactionTypesCount as $interactionType => $count) {
			$results = $db->interactions->aggregate([
				[ '$match' => [ 'interaction.type' => $interactionType, 'interaction.created_at' => ['$gte' => new MongoDate(strtotime(date('Y') . '-01-01')) ] ] ],
				[ '$group' => [ '_id' => ['$dayOfYear' => '$interaction.created_at' ], 'total' => [ '$sum' => 1 ] ] ],
				[ '$sort' => [ '_id' => 1 ] ]
			]);

			foreach ($results['result'] as $result) {
				if (!empty($result['_id'])) {
					$date = DateTime::createFromFormat('z Y', strval($result['_id']) . ' ' . date('Y'));

					// Prepopulate values
					if (!isset($interactionTypesTime[$date->format('Y-m-d')])) {
						$interactionTypesTime[$date->format('Y-m-d')] = [
							'date' => $date->format('Y-m-d')
						];

						foreach ($interactionTypesCount as $key => $value) {
							$interactionTypesTime[$date->format('Y-m-d')][$key] = 0;
						}
					}

					$interactionTypesTime[$date->format('Y-m-d')][$interactionType] = $result['total'];
				}
			}
		}
		ksort($interactionTypesTime);

		echo json_encode([
			'interaction_types' => array_keys($interactionTypesCount),
			'counts' => $interactionTypesCount,
			'timeseries' => array_values($interactionTypesTime)
		]);
	}
	
	function data() {
		$this->load->model('auth/users');
		$this->load->model('user_profiles_model');
		$this->load->model('user_accounts_model');
		
		$user_id = $this->tank_auth->get_user_id();
		
		//get login counts
		$result = $this->users->get_login_counts();
		$data['login_counts'] = [];
		$total_logins = 0;
		foreach ($result as $login) {
			$total_logins = $total_logins + $login->login_number;
			$data['login_counts'][$login->email] = $login->login_number;
		}
		arsort($data['login_counts']);
		$data['total_logins'] = $total_logins;
		
		
		//total tweets
		$data['total_tweets'] = $this->user_profiles_model->count_tweets();
		
		//total facebook posts
		$data['total_facebook_posts'] = $this->user_profiles_model->count_facebook_posts();
		
		//count social connections
		$data['facebook_connects'] = $this->user_accounts_model->count_connections('FACEBOOK');
		$data['google_connects'] = $this->user_accounts_model->count_connections('GOOGLE');
		$data['twitter_connects'] = $this->user_accounts_model->count_connections('TWITTER');
		
		//count all user
		$data['total_users'] = $this->users->count_all();
		$data['approved_users'] = $this->users->count_unbanned();
		
		$data['body_id'] = 'data';
		$this->stencil->title('Data Analysis');
		$this->stencil->paint('admin/data_analysis_view', $data);
	}
	
	function enable($user_id = NULL) {
		if (is_null($user_id)) {
			redirect('admin', 'location');
		}
		
		$this->load->model('tank_auth/users');
	
		$this->users->unban_user($user_id);
	
		$user = $this->users->get_user_by_id($user_id, 1);
		
		
			
		$this->load->library('email');
		
		$config['mailtype'] = 'html';
		$config['protocol'] = 'sendmail';
		$config['mailpath'] = '/usr/sbin/sendmail';
		
		//to admin
		$this->email->initialize($config);
		$this->email->from('info@electiondesk.us', 'Approved Account | ElectionDesk');
		$this->email->to($user->email);
		$this->email->subject('Your ElectionDesk registration has been approved!');
		
		$data['content'] = $this->load->view('email/approved_email', $data, TRUE);
		
		$this->email->message($this->load->view('email/default', $data, TRUE));
		$this->email->send();
		$this->email->print_debugger();
		$this->email->clear();
		
	
		redirect('admin/users', 'location');
	
	}

	function disable($user_id = NULL) {
		if (is_null($user_id)) {
			redirect('admin', 'location');
		}
		
		$this->load->model('tank_auth/users');
	
		$this->users->ban_user($user_id, 'Admin action');		
	
		redirect('admin/users', 'location');
	
	}

	function delete($user_id = NULL) {
		if (is_null($user_id)) {
			redirect('admin', 'location');
		}
		
		$this->load->model('tank_auth/users');
	
		$this->users->delete_user($user_id);
			
		redirect('admin/users', 'location');
	
	}
}

/* End of file admin.php */
/* Location: ./application/controllers/admin.php */
