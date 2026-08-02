// Unit tests for renderAddButton's per-color styling
//
// Tailwind only generates CSS for class names it finds as literal strings
// during its build-time scan; `` `bg-${colorTheme}-100` `` never produces
// generated CSS no matter what colorTheme is at runtime. These tests lock in
// that the rendered class attribute contains the complete, literal utility
// classes for every color actually used in the app - see
// tests/e2e/features/card-creation.feature for the companion E2E check that
// the real build actually generates matching CSS for these classes.

import { render } from "lit-html";
import {
  renderAddButton,
  AddButtonColorTheme,
} from "../../src/components/helpers/CollectionBehavior.js";

describe("renderAddButton theme classes", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const themes: Array<{ colorTheme: AddButtonColorTheme; expectedClasses: string[] }> = [
    {
      colorTheme: "indigo",
      expectedClasses: ["bg-indigo-100", "hover:bg-indigo-200", "text-indigo-700"],
    },
    {
      colorTheme: "purple",
      expectedClasses: ["bg-purple-100", "hover:bg-purple-200", "text-purple-700"],
    },
    { colorTheme: "red", expectedClasses: ["bg-red-100", "hover:bg-red-200", "text-red-700"] },
    {
      colorTheme: "green",
      expectedClasses: ["bg-green-100", "hover:bg-green-200", "text-green-700"],
    },
    { colorTheme: "teal", expectedClasses: ["bg-teal-100", "hover:bg-teal-200", "text-teal-700"] },
  ];

  it.each(themes)(
    "renders the complete literal classes for colorTheme=$colorTheme",
    ({ colorTheme, expectedClasses }) => {
      render(
        renderAddButton({
          onClick: () => {},
          testId: "add-test-button",
          colorTheme,
          ariaLabel: "Add",
        }),
        container
      );

      const button = container.querySelector('[data-testid="add-test-button"]');
      expect(button).toBeTruthy();
      for (const cls of expectedClasses) {
        expect(button!.className).toContain(cls);
      }
    }
  );
});
