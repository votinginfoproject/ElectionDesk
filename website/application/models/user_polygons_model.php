<?php
class User_polygons_model extends CI_Model {
	private $table_name = 'user_polygons';

	function User_polygons_model() {
		parent::__construct();
	}

	function count_all() {
		return $this->db->count_all($this->table_name);
	}

	function get_paged_list($limit = 10, $offset = 0) {
		$this->db->order_by('id','asc');
		return $this->db->get($this->table_name, $limit, $offset)->result();
	}

	function get_by_user_id($user_id) {
		$this->db->order_by('id', 'desc');
		$this->db->where('user_id', $user_id);

		return $this->db->get($this->table_name)->result();
	}

	function save($data) {
		$this->db->insert($this->table_name, $data);
		return $this->db->insert_id();
	}

	function update($id, $data) {
		$this->db->where('id', $id);
		$this->db->update($this->table_name, $data);
	}

	function delete($id) {
		$this->db->where('id', $id);
		$this->db->delete($this->table_name);
	}

	function delete_by_user_id($user_id) {
		$this->db->where('user_id', $user_id);
		$this->db->delete($this->table_name);
	}
	
}