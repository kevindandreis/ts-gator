# ts-gator

A TypeScript-based RSS feed aggregator CLI. Collect and browse your favorite RSS feeds from the terminal.

## Prerequisites

- **Node.js** (v20+ recommended)
- **PostgreSQL** database

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure CLI**:
   Create a `.gatorconfig.json` file in your home directory (`~/.gatorconfig.json`).
   Example content:
   ```json
   {
     "db_url": "postgres://username:password@localhost:5432/ts_gator",
     "current_user_name": "your_username"
   }
   ```
   *Note: If you run it locally, you can also have it in the root of the project.*

3. **Database Migrations**:
   Run the migrations to set up your database schema:
   ```bash
   npm run migrate
   ```

## Running the CLI

Use `npm start` followed by the command you want to run:

```bash
npm start <command> [args...]
```

## Available Commands

Here are some of the key commands you can use:

- `register <username>`: Register a new user and set them as the current user.
- `login <username>`: Set an existing user as the current user.
- `addfeed <name> <url>`: Add a new feed to follow.
- `feeds`: List all feeds.
- `follow <url>`: Follow a feed.
- `following`: List all followed feeds for the current user.
- `unfollow <url>`: Unfollow a feed.
- `agg <duration>`: Start the feed aggregator (e.g., `agg 10s`, `agg 1m`).
- `browse [limit]`: Browse the latest posts for the current user (e.g., `browse 5`).
- `users`: List all registered users.
- `reset`: Delete all users from the database.

## Development

- `npm run generate`: Generate new migrations based on schema changes.
- `npm run migrate`: Apply migrations to the database.
# ts-gator
