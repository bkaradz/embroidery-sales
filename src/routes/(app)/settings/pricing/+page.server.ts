import { createNewPricingTier } from '$lib/server/routes/pricingTiers';
import { pricingTierSchema } from '$lib/utility/schemas';
import { redirect } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  create: async (event) => {
    if (!event.locals.user) {
      return redirect(302, '/');
    }

    const userId = event.locals.user.id;

    const formData = await event.request.formData();

    const pricingTier = JSON.parse(
      formData.getAll('pricingTier').at(0) as unknown as string
    ) as unknown as { name: string; default: boolean };

    if (!pricingTier) redirect({ type: 'error', message: `pricingTier are required` }, event);

    const pricingTierDetails = JSON.parse(
      formData.getAll('pricingTierDetails').at(0) as unknown as string
    ) as unknown as {
      minQuantity: number;
      maxQuantity: number | null;
      minimumPrice: number;
      pricePer1000Stitches: number;
    }[];

    if (!pricingTierDetails)
      redirect({ type: 'error', message: `pricingTierDetails are required` }, event);

    const form = await superValidate(
      {
        pricingTier,
        pricingTierDetails
      },
      zod(pricingTierSchema)
    );

    if (!form.valid) {
      redirect({ type: 'error', message: `Pricing tier validation failed` }, event);
    }

    await createNewPricingTier(userId, form.data);

    return { success: true };
  }
};
