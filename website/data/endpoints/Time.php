<?php
class Time extends EndpointBase
{
	public function execute()
	{
		parent::execute();

		$time = time();
		$output = array(
			'current_time' => array(
				'unix' => $time,
				'iso' => date('Y-m-d H:i:s', $time)
			)
		);

		echo json_encode($output);
	}
}