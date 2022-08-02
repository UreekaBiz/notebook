# Hashtags

Unlike other features, Hashtags are defined in the RTDB to allow for an occurrence count to be maintained (a popularity measure). When a new RTDB Hashtag (Summary) is created then an on-write trigger is used to create a 'ledger' of them in Firestore.