export interface BankDetails {
  bankId: string;
  accountNo: string;
  accountName: string;
}

export function getBankDetails(): BankDetails {
  return {
    bankId: process.env.BANK_ID ?? '',
    accountNo: process.env.BANK_ACCOUNT ?? '',
    accountName: process.env.BANK_NAME ?? '',
  };
}

export function buildPaymentQrUrl(bank: BankDetails, orderCode: string, amount: bigint): string | null {
  if (!bank.bankId.trim() || !bank.accountNo.trim() || !bank.accountName.trim() ||
      !/^[A-Z0-9]+$/.test(orderCode) || amount <= 0n) return null;
  const path = `${encodeURIComponent(bank.bankId)}-${encodeURIComponent(bank.accountNo)}-compact2.png`;
  const query = new URLSearchParams({ amount: amount.toString(), addInfo: orderCode, accountName: bank.accountName });
  return `https://img.vietqr.io/image/${path}?${query.toString()}`;
}
