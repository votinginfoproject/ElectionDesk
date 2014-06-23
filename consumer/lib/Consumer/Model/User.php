<?php namespace Consumer\Model;

use Illuminate\Database\Eloquent\Model;

class User extends Model {
	
	public $table = 'users';
	public $timestamps = false;

	public function profile() {
		return $this->hasOne('Consumer\Model\UserProfile', 'user_id');
	}

	public function accounts() {
		return $this->hasMany('Consumer\Model\UserAccount', 'user_id');
	}
}