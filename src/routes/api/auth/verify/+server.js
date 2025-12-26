import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, cookies }) {
	const token = cookies.get('auth_token');
	console.log('Verify - Token present:', !!token);
	console.log('Verify - User in locals:', !!locals.user);
	
	if (locals.user) {
		console.log('Verify - User authenticated:', locals.user.username);
		return json({ authenticated: true, user: locals.user });
	}
	
	console.log('Verify - User not authenticated');
	return json({ authenticated: false }, { status: 401 });
}
