# Label

Labels are optionally-public collections of Notebooks that optionally have a specific order. A Notebook may be associated with zero or more Labels.

(Full disclosure: this feature might be more aptly named 'Collection' but that name poses challenges given the use of Firestore whose primary grouping of Documents is called 'Collection'.)

## Naming

Labels are *not* uniquely named -- meaning that two different Labels may have the exact same name. This was chosen for a few reasons:
* There's no name constraints on Notebooks so it seemed congruent to apply the same constraint (or lack thereof) to Collections
* Renaming is always challenging when there are uniqueness constraints on names. (Ex: "A" and "B". If the names need to be swapped then one of them needs to first be renamed to something other than "A" or "B". It's just an extra step.)

## Visibility

Labels can be either Public or Private. Public Labels are visible to any User on the internet (via either the Creator's homepage or a Published Notebook associated with the Label). Private Labels are only visible to the creator (`createdBy`) of that Label. Making a Label Public or Private has no impact on the Notebooks associated with that Label. (Specifically, making a Label Public does *not* Publish unpublished Notebooks associated with the Label nor does making a Label Private unpublish any Published Notebooks.)

In keeping with Notebook's notion of 'Published', a Public Label is considered to be Published.

## Permissions

Permissions associated with Labels *WILL* (future requirement / functionality) affect the Notebooks associated with the Label and not the Label itself. Specifically, if a User is in the list of Editors then that does *not* mean that that User can edit the Label itself. (Think about if there should be two different sets of Permissions.)

## Notebooks

Zero or more Notebooks may be associated with a Label. Notebooks are ordered in the order in which they are added. If the Label is marked as 'ordered' then the User may reorder the Notebooks. The numeric order of the Notebooks is sparse (*not* dense).

Labels that are Public are associated with only those Notebooks that are associated with the Label that are Published. If an associated Notebook is unpublished then that Notebook is removed from the _Published_ Label's collection of Notebooks (but it remains in the Label's ordered collection).

### Notebook Visibility

Due to the fact that view-ability (the Share state) of a Notebook is fluid, a User that has no visibility to a Notebook *may* add that Notebook to a Label. More specifically (since there would be no way for a User that cannot view a Notebook to know about the presence of that Notebook), if a User can view a Notebook and adds that Notebook to a Label then later the User loses that visibility then the Notebook will still be in the list of Notebooks associated with the Label. This allows for the case where the User then later regains visibility to that Notebook then the Notebook will be associated with the Label.

Note: the only case that needs to be addressed is that there is an upper-bound on the number of Notebooks associated with Labels. If those slots are being taken up by Notebooks that are not visible to the User then the User should be notified in some way (e.g. via a "Notebook not accessible" indicator?) so that they can remove the Notebook from the Label.

### Notebook Permissions (Future)

Labels have Notebook permissions are associated with them. Editor takes precedence over Viewer. Permissions are determined by looking at the permissions on the Notebook itself as well as the set of all LabelNotebooks to which the Notebook is associated.

A User with whom a Notebook is shared *cannot* view (or know the existence of) Labels that are not *explicitly* shared with them. In other words, only the share roles of a Label determine whether or not a User may view (or know the existence of) that Label.

With Firestore, two things need to be considered:
1. Firestore Rules: For a given Notebook and User, a Rule needs to determine if the User can view, edit or neither the Notebook. Since there is a limit of 10 document reads per Rule, it cannot be that each Label associated with a Notebook is checked (since there may be 'n' Labels associated with any given Notebook). That leaves two choices: either the set of Notebooks that each User can view / edit or the set of Users that can view / edit per Notebook.
2. Queries: Since there are no joins in Firestore, to list all Notebooks that a User can View, there needs to be a collection group that contains either all Notebooks that a User can view / edit or all Users that can view / edit a Notebook.
Bottom line: both constraints are identical.

For separation-of-concerns reasons, it feels "proper" to have a sub-collection on Notebooks that contains all of the Users that can view / edit it. This also provides an obvious way to look at a Notebook and see all of the associated User's permissions.

The challenge becomes: given 'n' Labels per Notebook in which each Label can specify 'v' Notebook viewers and 'e' Notebook editors, how is a sub-collection of Users on Notebook maintained? For each edit to the permissions on any Label or Notebook, a query is run that checks:
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
