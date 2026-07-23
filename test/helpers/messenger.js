import { vi } from 'vitest';

// true only for plain objects - used to decide whether to recurse when merging overrides,
// so functions (including vi.fn() mocks) passed as overrides always replace the default outright
const isPlainObject = (value) =>
	value !== null && typeof value === 'object' && !Array.isArray(value) && typeof value !== 'function';

const deepMerge = (base, overrides) => {
	const result = { ...base };
	for (const key of Object.keys(overrides)) {
		result[key] =
			isPlainObject(base[key]) && isPlainObject(overrides[key]) ? deepMerge(base[key], overrides[key]) : overrides[key];
	}
	return result;
};

// builds a fake `messenger` (Thunderbird WebExtension API) global for tests.
// storage.local is backed by a real in-memory store so get/set round-trip and
// storage.onChanged listeners actually fire, instead of being bare vi.fn() stubs.
// pass `overrides` to replace only the namespaces/methods a given test cares about,
// e.g. createMockMessenger({ tabs: { create: vi.fn() } }).
export function createMockMessenger(overrides = {}) {
	const store = new Map();
	const changeListeners = [];

	const storageLocal = {
		get: vi.fn(async (keys) => {
			if (keys === undefined) return Object.fromEntries(store);
			return store.has(keys) ? { [keys]: store.get(keys) } : {};
		}),
		set: vi.fn(async (items) => {
			for (const [key, newValue] of Object.entries(items)) {
				const oldValue = store.get(key);
				store.set(key, newValue);
				for (const listener of changeListeners) listener({ [key]: { oldValue, newValue } }, 'local');
			}
		}),
		clear: vi.fn(async () => store.clear()),
	};

	const base = {
		storage: {
			local: storageLocal,
			onChanged: {
				addListener: vi.fn((callback) => changeListeners.push(callback)),
			},
		},
		accounts: {
			list: vi.fn(async () => []),
			get: vi.fn(async () => null),
		},
		messages: {
			list: vi.fn(async () => ({ id: null, messages: [] })),
			continueList: vi.fn(async () => ({ id: null, messages: [] })),
			tags: {
				list: vi.fn(async () => []),
			},
		},
		folders: {
			// this codebase only ever calls folders.get(rootFolderId, true) on an account's
			// root folder, so the default reflects that shape (isRoot is always present on a
			// real MailFolder, unlike subFolders which is only populated when requested)
			get: vi.fn(async () => ({ isRoot: true, subFolders: [] })),
		},
		downloads: {
			download: vi.fn(async () => 1),
		},
		tabs: {
			create: vi.fn(async () => ({})),
		},
		runtime: {
			getBackgroundPage: vi.fn(async () => ({ messenger: { accounts: { list: vi.fn(async () => []) } } })),
		},
		i18n: {
			getUILanguage: vi.fn(() => 'en'),
		},
	};

	return deepMerge(base, overrides);
}
