import { LightningElement, wire, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import getRecentAccounts from "@salesforce/apex/AccountController.getRecentAccounts";

export default class RecentAccountList extends NavigationMixin(
  LightningElement
) {
  accounts;
  error;
  @track isDetailedView = true;

  @wire(getRecentAccounts)
  wiredRecentAccounts({ error, data }) {
    if (data) {
      this.accounts = data.map((account) => ({
        ...account,
        formattedLastModified: this.formatDate(account.LastModifiedDate)
      }));
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.accounts = undefined;
      console.error(JSON.stringify(error));
    }
  }

  /**
   * @description Checks if accounts are available to display
   * @returns {boolean} True if accounts exist and array is not empty
   */
  get hasAccounts() {
    return this.accounts && this.accounts.length > 0;
  }

  /**
   * @description Checks if there's an error to display
   * @returns {boolean} True if error exists
   */
  get hasError() {
    return this.error;
  }

  /**
   * @description Determines if the component is in compact view mode
   * @returns {boolean} True if in compact view
   */
  get isCompactView() {
    return !this.isDetailedView;
  }

  /**
   * @description Gets the appropriate icon for the view toggle button
   * @returns {string} Icon name for current view state
   */
  get viewToggleIcon() {
    return this.isDetailedView ? "utility:list" : "utility:tile_card_list";
  }

  /**
   * @description Gets the alternative text for the view toggle button
   * @returns {string} Alt text for accessibility
   */
  get viewToggleAltText() {
    return this.isDetailedView
      ? "Switch to compact view"
      : "Switch to detailed view";
  }

  /**
   * @description Gets the title text for the view toggle button
   * @returns {string} Title text for button hover
   */
  get viewToggleTitle() {
    return this.isDetailedView
      ? "Switch to compact view"
      : "Switch to detailed view";
  }

  /**
   * @description Formats a date for display
   * @param {string} dateString The date string to format
   * @returns {string} Formatted date string
   */
  formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  }

  /**
   * @description Handles click on account name to navigate to account record page
   * @param {Event} event The click event
   */
  handleAccountClick(event) {
    event.preventDefault();
    const accountId = event.target.dataset.accountId;

    if (accountId) {
      this[NavigationMixin.Navigate]({
        type: "standard__recordPage",
        attributes: {
          recordId: accountId,
          objectApiName: "Account",
          actionName: "view"
        }
      });
    }
  }

  /**
   * @description Handles the view toggle button click to switch between detailed and compact views
   * @param {Event} event The click event
   */
  handleViewToggle(event) {
    event.preventDefault();
    this.isDetailedView = !this.isDetailedView;
  }
}
