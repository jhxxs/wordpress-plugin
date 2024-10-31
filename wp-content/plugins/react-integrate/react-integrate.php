<?php
/*
 * Plugin Name: React Integrate
 * Description: React based WordPress plugin.
 * Version: 0.1.0
 * Author: Kyle Von
 * Author URI: https://jhxxs.github.io
 */


require_once plugin_dir_path(__FILE__) . '/public/helpers.php';

if (!defined('ABSPATH')) {
    exit;
}



define('PLUGIN_CONST_URL', plugin_dir_url(__FILE__));
define('PLUGIN_CONST_DIR', plugin_dir_path(__FILE__));

define('PLUGIN_CONST_VERSION', '1.0.5');

// This will automatically update, when you run dev or production
define('PLUGIN_CONST_DEVELOPMENT', 'yes');


class PromoWare
{
    public $rootMenuSlug = 'promoware';
    public function __construct()
    {
        $this->renderMenu();
        $this->disableUpdateNag();
    }



    public function renderMenu()
    {


        wp_enqueue_script('promoware-js', plugin_dir_url(__FILE__) . 'public/index.js', [], null, true);
        wp_enqueue_style('promoware-style', plugin_dir_url(__FILE__) . 'public/index.css', [], null);



        add_action('admin_menu', function () {
            if (!current_user_can('manage_options')) {
                return;
            }
            global $submenu;
            add_menu_page(
                'React Integrate',
                'React Integrate',
                'manage_options',
                $this->rootMenuSlug,
                [$this, 'renderAdminPage'],
                'dashicons-editor-code',
                40
            );

            add_submenu_page(
                $this->rootMenuSlug,
                'Index',
                'Index',
                'manage_options',
                $this->rootMenuSlug,
                [$this, 'renderAdminPage']
            );

            add_submenu_page(
                $this->rootMenuSlug,
                'FabricJS',
                'FabricJS',
                'manage_options',
                "$this->rootMenuSlug#/fabricjs",
                [$this, 'renderAdminPage']
            );


        });
    }

    /**
     * Main admin Page where the Vue app will be rendered
     * For translatable string localization you may use like this
     * 
     *      add_filter('pluginlowercase/frontend_translatable_strings', function($translatable){
     *          $translatable['world'] = __('World', 'pluginslug');
     *          return $translatable;
     *      }, 10, 1);
     */
    public function renderAdminPage()
    { ?>
        <div id="root" class="promoware-container"></div>
        <?= vite('main.tsx') ?>
    <?php }

    /**
     * Disable update nag for the dashboard area
     */
    public function disableUpdateNag()
    {
        add_action('admin_init', function () {
            $disablePages = [
                'pluginslug.php',
            ];

            if (isset($_GET['page']) && in_array($_GET['page'], $disablePages)) {
                remove_all_actions('admin_notices');
            }
        }, 20);
    }



}

new PromoWare();
