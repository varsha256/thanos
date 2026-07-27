import type { Locator, Page } from '@playwright/test';
import { SearchComponent } from '../components/Search';
import { HeaderComponent } from '../components/Header';
import { ToastComponent } from '../components/Toast';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

/**
 * Restaurant discovery and menu selection page.
 */
export class RestaurantPage extends BasePage {
  readonly search: SearchComponent;
  readonly header: HeaderComponent;
  readonly toast: ToastComponent;

  private readonly restaurantCards: Locator;
  private readonly restaurantTitle: Locator;
  private readonly menuItems: Locator;
  private readonly addToCartButton: Locator;
  private readonly quantityIncrease: Locator;
  private readonly quantityDecrease: Locator;
  private readonly quantityValue: Locator;
  private readonly selectedRestaurantName: Locator;

  constructor(page: Page, logger?: Logger) {
    const pageLogger = logger?.child('RestaurantPage') ?? new Logger('RestaurantPage');
    super(page, pageLogger);
    this.search = new SearchComponent(page, pageLogger);
    this.header = new HeaderComponent(page, pageLogger);
    this.toast = new ToastComponent(page, pageLogger);

    this.restaurantCards = page.getByTestId('restaurant-card');
    this.restaurantTitle = page.getByTestId('restaurant-title');
    this.menuItems = page.getByTestId('menu-item');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.quantityIncrease = page.getByTestId('quantity-increase');
    this.quantityDecrease = page.getByTestId('quantity-decrease');
    this.quantityValue = page.getByTestId('quantity-value');
    this.selectedRestaurantName = page.getByTestId('selected-restaurant-name');
  }

  async searchRestaurant(restaurantName: string): Promise<void> {
    await this.search.search(restaurantName);
  }

  async selectRestaurant(restaurantName: string): Promise<void> {
    this.logger.info(`Selecting restaurant: ${restaurantName}`);
    const card = this.restaurantCards
      .filter({ hasText: new RegExp(restaurantName, 'i') })
      .first();
    await this.click(card, `Restaurant card: ${restaurantName}`);
    await this.waitForVisible(this.selectedRestaurantName);
    this.logger.info('Restaurant selected', { restaurantName });
  }

  async getSelectedRestaurantName(): Promise<string> {
    return this.getText(this.selectedRestaurantName);
  }

  async selectFoodItem(foodItem: string): Promise<void> {
    this.logger.info(`Selecting food item: ${foodItem}`);
    const item = this.menuItems.filter({ hasText: new RegExp(foodItem, 'i') }).first();
    await this.click(item, `Menu item: ${foodItem}`);
  }

  async setQuantity(quantity: number): Promise<void> {
    if (quantity < 1) {
      throw new Error(`Quantity must be >= 1, received ${quantity}`);
    }

    const currentText = await this.getText(this.quantityValue);
    let current = Number.parseInt(currentText, 10) || 1;

    while (current < quantity) {
      await this.click(this.quantityIncrease, 'Increase quantity');
      current += 1;
    }
    while (current > quantity) {
      await this.click(this.quantityDecrease, 'Decrease quantity');
      current -= 1;
    }

    this.logger.info('Quantity set', { quantity });
  }

  async addSelectedItemToCart(): Promise<void> {
    await this.click(this.addToCartButton, 'Add to cart');
    await this.toast.expectSuccess(/added|cart/i);
    this.logger.info('Item added to cart');
  }

  async addFoodItemToCart(foodItem: string, quantity: number): Promise<void> {
    await this.selectFoodItem(foodItem);
    await this.setQuantity(quantity);
    await this.addSelectedItemToCart();
  }

  async openCart(): Promise<void> {
    await this.header.openCart();
  }
}
