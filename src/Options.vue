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
				<label for='dark'>
					{{ $t('options.darkMode.label') }}
					<span class="d-block text-gray text-small">{{ $t('options.darkMode.description') }}</span>
				</label>
				<div class='action'>
					<label class='switch'>
						<input type='checkbox' id='dark' v-model='dark' />
						<span class='switch-label' :data-on='$t("options.switch.on")' :data-off='$t("options.switch.off")'></span> 
						<span class='switch-handle'></span> 
					</label>
				</div>
			</section>
			<section class='entry'>
				<label for='local'>
					{{ $t('options.localIdentities.label') }}
					<span class="d-block text-gray text-small">{{ $t('options.localIdentities.description') }}</span>
				</label>
				<div class='action'>
					<textarea v-model='addresses' placeholder='hello@devmount.de, another@example.com' id='local'></textarea>
				</div>
			</section>
			<section class='entry'>
				<label for='start'>
					{{ $t('options.startOfWeek.label') }}
					<span class="d-block text-gray text-small">{{ $t('options.startOfWeek.description') }}</span>
				</label>
				<div class='action'>
					<select v-model='startOfWeek' id='start'>
						<option v-for='(name, pos) in weekdayNames' :key='pos' :value='pos'>{{ name }}</option>
					</select>
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
			startOfWeek: 0,
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
			this.startOfWeek = result.options.startOfWeek ? result.options.startOfWeek : 0
		},
		// save current add-on settings
		saveSettings: async function () {
			await messenger.storage.local.set({
				options: {
					addresses: this.addresses,
					dark: this.dark,
					startOfWeek: this.startOfWeek,
				}
			})
		}
	},
	computed: {
		weekdayNames () {
			let names = []
			for (let wd = 1; wd <= 7; wd++) {
				let d = new Date(1970, 1, wd) // choose a date to retrieve weekdays from, starting on a Sunday
				names.push(d.toLocaleDateString(this.$i18n.locale, { weekday: 'long' }))
			}
			return names
		},
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
		grid-template-columns: 1fr 1fr
		column-gap: 1rem
		margin-bottom: 1rem

		.action
			align-self: center

</style>
