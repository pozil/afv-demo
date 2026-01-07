trigger AccountTrigger on Account(before insert, before update) {
  AccountTriggerHandler.run(Trigger.operationType, Trigger.new, Trigger.old);
}
