# UI Version

It is convenient to know if the latest version of the UI is running. Using Firestore's listeners, each client listens to the latest known version and compares that with the hardcoded version per client. If the versions are different, a visual indicator is shown to the user. They can optionally reload the page to get the latest version.

To keep forward compatibility in mind, this UI version is maintained within a `web` structure. This will allow the structure to possibly grow in the future with additional use cases.

# History

In order to keep a history (primarily for sanity), each change is an insert rather than an update.
