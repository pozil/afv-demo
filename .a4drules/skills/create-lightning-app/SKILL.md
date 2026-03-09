---
name: create-lightning-app
description: This skills create a custom lightning App.
---

# create-lightning-app

The skill creates a custom lightning App with the related metadata (flexipages, tabs and permission set).

## Usage

This skill is to be used when the user wants to create an app.

## Steps

1. Ask the user for the app name if its not provided.

1. Ask the user to which permission set the new app should be added.

1. Ask the user for the LWC to include if not provided.

1. Check that the metadata of each selected LWC satisfies these conditions and if not, update them:
   1. `exposed` is set to `true`
   1. `target` includes one or more of these values: `lightning__HomePage` or `lightning__AppPage`

1. Create two flexipages files under `force-app/main/default/flexipages`
   1. The first flexipage is for the app's home page. This is where LWCs will be added.

      This is a sample home page flexipage that holds a custom `c_sample` LWC:

      ```xml
      <?xml version="1.0" encoding="UTF-8" ?>
      <FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
          <flexiPageRegions>
              <itemInstances>
                  <componentInstance>
                      <componentName>sample</componentName>
                      <identifier>c_sample</identifier>
                  </componentInstance>
              </itemInstances>
              <name>main</name>
              <type>Region</type>
          </flexiPageRegions>
          <masterLabel>Sample App</masterLabel>
          <template>
              <name>flexipage:defaultAppHomeTemplate</name>
          </template>
          <type>AppPage</type>
      </FlexiPage>
      ```

   1. The second flexipage is for the app's utility bar. It must be present even if we don't use an utility bar.

      This is a sample utility bar flexipage:

      ```xml
      <?xml version="1.0" encoding="UTF-8" ?>
      <FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
          <flexiPageRegions>
              <name>utilityItems</name>
              <type>Region</type>
          </flexiPageRegions>
          <flexiPageRegions>
              <name>backgroundComponents</name>
              <type>Background</type>
          </flexiPageRegions>
          <masterLabel>Sample App UtilityBar</masterLabel>
          <template>
              <name>one:utilityBarTemplateDesktop</name>
              <properties>
                  <name>isLeftAligned</name>
                  <value>true</value>
              </properties>
          </template>
          <type>UtilityBar</type>
      </FlexiPage>
      ```

1. Create a custom tab file under `force-app/main/default/tabs`

   This is a sample tab:

   ```xml
   <?xml version="1.0" encoding="UTF-8" ?>
   <CustomTab xmlns="http://soap.sforce.com/2006/04/metadata">
       <description>Created by Lightning App Builder</description>
       <flexiPage>Sample_App</flexiPage>
       <label>Sample App</label>
       <motif>Custom50: Big top</motif>
   </CustomTab>
   ```

1. Create an application file under `force-app/main/default/applications`

   This is a sample application file:

   ```xml
   <?xml version="1.0" encoding="UTF-8" ?>
   <CustomApplication xmlns="http://soap.sforce.com/2006/04/metadata">
       <brand>
           <headerColor>#0070D2</headerColor>
           <shouldOverrideOrgTheme>false</shouldOverrideOrgTheme>
       </brand>
       <description>Sample app description.</description>
       <formFactors>Small</formFactors>
       <formFactors>Large</formFactors>
       <isNavAutoTempTabsDisabled>false</isNavAutoTempTabsDisabled>
       <isNavPersonalizationDisabled>false</isNavPersonalizationDisabled>
       <isNavTabPersistenceDisabled>false</isNavTabPersistenceDisabled>
       <isOmniPinnedViewEnabled>false</isOmniPinnedViewEnabled>
       <label>Sample App</label>
       <navType>Standard</navType>
       <tabs>Sample_App_Home</tabs>
       <uiType>Lightning</uiType>
       <utilityBar>Sample_App_UtilityBar</utilityBar>
   </CustomApplication>
   ```

1. Add the app and its tabs to the target permission set.
