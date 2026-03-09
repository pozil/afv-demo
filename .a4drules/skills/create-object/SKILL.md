---
name: create-object
description: This skills helps to create metadata for custom objects.
---

# create-object

When creating metadata for custom objects follow these rules.

## Steps

- If there's a `name` or `title` field in the new object, use the standard `Name` field.
- Create XML files for all of the fields of the object except `Name`.
- When working with master-details relationships:
  - use `ControlledByParent` for the `sharingModel` on the field that points to the master object.
  - use `ControlledByParent` for the `externalSharingModel` of the child object of the relationship
- Create a layout for the object in `force-app/main/default/layouts`.
- When preparing `relatedLists` fields for layouts, only include fields that belong to the current object or the related object.
- Create a custom tab for the object.
- For the tab's `motif` field, always use `Custom57: Building Block`.
- Create a permission set that grants read/write access to all objects/fields that are created.
- When working on permission sets, Master-Detail fields are required by default and don't need explicit field permissions.
