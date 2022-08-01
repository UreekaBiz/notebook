# Migration

It is quite common that the schema that defines a Firestore document needs to be changed. This change can be a gradual progression (e.g. each time the data is accessed, the accessor is responsible for updating it) or a bulk-change (e.g. walk all documents and add a new field). This feature supports the second case -- performing some update to a set of Firestore documents.

Examples are provided for clarity.
