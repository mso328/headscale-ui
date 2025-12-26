import { redirect } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth.js';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Obtener token de la cookie
	const token = event.cookies.get('auth_token');
	
	console.log(`[${event.url.pathname}] Token present:`, !!token);
	
	// Verificar el token
	const user = verifyToken(token);
	
	console.log(`[${event.url.pathname}] User authenticated:`, !!user, user?.username);
	
	// Guardar usuario en locals para acceder en las rutas
	event.locals.user = user;
	
	// Rutas públicas que no requieren autenticación
	const publicPaths = ['/web/login', '/web/api/auth/login'];
	const isPublicPath = publicPaths.some(path => 
		event.url.pathname === path || event.url.pathname.startsWith(path)
	);
	
	// También permitir acceso a recursos estáticos
	const isStaticAsset = event.url.pathname.startsWith('/web/_app/') || 
	                      event.url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/);
	
	// Si no está autenticado y no está en una ruta pública ni es un recurso estático
	if (!user && !isPublicPath && !isStaticAsset) {
		throw redirect(303, '/web/login');
	}
	
	// Si está autenticado y trata de acceder al login, redirigir al home
	if (user && event.url.pathname === '/web/login') {
		throw redirect(303, '/web/');
	}
	
	const response = await resolve(event);
	return response;
}
