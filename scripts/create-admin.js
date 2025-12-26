#!/usr/bin/env node

/**
 * Script para crear el primer usuario administrador
 * Uso: node scripts/create-admin.js
 */

import { createUser, getUserCount } from '../src/lib/server/auth.js';
import readline from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function question(query) {
	return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
	console.log('=================================');
	console.log('  Headscale UI - Create Admin   ');
	console.log('=================================\n');
	
	// Verificar si ya hay usuarios
	const userCount = getUserCount();
	if (userCount > 0) {
		console.log(`⚠️  Warning: There are already ${userCount} user(s) in the database.`);
		const confirm = await question('Do you want to create another user? (yes/no): ');
		if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
			console.log('Cancelled.');
			rl.close();
			process.exit(0);
		}
	}
	
	console.log('\nCreate a new admin user:\n');
	
	const username = await question('Username: ');
	if (!username || username.trim().length < 3) {
		console.error('❌ Username must be at least 3 characters long.');
		rl.close();
		process.exit(1);
	}
	
	const password = await question('Password: ');
	if (!password || password.length < 8) {
		console.error('❌ Password must be at least 8 characters long.');
		rl.close();
		process.exit(1);
	}
	
	const passwordConfirm = await question('Confirm password: ');
	if (password !== passwordConfirm) {
		console.error('❌ Passwords do not match.');
		rl.close();
		process.exit(1);
	}
	
	try {
		const user = createUser(username.trim(), password);
		console.log(`\n✅ User created successfully!`);
		console.log(`   Username: ${user.username}`);
		console.log(`   User ID: ${user.id}`);
		console.log('\n🔐 You can now login with these credentials.');
	} catch (error) {
		console.error(`\n❌ Error: ${error.message}`);
		rl.close();
		process.exit(1);
	}
	
	rl.close();
}

main();
