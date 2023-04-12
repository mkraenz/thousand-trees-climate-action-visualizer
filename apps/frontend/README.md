# Thousand Trees - Climate Action Visualizer

Godot + Networking + Webdev (auth) + AWS (Serverless?)

Canvas + Webdev + AWS
Phaser 3
Godot (maybe even 3D) - limited responsiveness

Save user data + login (?auth0 or cognito) +

Value Proposition:
**Make my climate action visible.**

**Epic**:

As a User caring about the environment,
I want to track the number of trees I've sponsored
by planting a virtual forest
so that I stay motivated for further climate action.

Questions:

- How do I track C02 reductions?

1000 trees planted Miroshige Senbonzakura Kankyou Hozen Kikin - Miroshige 1000 Cherry blossoms Environmental Protection Fund

Constraints:

- Trees in the forest should be somewhat recognizable (and not just a random assortment)
- web-enabled
- publically available (anyone can sign up and use)
- responsive
- forest should be scalable -> scrollable?

Not necessary

- to track the planting position or kind of each tree

## Implementation Guidelines

- Prototype!

## MVP 1 - forest in the current browser

- [x] User can insert how many trees additionally got planted
  - [x] -> number input field + Add button
- [x] inserted number of trees gets saved (in the browser / local storage)
- [x] autogenerate coords for each tree and save + load
- [x] when opening app again, trees get loaded
- [x] when adding trees, they dynamically get added to the forest
  - [x] use react context API
  - [x] reintegrate with localstorage
- [x] trees get shown on page as a table
- [x] deploy

Implementation:

- NextJS + Chakra UI

### MVP 2 - save to the cloud

- [x] User can authenticate
- [x] planted trees gets saved _in the cloud_ -> only the ones after the user signed up. everything before is gone
- [x] load from the cloud

Implementation:

- use a framework like nextjs
- use AWS Cognito or auth0 or keycloak
- Serverless API for setting the number of trees
  - if using Cognito, consider AWS Api Gateway Cognito Authorizer

alternative (probably not the best):

- generate a long-lived token (aka api key) for the user on the backend
- save the token
- send the token (or as a link) to the user via email
- user uses email link to access her forest

User -> API GW -> Cognito JWT validation -> API GW -> (Lambda) -> DynamoDB -> Api GW -> User
maybe skip lambda by using a Api Gateway Service Integration directly to DynamoDb instead

## MVP 3 - draw forest

- _draw_ the forest

Implementation:

- maybe on canvas with <https://konvajs.org/>

## Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Deployment

- NextJS app is automatically deployed on Vercel on every push to `main`
- AWS Resources are managed using SAM. Deploy with `sam build && sam deploy --parameter-overrides $(xargs --arg-file .sam.env)`. Make sure `.sam.env` is up to date. Look at `.sam.env.example` for an example.

## AWS DynamoDB - Database

### About

- [Docs](https://aws.amazon.com/dynamodb/)
- NoSQL serverless database
- has free tier
- supports JSON storage
- very fast (if designed properly)
- designing for DynamoDB can be complicated -> [Single Table Design](https://www.alexdebrie.com/posts/dynamodb-single-table/)
- non-standard query model (no SQL)
- max item size of 400 KB
- How do you query stuff? Answer: You use partition key (Hash key, primary key) + sort key (range key, secondary key).

## Our Model

```log
partition key: user id
sort key: shard id (e.g. 1, 2, 3, 4, 5, ...)
```

## How to talk to DynamoDB

- could use [AWS SDK](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-examples.html) but it's very manual and annoying
- instead use [OneTable](https://doc.onetable.io/start/quick-tour/) (ORM for DynamoDB)

## Sign Up Flow

```log
frontend
-> cognito
    -> sign up
    -> confirm sign up
    -> redirect to frontend
-> frontend calls /api/me which returns `user: null`
-> call POST /api/createMe with the current trees of the user, which creates the user in dynamoDB and syncs the app state
```

## Syncing local storage to the cloud

- [x] if user is signed out, use local storage
- [x] if user is signed in, use the database (never use local storage)
- [x] on sign-up, write local storage to the database (if local storage is valid)

### Get the Cognito Auth URL for login / logout

```sh
aws cloudformation describe-stacks --stack-name thousand-trees \
    --query 'Stacks[0].Outputs[?OutputKey==`HostedUi`].OutputValue' \
    --output text
```

## Acknowledgements

Big shoutout to [Kenneys.nl](https://www.kenney.nl/assets/foliage-pack) for the free foliage assets!

## Development

### Internationalization and Localization

i18n = internationalization
l10n = localization

What i18n encompasses in the extreme case (we are only concerned with a subset of this list in this project):

- translate strings
  - i18next, react-i18next, next-i18next
  - accessibility strings
- date formats, number formats, telephone numbers, currency
  - Intl, payment provider-specific solutions
- Right-to-Left
- Non-alphabetical languages
- i18n/l10n for backend
  - transactional emails
  - privacy policies -> several different links to different versions
- icons, emojis
- page titles, meta tags

#### Lokalise

Upload the common.json file to lokalise:

```sh
lokalise2 \
    --token MY_TOKEN \
    --project-id 294027006436e9a71250c4.14064017 \
    file upload \
    --file ./public/locales/en/common.json \
    --lang-iso en
```

Download translation files from lokalise:

```sh
lokalise2 \
    --token MY_TOKEN \
    --project-id 294027006436e9a71250c4.14064017 \
    file download \
    --format json \
    --unzip-to ./public/locales
```
