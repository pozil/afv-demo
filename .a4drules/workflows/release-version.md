# Release Version Worflow

## Assumptions

- This workflow applies to the current repo.
- The git CLI (`git`) and the GitHub CLI (`gh`) are already installed.
- All versions use Semantic Versioning convention.

## Instructions

1. **Check for local repo changes**

   Make sure that there are no local changes to the git repo and that everthing has been pushed with this command:

   ```sh
   git status
   ```

   If there are some uncommited changes, abort the workflow.

1. **Get remote repo latest release**

   Use the GitHub CLI to retrieve the latest version of the repo:

   ```sh
   PAGER= gh release list --json tagName,isLatest --jq '.[] | select(.isLatest)|.tagName'
   ```

1. **Get the local repo version**

   Get the local `version` value from the `package.json` file.

1. **Determine new version**

   If the local version is smaller or identical to the remote version, ask for the release type before proceeding: major, minor or patch.

1. **Increase local version**

   Update the `package.json` file with the new version.
   Commit and push the change.

1. **Create the new release**

   Ask the user for the version title (`VERSION_TITLE`).
   Create the version using the GitHub CLI where `VERSION_NUMBER` us the new version number:

   ```sh
   gh release create VERSION_NUMBER --title VERSION_TITLE
   ```
