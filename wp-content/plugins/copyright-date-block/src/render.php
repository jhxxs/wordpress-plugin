<?php
$current_year = date("Y");
if (isset(($attributes['fallbackCurrentYear'])) && $attributes['fallbackCurrentYear'] !== $current_year) {
	$block_content = $content;
} else {
	$display_date = (!empty($attributes['startingYear']) && !empty($attributes['showStartingYear'])) ? "{$attributes['startingYear']}-{$current_year}" : $current_year;
	$block_content = '<p' . get_block_wrapper_attributes() . '>©️ ' . esc_html($display_date);
}
echo wp_kses_post($block_content);

