# Simplify onboarding for new users

## Scenarios

First time visiting the page:

a. user opens page for the first time, immediately signs up, and gets redirected to the page.

- Expected: system creates the user, empty trees. Show empty forest.  
  b. user opens page for the first time, adds trees, then signs up, and gets redirected to the page.
- Expected: save trees to local storage on add trees (if not signed in), then signup, then create the user together with the trees from local storage.  
  c. user opens page for the first time, adds trees, closes page. Later, opens the page again.
- Expected: show the trees from local storage.

Multiple times visiting the page:

a. user opens page for the second or later time, is signed in, and has trees. - Expected: show the trees from the database.
b. user opens page for the second or later time, is not signed in, and has trees in local storage. - Expected: show the trees from local storage. - same as first-time scenario c.
c. user opens page for the second or later time, is not signed in, (may add trees) and has no trees in local storage, then signs up. - Expected: same as first-time scenario a or b
d. user opens page for the second or later time, is signed in, and has trees, adds trees. - Expected: save trees to database
e. user opens page for the second or later time, is signed in, and has trees, signs out. - Expected: show empty forest, clear local storage
f. user opens page for the second or later time, is not signed in, adds trees, then signs in (to existing account with trees). - Expected: lose the state (DECIDED) but warn the user that n trees have been found locally that are not on the server (characterized by being logged in but local storage not being empty)

## Learnings

- a) on sign up
  - [x] try read trees from local storage and create user+trees in database,
- b) on sign out
  - [ ] show empty forest
- c) not signed in, add trees
  - [ ] render new trees
  - [ ] write all trees to local storage
- d) (empty local storage), signed in, add trees
  - render new trees
  - write trees to database
- e) not signed in, add trees, sign in
  - render trees from database (if not empty, otherwise same as `on sign up`)
  - warn the user that n trees created before sign-in have been lost
- f) not signed in
  - [ ] try render trees from local storage

Question: What happens if we get signed out automatically? - for now, same as e) - maybe in the future, if trees from local storage and from database are identical (deep-equal), then no need to warn the user

### Invariant

when signed in, local storage does not matter at all (except for sign up for a few seconds)
when signed in, local storage is never written to

In general,
signed out uses local storage
signed in uses database (and never local storage)
sign up writes local storage to database
