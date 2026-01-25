// Unit tests for AttackItem edit functionality
/* global HTMLTextAreaElement */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/dom";
import { render } from "lit-html";
import { AttackItem } from "../../src/components/AttackItem.js";
import { Attack } from "../../src/types/character.js";

describe("AttackItem - Edit Functionality", () => {
  let container: HTMLElement;
  let updateSpy: (updated: Attack) => void;
  const sampleAttack: Attack = {
    name: "Sword Attack",
    damage: 4,
    modifier: 1,
    range: "Immediate",
    notes: "Sharp blade",
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    updateSpy = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render with edit button", () => {
    const item = new AttackItem(sampleAttack, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("attack-edit-button-0");
    expect(editButton).toBeTruthy();
  });

  it("should open modal when edit button is clicked", () => {
    const item = new AttackItem(sampleAttack, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("attack-edit-button-0");
    fireEvent.click(editButton);

    expect(screen.getByTestId("card-modal-backdrop")).toBeTruthy();
    expect(screen.getByTestId("card-edit-modal")).toBeTruthy();
  });

  it("should display all editable fields in modal", () => {
    const item = new AttackItem(sampleAttack, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("attack-edit-button-0");
    fireEvent.click(editButton);

    const nameInput = screen.getByTestId("edit-attack-name") as HTMLInputElement;
    const damageInput = screen.getByTestId("edit-attack-damage") as HTMLInputElement;
    const modifierInput = screen.getByTestId("edit-attack-modifier") as HTMLInputElement;
    const rangeInput = screen.getByTestId("edit-attack-range") as HTMLInputElement;
    const notesInput = screen.getByTestId("edit-attack-notes") as HTMLTextAreaElement;

    expect(nameInput.value).toBe("Sword Attack");
    expect(damageInput.value).toBe("4");
    expect(modifierInput.value).toBe("1");
    expect(rangeInput.value).toBe("Immediate");
    expect(notesInput.value).toBe("Sharp blade");
  });

  it("should update attack when changes are confirmed", () => {
    const item = new AttackItem(sampleAttack, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("attack-edit-button-0");
    fireEvent.click(editButton);

    const nameInput = screen.getByTestId("edit-attack-name") as HTMLInputElement;
    const damageInput = screen.getByTestId("edit-attack-damage") as HTMLInputElement;

    fireEvent.input(nameInput, { target: { value: "Axe Attack" } });
    fireEvent.input(damageInput, { target: { value: "6" } });

    const confirmButton = screen.getByTestId("card-modal-confirm");
    fireEvent.click(confirmButton);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    const updatedAttack = (updateSpy as any).mock.calls[0][0];
    expect(updatedAttack.name).toBe("Axe Attack");
    expect(updatedAttack.damage).toBe(6);
  });

  it("should not update attack when cancelled", () => {
    const item = new AttackItem(sampleAttack, 0, updateSpy);
    render(item.render(), container);

    const editButton = screen.getByTestId("attack-edit-button-0");
    fireEvent.click(editButton);

    const nameInput = screen.getByTestId("edit-attack-name") as HTMLInputElement;
    fireEvent.input(nameInput, { target: { value: "Changed Name" } });

    const cancelButton = screen.getByTestId("card-modal-cancel");
    fireEvent.click(cancelButton);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(screen.queryByTestId("card-modal-backdrop")).toBeNull();
  });
});
