import { notFound } from 'next/navigation';
import { ProductDetailView } from '@client/views/ProductDetailView';
import { CatalogService } from '@server/modules/catalog/catalog.service';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await CatalogService.getProductDetail(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
