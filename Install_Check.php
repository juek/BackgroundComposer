<?php
defined('is_running') or die('Not an entry point...');

/* 
 * Install_Check() can be used to check the destination server for required features
 *   This can be helpful for addons that require PEAR support or extra PHP Extensions
 *   Install_Check() is called from step1 of the install/upgrade process
 */

function Install_Check(){
  /* 
  if (version_compare(phpversion(), '5.3', '<=')) {
    echo '<p style="color:red">This addon cannot be installed. PHP version 5.3 or higher is required. This server is running PHP version ' . phpversion() . '.</p>';
    return false;
  }
  */
  return true;
}