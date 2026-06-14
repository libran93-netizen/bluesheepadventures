// Mirrors next.config.ts's basePath. Raw fetch() calls (unlike <Link>/<Image>)
// are not rewritten by Next's router, so client components must prefix
// same-origin API calls with this.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
