---
name: data-import
description: Import data in Salesforce. Use when importing multiple records from related or unrelated objects.
---

# data-import

This skill imports data from multiple related or unrelated records in Salesforce using the Salesforce CLI `sf data import tree` command. This relies on building a JSON data plan that links to one or several JSON data files ahead of the import.

## Rules

- Don't ask which org to use. Use the project's default org unless the user specifies another org.
- Consider that the local metadata (object, fields and picklist values) is up to date with what is on the org.
- Do not propose to modify the metadata unless explicitely asked to by the user. For example, don't try to create External ID fields on the objects.
- Don't prompt the user for confirmation when creating JSON data files or JSON plan files under `/data`.
- When working with Salesforce compound fields like addresses, split the data in the right compound sub-fields (street, city, state...) without asking for confirmation.
- Do not ask for deduplication preferences.

## Steps

1. Identify the objects that are included in the import.

1. Identify the fields of the target objects.

1. For each object that is part of the import, prepare a JSON data file in the `/data` folder of the project.

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

   If there are related objects, use `referenceId` values in the data file.

   For example, this is a `Product__cs.json` data file that contains a `Product__c` record related to the `Product_Family__c` record from the previous file:

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

   Note how the `Product__c.Product_Family__c` field points to the `Product_Family__c` record with `@DynamoRef` (`@` symbol followed by the `referenceId` value).

1. Build a data plan file that include links to the data files.

   This is a sample `data-plan.json` data plan file that includes the data files for the `Product_Family__c` and `Product__c` records:

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

   Note how the `Product_Family__c` saves reference IDs thanks to a `saveRefs` attribute set to `true` and how `Product__c` resolves saved references thanks to a `resolveRefs` attribute set to `true`.

1. Use the Salesforce CLI to import the data plan:
   ```sh
   sf data import tree --plan data-plan.json
   ```
