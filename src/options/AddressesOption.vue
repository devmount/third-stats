<template>
	<div class="entry">
		<label for="local">
			<div class="label-head">
				{{ t('options.localIdentities.label') }}
				<span class="note-icon" v-tooltip="t('options.note.refreshCacheRequired')">
					<ts-icon size="tiny">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<path
							d="M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74"
						/>
						<path
							d="M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6"
						/>
						<path d="M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4" />
						<line x1="3" y1="3" x2="21" y2="21" />
					</ts-icon>
				</span>
			</div>
			<div class="description">{{ t('options.localIdentities.description') }}</div>
		</label>
		<div class="action">
			<ts-input-group class="address-group">
				<ts-char-input
					class="address-input"
					type="email"
					v-model="input.address"
					placeholder="hello@devmount.de"
					id="local"
				/>
				<ts-button @click="addAddress" class="add-button">
					<ts-icon size="small" weight="bold" class="add-icon">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</ts-icon>
				</ts-button>
			</ts-input-group>
			<div>
				<ts-tag class="address-tag" v-for="a in addressList" :key="a">
					{{ a }}
					<ts-icon @click="removeAddress(a)" weight="bold" size="text" class="remove-icon">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</ts-icon>
				</ts-tag>
			</div>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { input, addressList, addAddress, removeAddress } = inject('engine');

const { t } = useI18n();
</script>

<style scoped>
.address-group {
	display: flex;
}

.address-input {
	flex-grow: 1;
}

.add-button {
	height: 2.5rem;
}

.add-icon {
	display: block;
	margin: 0 auto;
}

.address-tag {
	font-size: 0.875rem;
}

.remove-icon {
	cursor: pointer;
}
</style>
