<template>
	<div
		id='options'
		:class='{
			"dark": dark,
			"light": !dark,
			"text-normal": true,
			"background-normal": dark,
			"background-highlight-contrast": !dark,
		}'
	>
		<div class='container p-1'>
			<section class='entry'>
				<label for='dark'>{{ $t('options.darkMode.label') }}</label>
				<div class='action'>
					<label class='switch'>
						<input type='checkbox' id='dark' v-model='dark' />
						<span class='switch-label' :data-on='$t("options.switch.on")' :data-off='$t("options.switch.off")'></span> 
						<span class='switch-handle'></span> 
					</label>
				</div>
			</section>
			<section class='entry'>
				<label for='dark'>{{ $t('options.localIdentities.label') }}</label>
				<div class='action'>
					<textarea v-model='addresses' placeholder='hello@devmount.de, another@example.com'></textarea>
				</div>
			</section>
			<section class='entry mt-5'>
				<div></div>
				<div class='action text-right'>
					<button @click='saveSettings'>{{ $t('options.button.save') }}</button>
				</div>
			</section>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Options',
	data () {
		return {
			addresses: '',
			dark: true,
		}
	},
	created () {
		this.getSettings()
	},
	methods: {
		// get all add-on settings
		getSettings: async function () {
			let result = await messenger.storage.local.get('options')
			this.addresses = result.options.addresses ? result.options.addresses : ''
			this.dark = result.options.dark ? true : false
			console.log(result.options);
		},
		// save current add-on settings
		saveSettings: async function () {
			await messenger.storage.local.set({
				options: {
					addresses: this.addresses,
					dark: this.dark
				}
			})
			console.log('saved');
		}
	}
}
</script>

<style lang='stylus'>
@require "assets/global"

// general
html, body
	min-height: 300px

// layout
#options
	width 100%
	height 100%
	min-height: 300px

	.entry
		display: grid
		grid-template-columns: 1fr 2fr
		margin-bottom: 1rem

</style>
