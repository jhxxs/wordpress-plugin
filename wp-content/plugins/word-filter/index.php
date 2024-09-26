<?
/**
 * Plugin Name: Word Filter
 * Description: Filter words.
 * Version: 1.0
 * Author: Kyle
 * Author URI: https://jhxxs.github.io
 */

if (!defined('ABSPATH'))
    exit;

class WordFilterPlugin
{

    private $optionsPageID = 'wordfilter-options';
    private $replacementTextSectionID = 'replacement-text-section';
    private $replacementFieldGroup = 'replacementFields';
    private $replacementTextOptionName = 'replacement_text';

    function __construct()
    {
        add_action('admin_menu', [$this, 'adminMenuPage']);
        add_action('admin_init', [$this, 'settings']);

        if (get_option('plugin_words_to_filter')) {
            add_filter('the_title', [$this, 'filterWords']);
            add_filter('the_content', [$this, 'filterWords']);
        }
    }

    function filterWords(string $content)
    {
        $badwords = explode(
            ',',
            get_option('plugin_words_to_filter')
        );
        $badwordsTrimmed = array_map('trim', $badwords);
        return str_ireplace($badwordsTrimmed, esc_html(get_option($this->replacementTextOptionName)), $content);
    }

    function settings()
    {
        add_settings_section(
            $this->replacementTextSectionID,
            null,
            [],
            $this->optionsPageID
        );

        add_settings_field(
            'replacement-text',
            'Filterd Text',
            [$this, 'replacementFieldHTML'],
            $this->optionsPageID,
            $this->replacementTextSectionID
        );
        register_setting(
            $this->replacementFieldGroup,
            $this->replacementTextOptionName
        );

    }

    function replacementFieldHTML()
    { ?>
        <input type="text" name="<?= $this->replacementTextOptionName ?>"
            value=<?= esc_attr(get_option($this->replacementTextOptionName, '***'), ) ?>>
        <p class="description">
            Leave blank to simply remove the filtered words.
        </p>
    <?php }

    function adminMenuPage()
    {
        $mainPage = add_menu_page(
            'Word Filter',
            'Word Filter',
            'manage_options',
            'wordfilter',
            [$this, 'wordFilterPage'],
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTUgMmExIDEgMCAwIDAtMSAxdjJoMTZWM2ExIDEgMCAwIDAtMS0xem0xNC43ODIgNUg0LjIxOGEyIDIgMCAwIDAgLjQ2NS41OThsNiA1LjI1YTIgMiAwIDAgMCAyLjYzNCAwbDYtNS4yNWMuMTk0LS4xNy4zNTEtLjM3My40NjUtLjU5OCIvPjxwYXRoIGQ9Ik0xNCAxNi43MDVWMTBoLTR2OC43MDV6Ii8+PC9nPjwvc3ZnPg==',
            50
        );
        add_action("load-{$mainPage}", [$this, 'loadMainPageStyle']);

        add_submenu_page(
            'wordfilter',
            'Word Filter',
            'Word List',
            'manage_options',
            'wordfilter',
            [$this, 'wordFilterPage'],
        );

        add_submenu_page(
            'wordfilter',
            'Word Filter Options',
            'Options',
            'manage_options',
            'wordfilter-options',
            [$this, 'optionsPage'],
        );
    }

    function loadMainPageStyle()
    {
        wp_enqueue_style(
            'wordfilter-main-style',
            plugin_dir_url(__FILE__) . 'style.css'
        );
    }

    function handleFormPost()
    {
        if (wp_verify_nonce($_POST['ourNonce'], 'saveFilterWords') and current_user_can('manage_options')) {
            update_option('plugin_words_to_filter', sanitize_text_field($_POST['plugin_words_to_filter'])); ?>
            <div class="updated">
                <p>Your filterd words were saved.</p>
            </div>
        <?php } else { ?>
            <div class="error">
                <p>Sorry, you don't have the permission to perform the action.</p>
            </div>
        <?php }

    }

    function wordFilterPage()
    { ?>
        <div class="wrap">
            <h1>Word Filter</h1>
            <?php if (isset($_POST['justsubmitted']) == 'true')
                $this->handleFormPost() ?>
                <form method="post">
                    <input type="hidden" name="justsubmitted" value="true">
                <?php wp_nonce_field('saveFilterWords', 'ourNonce') ?>
                <label for="plugin_words_to_filter">
                    <p>
                        Enter a <strong>comma-separated</strong> list of words to filter from your site's content.
                    </p>
                </label>
                <div class="word-filter__flex-container">
                    <textarea name="plugin_words_to_filter" id="plugin_words_to_filter"
                        placeholder="bad, mean, awful, horrible"><?= esc_textarea(get_option('plugin_words_to_filter')) ?></textarea>
                </div>
                <input type="submit" value="Save Changes" id="submit" name="submit" class="button button-primary">
            </form>
        </div>
    <?php }

    function optionsPage()
    { ?>
        <div class="wrap">
            <h1>Word Filter Options</h1>
            <form action="options.php" method="post">
                <?php
                settings_errors();
                settings_fields($this->replacementFieldGroup);
                do_settings_sections($this->optionsPageID);
                submit_button();
                ?>
            </form>
        </div>
    <?php }
}

$wordFilterPlugin = new WordFilterPlugin();