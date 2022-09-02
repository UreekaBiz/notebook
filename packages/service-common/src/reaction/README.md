# Reaction

Reactions are a generic form of "like" or "upvote" that can be applied to any entity that has a unique document identifier. Reactions are unique per reaction-entity-user tuple, so a User can only react to an Entity once. (These tuples are stored in Firestore.) RTDB summaries are used to maintain a count of the number of Reactions per Entity.
