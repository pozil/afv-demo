# Release Version Workflow

## Assumptions

- This workflow applies to the current repository.
- The git CLI (`git`) and the GitHub CLI (`gh`) are already installed.
- All versions use Semantic Versioning convention.

## Instructions

1. **Check for local repository changes**

   Make sure that there are no local changes to the git repository and that everything has been pushed with this command:

   ```sh
   git status
   ```

   If there are some uncommitted changes, abort the workflow.

1. **Get remote repository's latest release**

   Retrieve the latest released version of the repository with this command:

   ```sh
   PAGER= gh release list --json tagName,isLatest --jq '.[] | select(.isLatest)|.tagName'
   ```

1. **Get local project's version**

   Get the local `version` value from the `package.json` file.

1. **Determine new version**

   If the local version is smaller or identical to the remote version, ask for the new release's type before proceeding: major, minor or patch.
   Based on the release type, determine the new release version (`RELEASE_VERSION`) by following semantic versioning.

1. **Determine release title**

   Ask the user for the new release's title (`RELEASE_TITLE`).

1. **Increase local project version**

   Update the `package.json` file with the new version.
   Commit and push the change.

1. **Create GitHub release**

   Create the GitHub release with this command (replace `RELEASE_VERSION` and `RELEASE_TITLE` with the previously collected values):

   ```sh
   gh release create RELEASE_VERSION --title RELEASE_TITLE --generate-notes
   ```
