import type { LayoutServerLoad } from './$types';
import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async () => {
  return {};
}) satisfies LayoutServerLoad;


