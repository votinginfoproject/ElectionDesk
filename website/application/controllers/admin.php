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
		
    }
	
	function index() {
		$this->users();
	}
	
	function users() {
		$data['body_id'] = 'users';
		$this->stencil->title('User Management');
		
		$this->load->model('tank_auth/users');
		
		$data['banned_users'] = $this->users->get_banned_users();
		
		
		
		$this->stencil->paint('admin/user_management_view', $data);
	}
	
	function data() {
		$data['twitter_stream_total'] = NULL;
		$data['facebook_stream_total'] = NULL;
		
			try {
				$m = new \Mongo('mongodb://' . MONGODB_USERNAME . ':' . MONGODB_PASSWORD . '@' . MONGODB_HOST . '/' . MONGODB_DATABASE);
				$db = $m->selectDB(MONGODB_DATABASE);
			} catch (MongoConnectionException $e) {
				echo json_encode(array('error' => 'Database connection failed, please try again later'));
				exit;
			}

			
			$data['twitter_stream_total'] = $db->interactions->find(array('interaction.type' => 'twitter'))->count();
			$data['facebook_stream_total'] = $db->interactions->find(array('interaction.type' => 'facebook'))->count();
	
	
	
	
		$this->load->model('auth/users');
		$this->load->model('user_profiles_model');
		$this->load->model('tickets_model');
		
		$user_id = $this->tank_auth->get_user_id();
		
		//get login counts
		$result = $this->users->get_login_counts();
		$data['login_counts'] = $result;
		$total_logins = 0;
		foreach ($result as $login) {
			$total_logins = $total_logins + $login->login_number;
		}
		$data['total_logins'] = $total_logins;
		
		
		//total tweets
		$data['total_tweets'] = $this->user_profiles_model->count_tweets();
		
		//total facebook posts
		$data['total_facebook_posts'] = $this->user_profiles_model->count_facebook_posts();
		
		//count social connections
		$data['facebook_connects'] = $this->user_profiles_model->count_connections('facebook_accesstoken');
		$data['google_connects'] = $this->user_profiles_model->count_connections('google_accesstoken');
		$data['twitter_connects'] = $this->user_profiles_model->count_connections('twitter_accesstoken');
		
		//count all user
		$data['total_users'] = $this->users->count_all();
		
		//total tickets submitted
		$data['tickets_total'] = $this->tickets_model->count_all();
		
		
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
}

/* End of file admin.php */
/* Location: ./application/controllers/admin.php */

