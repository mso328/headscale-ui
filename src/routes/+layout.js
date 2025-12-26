import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const prerender = false;
export const ssr = true;

/** @type {import('./$types').LayoutLoad} */
export async function load({ fetch, url }) {
	// Rutas públicas
	const publicPaths = ['/web/login'];
	const isPublicPath = publicPaths.some(path => url.pathname === path);
	
	// Si no está en una ruta pública, verificar autenticación
	if (!isPublicPath) {
		try {
			const response = await fetch('/web/api/auth/verify', {
				credentials: 'include' // Importante: incluir cookies
			});
			
			if (browser) {
				console.log('Auth verify response:', response.status);
			}
			
			if (!response.ok) {
				if (browser) {
					console.log('Not authenticated, redirecting to login');
				}
				throw redirect(303, '/web/login');
			}
			
			const data = await response.json();
			
			if (!data.authenticated) {
				if (browser) {
					console.log('User not authenticated');
				}
				throw redirect(303, '/web/login');
			}
			
			if (browser) {
				console.log('User authenticated:', data.user);
			}
			
			return {
				user: data.user
			};
		} catch (error) {
			if (error?.status === 303) {
				throw error;
			}
			if (browser) {
				console.error('Auth check error:', error);
			}
			throw redirect(303, '/web/login');
		}
	}
	
	return {};
}
