import { TextControl } from '@wordpress/components'
import { registerBlockType } from '@wordpress/blocks'

registerBlockType(
    "ourplugin/please-pay-attention",
    {
        title: 'Are you pay attention?',
        icon: 'smiley',
        category: 'common',
        attributes: {
            skyColor: {
                type: 'string',
                default: '',
            },
            grassColor: {
                type: 'string',
                default: '',
            }
        },
        edit: (props) => {
            function updateSkyColor(e: React.ChangeEvent<HTMLInputElement>) {
                props.setAttributes({
                    skyColor: e.target.value
                })
            }

            function updateGrassColor(e: React.ChangeEvent<HTMLInputElement>) {
                props.setAttributes({
                    grassColor: e.target.value
                })
            }

            return <>
                <input
                    placeholder='sky color'
                    value={props.attributes.skyColor as string}
                    onChange={updateSkyColor}
                />
                <input
                    placeholder='grass color'
                    value={props.attributes.grassColor as string}
                    onChange={updateGrassColor}
                />
            </>
        },
        save: () => null
    }
)