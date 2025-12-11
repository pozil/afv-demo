/**
 * @description Controller class for handling Account-related operations in Lightning Web Components
 * @author Salesforce Developer
 * @date 2025
 */
public with sharing class AccountController {
  /**
   * @description Retrieves a list of accounts for display in Lightning components
   * @return List<Account> A list of up to 5 Account records with basic information
   */
  @AuraEnabled
  public static List<Account> getAccounts() {
    return [
      SELECT Id, Name, Phone, Website
      FROM Account
      WITH USER_MODE
      LIMIT 5
    ];
  }
}
