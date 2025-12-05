public class accountController {
  // Get a list of 5 accounts
  @AuraEnabled
  public static List<Account> getAccounts() {
    Integer queryLimit = 5;
    return [SELECT Id, Name, Phone, Website FROM Account LIMIT 5];
  }
}
