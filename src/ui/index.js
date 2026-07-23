import TsIcon from './TsIcon.vue';
import TsButton from './TsButton.vue';
import TsCheckbox from './TsCheckbox.vue';
import TsSwitch from './TsSwitch.vue';
import TsInputGroup from './TsInputGroup.vue';
import TsTag from './TsTag.vue';
import TsLoader from './TsLoader.vue';
import TsSelect from './TsSelect.vue';
import TsCharInput from './TsCharInput.vue';
import TsColorInput from './TsColorInput.vue';
import vTooltip from '@/directives/tooltip.js';

export default {
	install(app) {
		app.component('TsIcon', TsIcon);
		app.component('TsButton', TsButton);
		app.component('TsCheckbox', TsCheckbox);
		app.component('TsSwitch', TsSwitch);
		app.component('TsInputGroup', TsInputGroup);
		app.component('TsTag', TsTag);
		app.component('TsLoader', TsLoader);
		app.component('TsSelect', TsSelect);
		app.component('TsCharInput', TsCharInput);
		app.component('TsColorInput', TsColorInput);
		app.directive('tooltip', vTooltip);
	},
};
