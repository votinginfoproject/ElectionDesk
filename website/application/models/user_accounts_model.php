<?php
class User_accounts_model extends CI_Model {
	private $table_name = 'user_accounts';

	function User_accounts_model() {
		parent::__construct();
	}

	function count_all() {
		return $this->db->count_all($this->table_name);
	}

	function get_paged_list($limit = 10, $offset = 0) {
		$this->db->order_by('id','asc');
		return $this->db->get($this->table_name, $limit, $offset)->result();
	}

	function get_by_user_id($user_id, $type = NULL, $account_identifier = NULL, $primary_only = false) {
		$this->db->order_by('id', 'desc');
		$this->db->where('user_id', $user_id);
		
		if (!is_null($type)) {
			$this->db->where('type', $type);
		}

		if (!is_null($account_identifier)) {
			$this->db->where('account_identifier', $account_identifier);
		}
		
		if ($primary_only) {
			$this->db->where('is_primary', 1);
		}
		
		return $this->db->get($this->table_name)->result();
	}

	function get_by_id_for_user($id, $user_id) {
		$this->db->where('id', $id);
		$this->db->where('user_id', $user_id);
		
		return $this->db->get($this->table_name)->row();
	}

	function save($data) {
		$this->db->insert($this->table_name, $data);
		return $this->db->insert_id();
	}

	function update($id, $data) {
		$this->db->where('id', $id);
		$this->db->update($this->table_name, $data);
	}
	
	function update_by_user_id($user_id, $data, $type = NULL) {
		$this->db->where('user_id', $user_id);

		if (!is_null($type)) {
			$this->db->where('type', $type);
		}

		$this->db->update($this->table_name, $data);
	}

	function delete($id) {
		$this->db->where('id', $id);
		$this->db->delete($this->table_name);
	}

	function delete_by_user_id($user_id, $type, $account_identifier) {
		$this->db->where('user_id', $user_id);
		$this->db->where('type', $type);
		$this->db->where('account_identifier', $account_identifier);
		$this->db->delete($this->table_name);
	}

	function delete_primary($user_id, $type) {
		$this->db->where('user_id', $user_id);
		$this->db->where('type', $type);
		$this->db->where('is_primary', 1);
		$this->db->delete($this->table_name);
	}
	
}