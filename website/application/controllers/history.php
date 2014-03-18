<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class History extends CI_Controller {
	
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
		$this->stencil->title('History');
	}
	
	public function data()
	{
		$this->output->set_header('Content-type: application/json');

		$this->load->model('read_messages_model');
		$this->load->model('message_replies_model');
		$this->load->helper('relative_time_helper');
	}

	public function index()
	{
        $this->stencil->title('My Desk');
        $this->stencil->js(array('scripts', 'history', '../jquery-simple-datetimepicker/jquery.simple-dtpicker.js'));
        $this->stencil->css(array('../jquery-simple-datetimepicker/jquery.simple-dtpicker.css'));

        $data['body_id'] = 'history';

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

        // Output view
        $data['states'] = $this->config->item('states');
        $this->stencil->paint('history_view', $data);
	}
}

/* End of file history.php */
/* Location: ./application/controllers/history.php */
