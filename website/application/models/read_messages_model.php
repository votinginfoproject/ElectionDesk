<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Read_messages_model extends CI_Model {
	private $table_name = 'read_messages';

	function Read_messages_model() {
		parent::__construct();
	}

	function count_all() {
		return $this->db->count_all($this->table_name);
	}

	function get_paged_list($limit = 10, $offset = 0) {
		$this->db->where('active', 1);
		$this->db->order_by('id','asc');
		return $this->db->get($this->table_name, $limit, $offset)->result();
	}

	function get_by_id($id) {
		$this->db->where('id', $id);
		return $this->db->get($this->table_name)->row();
	}

	function get_by_user_id($user_id) {
		$this->db->where('user_id', $user_id);
		return $this->db->get($this->table_name)->result();
	}

	function get_unread_messages($user_id) {
		$this->db->where('user_id', $user_id);
		$this->db->where('read_time', null);
		return $this->db->get($this->table_name)->result();
	}

	function get_unread_messages_count($user_id) {
		$this->db->where('user_id', $user_id);
		$this->db->where('read_time', null);
		$this->db->from($this->table_name);

		return $this->db->count_all_results();
	}

	function get_latest_message($user_id) {
		$this->db->where('user_id', $user_id);
		$this->db->order_by('fetched_time', 'desc');
		return $this->db->get($this->table_name)->row();
	}

	function set_message_read($user_id, $message_id) {
		$this->db->where('user_id', $user_id);
		$this->db->where('message_id', $message_id);
		$this->db->where('read_time', null);

		$data = array(
			'read_time' => date('Y-m-d H:i:s')
		);

		$this->db->update($this->table_name, $data);

		return $this->db->affected_rows();
	}

	function is_message_read($user_id, $message_id) {
		$this->db->where('user_id', $user_id);
		$this->db->where('message_id', $message_id);
		$result = $this->db->get($this->table_name)->row();

		if (!$result || is_null($result->read_time)) {
			return false;
		} else {
			return true;
		}
	}

	function message_exists($user_id, $message_id) {
		$this->db->where('user_id', $user_id);
		$this->db->where('message_id', $message_id);
		$this->db->from($this->table_name);

		return ($this->db->count_all_results() > 0);
	}

	function save($data) {
		// Skip messages that already exists
		if (array_key_exists('user_id', $data) && array_key_exists('message_id', $data)) {
			if ($this->message_exists($data['user_id'], $data['message_id'])) {
				return NULL;
			}
		}

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

/* End of file filters_model.php */
/* Location: ./application/models/filters_model.php */