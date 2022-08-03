# Label

Labels are optionally-public collections of Notebooks that optionally have a specific order. A Notebook may be associated with zero or more Labels.

(Full disclosure: this feature might be more aptly named 'Collection' but that name poses challenges given the use of Firestore whose primary grouping of Documents is called 'Collection'.)

## Naming

Labels are *not* uniquely named -- meaning that two different Labels may have the exact same name. This was chosen for a few reasons:
* There's no name constraints on Notebooks so it seemed congruent to apply the same constraint (or lack thereof) to Collections
* Renaming is always challenging when there are uniqueness constraints on names. (Ex: "A" and "B". If the names need to be swapped then one of them needs to first be renamed to something other than "A" or "B". It's just an extra step.)

## Visibility

Labels can be either Public or Private. Public Labels are visible to any User on the internet (via either the Creator's homepage or a Published Notebook associated with the Label). Private Labels are only visible to the creator (`createdBy`). Making a Label Public or Private has no impact on the Notebooks associated with that Label. (Specifically, making a Label Public does *not* Publish unpublished Notebooks associated with the Label nor does making a Label Private unpublish any Published Notebooks.)

## Notebook Permissions

Labels have Notebook permissions are associated with them. Editor takes precedence over Viewer. Permissions are determined by looking at the permissions on the Notebook itself as well as the set of all LabelNotebooks to which the Notebook is associated.

With Firestore, two things need to be considered:
1. Firestore Rules: For a given Notebook and User, a Rule needs to determine if the User can view, edit or neither the Notebook. Since there is a limit of 10 document reads per Rule, it cannot be that each Label associated with a Notebook is checked (since there may be 'n' Labels associated with any given Notebook). That leaves two choices: either the set of Notebooks that each User can view / edit or the set of Users that can view / edit per Notebook.
2. Queries: Since there are no joins in Firestore, to list all Notebooks that a User can View, there needs to be a collection group that contains either all Notebooks that a User can view / edit or all Users that can view / edit a Notebook.
Bottom line: both constraints are identical.

For separation-of-concerns reasons, it feels "proper" to have a sub-collection on Notebooks that contains all of the Users that can view / edit it. This also provides an obvious way to look at a Notebook and see all of the associated User's permissions.

So the challenge becomes: given 'n' Labels per Notebook in which each Label can specify 'v' Notebook viewers and 'e' Notebook editors, how is a sub-collection of Users on Notebook maintained? For each edit to the permissions on any Label or Notebook, a query is run that checks:
1. If there are any Labels associated with the Notebook in which the User appears as a viewer / editor:
```TypeScript
      query(LabelNotebooks, where(notebook, '==', notebookId),
                            where(viewer / editor, 'array-contains', userId),
                            limit(1))
```
2. If the User is a viewer / editor of the Notebook itself:
```TypeScript
      query(Notebook(notebookId), where(viewer / editor, 'array-contains', userId))
```
(Check: does the `limit(1)` affect the transaction's ability to retry if *any* LabelNotebooks is changed?)
Based on the results, a User document is created or removed from the Notebook's permission sub-collection.


### Notebook Permission Use Cases

* Notebook A created by User A
* Notebook B created by User B
  - Editors: User X
  - Viewers: User Y
* Notebook C created by User B
  - Editors: User Y
* Notebook D created by User B
  - Viewers: User X

* Label L created by User A
  + Editors: User X
    - Notebook A
      => Edit: User A (Notebook creator)
    - Notebook B
      => Edit: User B (Notebook creator)
               User X (Label or Notebook)
      => View: User Y (Notebook)
    - Notebook C
      => Edit: User B (Notebook creator)
               User Y (Notebook)
               User X (Label)
    - Notebook D
      => Edit: User B (Notebook creator)
               User X (Label overrides Notebook)
  + Viewers: User X
    - Notebook A
      => Edit: User A (Notebook creator)
    - Notebook B
      => Edit: User B (Notebook creator)
               User X (Notebook)
      => View: User X (Label)
               User Y (Notebook)
    - Notebook C
      => Edit: User B (Notebook creator)
               User Y (Notebook)
      => View: User X (Label)
    - Notebook D
      => Edit: User B (Notebook creator)
      => View: User X (Label or Notebook)
