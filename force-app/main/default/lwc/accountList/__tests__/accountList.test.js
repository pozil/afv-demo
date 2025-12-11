import { createElement } from "@lwc/engine-dom";
import AccountList from "c/accountList";
import getAccounts from "@salesforce/apex/AccountController.getAccounts";

// Mock data
const mockAccountsData = [
  {
    Id: "0010000000001",
    Name: "Acme Corporation",
    Phone: "(555) 123-4567",
    Website: "https://www.acme.com"
  },
  {
    Id: "0010000000002",
    Name: "Global Industries",
    Phone: "(555) 987-6543",
    Website: "https://www.global.com"
  },
  {
    Id: "0010000000003",
    Name: "Tech Solutions",
    Phone: null,
    Website: null
  }
];

const mockError = {
  body: { message: "An error occurred" },
  ok: false,
  status: 400,
  statusText: "Bad Request"
};

// Mock the wire adapter
jest.mock(
  "@salesforce/apex/AccountController.getAccounts",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return { default: createApexTestWireAdapter(jest.fn()) };
  },
  { virtual: true }
);

// Utility function for async operations
async function flushPromises() {
  return Promise.resolve();
}

describe("c-account-list", () => {
  afterEach(() => {
    // Clean up DOM and mocks
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  describe("Wire Adapter - Data States", () => {
    it("renders accounts when data is returned", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit(mockAccountsData);
      await flushPromises();

      // Assert - Check card title and icon
      const card = element.shadowRoot.querySelector("lightning-card");
      expect(card.title).toBe("Accounts");
      expect(card.iconName).toBe("standard:account");

      // Assert - Check accounts list is rendered
      const accountsList = element.shadowRoot.querySelector(
        ".slds-has-dividers_around-space"
      );
      expect(accountsList).not.toBeNull();

      // Assert - Check correct number of account items
      const accountItems = element.shadowRoot.querySelectorAll("li.slds-item");
      expect(accountItems).toHaveLength(3);

      // Assert - Verify first account details
      const firstAccountName = accountItems[0].querySelector(
        ".slds-text-heading_small"
      );
      expect(firstAccountName.textContent.trim()).toBe("Acme Corporation");

      const firstAccountPhone = accountItems[0].querySelector(
        ".slds-text-body_small"
      );
      expect(firstAccountPhone.textContent.trim()).toBe("(555) 123-4567");

      const firstAccountWebsite = accountItems[0].querySelector("a");
      expect(firstAccountWebsite.href).toBe("https://www.acme.com/");
      expect(firstAccountWebsite.target).toBe("_blank");
      expect(firstAccountWebsite.rel).toBe("noopener noreferrer");
    });

    it('renders "No accounts found" when empty data is returned', async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit([]);
      await flushPromises();

      // Assert - Check no accounts message
      const noAccountsMessage = element.shadowRoot.querySelector(
        ".slds-text-color_weak"
      );
      expect(noAccountsMessage).not.toBeNull();
      expect(noAccountsMessage.textContent.trim()).toBe("No accounts found.");

      // Assert - Accounts list should not be rendered
      const accountsList = element.shadowRoot.querySelector(
        ".slds-has-dividers_around-space"
      );
      expect(accountsList).toBeNull();

      // Assert - Error message should not be rendered
      const errorMessage =
        element.shadowRoot.querySelector(".slds-alert_error");
      expect(errorMessage).toBeNull();
    });

    it("renders error message when wire adapter returns error", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.error(mockError);
      await flushPromises();

      // Assert - Check error panel is displayed
      const errorPanel = element.shadowRoot.querySelector(".slds-alert_error");
      expect(errorPanel).not.toBeNull();
      expect(errorPanel.getAttribute("role")).toBe("alert");

      const errorHeading = errorPanel.querySelector("h2");
      expect(errorHeading.textContent.trim()).toBe(
        "Error loading accounts. Please try again later."
      );

      // Assert - Assistive text for screen readers
      const assistiveText = errorPanel.querySelector(".slds-assistive-text");
      expect(assistiveText.textContent.trim()).toBe("Error");

      // Assert - Accounts list should not be rendered
      const accountsList = element.shadowRoot.querySelector(
        ".slds-has-dividers_around-space"
      );
      expect(accountsList).toBeNull();

      // Assert - No accounts message is rendered due to lwc:else structure
      // The lwc:else is paired with lwc:if={hasAccounts}, so when hasAccounts is false (due to error),
      // the "No accounts found" message shows alongside the error message
      const noAccountsMessage = element.shadowRoot.querySelector(
        ".slds-text-color_weak"
      );
      expect(noAccountsMessage).not.toBeNull();
      expect(noAccountsMessage.textContent.trim()).toBe("No accounts found.");
    });
  });

  describe("Conditional Rendering Logic", () => {
    it("handles accounts with missing phone and website gracefully", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit(mockAccountsData);
      await flushPromises();

      // Assert - Check third account (has null phone and website)
      const accountItems = element.shadowRoot.querySelectorAll("li.slds-item");
      const thirdAccount = accountItems[2];

      const accountName = thirdAccount.querySelector(
        ".slds-text-heading_small"
      );
      expect(accountName.textContent.trim()).toBe("Tech Solutions");

      // Phone and website should not be rendered when null
      const phoneElements = thirdAccount.querySelectorAll(
        ".slds-text-body_small"
      );
      const websiteElements = thirdAccount.querySelectorAll("a");
      expect(phoneElements).toHaveLength(0);
      expect(websiteElements).toHaveLength(0);
    });

    it("renders phone when present", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit([
        {
          Id: "001test",
          Name: "Test Account",
          Phone: "(555) 000-0000",
          Website: null
        }
      ]);
      await flushPromises();

      // Assert
      const phoneElement = element.shadowRoot.querySelector(
        ".slds-text-body_small"
      );
      expect(phoneElement).not.toBeNull();
      expect(phoneElement.textContent.trim()).toBe("(555) 000-0000");
    });

    it("renders website link when present", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit([
        {
          Id: "001test",
          Name: "Test Account",
          Phone: null,
          Website: "https://test.example.com"
        }
      ]);
      await flushPromises();

      // Assert
      const websiteLink = element.shadowRoot.querySelector("a");
      expect(websiteLink).not.toBeNull();
      expect(websiteLink.href).toBe("https://test.example.com/");
      expect(websiteLink.textContent.trim()).toBe("https://test.example.com");
      expect(websiteLink.target).toBe("_blank");
      expect(websiteLink.rel).toBe("noopener noreferrer");
    });
  });

  describe("Computed Properties", () => {
    it("hasAccounts getter returns true when accounts exist", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit(mockAccountsData);
      await flushPromises();

      // Assert - Verify through DOM rendering (can't access private getter directly)
      const accountsList = element.shadowRoot.querySelector(
        ".slds-has-dividers_around-space"
      );
      expect(accountsList).not.toBeNull();
    });

    it("hasAccounts getter returns false when accounts array is empty", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit([]);
      await flushPromises();

      // Assert - Verify through DOM rendering
      const noAccountsMessage = element.shadowRoot.querySelector(
        ".slds-text-color_weak"
      );
      expect(noAccountsMessage).not.toBeNull();
    });

    it("hasError getter returns true when error exists", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.error(mockError);
      await flushPromises();

      // Assert - Verify through DOM rendering
      const errorPanel = element.shadowRoot.querySelector(".slds-alert_error");
      expect(errorPanel).not.toBeNull();
    });
  });

  describe("Accessibility", () => {
    it("is accessible when accounts are displayed", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit(mockAccountsData);
      await flushPromises();

      // Assert
      await expect(element).toBeAccessible();
    });

    it("is accessible when no accounts are found", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit([]);
      await flushPromises();

      // Assert
      await expect(element).toBeAccessible();
    });

    it("is accessible when error state is displayed", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.error(mockError);
      await flushPromises();

      // Assert
      await expect(element).toBeAccessible();
    });

    it("has proper ARIA attributes for error state", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.error(mockError);
      await flushPromises();

      // Assert
      const errorPanel = element.shadowRoot.querySelector(".slds-alert_error");
      expect(errorPanel.getAttribute("role")).toBe("alert");

      const assistiveText = errorPanel.querySelector(".slds-assistive-text");
      expect(assistiveText.textContent).toBe("Error");
    });
  });

  describe("Component Structure", () => {
    it("renders lightning-card with correct title and icon", () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });

      // Act
      document.body.appendChild(element);

      // Assert
      const card = element.shadowRoot.querySelector("lightning-card");
      expect(card).not.toBeNull();
      expect(card.title).toBe("Accounts");
      expect(card.iconName).toBe("standard:account");
    });

    it("applies correct CSS classes for layout", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit(mockAccountsData);
      await flushPromises();

      // Assert
      const list = element.shadowRoot.querySelector("ul");
      expect(list.classList.contains("slds-has-dividers_around-space")).toBe(
        true
      );

      const items = element.shadowRoot.querySelectorAll("li");
      items.forEach((item) => {
        expect(item.classList.contains("slds-item")).toBe(true);
        expect(item.classList.contains("slds-p-around_small")).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined accounts gracefully", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit(undefined);
      await flushPromises();

      // Assert - Should show "No accounts found" message
      const noAccountsMessage = element.shadowRoot.querySelector(
        ".slds-text-color_weak"
      );
      expect(noAccountsMessage).not.toBeNull();
      expect(noAccountsMessage.textContent.trim()).toBe("No accounts found.");
    });

    it("handles null accounts gracefully", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      document.body.appendChild(element);

      // Act
      getAccounts.emit(null);
      await flushPromises();

      // Assert - Should show "No accounts found" message
      const noAccountsMessage = element.shadowRoot.querySelector(
        ".slds-text-color_weak"
      );
      expect(noAccountsMessage).not.toBeNull();
      expect(noAccountsMessage.textContent.trim()).toBe("No accounts found.");
    });

    it("handles accounts with missing required fields", async () => {
      // Arrange
      const element = createElement("c-account-list", {
        is: AccountList
      });
      const incompleteAccounts = [
        { Id: "001test", Name: "Test Account" }, // Missing Phone and Website
        { Id: "002test" } // Missing Name
      ];
      document.body.appendChild(element);

      // Act
      getAccounts.emit(incompleteAccounts);
      await flushPromises();

      // Assert
      const accountItems = element.shadowRoot.querySelectorAll("li.slds-item");
      expect(accountItems).toHaveLength(2);

      // First account should render with name
      const firstAccountName = accountItems[0].querySelector(
        ".slds-text-heading_small"
      );
      expect(firstAccountName.textContent.trim()).toBe("Test Account");

      // Second account should handle missing name gracefully
      const secondAccountName = accountItems[1].querySelector(
        ".slds-text-heading_small"
      );
      expect(secondAccountName.textContent.trim()).toBe("");
    });
  });
});
