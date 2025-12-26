import { json } from '@sveltejs/kit';
import { login } from '$lib/server/auth.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	try {
		const { username, password } = await request.json();
		
		if (!username || !password) {
			return json({ error: 'Username and password are required' }, { status: 400 });
		}
		
		const { token, user } = login(username, password);
		
		// Establecer cookie segura con el token
		cookies.set('auth_token', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 7 días
		});
		
		return json({ success: true, user });
	} catch (error) {
		return json({ error: error.message }, { status: 401 });
	}
}
