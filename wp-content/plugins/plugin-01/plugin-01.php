<?php
/**
 * Plugin Name: Plugin 01
 * Description: My very first plugin.
 * Version: 1.0
 * Author: Kyle
 * Author URI: https://jhxxs.github.io
 * Text Domain: wcpdomain
 * Domain Path: /languages
 */

class WordCountAndTimePlugin
{
    function __construct()
    {
        add_action('admin_menu', [$this, 'addAdminPage']);
        add_action('admin_init', [$this, 'registerSettings']);

        add_filter('the_content', [$this, 'ifWrap']);

        add_action('init', [$this, 'wpdocs_load_textdomain']);

    }

    function wpdocs_load_textdomain()
    {
        load_plugin_textdomain(
            'wcpdomain',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }

    function ifWrap(string $content)
    {
        if (
            (is_main_query() and is_single()) and (
                get_option('wcp_word_count', '1') or
                get_option('wcp_character_count', '1') or
                get_option('wcp_read_time', '1')
            )
        ) {
            return $this->createHTML($content);
        }

        return $content;
    }

    function createHTML(string $content)
    {
        $html = '<h3>' . esc_html(get_option('wcp_headline', 'Post Statistics')) . '</h3>';

        if (get_option('wcp_word_count', '1') or get_option('wcp_read_time', '1')) {
            $wordCount = str_word_count(strip_tags($content));
        }

        if (get_option('wcp_word_count', '1')) {
            /* translators: 统计文章字数 */
            $plural = _n_noop(
                'This post has %s word.',
                'This post has %s words.',
            );
            $locale = sprintf(esc_html(translate_nooped_plural(
                $plural,
                $wordCount,
                'wcpdomain'
            )), number_format_i18n($wordCount));

            $html .= "$locale<br>";
        }

        if (get_option('wcp_character_count', '1')) {
            $characterCount = mb_strlen(trim(strip_tags(html_entity_decode($content))), 'UTF-8');
            $plural = _n_noop(
                'This post has %s character.',
                'This post has %s characters.'
            );
            $locale = sprintf(esc_html__(translate_nooped_plural(
                $plural,
                $characterCount,
                'wcpdomain'
            )), number_format_i18n($characterCount));

            $html .= "$locale<br>";
        }

        if (get_option('wcp_read_time', '1')) {
            $minutes = $wordCount / 225;
            $plural = _n_noop(
                'This post will take about %s minute to read.',
                'This post will take about %s minutes to read.'
            );
            $locale = sprintf(translate_nooped_plural(
                $plural,
                $minutes,
                'wcpdomain'
            ), number_format_i18n($minutes, 2));

            $html .= $locale;
        }


        if (get_option('wcp_location', '0') == '0') {
            return "$html $content";
        }
        return "$content $html";
    }

    // 添加后台菜单页面
    function addAdminPage()
    {
        add_options_page(
            __('Word Count Setting', 'wcpdomain'),
            __('Word Count', 'wcpdomain'),
            'manage_options',
            'word-count-settings-page',
            [$this, 'settingsPageHTML']
        );
    }


    function settingsPageHTML()
    { ?>
        <div class="wrap">
            <h1><?= __('Word Count', 'wcpdomain') ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_errors();
                settings_fields('wordcountplugin');
                do_settings_sections('word-count-settings-page');
                submit_button();
                ?>
            </form>
        </div>
    <?php }


    // 注册设置和设置区域
    function registerSettings()
    {
        $sectionID = 'wcp_first_section';
        $pageID = 'word-count-settings-page';
        $optionGroup = 'wordcountplugin';

        // 添加设置区域
        add_settings_section(
            $sectionID,
            null,
            [],
            $pageID
        );

        // 添加设置字段
        add_settings_field(
            'wcp_location',
            __('Display Location', 'wcpdomain'),
            [$this, 'customOptionsHTML'],
            $pageID,
            $sectionID
        );
        // 注册设置选项
        register_setting(
            $optionGroup,
            'wcp_location',
            [
                'sanitize_callback' => [$this, 'sanitizeLocation'],
                'default' => 0,
            ]
        );

        add_settings_field(
            'wcp_headline',
            __('Headline Text', 'wcpdomain'),
            [$this, 'headlineHTML'],
            $pageID,
            $sectionID
        );
        register_setting(
            $optionGroup,
            'wcp_headline',
            [
                'sanitize_callback' => 'sanitize_text_field',
                'default' => 'Post Statistics',
            ]
        );

        add_settings_field(
            'wcp_word_count',
            __('Word Count', 'wcpdomain'),
            [$this, 'commonCheckboxHTML'],
            $pageID,
            $sectionID,
            [
                'name' => 'wcp_word_count',
            ]
        );
        register_setting(
            $optionGroup,
            'wcp_word_count',
            [
                'sanitize_callback' => 'sanitize_text_field',
                'default' => '1',
            ]
        );

        add_settings_field(
            'wcp_character_count',
            __('Character Count', 'wcpdomain'),
            [$this, 'commonCheckboxHTML'],
            $pageID,
            $sectionID,
            [
                'name' => 'wcp_character_count',
            ]
        );
        register_setting(
            $optionGroup,
            'wcp_character_count',
            [
                'sanitize_callback' => 'sanitize_text_field',
                'default' => '1',
            ]
        );

        add_settings_field(
            'wcp_read_time',
            __('Read Time', 'wcpdomain'),
            [$this, 'commonCheckboxHTML'],
            $pageID,
            $sectionID,
            [
                'name' => 'wcp_read_time',
            ]
        );
        register_setting(
            $optionGroup,
            'wcp_read_time',
            [
                'sanitize_callback' => 'sanitize_text_field',
                'default' => '1',
            ]
        );

    }

    function sanitizeLocation(string $input)
    {
        if ($input != '0' and $input != '1') {
            add_settings_error(
                'wcp_location',
                'wcp_location_error',
                __('Display location must be either 0 or 1.', 'wcpdomain')
            );
        }
        return $input;
    }


    function customOptionsHTML()
    { ?>
        <select name="wcp_location" id="wcp_location">
            <option value="0" <?php selected(get_option('wcp_location'), '0') ?>>
                <?= __('Beginning of post', 'wcpdomain') ?>
            </option>
            <option value="1" <?php selected(get_option('wcp_location'), '1') ?>>
                <?= __('End of post', 'wcpdomain') ?>
            </option>
        </select>
    <?php }

    function headlineHTML()
    { ?>
        <input type="text" name="wcp_headline" value="<?= esc_attr(get_option(
            'wcp_headline',
            'Post Statistics'
        )) ?>">
    <?php }

    /**
     * Summary of commonCheckboxHTML
     * @param array $arguments
     * @return void
     */
    function commonCheckboxHTML(array $arguments)
    { ?>
        <input type="checkbox" name="<?= $arguments['name'] ?>" value="<?= $arguments['value'] ?? '1' ?>" <?php checked(get_option($arguments['name']), $arguments['currentValue'] ?? '1') ?>>
    <?php }

}

$wordCountAndTimePlugin = new WordCountAndTimePlugin();
