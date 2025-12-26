import { json, error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, request }) {
	const endpoint = url.searchParams.get('endpoint');
	
	if (!endpoint) {
		throw error(400, 'Endpoint parameter is required');
	}

	// Obtener URL y API Key desde los headers enviados por el cliente
	const headscaleURL = request.headers.get('x-headscale-url') || '';
	const headscaleAPIKey = request.headers.get('x-headscale-api-key') || '';

	if (!headscaleURL || !headscaleAPIKey) {
		throw error(400, 'Headscale URL and API Key are required');
	}

	try {
		// Deshabilitar temporalmente la verificación de certificados SSL para esta petición
		// Esto es necesario para certificados autofirmados en desarrollo
		const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

		const response = await fetch(headscaleURL + endpoint, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${headscaleAPIKey}`
			}
		});

		// Restaurar el valor original
		if (originalRejectUnauthorized !== undefined) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
		} else {
			delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
		}

		if (!response.ok) {
			const text = await response.text();
			throw error(response.status, text);
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Proxy error:', err);
		throw error(500, err.message || 'Failed to fetch from Headscale');
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, request }) {
	const endpoint = url.searchParams.get('endpoint');
	
	if (!endpoint) {
		throw error(400, 'Endpoint parameter is required');
	}

	// Obtener URL y API Key desde los headers enviados por el cliente
	const headscaleURL = request.headers.get('x-headscale-url') || '';
	const headscaleAPIKey = request.headers.get('x-headscale-api-key') || '';

	if (!headscaleURL || !headscaleAPIKey) {
		throw error(400, 'Headscale URL and API Key are required');
	}

	try {
		let body;
		const contentType = request.headers.get('content-type');
		
		if (contentType && contentType.includes('application/json')) {
			body = await request.text();
		}

		// Deshabilitar temporalmente la verificación de certificados SSL
		const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

		const response = await fetch(headscaleURL + endpoint, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${headscaleAPIKey}`,
				...(body && { 'Content-Type': 'application/json' })
			},
			...(body && { body })
		});

		// Restaurar el valor original
		if (originalRejectUnauthorized !== undefined) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
		} else {
			delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
		}

		if (!response.ok) {
			const text = await response.text();
			throw error(response.status, text);
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Proxy error:', err);
		throw error(500, err.message || 'Failed to fetch from Headscale');
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ url, request }) {
	const endpoint = url.searchParams.get('endpoint');
	
	if (!endpoint) {
		throw error(400, 'Endpoint parameter is required');
	}

	// Obtener URL y API Key desde los headers enviados por el cliente
	const headscaleURL = request.headers.get('x-headscale-url') || '';
	const headscaleAPIKey = request.headers.get('x-headscale-api-key') || '';

	if (!headscaleURL || !headscaleAPIKey) {
		throw error(400, 'Headscale URL and API Key are required');
	}

	try {
		// Deshabilitar temporalmente la verificación de certificados SSL
		const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

		const response = await fetch(headscaleURL + endpoint, {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${headscaleAPIKey}`
			}
		});

		// Restaurar el valor original
		if (originalRejectUnauthorized !== undefined) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
		} else {
			delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
		}

		if (!response.ok) {
			const text = await response.text();
			throw error(response.status, text);
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Proxy error:', err);
		throw error(500, err.message || 'Failed to fetch from Headscale');
	}
}
