import { getCustomers } from '$lib/server/routes/customers';
import type { PageServerLoad } from './$types';
import { fileURLToPath } from 'node:url';
import path, { dirname, join } from 'node:path';
import { findFilesInDir, generateHash } from '$lib/utility/logos-hash';

const __dirname = dirname(fileURLToPath(import.meta.url))
const __filename = fileURLToPath(import.meta.url);


export const load = (async () => {

  // const audit = await auditTransaction()
  // const paymentsAudit = await auditPayments()
  // const customerAudit = await auditCustomer()
  // /run/media/karadz/A2A8611CA860EFE9/Users/karadz/Desktop/WORKS/
  const LOGO_PATH = '/run/media/karadz/A2A8611CA860EFE9/Users/karadz/Desktop/WORKS'

  // const LOGO_PATH = '/home/karadz/development/sidebar/src/lib/emb'
  const EXTENSION = '.emb'

  const filesEMB = await findFilesInDir(LOGO_PATH, EXTENSION)
  // console.log("files", filesEMB);

  const hashResults: any[] = []
  Array.from(filesEMB.values()).forEach((file, index) => {
    hashResults.push([file.name, { ...file, hash: generateHash(file.path) }])
  })
  console.log("🚀 ~ load ~ hashResults:", hashResults)

  // const resolvedEntries = await Promise.all(hashResults);

  const customers = await getCustomers()

  return {
    customers
  };
}) satisfies PageServerLoad;

export const actions = {
  create: async () => {

    // const data = await request.formData();
    // const formData = Object.fromEntries(data)


  },
};