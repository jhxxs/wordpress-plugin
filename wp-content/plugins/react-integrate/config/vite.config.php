<?php
$viteHost = 'http://localhost:8880';
$manifestPath = get_theme_file_path('assets/.vite/manifest.json');

add_action('wp_enqueue_scripts', 'loadScripts');

function loadScripts()
{
    global $viteHost;
    global $manifestPath;
    if (is_array(wp_remote_get($viteHost))) {
        wp_enqueue_script_module(
            '@vite/client',
            "{$viteHost}/@vite/client",
            [],
        );
        wp_enqueue_script_module(
            'main.js',
            "{$viteHost}/main.js",
            ['jquery'],
        );

    } elseif (file_exists($manifestPath)) {
        $manifest = json_decode(file_get_contents($manifestPath), true);

        wp_enqueue_script_module(
            'main-js',
            get_theme_file_uri(
                'public/dist/' . $manifest['src/main.tsx']['file']
            ),
            ['jquery'],
        );
    }
}
