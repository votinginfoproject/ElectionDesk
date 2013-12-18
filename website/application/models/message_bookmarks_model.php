<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Message_bookmarks_model extends CI_Model {
	private $table_name = 'message_bookmarks';

	function Message_bookmarks_model() {
		parent::__construct();
	}

	function get_user_bookmarks($user_id) {
		$this->db->where('user_id', $user_id);
		return $this->db->get($this->table_name)->result();
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

	function bookmark_exists($message_id, $user_id) {
		$this->db->where('message_id', $message_id);
		$this->db->where('user_id', $user_id);
		$this->db->from($this->table_name);

		return ($this->db->count_all_results() > 0);
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
	
	function delete_bookmark($user_id, $message_id) {
		$this->db->where('user_id', $user_id);
		$this->db->where('message_id', $message_id);
		$this->db->delete($this->table_name);
	}
}

/* End of file message_bookmarks_model.php */
/* Location: ./application/models/message_bookmarks_model.php */