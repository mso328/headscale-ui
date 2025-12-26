import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: false
		}),
		paths: {
			base: "/web"
		},
		csp: {
			mode: "hash",
			directives: { "script-src": ["self"] },
		}
	},
	preprocess: [
		preprocess({
			postcss: true
		})
	]
};

export default config;
