<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	
	let username = '';
	let password = '';
	let error = '';
	let loading = false;
	
	async function handleLogin(event) {
		event.preventDefault();
		error = '';
		loading = true;
		
		console.log('Attempting login with username:', username);
		
		try {
			const response = await fetch(`${base}/api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});
			
			console.log('Response status:', response.status);
			
			const data = await response.json();
			console.log('Response data:', data);
			
			if (response.ok) {
				console.log('Login successful, redirecting...');
				// Redirigir a la página principal
				window.location.href = `${base}/`;
			} else {
				error = data.error || 'Login failed';
				console.error('Login failed:', error);
			}
		} catch (err) {
			console.error('Connection error:', err);
			error = 'Connection error. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Headscale UI</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200">
	<div class="card w-96 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl font-bold text-center justify-center mb-4">
				🔐 Headscale UI Login
			</h2>
			
			{#if error}
				<div class="alert alert-error mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			{/if}
			
			<form on:submit={handleLogin}>
				<div class="form-control w-full mb-4">
					<label class="label" for="username">
						<span class="label-text">Username</span>
					</label>
					<input
						id="username"
						type="text"
						placeholder="Enter username"
						class="input input-bordered w-full"
						bind:value={username}
						required
						disabled={loading}
					/>
				</div>
				
				<div class="form-control w-full mb-6">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						id="password"
						type="password"
						placeholder="Enter password"
						class="input input-bordered w-full"
						bind:value={password}
						required
						disabled={loading}
					/>
				</div>
				
				<div class="form-control mt-6">
					<button 
						type="submit" 
						class="btn btn-primary w-full"
						class:loading={loading}
						disabled={loading}
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</div>
			</form>
			
			<div class="divider mt-6"></div>
			
			<div class="text-center text-sm text-base-content/60">
				<p>Secure authentication with encrypted passwords</p>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
