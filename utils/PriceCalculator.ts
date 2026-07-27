/**
 * Currency and price calculation helpers shared across cart/checkout layers.
 */
export class PriceCalculator {
  static calculateExpectedTotal(
    unitPrice: number,
    quantity: number,
    deliveryFee: number,
    discount: number,
  ): number {
    const subtotal = unitPrice * quantity;
    const total = subtotal + deliveryFee - discount;
    return Number(Math.max(total, 0).toFixed(2));
  }

  static parseCurrency(raw: string): number {
    const normalized = raw.replace(/[^0-9.-]/g, '');
    const value = Number.parseFloat(normalized);
    if (Number.isNaN(value)) {
      throw new Error(`Unable to parse currency from "${raw}"`);
    }
    return Number(value.toFixed(2));
  }
}
