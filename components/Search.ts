import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { Logger } from '../utils/Logger';

/**
 * Global restaurant / food search widget.
 */
export class SearchComponent extends BasePage {
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly suggestionList: Locator;
  private readonly clearButton: Locator;

  constructor(page: Page, logger?: Logger) {
    super(page, logger?.child('Search') ?? new Logger('Search'));
    this.searchInput = page.getByTestId('search-input');
    this.searchButton = page.getByTestId('search-submit');
    this.suggestionList = page.getByTestId('search-suggestions');
    this.clearButton = page.getByTestId('search-clear');
  }

  async search(query: string): Promise<void> {
    this.logger.info(`Searching for: ${query}`);
    await this.clearAndFill(this.searchInput, query, 'Search input');
    await this.click(this.searchButton, 'Search submit');
  }

  async searchAndSelectSuggestion(query: string, suggestionText: string): Promise<void> {
    await this.clearAndFill(this.searchInput, query, 'Search input');
    await this.waitForVisible(this.suggestionList);
    const suggestion = this.suggestionList.getByRole('option', {
      name: new RegExp(suggestionText, 'i'),
    });
    await this.click(suggestion, `Suggestion: ${suggestionText}`);
  }

  async clear(): Promise<void> {
    if (await this.isVisible(this.clearButton)) {
      await this.click(this.clearButton, 'Clear search');
    }
  }
}
