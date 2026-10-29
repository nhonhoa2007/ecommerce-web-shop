export interface OrderLineInput {
  productId: string;
  variantId: string | null;
  quantity: number;
}

export interface ValidatedOrderInput {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail: string | null;
  note: string | null;
  items: OrderLineInput[];
}

export interface AuthoritativeOrderItem extends OrderLineInput {
  productName: string;
  variantTitle: string | null;
  price: bigint;
}

interface AuthoritativeProduct {
  id: string;
  name: string;
  price: bigint;
  stock: number;
  isActive: boolean;
  variants: Array<{
    id: string;
    title: string;
    price: bigint;
    stock: number;
    isActive: boolean;
  }>;
}

export interface OrderProductRepository {
  product: {
    findMany: (args: object) => Promise<AuthoritativeProduct[]>;
  };
}

export class OrderInputError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'OrderInputError';
    this.status = status;
  }
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateOrderInput(value: unknown): ValidatedOrderInput {
  if (!value || typeof value !== 'object') {
    throw new OrderInputError('Dữ liệu đơn hàng không hợp lệ');
  }
  const body = value as Record<string, unknown>;
  const customerName = normalizeText(body.customerName);
  const customerPhone = normalizeText(body.customerPhone);
  const customerAddress = normalizeText(body.customerAddress);
  const customerEmail = normalizeText(body.customerEmail).toLowerCase() || null;
  const note = normalizeText(body.note) || null;

  if (!customerName || !customerPhone || !customerAddress) {
    throw new OrderInputError('Vui lòng điền đầy đủ thông tin nhận hàng');
  }
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
    throw new OrderInputError('Đơn hàng phải có từ 1 đến 100 sản phẩm');
  }

  const seen = new Set<string>();
  const items = body.items.map((raw): OrderLineInput => {
    if (!raw || typeof raw !== 'object') {
      throw new OrderInputError('Sản phẩm trong đơn hàng không hợp lệ');
    }
    const line = raw as Record<string, unknown>;
    const productId = normalizeText(line.productId);
    const variantId = normalizeText(line.variantId) || null;
    const quantity = line.quantity;
    if (!productId) throw new OrderInputError('Mã sản phẩm không hợp lệ');
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      throw new OrderInputError('Số lượng phải là số nguyên dương không quá 99');
    }
    const key = `${productId}:${variantId ?? 'base'}`;
    if (seen.has(key)) throw new OrderInputError('Sản phẩm trong đơn bị trùng lặp');
    seen.add(key);
    return { productId, variantId, quantity };
  });

  return { customerName, customerPhone, customerAddress, customerEmail, note, items };
}

export async function loadAuthoritativeOrderItems(
  repository: OrderProductRepository,
  requestedItems: OrderLineInput[],
): Promise<{ items: AuthoritativeOrderItem[]; subtotal: bigint }> {
  const products = await repository.product.findMany({
    where: { id: { in: [...new Set(requestedItems.map((item) => item.productId))] }, isActive: true },
    include: { variants: true },
  });
  const byId = new Map(products.map((product) => [product.id, product]));
  let subtotal = BigInt(0);

  const items = requestedItems.map((requested): AuthoritativeOrderItem => {
    const product = byId.get(requested.productId);
    if (!product || !product.isActive) {
      throw new OrderInputError(`Sản phẩm ${requested.productId} không còn tồn tại`, 409);
    }
    const variant = requested.variantId
      ? product.variants.find((candidate) => candidate.id === requested.variantId && candidate.isActive)
      : null;
    if (requested.variantId && !variant) {
      throw new OrderInputError(`Phân loại ${requested.variantId} không còn tồn tại`, 409);
    }
    const stock = variant?.stock ?? product.stock;
    if (stock < requested.quantity) {
      throw new OrderInputError(`${variant?.title ?? product.name} không đủ tồn kho`, 409);
    }
    const price = BigInt(variant?.price ?? product.price);
    subtotal += price * BigInt(requested.quantity);
    return {
      ...requested,
      productName: product.name,
      variantTitle: variant?.title ?? null,
      price,
    };
  });

  return { items, subtotal };
}
