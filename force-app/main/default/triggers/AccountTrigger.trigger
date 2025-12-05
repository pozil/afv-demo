trigger AccountTrigger on Account(before insert, before update) {
  for (Account acct : Trigger.new) {
    // Prevent saving accounts with a shipping state length greater than 2
    if (acct.ShippingState?.length() > 2) {
      acct.addError('Shipping State Length exceeds maximum allowed');
    }
  }
}
