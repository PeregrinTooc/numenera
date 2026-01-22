import { Page, Locator } from "@playwright/test";

/**
 * DOM Helper utilities for testing
 * Provides semantic methods for interacting with elements via data-testid attributes
 */
export class DOMHelpers {
  constructor(private page: Page) {}

  /**
   * Get element by data-testid attribute
   * @param testId - The value of the data-testid attribute
   * @returns Playwright Locator for the element
   */
  getByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * Check if element has a specific CSS class
   * @param testId - The data-testid of the element
   * @param className - The class name to check for
   * @returns True if the element has the class, false otherwise
   */
  async hasClass(testId: string, className: string): Promise<boolean> {
    const element = this.getByTestId(testId).first();
    const classes = await element.getAttribute("class");
    return classes?.includes(className) ?? false;
  }

  /**
   * Check if element is visible in the viewport
   * @param testId - The data-testid of the element
   * @returns True if visible, false otherwise
   */
  async isVisible(testId: string): Promise<boolean> {
    return await this.getByTestId(testId).isVisible();
  }

  /**
   * Check if element is hidden (not visible)
   * @param testId - The data-testid of the element
   * @returns True if hidden, false otherwise
   */
  async isHidden(testId: string): Promise<boolean> {
    return await this.getByTestId(testId).isHidden();
  }

  /**
   * Get the value of an HTML attribute
   * @param testId - The data-testid of the element
   * @param attr - The attribute name
   * @returns The attribute value or null if not found
   */
  async getAttribute(testId: string, attr: string): Promise<string | null> {
    return await this.getByTestId(testId).getAttribute(attr);
  }

  /**
   * Check if element has a specific attribute
   * @param testId - The data-testid of the element
   * @param attr - The attribute name to check for
   * @returns True if attribute exists, false otherwise
   */
  async hasAttribute(testId: string, attr: string): Promise<boolean> {
    const value = await this.getAttribute(testId, attr);
    return value !== null;
  }

  /**
   * Get the text content of an element
   * @param testId - The data-testid of the element
   * @returns The text content as a string
   */
  async getText(testId: string): Promise<string> {
    const text = await this.getByTestId(testId).textContent();
    return text ?? "";
  }

  /**
   * Count elements matching a testid pattern
   * Useful for counting collections like cypher-item, artifact-item, etc.
   * @param testIdPattern - The pattern to match (prefix)
   * @returns The count of matching elements
   */
  async count(testIdPattern: string): Promise<number> {
    return await this.page.locator(`[data-testid^="${testIdPattern}"]`).count();
  }

  /**
   * Get computed CSS style property value
   * Useful for responsive testing and layout verification
   * @param testId - The data-testid of the element
   * @param property - The CSS property name (e.g., 'display', 'flex-direction')
   * @returns The computed style value or null if not found
   */
  async getComputedStyle(testId: string, property: string): Promise<string | null> {
    return await this.getByTestId(testId).evaluate((el, prop) => {
      // eslint-disable-next-line no-undef
      return getComputedStyle(el).getPropertyValue(prop);
    }, property);
  }

  /**
   * Check if element has a data attribute with a specific value
   * Useful for checking empty state markers, item types, etc.
   * @param testId - The data-testid of the element
   * @param dataAttr - The data attribute name (without 'data-' prefix)
   * @param expectedValue - The expected value (optional, checks existence if not provided)
   * @returns True if the data attribute matches, false otherwise
   */
  async hasDataAttribute(
    testId: string,
    dataAttr: string,
    expectedValue?: string
  ): Promise<boolean> {
    const value = await this.getAttribute(testId, `data-${dataAttr}`);
    if (expectedValue === undefined) {
      return value !== null;
    }
    return value === expectedValue;
  }

  /**
   * Get all elements matching a testid pattern
   * @param testIdPattern - The pattern to match (prefix)
   * @returns Array of Locators
   */
  getAllByTestIdPattern(testIdPattern: string): Locator {
    return this.page.locator(`[data-testid^="${testIdPattern}"]`);
  }
}
