<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Reply_locks_model extends CI_Model {

	private $table_name = 'reply_locks';

	function Message_bookmarks_model() {
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

	function get_message_id($message_id) {
		$this->db->where('message_id', $message_id);
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

	function delete($id) {
		$this->db->where('id', $id);
		$this->db->delete($this->table_name);
	}

	function delete_by_message_id($message_id) {
		$this->db->where('message_id', $message_id);
		$this->db->delete($this->table_name);
	}	

}

/* End of file reply_locks_model.php */
/* Location: ./application/models/reply_locks_model.php */


