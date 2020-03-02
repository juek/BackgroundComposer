<?php
/**
 * PHP script for Typesetter CMS plugin Background Composer 
 * Author: J. Krausz
 * Date: 2020-03-02
 * Version : 1.0-b4
 * 
 */

defined('is_running') or die('Not an entry point...');

class BackgroundComposer {

  static function GetHead(){
    global $page;
    if( !\gp\tool::LoggedIn() || $page->pagetype != 'display' ){
      return;
    }
    \gp\tool\Plugins::css('/bootstrap_colorpicker/bootstrap-colorpicker.css', false);
    \gp\tool\Plugins::js('bootstrap_colorpicker/bootstrap-colorpicker.min.js', false);
    \gp\tool\Plugins::css('BackgroundComposer.css', false);
    \gp\tool\Plugins::js('BackgroundComposer.js', false);
  }

}
