<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Wait extends CI_Controller {
  
	function __construct()
	{
		parent::__construct();
		if (!$this->tank_auth->is_logged_in())
        {
            redirect('/auth/login');
            exit;
        }
		$this->stencil->layout('plain_layout');
		$this->stencil->slice('head');
	}

	function index()
	{
	
		$this->stencil->js('wait');
	
		$this->load->model('user_profiles_model');
		$user = $this->user_profiles_model->get_by_user_id($this->tank_auth->get_user_id());
		$api_key = $this->config->item('wait_time_api_key');
		
		$url = 'http://wtc.votinginfoproject.org/api/polllocations?api_key='.$api_key.'&latitude='.$user->user_lat.'&longitude='.$user->user_lon.'&include_times=true&radius=50';

		
		$output = file_get_contents($url);
		$data['wait_times'] = json_decode($output);
		$data['user_location'] = $user->user_location;
	
		$this->stencil->title('Wait Time Calculator');
		
		$this->stencil->paint('wait_view', $data);
		
	}
 
}

/* End of file wait.php */
/* Location: ./application/controllers/wait.php */
