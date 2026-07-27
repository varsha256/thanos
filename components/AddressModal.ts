import type { Locator, Page } from '@playwright/test';
import type { AddressData } from '../data/models/BookingData';
import { BasePage } from '../pages/BasePage';
import { Logger } from '../utils/Logger';

/**
 * Delivery address selection / entry modal.
 */
export class AddressModalComponent extends BasePage {
  private readonly modal: Locator;
  private readonly savedAddressList: Locator;
  private readonly addNewAddressButton: Locator;
  private readonly labelInput: Locator;
  private readonly line1Input: Locator;
  private readonly line2Input: Locator;
  private readonly cityInput: Locator;
  private readonly stateInput: Locator;
  private readonly zipInput: Locator;
  private readonly landmarkInput: Locator;
  private readonly saveButton: Locator;
  private readonly confirmButton: Locator;
  private readonly closeButton: Locator;

  constructor(page: Page, logger?: Logger) {
    super(page, logger?.child('AddressModal') ?? new Logger('AddressModal'));
    this.modal = page.getByTestId('address-modal');
    this.savedAddressList = page.getByTestId('saved-address-list');
    this.addNewAddressButton = page.getByRole('button', { name: /add (new )?address/i });
    this.labelInput = page.getByTestId('address-label');
    this.line1Input = page.getByTestId('address-line1');
    this.line2Input = page.getByTestId('address-line2');
    this.cityInput = page.getByTestId('address-city');
    this.stateInput = page.getByTestId('address-state');
    this.zipInput = page.getByTestId('address-zip');
    this.landmarkInput = page.getByTestId('address-landmark');
    this.saveButton = page.getByRole('button', { name: /save address/i });
    this.confirmButton = page.getByRole('button', { name: /deliver here|confirm address|use this address/i });
    this.closeButton = page.getByTestId('address-modal-close');
  }

  async waitUntilOpen(): Promise<void> {
    await this.waitForVisible(this.modal);
  }

  async selectSavedAddress(label: string): Promise<void> {
    await this.waitUntilOpen();
    const addressCard = this.savedAddressList.getByTestId(`address-card-${label.toLowerCase()}`);
    const fallback = this.savedAddressList.getByText(new RegExp(label, 'i')).first();
    const target = (await addressCard.count()) > 0 ? addressCard : fallback;
    await this.click(target, `Saved address: ${label}`);
    await this.click(this.confirmButton, 'Confirm delivery address');
    await this.waitForHidden(this.modal);
    this.logger.info('Delivery address selected', { label });
  }

  async addAndSelectAddress(address: AddressData): Promise<void> {
    await this.waitUntilOpen();
    await this.click(this.addNewAddressButton, 'Add new address');
    await this.fill(this.labelInput, address.label, 'Address label');
    await this.fill(this.line1Input, address.line1, 'Address line 1');
    if (address.line2) {
      await this.fill(this.line2Input, address.line2, 'Address line 2');
    }
    await this.fill(this.cityInput, address.city, 'City');
    await this.fill(this.stateInput, address.state, 'State');
    await this.fill(this.zipInput, address.zipCode, 'Zip code');
    if (address.landmark) {
      await this.fill(this.landmarkInput, address.landmark, 'Landmark');
    }
    await this.click(this.saveButton, 'Save address');
    await this.click(this.confirmButton, 'Confirm delivery address');
    await this.waitForHidden(this.modal);
    this.logger.info('New delivery address saved and selected', { label: address.label });
  }

  async close(): Promise<void> {
    if (await this.isVisible(this.closeButton)) {
      await this.click(this.closeButton, 'Close address modal');
    }
  }
}
