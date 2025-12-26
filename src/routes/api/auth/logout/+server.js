import { json } from '@sveltejs/kit';
import { logout } from '$lib/server/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies }) {
	const token = cookies.get('auth_token');
	
	if (token) {
		logout(token);
	}
	
	cookies.delete('auth_token', { path: '/' });
	
	return json({ success: true });
}
