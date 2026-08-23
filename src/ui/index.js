import TsIcon from '@/ui/TsIcon.vue';
import TsButton from '@/ui/TsButton.vue';
import TsCheckbox from '@/ui/TsCheckbox.vue';
import TsSwitch from '@/ui/TsSwitch.vue';
import TsInputGroup from '@/ui/TsInputGroup.vue';
import TsTag from '@/ui/TsTag.vue';
import TsLoader from '@/ui/TsLoader.vue';
import TsSelect from '@/ui/TsSelect.vue';
import TsCharInput from '@/ui/TsCharInput.vue';
import TsColorInput from '@/ui/TsColorInput.vue';
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
