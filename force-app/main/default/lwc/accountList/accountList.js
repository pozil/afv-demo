import { LightningElement, wire } from "lwc";
import getAccounts from "@salesforce/apex/AccountController.getAccounts";

export default class AccountList extends LightningElement {
  accounts;
  error;

  @wire(getAccounts)
  wiredAccounts({ error, data }) {
    if (data) {
      this.accounts = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.accounts = undefined;
      console.error("Error retrieving accounts:", error);
    }
  }

  get hasAccounts() {
    return this.accounts && this.accounts.length > 0;
  }

  get hasError() {
    return this.error;
  }
}
