# @Ureeka/Notebook | Firebase

This project encompasses all Firebase functionality (Firestore/RTDB rules, Indexes, Storage, etc) for the Notebook project.

The top-level `package.json` should have all of the functions necessary to install and deploy the Firebase rules, storage, etc. (If there are any omissions then they should be added).

## Setup

# Firestore Rules

Firestore/RTDB rules are applied by running the following:

```bash
npm run database-rules
npm run firestore-rules

# or
npm run rules
```

# Firestore Indexes

Firestore indexes are applied by running the following:

```bash
npm run indexes
```

# Firestore Hosting

Firestore hosting is contained within the `web` package.