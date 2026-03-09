---
name: data-import
description: Use this skill to import data with the Salesforce CLI.
---

# data-import

Follow these steps to import data in Salesforce using the Salesforce CLI `data import tree` command.

## Steps

1. For each object that is part of the import, prepare a JSON data file in the `/data` folder.

   For example, if there's a `Product_Family__c` object, create a `Product_Family__cs.json` data file like this:

   ```json
   {
     "records": [
       {
         "attributes": {
           "type": "Product_Family__c",
           "referenceId": "DynamoRef"
         },
         "Name": "Dynamo",
         "Description__c": "Performance and reliability. The best choice for hobbyists and enthusiasts.",
         "Category__c": "Mountain"
       }
     ]
   }
   ```

   If there are related objects, make sure to use reference IDs.

   For example, this is a related sample `Product_Family__cs.json` data file:

   ```json
   {
     "records": [
       {
         "attributes": {
           "type": "Product__c",
           "referenceId": "Product__cRef1"
         },
         "Name": "FUSE X1",
         "Product_Family__c": "@DynamoRef",
         "MSRP__c": 2500,
         "Level__c": "Beginner"
       }
     ]
   }
   ```

   Note how the `referenceId` field from the product family record with value `DynamoRef` is used as `@DynamoRef` in `Product_Family__c` field of the product record.

1. Build a data plan file that include links to the data files.

   This is a sample `data-plan.json` data plan file:

   ```json
   [
     {
       "sobject": "Product_Family__c",
       "saveRefs": true,
       "files": ["Product_Family__cs.json"]
     },
     {
       "sobject": "Product__c",
       "resolveRefs": true,
       "files": ["Product__cs.json"]
     }
   ]
   ```

1. Use the Salesforce CLI to import the data plan:
   ```sh
   sf data import tree --plan data-plan.json
   ```
