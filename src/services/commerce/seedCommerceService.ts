import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';
import { SeedCommerceRequest, SeedCommerceResult } from '@/types/commerce';

/**
 * Service to invoke the authoritative server-side production commerce seed.
 * 
 * Only callable by SUPER_ADMIN, ADMIN, or PRODUCT_MANAGER accounts.
 * Idempotently creates canonical products, variants, and server inventory.
 * Never resets operational inventory quantities.
 */
export async function seedProductionCommerceCatalog(
  options?: SeedCommerceRequest
): Promise<SeedCommerceResult> {
  const seedCallable = httpsCallable<SeedCommerceRequest, SeedCommerceResult>(
    functions,
    'seedProductionCommerceCatalog'
  );

  const response = await seedCallable(options || {});
  return response.data;
}
