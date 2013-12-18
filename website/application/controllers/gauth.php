<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Gauth extends CI_Controller{
	
	function __construct(){
		parent::__construct();
	}
	
	function index(){
		if($this->google->is_auth() === TRUE){
			redirect('gauth/callback');
		}else{
			$this->google->auth();
		}
	}
	
	function profile(){
			$profile = $this->google->get_user_profile();
			var_dump($profile);
	}
	
	function list_activity(){
		$activities = $this->google->get_list_activities();
		var_dump($activities);
	}
	
	function activity($activity_id = ''){
		$activity = $this->google->get_activity('z13fc3zgwqfbu1dj204chnfr2tmjsti5ufw');
		var_dump($activity);
	}
	
	
	function callback(){
		if(isset($_GET['code'])){ 
			$this->google->request_access_token(); 
			redirect('gauth/profile');
		}else{
			redirect('gauth/profile');
		}
	}
	
	function logout(){
		$this->session->sess_destroy();
	}
}

/*
	End of gauth.php
	Location : .application/controllers/gauth.php
*/
