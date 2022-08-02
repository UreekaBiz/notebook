# Hashtags

Hashtags are 'created' by incrementing their occurrence count on their summaries:
* `incrementHashtagOccurrence()`
* `decrementHashtagOccurrence()`
* `updateHashtagOccurrences()`

When a Hashtag Summary is created then an on-create trigger is fired which creates a corresponding Hashtag in the Firestore 'ledger'.