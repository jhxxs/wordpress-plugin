<?php
/**
 * Plugin Name: Please Pay Attention
 * Description: Please Pay Attention.
 * Version: 1.0
 * Author: Kyle
 * Author URI: https://jhxxs.github.io
 */

if (!defined('ABSPATH'))
    exit;

class PleasePayAttention
{
    function __construct()
    {
        add_action('init', [$this, 'adminAssets']);
    }

    function adminAssets()
    {
        register_block_type_from_metadata(__DIR__ . '/build');
    }


    function theHTML()
    {
        return "<h3>The fuck!</h3>";
    }

}

$pleasePayAttention = new PleasePayAttention();