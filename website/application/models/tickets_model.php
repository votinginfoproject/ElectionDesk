<?php
class Tickets_model extends CI_Model {

	private $table_name = 'tickets';

	function Tickets_model() {
		parent::__construct();
	}
	
	function save($data) {
		$this->db->insert($this->table_name, $data);
		return $this->db->insert_id();
	}
	
	function count_all() {
		$this->db->select('id');
		return $this->db->get($this->table_name)->num_rows();
	}


}