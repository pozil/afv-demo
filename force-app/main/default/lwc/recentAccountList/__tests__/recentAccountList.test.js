import { createElement } from "lwc";
import RecentAccountList from "c/recentAccountList";
import { getNavigateCalledWith } from "lightning/navigation";
import getRecentAccounts from "@salesforce/apex/AccountController.getRecentAccounts";

// Mock NavigationMixin to capture the page reference passed to Navigate
jest.mock("lightning/navigation", () => {
  let navigateArgs;
  const Navigate = Symbol("Navigate");
  const NavigationMixin = (Base) =>
    class extends Base {
      [Navigate](pageReference, replace) {
        navigateArgs = { pageReference, replace };
      }
    };
  NavigationMixin.Navigate = Navigate;
  return {
    NavigationMixin,
    getNavigateCalledWith: () => navigateArgs
  };
});

// Mock the Apex wire adapter
jest.mock(
  "@salesforce/apex/AccountController.getRecentAccounts",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

const MOCK_ACCOUNTS = [
  {
    Id: "001000000000001AAA",
    Name: "Acme Corp",
    Phone: "(555) 123-4567",
    Website: "https://acme.example.com",
    LastModifiedDate: "2026-11-10T10:00:00.000Z"
  },
  {
    Id: "001000000000002AAA",
    Name: "Globex",
    Phone: null,
    Website: null,
    LastModifiedDate: null
  }
];

const MOCK_ERROR = {
  body: { message: "An internal server error has occurred" },
  ok: false,
  status: 400,
  statusText: "Bad Request"
};

// Resolves after pending microtasks so the DOM re-renders
const flushPromises = () => Promise.resolve();

describe("c-recent-account-list", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  function createComponent() {
    const element = createElement("c-recent-account-list", {
      is: RecentAccountList
    });
    document.body.appendChild(element);
    return element;
  }

  function getToggleButton(element) {
    return element.shadowRoot.querySelector("lightning-button-icon");
  }

  describe("before data is loaded", () => {
    it("shows the empty state message", () => {
      const element = createComponent();

      expect(element.shadowRoot.textContent).toContain(
        "No recent accounts found."
      );
      expect(element.shadowRoot.querySelector('[role="alert"]')).toBeNull();
    });

    it("renders the card with the correct title and icon", () => {
      const element = createComponent();

      const card = element.shadowRoot.querySelector("lightning-card");
      expect(card.title).toBe("Recent Accounts");
      expect(card.iconName).toBe("standard:account");
    });
  });

  describe("with account data", () => {
    it("renders one tile per account in detailed view", async () => {
      const element = createComponent();
      getRecentAccounts.emit(MOCK_ACCOUNTS);
      await flushPromises();

      const tiles = element.shadowRoot.querySelectorAll("article.slds-tile");
      expect(tiles.length).toBe(MOCK_ACCOUNTS.length);

      const links = element.shadowRoot.querySelectorAll(
        "h3.slds-tile__title a"
      );
      expect(links[0].textContent.trim()).toBe("Acme Corp");
      expect(links[0].dataset.accountId).toBe(MOCK_ACCOUNTS[0].Id);
      expect(links[1].textContent.trim()).toBe("Globex");
      expect(element.shadowRoot.textContent).not.toContain(
        "No recent accounts found."
      );
    });

    it("shows phone, website and formatted last modified date when present", async () => {
      const element = createComponent();
      getRecentAccounts.emit(MOCK_ACCOUNTS);
      await flushPromises();

      const firstDetail =
        element.shadowRoot.querySelectorAll(".slds-tile__detail")[0];
      const values = Array.from(firstDetail.querySelectorAll("dd")).map((dd) =>
        dd.textContent.trim()
      );
      expect(values).toEqual([
        "(555) 123-4567",
        "https://acme.example.com",
        new Date(MOCK_ACCOUNTS[0].LastModifiedDate).toLocaleDateString()
      ]);

      const websiteLink = firstDetail.querySelector("dd a");
      expect(websiteLink.href).toBe("https://acme.example.com/");
      expect(websiteLink.target).toBe("_blank");
      expect(websiteLink.rel).toBe("noopener noreferrer");
    });

    it("hides optional fields that are empty", async () => {
      const element = createComponent();
      getRecentAccounts.emit(MOCK_ACCOUNTS);
      await flushPromises();

      const secondDetail =
        element.shadowRoot.querySelectorAll(".slds-tile__detail")[1];
      expect(secondDetail.querySelectorAll("dt").length).toBe(0);
      expect(secondDetail.querySelectorAll("dd").length).toBe(0);
    });

    it("shows the empty state when no accounts are returned", async () => {
      const element = createComponent();
      getRecentAccounts.emit([]);
      await flushPromises();

      expect(element.shadowRoot.querySelectorAll("li").length).toBe(0);
      expect(element.shadowRoot.textContent).toContain(
        "No recent accounts found."
      );
    });
  });

  describe("with an error", () => {
    it("shows the error alert and logs the error", async () => {
      const element = createComponent();
      getRecentAccounts.error(MOCK_ERROR.body, MOCK_ERROR.status);
      await flushPromises();

      const alert = element.shadowRoot.querySelector('[role="alert"]');
      expect(alert).not.toBeNull();
      expect(alert.textContent).toContain(
        "Error loading recent accounts. Please try again later."
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("clears previously loaded accounts", async () => {
      const element = createComponent();
      getRecentAccounts.emit(MOCK_ACCOUNTS);
      await flushPromises();
      expect(element.shadowRoot.querySelectorAll("li").length).toBe(2);

      getRecentAccounts.error();
      await flushPromises();

      expect(element.shadowRoot.querySelectorAll("li").length).toBe(0);
      expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
    });
  });

  describe("view toggle", () => {
    it("defaults to detailed view with the compact view toggle", () => {
      const element = createComponent();

      const button = getToggleButton(element);
      expect(button.iconName).toBe("utility:rows");
      expect(button.alternativeText).toBe("Switch to compact view");
      expect(button.title).toBe("Switch to compact view");
    });

    it("switches to compact view and back", async () => {
      const element = createComponent();
      getRecentAccounts.emit(MOCK_ACCOUNTS);
      await flushPromises();

      getToggleButton(element).click();
      await flushPromises();

      expect(element.shadowRoot.querySelector(".compact-view")).not.toBeNull();
      expect(
        element.shadowRoot.querySelectorAll("article.slds-tile").length
      ).toBe(0);
      const compactNames = Array.from(
        element.shadowRoot.querySelectorAll(".compact-view h3")
      ).map((h3) => h3.textContent.trim());
      expect(compactNames).toEqual(["Acme Corp", "Globex"]);

      const button = getToggleButton(element);
      expect(button.iconName).toBe("utility:list");
      expect(button.alternativeText).toBe("Switch to detailed view");

      button.click();
      await flushPromises();

      expect(element.shadowRoot.querySelector(".compact-view")).toBeNull();
      expect(
        element.shadowRoot.querySelectorAll("article.slds-tile").length
      ).toBe(2);
      expect(getToggleButton(element).iconName).toBe("utility:rows");
    });

    // Current behavior: the empty-state message only renders in detailed view
    it("renders no list or empty message in compact view when there are no accounts", async () => {
      const element = createComponent();
      getRecentAccounts.emit([]);
      await flushPromises();

      getToggleButton(element).click();
      await flushPromises();

      expect(element.shadowRoot.querySelector(".compact-view")).toBeNull();
      expect(element.shadowRoot.textContent).not.toContain(
        "No recent accounts found."
      );
    });
  });

  describe("navigation", () => {
    it("navigates to the account record page from detailed view", async () => {
      const element = createComponent();
      getRecentAccounts.emit(MOCK_ACCOUNTS);
      await flushPromises();

      element.shadowRoot.querySelector("h3.slds-tile__title a").click();

      const { pageReference } = getNavigateCalledWith();
      expect(pageReference).toEqual({
        type: "standard__recordPage",
        attributes: {
          recordId: MOCK_ACCOUNTS[0].Id,
          objectApiName: "Account",
          actionName: "view"
        }
      });
    });

    it("navigates to the account record page from compact view", async () => {
      const element = createComponent();
      getRecentAccounts.emit(MOCK_ACCOUNTS);
      await flushPromises();

      getToggleButton(element).click();
      await flushPromises();

      // Click the link itself so event.target carries the data attribute
      element.shadowRoot.querySelectorAll(".compact-view a")[1].click();

      const { pageReference } = getNavigateCalledWith();
      expect(pageReference.attributes.recordId).toBe(MOCK_ACCOUNTS[1].Id);
    });
  });

  describe("accessibility", () => {
    it("is accessible with account data", async () => {
      const element = createComponent();
      getRecentAccounts.emit(MOCK_ACCOUNTS);
      await flushPromises();

      await expect(element).toBeAccessible();
    });

    it("is accessible in compact view", async () => {
      const element = createComponent();
      getRecentAccounts.emit(MOCK_ACCOUNTS);
      await flushPromises();
      getToggleButton(element).click();
      await flushPromises();

      await expect(element).toBeAccessible();
    });

    it("is accessible with an error", async () => {
      const element = createComponent();
      getRecentAccounts.error();
      await flushPromises();

      await expect(element).toBeAccessible();
    });
  });
});
