<script context="module" lang="ts">
	import { APIKey, Device, PreAuthKey, User } from '$lib/common/classes';
	import { deviceStore, userStore, apiTestStore} from '$lib/common/stores.js';
	import { sortDevices, sortUsers } from '$lib/common/sorting.svelte';
	import { filterDevices, filterUsers } from './searching.svelte';
	import { base } from '$app/paths';

	// Helper function to call the proxy API
	async function proxyFetch(endpoint: string, method: string = 'GET', body: any = null) {
		// Obtener credenciales desde localStorage (configuradas en la web)
		const headscaleURL = localStorage.getItem('headscaleURL') || '';
		const headscaleAPIKey = localStorage.getItem('headscaleAPIKey') || '';
		
		const url = `${base}/api/proxy?endpoint=${encodeURIComponent(endpoint)}`;
		
		const options: RequestInit = {
			method,
			headers: {
				Accept: 'application/json',
				// Enviar credenciales al proxy del servidor
				'X-Headscale-Url': headscaleURL,
				'X-Headscale-Api-Key': headscaleAPIKey
			}
		};

		if (body) {
			options.headers['Content-Type'] = 'application/json';
			options.body = JSON.stringify(body);
		}

		const response = await fetch(url, options);

		if (!response.ok) {
			const text = await response.text();
			throw new Error(text || `HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	export async function getUsers() {
		// endpoint url for getting users
		let endpointURL = '/api/v1/user';

		//returning variables
		let headscaleUsers = [new User()];

		try {
			const data = await proxyFetch(endpointURL);
			headscaleUsers = data.users;
			// sort the users
			headscaleUsers = sortUsers(headscaleUsers);
			// Set the store
			apiTestStore.set('succeeded');
			userStore.set(headscaleUsers);
			// Filter the store
			filterUsers();
		} catch (error) {
			apiTestStore.set('failed');
			throw error;
		}
	}

	export async function editUser(currentUserId: string, newUsername: string): Promise<any> {
		// endpoint url for editing users
		let endpointURL = '/api/v1/user/' + currentUserId + '/rename/' + newUsername;

		try {
			await proxyFetch(endpointURL, 'POST');
		} catch (error) {
			throw error;
		}
	}

	export async function newAPIKey(APIKeyExpiration: string): Promise<string> {
		// endpoint url for editing users
		let endpointURL = '/api/v1/apikey';

		try {
			const data = await proxyFetch(endpointURL, 'POST', {
				expiration: APIKeyExpiration
			});
			return data.apiKey;
		} catch (error) {
			throw error;
		}
	}

	export async function expireAPIKey(APIKeyPrefix: string) {
		// endpoint url for editing users
		let endpointURL = '/api/v1/apikey/expire';

		try {
			await proxyFetch(endpointURL, 'POST', {
				prefix: APIKeyPrefix
			});
		} catch (error) {
			throw error;
		}
	}

	export async function updateTags(deviceID: string, tags: string[]): Promise<any> {
		// endpoint url for editing users
		let endpointURL = `/api/v1/node/${deviceID}/tags`;

		try {
			await proxyFetch(endpointURL, 'POST', {
				tags: tags
			});
		} catch (error) {
			throw error;
		}
	}

	export async function removeUser(currentUserId: string): Promise<any> {
		// endpoint url for editing users
		let endpointURL = '/api/v1/user/' + currentUserId;

		try {
			await proxyFetch(endpointURL, 'DELETE');
		} catch (error) {
			throw error;
		}
	}

	export async function newUser(newUsername: string): Promise<any> {
		// endpoint url for editing users
		let endpointURL = '/api/v1/user';

		try {
			await proxyFetch(endpointURL, 'POST', {
				name: newUsername.toLowerCase()
			});
		} catch (error) {
			throw error;
		}
	}

	export async function getDevices(): Promise<any> {
		// endpoint url for getting devices
		let endpointURL = `/api/v1/node`;

		//returning variables
		let headscaleDevices = [new Device()];

		try {
			const data = await proxyFetch(endpointURL);
			headscaleDevices = data[`nodes`];
			headscaleDevices = sortDevices(headscaleDevices);
			// set the stores
			apiTestStore.set('succeeded');
			deviceStore.set(headscaleDevices);
			// filter the store
			filterDevices();
		} catch (error) {
			apiTestStore.set('failed');
			throw error;
		}
	}

	export async function getAPIKeys(): Promise<APIKey[]> {
		// endpoint url for editing users
		let endpointURL = '/api/v1/apikey';
		let apiKeys = [new APIKey()];

		try {
			const data = await proxyFetch(endpointURL);
			apiKeys = data.apiKeys;
			return apiKeys;
		} catch (error) {
			throw error;
		}
	}

	export async function getPreauthKeys(userID: string): Promise<PreAuthKey[]> {
		// endpoint url for editing users
		let endpointURL = '/api/v1/preauthkey';

		//returning variables
		let headscalePreAuthKey = [new PreAuthKey()];

		try {
			const data = await proxyFetch(endpointURL + '?user=' + userID);
			headscalePreAuthKey = data.preAuthKeys;
			return headscalePreAuthKey;
		} catch (error) {
			throw error;
		}
	}

	export async function newPreAuthKey(userID: string, expiry: string, reusable: boolean, ephemeral: boolean): Promise<any> {
		// endpoint url for editing users
		let endpointURL = '/api/v1/preauthkey';

		try {
			await proxyFetch(endpointURL, 'POST', {
				user: userID,
				expiration: expiry,
				reusable: reusable,
				ephemeral: ephemeral
			});
		} catch (error) {
			throw error;
		}
	}

	export async function removePreAuthKey(userID: string, preAuthKey: string): Promise<any> {
		// endpoint url for removing devices
		let endpointURL = '/api/v1/preauthkey/expire';

		try {
			await proxyFetch(endpointURL, 'POST', {
				user: userID,
				key: preAuthKey
			});
		} catch (error) {
			throw error;
		}
	}

	export async function newDevice(key: string, userId: string): Promise<any> {
		// endpoint url for editing users
		let endpointURL = `/api/v1/node/register`;

		try {
			await proxyFetch(endpointURL + '?user=' + userId + '&key=' + key, 'POST');
		} catch (error) {
			throw error;
		}
	}

	export async function moveDevice(deviceID: string, userID: string): Promise<any> {
		// endpoint url for editing users
		let endpointURL = `/api/v1/node/${deviceID}/user`;

		try {
			await proxyFetch(endpointURL, 'POST', {
				user: parseInt(userID)
			});
		} catch (error) {
			throw error;
		}
	}

	export async function renameDevice(deviceID: string, name: string): Promise<any> {
		// endpoint url for editing users
		let endpointURL = `/api/v1/node/${deviceID}/rename/${name}`;

		try {
			await proxyFetch(endpointURL, 'POST');
		} catch (error) {
			throw error;
		}
	}

	export async function removeDevice(deviceID: string): Promise<any> {
		// endpoint url for removing devices
		let endpointURL = `/api/v1/node/${deviceID}`;

		try {
			await proxyFetch(endpointURL, 'DELETE');
		} catch (error) {
			throw error;
		}
	}
</script>
