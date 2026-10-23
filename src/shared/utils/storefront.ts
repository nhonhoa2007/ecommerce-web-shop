export type StorefrontSort = 'newest' | 'price-asc' | 'price-desc';

const STOREFRONT_SORTS = new Set<StorefrontSort>(['newest', 'price-asc', 'price-desc']);
const SUPPORTED_IMAGE_HOSTS = new Set([
  'img.vietqr.io',
  'images.unsplash.com',
  'res.cloudinary.com',
  'lh3.googleusercontent.com',
]);

export function normalizeSingleQueryParam(value: string | string[] | undefined): string | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = candidate?.trim();
  return normalized || null;
}

export function normalizeStorefrontSort(value: string | string[] | undefined): StorefrontSort {
  const normalized = normalizeSingleQueryParam(value);
  return normalized && STOREFRONT_SORTS.has(normalized as StorefrontSort)
    ? (normalized as StorefrontSort)
    : 'newest';
}

export function buildStorefrontUrl(params: {
  category?: string | null;
  search?: string | null;
  sort?: StorefrontSort;
  page?: number;
}): string {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.sort && params.sort !== 'newest') query.set('sort', params.sort);
  if (params.page && params.page > 1) query.set('page', String(params.page));
  return query.size > 0 ? `/?${query.toString()}` : '/';
}

export function isSupportedProductImageSource(source: string | null | undefined): source is string {
  if (!source) return false;
  if (source.startsWith('/') && !source.startsWith('//')) return true;

  try {
    const url = new URL(source);
    return url.protocol === 'https:' && SUPPORTED_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
