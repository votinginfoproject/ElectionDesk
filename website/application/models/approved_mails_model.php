<?php
class Approved_mails_model extends CI_Model {
	private $table_name = 'approved_mails';

	function Approved_mails_model() {
		parent::__construct();
	}

	function count_all() {
		return $this->db->count_all($this->table_name);
	}

	function get_paged_list($limit = 10, $offset = 0) {
		$this->db->order_by('id','asc');
		return $this->db->get($this->table_name, $limit, $offset)->result();
	}

	function get_by_id($id) {
		$this->db->where('id', $id);
		return $this->db->get($this->table_name)->row();
	}

	function is_whitelisted($mail) {
		// Make sure e-mail address has an AT signed
		if (strpos($mail, '@') === false)
			return false;

		// Check if mail is in database
		$this->db->where('mail', $mail);
		$this->db->where('is_host', 0);
		$this->db->from($this->table_name);
		
		if ($this->db->count_all_results() > 0) {
			return true;
		}

		// Check if host is in database
		list(,$host) = explode('@', $mail);
		$this->db->where('mail', $host);
		$this->db->where('is_host', 1);
		$this->db->from($this->table_name);
		
		if ($this->db->count_all_results() > 0) {
			return true;
		}

		// E-mail address is NOT approved
		return false;
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
}