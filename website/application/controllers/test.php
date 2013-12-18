<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Test extends CI_Controller {
  
	function __construct()
	{
		parent::__construct();
		// Test if user is logged in
		if (!$this->tank_auth->is_logged_in())
        {
            redirect('/auth/login');
            exit;
        }

        // Test if user is admin
        $this->load->model('user_profiles_model');
		$user = $this->user_profiles_model->get_by_user_id($this->tank_auth->get_user_id());
        if ($user->is_admin == 0)
        {
            redirect('/');
            exit;
        }
	}

	function index()
	{
        // Start unit tests
        $this->load->library('unit_test');

        $this->_test_whitelist();

        echo $this->unit->report();
	}
  
	function _test_whitelist()
	{
		$this->load->model('approved_mails_model');
		$mails = array(
			'mathias@engagedc.com' => true,
       		'sdfdfsdf@engagedc.com' => true,
        	'bdavis@elections.il.gov' => true,
        	'elections.state.ny.us' => false,
        	'asdasdasd.asdaasd@sdfsdf.com' => false
		);

		foreach ($mails as $mail => $expected) {
			$this->unit->run($this->approved_mails_model->is_whitelisted($mail), $expected, '[WHITELIST] Testing ' . $mail);
		}
	}
}
/* End of file test.php */
/* Location: ./application/controllers/test.php */
