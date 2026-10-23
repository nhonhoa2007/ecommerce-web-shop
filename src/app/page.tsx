import { CatalogService } from '@server/modules/catalog/catalog.service';
import { HomeView } from '@client/views/HomeView';
import { normalizeSingleQueryParam, normalizeStorefrontSort } from '@shared/utils/storefront';

export const revalidate = 60;

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentCategory = normalizeSingleQueryParam(params?.category);
  const searchQuery = normalizeSingleQueryParam(params?.search);
  const currentSort = normalizeStorefrontSort(params?.sort);
  const parsedPage = Number(normalizeSingleQueryParam(params?.page));
  const currentPage = Number.isFinite(parsedPage) && parsedPage >= 1 ? Math.floor(parsedPage) : 1;

  const { products, allCategories, total, limit } = await CatalogService.getHomeCatalog({
    category: currentCategory,
    search: searchQuery,
    sort: currentSort,
    page: currentPage,
    limit: 12,
  });

  return (
    <HomeView
      products={products}
      allCategories={allCategories}
      currentCategory={currentCategory}
      searchQuery={searchQuery}
      total={total}
      page={currentPage}
      pageSize={limit}
      currentSort={currentSort}
    />
  );
}
