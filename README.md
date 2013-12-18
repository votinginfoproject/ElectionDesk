# ElectionDesk
[ElectionDesk](http://electiondesk.us) is a Social Media Dashboard designed to help voting officials monitor social media activity.

ElectionDesk has several built-in tools to facilitate this:

* A trending topics view that gathers filtered social media updates across several social networks
* Filtering by topics and location
* In-dashboard bookmark and reply functionality
* Conversations view to keep track of existing messages that have been sent and received
* And more

## Technical description
ElectionDesk is splitted into two parts -- the web-facing dashboard and the social media consumer running in the background.

### Dashboard
The ElectionDesk dashboard is based off of the [CodeIgniter PHP Framework](http://ellislab.com/codeigniter) it shares data with the consumer using a MySQL database for general data and MongoDB for social media interactions.

### Consumer
The consumer is a [Composer](http://getcomposer.org)-backed CLI app that is responsible for fetching social media interactions from the various social networks and storing them in MongoDB. The initial version used [DataSift](http://datasift.com) but it has since been transitioned to support interaction directly with the various API's from the social media networks.

The DataSift functionality has hover been retained, allowing switching between DataSift and Social Media API's via a config file constant.

## Requirements
ElectionDesk requires the following software to be installed and configured first

* PHP 5.4+
	* [Composer](http://getcomposer.org)
* MySQL
* MongoDB
* Memcached

## Installation
Clone the latest version of ElectionDesk

	$ git clone git@github.com:votinginfoproject/ElectionDesk.git
	$ cd ElectionDesk

Create the config file

	$ cp config.sample.php config.php
	$ vim config.php

Import MySQL database structure

	$ mysql -u YOUR_MYSQL_USERNAME -p YOUR_MYSQL_DATABASE < database_structure.sql

Install composer depencies

	$ cd consumer
	$ composer install

---

*The next steps depends on whether you're using the Social Media APIs or DataSift as a data provider*

### If using individual social network APIs (recommended)
Set up a cron job to run the consumer periodically

	$ crontab -e

Example cronjob that runs every 4 minutes

	*/4 * * * * cd /var/www/electiondesk/consumer && php start.php > /var/log/consumer.log

### If using DataSift
Run `start.php` in the `consumer` fodler

	$ cd consumer
	$ php start.php

It is recommended that you use a process monitoring service such as [supervisord](http://supervisord.org) to restart the script in case of a failure.