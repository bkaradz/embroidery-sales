// See https://svelte.dev/docs/kit/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/routes/auth').SessionValidationResult['user'];
			session: import('$lib/server/routes/auth').SessionValidationResult['session'];
		}
    interface PageData {
      flash?: { type: 'success' | 'error'; message: string };
    }
	}
}

export {};
