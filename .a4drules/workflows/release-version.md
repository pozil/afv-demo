# Release Version Worflow

## Assumptions

- This workflow applies to the current repository.
- The git CLI (`git`) and the GitHub CLI (`gh`) are already installed.
- All versions use Semantic Versioning convention.

## Instructions

1. **Check for local repository changes**

   Make sure that there are no local changes to the git repository and that everthing has been pushed with this command:

   ```sh
   git status
   ```

   If there are some uncommited changes, abort the workflow.

1. **Get remote repository's latest release**

   Retrieve the latest released version of the repository with this command:

   ```sh
   PAGER= gh release list --json tagName,isLatest --jq '.[] | select(.isLatest)|.tagName'
   ```

1. **Get local project's version**

   Get the local `version` value from the `package.json` file.

1. **Determine new version details**

   If the local version is smaller or identical to the remote version, ask for the new release's type before proceeding: major, minor or patch.

   Ask the user for the version title (`VERSION_TITLE`).

1. **Increase local project version**

   Update the `package.json` file with the new version.
   Commit and push the change.

1. **Create new GitHub release**

   Create the GitHub release with this command where `VERSION_NUMBER` is the new version number:

   ```sh
   gh release create VERSION_NUMBER --title VERSION_TITLE --generate-notes
   ```
