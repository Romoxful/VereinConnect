declare global {
	namespace App {
		interface Locals {
			user?: {
				id: number;
				email: string;
				name: string;
				role: 'vorstand' | 'mitglied';
			};
		}
	}
}

export {};
