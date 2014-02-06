<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Areas extends CI_Controller {
  
	function __construct()
	{
		parent::__construct();
		if (!$this->tank_auth->is_logged_in())
        {
            redirect('/auth/login');
            exit;
        }

        $this->stencil->slice('head');

        $this->load->model('user_polygons_model');
	}
  
	function index()
	{
		$data['body_id'] = 'areas';
		$data['polygons'] = $this->user_polygons_model->get_by_user_id($this->tank_auth->get_user_id());
		
		$this->stencil->layout('default_layout');
		$this->stencil->title('Areas');
		$this->stencil->paint('areas_view', $data);
	}

	function upload()
	{
		require_once APPPATH.'third_party/ShapeFile.php';
		require_once APPPATH.'third_party/Simplify.php';

		$options = array('noparts' => false);

		try {
			$shp = new ShapeFile($_FILES['shp_file']['tmp_name'], null, $options); 

			$polygons = array();

			while ($record = $shp->getNext()) {
				$shpData = $record->getShpData();

				foreach ($shpData['parts'] as $part) {
					$polygons[] = Simplify::line($part['points'], count($part['points']) / 1000000);
				}
			}
		} catch (Exception $e) {
			$this->session->set_flashdata('error', $e->getMessage());
		}

		$this->user_polygons_model->save(array(
			'user_id' => $this->tank_auth->get_user_id(),
			'name' => $_FILES['shp_file']['name'],
			'points' => json_encode($polygons)
		));

		redirect('/areas');
	}

	function draw()
	{
		$points = json_decode($this->input->post('points'));
		$polygons = array(array());

		foreach ($points as $point) {
			$polygons[0][] = array('x' => $point->e, 'y' => $point->d);
		}

		$this->user_polygons_model->save(array(
			'user_id' => $this->tank_auth->get_user_id(),
			'name' => $this->input->post('name'),
			'points' => json_encode($polygons)
		));

		redirect('/areas');
	}

	function delete()
	{
		$this->user_polygons_model->delete_if_user_id(
			$this->input->get('id'),
			$this->tank_auth->get_user_id()
		);

		redirect('/areas');
	}
}
/* End of file areas.php */
/* Location: ./application/controllers/areas.php */
