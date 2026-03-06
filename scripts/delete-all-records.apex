// Delete junction records first
delete [SELECT Id FROM Movie_Actor__c];
delete [SELECT Id FROM Movie_Director__c];

// Delete main records
delete [SELECT Id FROM Movie__c];
delete [SELECT Id FROM Actor__c];
delete [SELECT Id FROM Director__c];
