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
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
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
