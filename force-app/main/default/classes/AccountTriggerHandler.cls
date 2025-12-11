/**
 * @description Trigger handler class for Account object operations
 * @author Salesforce Developer
 * @date 2025
 */
public with sharing class AccountTriggerHandler {
  // Static variable to prevent recursive triggers
  private static Boolean isExecuting = false;

  /**
   * @description Main entry point for Account trigger
   * @param triggerContext The trigger context (before insert, before update, etc.)
   * @param newRecords List of new Account records
   * @param oldRecords List of old Account records (for updates)
   */
  public static void run(
    System.TriggerOperation triggerContext,
    List<Account> newRecords,
    List<Account> oldRecords
  ) {
    // Prevent recursive execution
    if (isExecuting) {
      return;
    }

    isExecuting = true;

    try {
      switch on triggerContext {
        when BEFORE_INSERT {
          handleBeforeInsert(newRecords);
        }
        when BEFORE_UPDATE {
          handleBeforeUpdate(newRecords, oldRecords);
        }
      }
    } finally {
      isExecuting = false;
    }
  }

  /**
   * @description Handles before insert operations for Account records
   * @param newRecords List of new Account records being inserted
   */
  private static void handleBeforeInsert(List<Account> newRecords) {
    validateShippingState(newRecords);
  }

  /**
   * @description Handles before update operations for Account records
   * @param newRecords List of new Account records being updated
   * @param oldRecords List of old Account records before update
   */
  private static void handleBeforeUpdate(
    List<Account> newRecords,
    List<Account> oldRecords
  ) {
    validateShippingState(newRecords);
  }

  /**
   * @description Validates that shipping state length does not exceed 2 characters
   * @param accounts List of Account records to validate
   */
  private static void validateShippingState(List<Account> accounts) {
    for (Account acct : accounts) {
      // Prevent saving accounts with a shipping state length greater than 2
      if (acct.ShippingState?.length() > 2) {
        acct.addError('Shipping State Length exceeds maximum allowed');
      }
    }
  }
}
