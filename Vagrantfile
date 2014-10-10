# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Define VM box to use
  config.vm.box = "electiondesk"
  config.vm.box_url = "https://electiondesk.s3.amazonaws.com/electiondesk.box"
  
  # Make sure that the newest version of Chef have been installed
  config.omnibus.chef_version = "11.10.4"

  # Use hostonly network with a static IP Address
  # and enable hostmanager
  config.hostmanager.enabled = true
  config.hostmanager.manage_host = true
  config.hostmanager.include_offline = true
  config.vm.define 'electiondesk' do |node|
    node.vm.hostname = 'electiondesk.local'
    node.vm.network :private_network, ip: '172.95.122.104'
    node.hostmanager.aliases = %w(www.electiondesk.local)
  end
  config.vm.provision :hostmanager

  # Set share folder
  config.vm.synced_folder "." , "/var/www/electiondesk/"

  # Use host for DNS lookups
  config.vm.provider :virtualbox do |vb|
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
  end
end
