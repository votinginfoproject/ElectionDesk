<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Checkins extends CI_Controller {

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
		$this->stencil->title('Check-Ins');
	}
	
	public function index()
	{
		$this->stencil->paint('checkins_view');
	}

}

/* End of file checkins.php */
/* Location: ./application/controllers/checkins.php */
