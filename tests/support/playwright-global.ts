import { spawn, type ChildProcess } from 'node:child_process';
import net from 'node:net';

const HOST = '127.0.0.1';
const PROJECT = 'bibletogether';
const API_KEY = process.env.PUBLIC_FIREBASE_API_KEY || 'AIzaSyBZVR0Y2AofdON2Tz2J6hEikRTiHmJHShE';

function waitForPort(port: number, timeout = 30_000): Promise<void> {
	return new Promise((resolve, reject) => {
		const started = Date.now();
		const probe = () => {
			const socket = net.createConnection({ host: HOST, port });
			socket.once('connect', () => {
				socket.destroy();
				resolve();
			});
			socket.once('error', () => {
				socket.destroy();
				if (Date.now() - started > timeout)
					reject(new Error(`Firebase emulator port ${port} did not become ready`));
				else setTimeout(probe, 100);
			});
		};
		probe();
	});
}

async function createVerifiedUser() {
	const email = 'highlights@example.test';
	const password = 'Highlight-password-123!';
	const key = API_KEY;
	const signup = await fetch(
		`http://${HOST}:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${key}`,
		{
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email, password, returnSecureToken: true })
		}
	);
	if (!signup.ok && signup.status !== 400)
		throw new Error(`Auth emulator setup failed: ${signup.status}`);
	return { email, password };
}

export default async function globalSetup() {
	process.env.PUBLIC_USE_FIREBASE_EMULATOR = 'true';
	let emulator: ChildProcess | undefined;
	try {
		emulator = spawn(
			'bunx',
			['firebase', 'emulators:start', '--project', PROJECT, '--only', 'auth,firestore'],
			{ stdio: 'ignore', env: { ...process.env, PUBLIC_USE_FIREBASE_EMULATOR: 'true' } }
		);
		await Promise.all([waitForPort(9099), waitForPort(8080)]);
		await createVerifiedUser();
	} catch (error) {
		emulator?.kill('SIGTERM');
		throw new Error(
			`Highlight emulator setup failed (Auth 9099 / Firestore 8080). Another process may already own port 8080: ${String(error)}`
		);
	}

	return async () => {
		if (!emulator || emulator.killed) return;
		emulator.kill('SIGTERM');
		await new Promise<void>((resolve) => {
			emulator?.once('exit', () => resolve());
			setTimeout(resolve, 5_000);
		});
	};
}
