# Database schema

## User

| Field               | Type    | Notes                                                     |
| ------------------- | ------- | --------------------------------------------------------- |
| name                | String  | Required                                                  |
| email               | String  | Required, unique, lowercase                               |
| password            | String  | Required, bcrypt-hashed (12 rounds), not returned in JSON |
| role                | String  | `user` \| `manager` \| `admin` (default `user`)           |
| emailVerified       | Boolean | Default false                                             |
| verificationToken   | String  | Optional email verification (not exposed in JSON)         |
| failedLoginAttempts | Number  | For lockout                                               |
| lockUntil           | Date    | Account lock expiry                                       |
| refreshTokens       | Subdocs | Hashed refresh tokens + expiry                            |

## Todo

| Field             | Type     | Notes                                     |
| ----------------- | -------- | ----------------------------------------- |
| title             | String   | Required                                  |
| description       | String   | Optional                                  |
| status            | String   | `pending` \| `in-progress` \| `completed` |
| priority          | String   | `low` \| `medium` \| `high`               |
| priorityRank      | Number   | Derived for sorting                       |
| dueDate           | Date     | Optional                                  |
| assignedTo        | ObjectId | ref User                                  |
| assignedBy        | ObjectId | ref User                                  |
| category          | String   | Optional                                  |
| tags              | [String] | Optional                                  |
| createdBy         | ObjectId | ref User, required                        |
| completedAt       | Date     | Set when status is `completed`            |
| completed         | Boolean  | Legacy sync with `status`                 |
| assignmentHistory | Array    | `{ assignedTo, assignedBy, at }`          |

Indexes: text on `title` + `description`; compound indexes on `createdBy`, `assignedTo`, `dueDate`, `createdAt`.

## Notification

| Field         | Type     | Notes                    |
| ------------- | -------- | ------------------------ |
| userId        | ObjectId | ref User                 |
| title         | String   | Required                 |
| message       | String   | Required                 |
| read          | Boolean  | Default false            |
| type          | String   | `assignment` \| `system` |
| relatedTodoId | ObjectId | Optional ref Todo        |
