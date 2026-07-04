# BTD6 Mod Manager

A comprehensive web-based mod manager for Bloons TD 6, featuring mod browsing, searching, favorites management, and installation guides.

## Features

### Core Features
- **Mod Browser**: Browse all available mods with a responsive grid/list view toggle
- **Search & Filter**: Search mods by name and filter by category
- **Mod Details**: View detailed information about each mod including:
  - Screenshots gallery with navigation
  - Description and metadata
  - Download statistics and ratings
  - User reviews
  - Installation guide
  - Direct download links
- **User Accounts**: Create an account and manage your profile
- **Favorites**: Save your favorite mods for quick access
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Features
- **Mod Aggregation**: Sync mods from multiple sources:
  - GitHub (btd6-mod topic repositories)
  - Nexus Mods (with API integration)
- **Mod Management**: Create, update, and manage mod listings
- **Screenshots**: Add and manage multiple screenshots per mod

## Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- tRPC + React Query for API communication
- Wouter for routing
- Lucide React for icons

**Backend:**
- Express.js server
- tRPC for type-safe API
- Drizzle ORM for database management
- MySQL for data persistence

**Database Schema:**
- `users`: User accounts and authentication
- `mods`: Mod information and metadata
- `favorites`: User favorite mods
- `reviews`: User ratings and reviews
- `screenshots`: Mod screenshots and gallery

## Setup & Configuration

### Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=mysql://user:password@host/database

# Authentication
JWT_SECRET=your-secret-key
OAUTH_SERVER_URL=https://api.manus.im

# Optional: Nexus Mods API
NEXUS_MODS_API_KEY=your-nexus-api-key
```

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables in `.env.local`

3. Run database migrations:
```bash
pnpm db:push
```

4. Start the development server:
```bash
pnpm dev
```

5. Open http://localhost:3000 in your browser

## API Endpoints

### Public Endpoints

**List Mods**
```
GET /api/trpc/mods.list?input={"limit":20,"offset":0}
```

**Search Mods**
```
GET /api/trpc/mods.search?input={"query":"search term","limit":20,"offset":0}
```

**Get Mod by Category**
```
GET /api/trpc/mods.byCategory?input={"category":"Gameplay","limit":20,"offset":0}
```

**Get Mod Details**
```
GET /api/trpc/mods.detail?input={"id":1}
```

**Get Mod Reviews**
```
GET /api/trpc/mods.reviews?input={"modId":1}
```

**Get Mod Screenshots**
```
GET /api/trpc/mods.screenshots?input={"modId":1}
```

### Protected Endpoints (Requires Authentication)

**Get User Favorites**
```
GET /api/trpc/mods.favorites
```

**Add Favorite**
```
POST /api/trpc/mods.addFavorite
```

**Remove Favorite**
```
POST /api/trpc/mods.removeFavorite
```

**Add Review**
```
POST /api/trpc/mods.addReview
```

### Admin Endpoints (Requires Admin Role)

**Sync GitHub Mods**
```
POST /api/trpc/admin.syncGitHub
```

**Sync Nexus Mods**
```
POST /api/trpc/admin.syncNexus
```

**Sync All Sources**
```
POST /api/trpc/admin.syncAll
```

**Create Mod**
```
POST /api/trpc/mods.create
```

**Update Mod**
```
POST /api/trpc/mods.update
```

**Add Screenshot**
```
POST /api/trpc/mods.addScreenshot
```

**Delete Screenshot**
```
POST /api/trpc/mods.deleteScreenshot
```

## Mod Data Aggregation

### GitHub Integration

The app automatically discovers BTD6 mods from GitHub repositories tagged with `btd6-mod`. The sync process:

1. Queries GitHub API for all repositories with the `btd6-mod` topic
2. Fetches the latest release information
3. Extracts the .dll download link
4. Creates mod entries in the database

**To sync GitHub mods:**
```bash
# Via admin panel or API
POST /api/trpc/admin.syncGitHub
```

### Nexus Mods Integration

To enable Nexus Mods integration:

1. Get your API key from https://www.nexusmods.com/users/myaccount?tab=api
2. Set the `NEXUS_MODS_API_KEY` environment variable
3. Trigger a sync

**To sync Nexus mods:**
```bash
# Via admin panel or API
POST /api/trpc/admin.syncNexus
```

## Usage Guide

### For Users

1. **Browse Mods**: Visit the homepage to see all available mods
2. **Search**: Use the search bar to find specific mods
3. **Filter by Category**: Click category buttons in the sidebar
4. **View Details**: Click on a mod to see full details and screenshots
5. **Download**: Click the download button to get the mod file
6. **Add to Favorites**: Click the heart icon to save mods for later
7. **View Profile**: Click "My Profile" to see your saved favorites

### For Administrators

1. **Sync Mods**: Use the admin API endpoints to sync mods from GitHub/Nexus
2. **Manage Mods**: Create, update, or delete mod listings
3. **Add Screenshots**: Upload screenshots for mods to create galleries
4. **Monitor Activity**: Track downloads and user engagement

## Installation Guide for Players

Players can follow the installation guide displayed on each mod's detail page:

1. Download MelonLoader from melonwiki.xyz
2. Install BTD Mod Helper
3. Download the mod from the app
4. Place the .dll file in the BTD6 Mods folder
5. Launch BTD6 and enjoy!

## Development

### Project Structure

```
├── client/                 # Frontend React app
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable components
│       └── lib/          # Utilities and helpers
├── server/                # Backend Express server
│   ├── modRouter.ts      # Mod API routes
│   ├── adminRouter.ts    # Admin routes
│   ├── githubAggregator.ts  # GitHub sync logic
│   ├── nexusAggregator.ts   # Nexus sync logic
│   └── db.ts             # Database queries
├── drizzle/              # Database schema and migrations
└── shared/               # Shared types and constants
```

### Running Tests

```bash
pnpm test
```

### Building for Production

```bash
pnpm build
pnpm start
```

## Future Enhancements

- [ ] Prevent duplicate favorites at database level
- [ ] Mod-specific installation guides
- [ ] User mod recommendations based on history
- [ ] Mod compatibility checker
- [ ] Mod collections/packs
- [ ] Social features (following, sharing collections)
- [ ] Advanced filtering and sorting
- [ ] Mod update notifications
- [ ] Desktop application (Electron)
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## Disclaimer

This is a community-maintained mod manager. Bloons TD 6 is developed by Ninja Kiwi. Using mods may affect your game experience and online rankings. Use at your own risk.
