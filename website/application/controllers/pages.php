<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Pages extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		$this->stencil->layout('static_layout');
		$this->stencil->slice('head');
	}

  	function index()
 	{
		switch ($this->uri->segment(1)) 
		{
			case 'glossary' :
				$this->stencil->title('Glossary');
				$this->stencil->paint('glossary_view');
				break;

			case 'help' :
				$this->_help();
				break;
				
			case 'about' :
				$this->stencil->title('About');
				$this->stencil->paint('about_view');
				break;

			case 'terms-of-use' :
				$this->stencil->title('Terms of Use');
				$this->stencil->paint('terms_of_use_view');
				break;

			case 'privacy-policy' :
				$this->stencil->title('Privacy Policy');
				$this->stencil->paint('privacy_policy_view');
				break;

			default:
				$this->output->set_status_header('404');
				$this->stencil->title('404');
				$this->stencil->paint('404_view');
				break;
		}
	}
	
	function _help()
	{
		$this->stencil->title('Help');

		require(APPPATH . '/libraries/recaptchalib.php');

		if ($_SERVER['REQUEST_METHOD'] != 'POST') {
			$this->stencil->paint('help_view');
			return;
		}

		$resp = recaptcha_check_answer (RECAPTCHA_PRIVATE,
                            $_SERVER['REMOTE_ADDR'],
                            $this->input->post('recaptcha_challenge_field'),
                            $this->input->post('recaptcha_response_field'));

		if (!$resp->is_valid) {
			$this->session->set_flashdata('message', '<div class="error-message flash-message">Sorry, the letters in the picture doesn\'t match. Please try again.</div>');
			redirect('help', 'location');
		} else {	
			$this->form_validation->set_rules('first_name', 'First Name', 'trim|strip_tags|xss_clean|required|max_length[255]');
			$this->form_validation->set_rules('last_name', 'Last Name', 'trim|strip_tags|xss_clean|required|max_length[255]');
			$this->form_validation->set_rules('email', 'Email', 'trim|strip_tags|xss_clean|required|valid_email|max_length[255]');
			$this->form_validation->set_rules('priority', 'Priority', 'trim|strip_tags|xss_clean');
			$this->form_validation->set_rules('message', 'Message', 'trim|strip_tags|xss_clean|max_length[2000]');
			
			if ($this->form_validation->run() == FALSE)
			{
				$this->stencil->paint('help_view');
			}
			else
			{
				$this->load->library('email');

				$data['first_name'] = $this->input->post('first_name');
				$data['last_name'] = $this->input->post('last_name');
				$data['email'] = $this->input->post('email');
				$data['priority'] = $this->input->post('priority');
				$data['message'] = $this->input->post('message');

				$this->load->model('tickets_model');
				$this->tickets_model->save($data);
				
				$config['mailtype'] = 'html';
				$config['protocol'] = 'sendmail';
				$config['mailpath'] = '/usr/sbin/sendmail';
				
				//to admin
				$this->email->initialize($config);
				$this->email->from('no-reply@electiondesk.us', 'Help | ElectionDesk');
				$this->email->to($this->config->item('admin_email')); 
				$this->email->subject('Message from Election Desk');
				
				$data['content'] = $this->load->view('email/help_email', $data, TRUE);
				
				$this->email->message($this->load->view('email/default', $data, TRUE));
				$this->email->send();
				$this->email->clear();
				
				//to user
				$this->email->initialize($config);
				$this->email->from('info@electiondesk.us', 'Help | ElectionDesk');
				$this->email->to($data['email']); 
				$this->email->subject('Thank you for submitting your ticket to ElectionDesk!');
				$data['content'] = $this->load->view('email/help_response', $data, TRUE);
				$this->email->message($this->load->view('email/default', $data, TRUE));
				$this->email->send();
				$this->email->clear();
				
				$this->session->set_flashdata('message', '<div class="success-message flash-message">Thank you for submitting your ticket. Our support team is handling tickets in the order they are received and will get back to you as soon as possible.</div>');
				
				redirect('help', 'location');
			}
		}
	}
}

/* End of file pages.php */
/* Location: ./application/controllers/pages.php */