/**
 * @description Test class for AccountController
 * @author Salesforce Developer
 * @date 2025
 */
@IsTest
private class AccountControllerTest {
  /**
   * @description Test setup method to create test data
   */
  @TestSetup
  static void setupTestData() {
    // Create test accounts
    List<Account> testAccounts = new List<Account>();
    for (Integer i = 1; i <= 10; i++) {
      testAccounts.add(
        new Account(
          Name = 'Test Account ' + i,
          Phone = '555-000-000' + i,
          Website = 'https://testaccount' + i + '.com'
        )
      );
    }

    Database.insert(testAccounts, AccessLevel.USER_MODE);
  }

  /**
   * @description Test getAccounts method returns correct data
   */
  @IsTest
  static void testGetAccountsReturnsData() {
    // Given: Test data is set up

    // When: Calling getAccounts method
    Test.startTest();
    List<Account> result = AccountController.getAccounts();
    Test.stopTest();

    // Then: Should return maximum 5 accounts with expected fields
    Assert.areEqual(5, result.size(), 'Should return maximum 5 accounts');

    for (Account acc : result) {
      Assert.isNotNull(acc.Id, 'Account Id should not be null');
      Assert.isNotNull(acc.Name, 'Account Name should not be null');
      Assert.isTrue(
        acc.Name.startsWith('Test Account'),
        'Account Name should start with Test Account'
      );
    }
  }

  /**
   * @description Test getAccounts method with no data
   */
  @IsTest
  static void testGetAccountsWithNoData() {
    // Given: Delete all test accounts
    List<Account> accountsToDelete = [SELECT Id FROM Account WITH USER_MODE];
    Database.delete(accountsToDelete, AccessLevel.USER_MODE);

    // When: Calling getAccounts method
    Test.startTest();
    List<Account> result = AccountController.getAccounts();
    Test.stopTest();

    // Then: Should return empty list
    Assert.areEqual(
      0,
      result.size(),
      'Should return empty list when no accounts exist'
    );
  }

  /**
   * @description Test getAccounts method returns all required fields
   */
  @IsTest
  static void testGetAccountsReturnsRequiredFields() {
    // Given: Test data is set up

    // When: Calling getAccounts method
    Test.startTest();
    List<Account> result = AccountController.getAccounts();
    Test.stopTest();

    // Then: Should return accounts with all required fields populated
    Assert.isTrue(result.size() > 0, 'Should return at least one account');

    Account testAccount = result[0];
    Assert.isNotNull(testAccount.Id, 'Id field should be populated');
    Assert.isNotNull(testAccount.Name, 'Name field should be populated');
    Assert.isNotNull(testAccount.Phone, 'Phone field should be populated');
    Assert.isNotNull(testAccount.Website, 'Website field should be populated');
  }

  /**
   * @description Test getAccounts method respects LIMIT clause
   */
  @IsTest
  static void testGetAccountsRespectsLimit() {
    // Given: More than 5 test accounts exist (created in @TestSetup)

    // When: Calling getAccounts method multiple times
    Test.startTest();
    List<Account> firstCall = AccountController.getAccounts();
    List<Account> secondCall = AccountController.getAccounts();
    Test.stopTest();

    // Then: Should consistently return maximum 5 accounts
    Assert.areEqual(5, firstCall.size(), 'First call should return 5 accounts');
    Assert.areEqual(
      5,
      secondCall.size(),
      'Second call should return 5 accounts'
    );
  }

  /**
   * @description Test getAccounts method with bulk data scenario
   */
  @IsTest
  static void testGetAccountsBulkScenario() {
    // Given: Create additional bulk test data
    List<Account> bulkAccounts = new List<Account>();
    for (Integer i = 11; i <= 100; i++) {
      bulkAccounts.add(
        new Account(
          Name = 'Bulk Test Account ' + i,
          Phone = '555-100-000' + Math.mod(i, 10),
          Website = 'https://bulktestaccount' + i + '.com'
        )
      );
    }
    Database.insert(bulkAccounts, AccessLevel.USER_MODE);

    // When: Calling getAccounts method
    Test.startTest();
    List<Account> result = AccountController.getAccounts();
    Test.stopTest();

    // Then: Should still return only 5 accounts despite large dataset
    Assert.areEqual(
      5,
      result.size(),
      'Should return exactly 5 accounts even with bulk data'
    );
  }

  /**
   * @description Test getAccounts method runs in user mode (security test)
   */
  @IsTest
  static void testGetAccountsUserModeExecution() {
    // Given: Create test user with limited permissions
    Profile standardProfile = [
      SELECT Id
      FROM Profile
      WHERE Name = 'Standard User'
      LIMIT 1
    ];
    User testUser = new User(
      FirstName = 'Test',
      LastName = 'User',
      Email = 'testuser@example.com',
      Username = 'testuser' + System.currentTimeMillis() + '@example.com',
      Alias = 'tuser',
      TimeZoneSidKey = 'America/New_York',
      LocaleSidKey = 'en_US',
      EmailEncodingKey = 'UTF-8',
      LanguageLocaleKey = 'en_US',
      ProfileId = standardProfile.Id
    );
    insert testUser;

    // When: Running as test user
    System.runAs(testUser) {
      Test.startTest();
      List<Account> result = AccountController.getAccounts();
      Test.stopTest();

      // Then: Method should execute without system mode privileges
      Assert.isNotNull(
        result,
        'Result should not be null when running as standard user'
      );
    }
  }
}
