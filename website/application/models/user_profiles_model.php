<?php
class User_profiles_model extends CI_Model {
	private $table_name = 'user_profiles';

	function User_profiles_model() {
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
	
	function update_by_user_id($user_id, $data) {
		$this->db->where('user_id', $user_id);
		$this->db->update($this->table_name, $data);
	}

	function delete($id) {
		$this->db->where('id', $id);
		$this->db->delete($this->table_name);
	}
	
	function count_tweet($user_id) {
		$previous = $this->db->select('tweet_count')->where('id', $user_id)->get($this->table_name)->row();
	
		if (is_null($previous->tweet_count)) {
			$count = 0 + 1;
		} else {
			$count = $previous->tweet_count + 1;
		}
	
		$this->db->set('tweet_count', $count);
		return $this->db->where('id', $user_id)->update($this->table_name);
	}
	
	function count_facebook_post($user_id) {
		$previous = $this->db->select('facebook_post_count')->where('id', $user_id)->get($this->table_name)->row();
	
		if (is_null($previous->facebook_post_count)) {
			$count = 0 + 1;
		} else {
			$count = $previous->facebook_post_count + 1;
		}
	
		$this->db->set('facebook_post_count', $count);
		return $this->db->where('id', $user_id)->update($this->table_name);
	}
	
	function count_tweets() {
		$this->db->select_sum('tweet_count');
		return $this->db->get($this->table_name)->row();
	}
	
	function count_facebook_posts() {
		$this->db->select_sum('facebook_post_count');
		return $this->db->get($this->table_name)->row();
	}
	
}