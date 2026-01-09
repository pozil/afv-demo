public with sharing class AccountController {
  /**
   * @description Retrieves a list of recently modified accounts for display in Lightning components
   * @return List<Account> A list of up to 5 recently modified Account records with basic information
   */
  @AuraEnabled(cacheable=true)
  public static List<Account> getRecentAccounts() {
    return [
      SELECT Id, Name, Phone, Website, LastModifiedDate
      FROM Account
      WITH USER_MODE
      ORDER BY LastViewedDate DESC
      LIMIT 5
    ];
  }
}
