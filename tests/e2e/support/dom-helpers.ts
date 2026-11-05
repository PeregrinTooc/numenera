import { Page, Locator } from "@playwright/test";

export class DOMHelpers {
  constructor(private page: Page) {}

  getByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  async hasClass(testId: string, className: string): Promise<boolean> {
    const element = this.getByTestId(testId).first();
    const classes = await element.getAttribute("class");
    return classes?.includes(className) ?? false;
  }

  async isVisible(testId: string): Promise<boolean> {
    return await this.getByTestId(testId).isVisible();
  }

  async isHidden(testId: string): Promise<boolean> {
    return await this.getByTestId(testId).isHidden();
  }

  async getAttribute(testId: string, attr: string): Promise<string | null> {
    return await this.getByTestId(testId).getAttribute(attr);
  }

  async hasAttribute(testId: string, attr: string): Promise<boolean> {
    const value = await this.getAttribute(testId, attr);
    return value !== null;
  }

  async getText(testId: string): Promise<string> {
    const text = await this.getByTestId(testId).textContent();
    return text ?? "";
  }

  async count(testIdPattern: string): Promise<number> {
    return await this.page.locator(`[data-testid^="${testIdPattern}"]`).count();
  }

  async getComputedStyle(testId: string, property: string): Promise<string | null> {
    return await this.getByTestId(testId).evaluate((el, prop) => {
      // eslint-disable-next-line no-undef
      return getComputedStyle(el).getPropertyValue(prop);
    }, property);
  }

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

  getAllByTestIdPattern(testIdPattern: string): Locator {
    return this.page.locator(`[data-testid^="${testIdPattern}"]`);
  }

  static async getComputedBackgroundColor(element: Locator): Promise<string> {
    return await element.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
  }

  static async getComputedBorderColor(element: Locator): Promise<string> {
    return await element.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });
  }

  static async getComputedBorderRadius(element: Locator): Promise<string> {
    return await element.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
  }

  static async getComputedBoxShadow(element: Locator): Promise<string> {
    return await element.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
  }

  static async findEquipmentItemByName(page: Page, name: string): Promise<Locator> {
    const items = await page.locator(".equipment-item").all();
    for (const item of items) {
      const nameEl = item.locator(".equipment-name");
      const text = await nameEl.textContent();
      if (text?.trim() === name) {
        return item;
      }
    }
    throw new Error(`Equipment item with name "${name}" not found`);
  }
}
