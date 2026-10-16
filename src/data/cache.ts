import { unstable_cache as nextCache } from 'next/cache'

/**
 * Keš podataka vezan za verziju sajta. Vercel čuva keš podataka i između buildova, a sadržaj
 * uvezen skriptama s računara ne može ga osvježiti; zato svaki novi deploy (commit) počinje sa
 * svježim podacima. Izmjene kroz CMS i dalje osvježavaju keš odmah, preko tagova.
 */
const VERSION = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || 'lokalno'

export const unstable_cache: typeof nextCache = (fn, keyParts, options) => nextCache(fn, [...(keyParts ?? []), VERSION], options)
