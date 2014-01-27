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
	}
  
	function index()
	{
		$data['body_id'] = 'areas';

		$this->input->post('lat');
		
		$this->stencil->layout('default_layout');
		$this->stencil->title('Areas');
		$this->stencil->paint('areas_view', $data);
	}

	function upload()
	{
		echo '<pre>';
		require_once APPPATH.'third_party/ShapeFile.php';

		$options = array('noparts' => false);
		$shp = new ShapeFile($_FILES['shp_file']['tmp_name'], $_FILES['dbf_file']['tmp_name'], $options); 

		//Dump the ten first records
		$i = 0;
		while ($record = $shp->getNext() and $i<10) {
			$dbf_data = $record->getDbfData();
			$shp_data = $record->getShpData();
			//Dump the information
			var_dump($dbf_data);
			var_dump($shp_data);

			var_dump($record->getError());
			$i++;
		}
		echo '</pre>';

		exit;

		redirect('/areas');

		exit;
	}
}
/* End of file areas.php */
/* Location: ./application/controllers/areas.php */
