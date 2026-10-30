export interface OrderStockItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface StockTransaction {
  product: {
    updateMany: (args: object) => Promise<{ count: number }>;
    update: (args: object) => Promise<unknown>;
  };
  productVariant: {
    updateMany: (args: object) => Promise<{ count: number }>;
  };
}

export interface StockReleaseTransaction {
  product: { update: (args: object) => Promise<unknown> };
  productVariant: { update: (args: object) => Promise<unknown> };
}

export async function reserveOrderStock(
  tx: StockTransaction,
  items: OrderStockItem[],
): Promise<string | null> {
  for (const item of items) {
    if (item.variantId) {
      const result = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          productId: item.productId,
          isActive: true,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count !== 1) return item.variantId;
      const parentResult = await tx.product.updateMany({
        where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (parentResult.count !== 1) return item.productId;
      continue;
    }

    const result = await tx.product.updateMany({
      where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (result.count !== 1) return item.productId;
  }
  return null;
}

export async function releaseOrderStock(
  tx: StockReleaseTransaction,
  items: OrderStockItem[],
): Promise<void> {
  for (const item of items) {
    if (item.variantId) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
}
