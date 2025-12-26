import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './database.js';

// Clave secreta para JWT - en producción usar variable de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production-' + Math.random();

// Duración de la sesión (7 días)
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

/**
 * Crear un nuevo usuario
 */
export function createUser(username, password) {
	const passwordHash = bcrypt.hashSync(password, 10);
	
	try {
		const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
		const result = stmt.run(username, passwordHash);
		return { id: result.lastInsertRowid, username };
	} catch (error) {
		if (error.code === 'SQLITE_CONSTRAINT') {
			throw new Error('Username already exists');
		}
		throw error;
	}
}

/**
 * Verificar credenciales y crear sesión
 */
export function login(username, password) {
	const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
	
	if (!user) {
		throw new Error('Invalid username or password');
	}
	
	const isValid = bcrypt.compareSync(password, user.password_hash);
	
	if (!isValid) {
		throw new Error('Invalid username or password');
	}
	
	// Actualizar último login
	db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
	
	// Eliminar sesiones antiguas del usuario
	db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
	
	// Crear token JWT
	const token = jwt.sign(
		{ userId: user.id, username: user.username },
		JWT_SECRET,
		{ expiresIn: '7d' }
	);
	
	// Guardar sesión en la base de datos
	const expiresAt = new Date(Date.now() + SESSION_DURATION);
	db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
		user.id,
		token,
		expiresAt.toISOString()
	);
	
	return { token, user: { id: user.id, username: user.username } };
}

/**
 * Verificar si un token es válido
 */
export function verifyToken(token) {
	if (!token) {
		console.log('verifyToken: No token provided');
		return null;
	}
	
	try {
		// Verificar JWT
		console.log('verifyToken: Verifying JWT...');
		const decoded = jwt.verify(token, JWT_SECRET);
		console.log('verifyToken: JWT decoded:', decoded);
		
		// Verificar que la sesión existe en la base de datos y no ha expirado
		const session = db.prepare(
			"SELECT s.*, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime('now')"
		).get(token);
		
		console.log('verifyToken: Session found:', !!session);
		
		if (!session) {
			console.log('verifyToken: No valid session in database');
			return null;
		}
		
		console.log('verifyToken: Session valid for user:', session.username);
		
		return {
			userId: session.user_id,
			username: session.username
		};
	} catch (error) {
		console.error('verifyToken: Error -', error.message);
		return null;
	}
}

/**
 * Cerrar sesión
 */
export function logout(token) {
	if (!token) {
		return;
	}
	
	// Eliminar sesión de la base de datos
	db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

/**
 * Limpiar sesiones expiradas
 */
export function cleanExpiredSessions() {
	db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
}

/**
 * Obtener número de usuarios
 */
export function getUserCount() {
	const result = db.prepare('SELECT COUNT(*) as count FROM users').get();
	return result.count;
}

/**
 * Cambiar contraseña
 */
export function changePassword(userId, newPassword) {
	const passwordHash = bcrypt.hashSync(newPassword, 10);
	db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
}

// Limpiar sesiones expiradas cada hora
setInterval(cleanExpiredSessions, 60 * 60 * 1000);
