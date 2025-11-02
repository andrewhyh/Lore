# Remaining Features: F-008 through F-012

---

## Feature F-008: External Platform Integrations

**Priority:** P2 (Nice to Have)  
**Status:** Post-MVP  
**Dependencies:** F-001 (Authentication)  
**Estimated Effort:** 3-4 weeks

### Overview
Link external accounts (Google Photos, Facebook, Instagram, iCloud) to import photos and sync contacts.

### Requirements
- **F-008.1:** Link external accounts (Discord-style)
- **F-008.2:** Import photos from linked accounts
- **F-008.3:** Sync contacts for easier invitations
- **F-008.4:** Display linked accounts on profile

### Technical Implementation
- OAuth integrations for each platform
- Next.js API routes for OAuth callbacks
- Background jobs for photo imports (BullMQ)
- Rate limiting for API calls

### Database Schema
```sql
CREATE TABLE external_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- google_photos, facebook, instagram, icloud
  platform_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  UNIQUE(user_id, platform)
);
```

### API Endpoints
```typescript
POST   /api/integrations/:platform/connect    // Start OAuth flow
POST   /api/integrations/:platform/disconnect // Disconnect account
POST   /api/integrations/:platform/import     // Import photos
GET    /api/integrations                      // List connected accounts
```

---

## Feature F-009: Offline Mode & PWA

**Priority:** P1 (Should Have)  
**Status:** MVP  
**Dependencies:** None  
**Estimated Effort:** 1-2 weeks

### Overview
Progressive Web App with offline capabilities for viewing cached content and queuing actions.

### Requirements
- **F-009.1:** PWA capabilities (installable)
- **F-009.2:** Offline viewing of cached content
- **F-009.3:** Queue actions when offline (upload, create post)
- **F-009.4:** Offline indicator in UI
- **F-009.5:** Background sync when reconnected

### Technical Implementation
- Next.js service worker with Workbox
- IndexedDB for offline storage
- Background Sync API for queued actions
- Cache-first strategy for media

### Service Worker Configuration
```typescript
// next.config.js with next-pwa
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

### Manifest (manifest.json)
```json
{
  "name": "Lore - Family Archive",
  "short_name": "Lore",
  "description": "Preserve and share your family history",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Feature F-010: Search & Discovery

**Priority:** P1 (Should Have)  
**Status:** MVP  
**Dependencies:** F-002 (Trees), F-003 (Timeline)  
**Estimated Effort:** 2 weeks

### Overview
Global search across people, posts, media, and trees with advanced filters.

### Requirements
- **F-010.1:** Global search (people, posts, media, trees)
- **F-010.2:** Advanced filters (date, type, tree, members)
- **F-010.3:** Search suggestions as user types
- **F-010.4:** Recent searches history
- **F-010.5:** Save search queries
- **F-010.6:** Public tree discovery (opt-in)

### Technical Implementation
- PostgreSQL full-text search with tsvector
- Debounced search API calls (300ms)
- Search index materialized views

### Database Schema
```sql
-- Search History
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result_count INTEGER,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Searches
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search indexes (already added in other features)
CREATE INDEX idx_posts_search ON timeline_posts 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

CREATE INDEX idx_members_search ON tree_members 
  USING gin(to_tsvector('english', name || ' ' || COALESCE(bio, '')));
```

### API Endpoints
```typescript
GET    /api/search?q={query}&type={type}&filters={filters}
GET    /api/search/suggestions?q={query}
GET    /api/search/history
POST   /api/search/save
GET    /api/discover/trees    // Browse public trees
```

---

## Feature F-011: Privacy & Security

**Priority:** P0 (Must Have)  
**Status:** MVP  
**Dependencies:** All features  
**Estimated Effort:** Ongoing (2 weeks initial)

### Overview
Comprehensive privacy controls and security measures including RLS, data export, and content moderation.

### Requirements
- **F-011.1:** Row Level Security on all tables
- **F-011.2:** Privacy settings per tree (public, link-only, private)
- **F-011.3:** Privacy settings per post
- **F-011.4:** Block users from trees
- **F-011.5:** Report inappropriate content
- **F-011.6:** Data export (GDPR compliance)
- **F-011.7:** Data deletion (right to be forgotten)
- **F-011.8:** Audit logs for sensitive actions

### Database Schema
```sql
-- Blocked Users
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  blocker_id UUID REFERENCES auth.users(id),
  blocked_id UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tree_id, blocker_id, blocked_id)
);

-- Content Reports
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES auth.users(id),
  content_type TEXT NOT NULL, -- post, comment, member, tree
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, actioned, dismissed
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- created, updated, deleted, exported, etc.
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

### Data Export Format (GDPR)
```json
{
  "export_date": "2025-01-15T00:00:00Z",
  "user": {
    "id": "...",
    "email": "...",
    "profile": {...}
  },
  "trees": [...],
  "posts": [...],
  "media": [...],
  "comments": [...]
}
```

---

## Feature F-012: Admin Dashboard

**Priority:** P2 (Nice to Have)  
**Status:** Post-MVP  
**Dependencies:** F-011 (Security)  
**Estimated Effort:** 2-3 weeks

### Overview
Internal admin dashboard for user management, content moderation, and analytics.

### Requirements
- **F-012.1:** User management (view, suspend, delete)
- **F-012.2:** Content moderation queue
- **F-012.3:** Analytics dashboard (users, storage, subscriptions)
- **F-012.4:** Feature flags for gradual rollouts
- **F-012.5:** System health monitoring

### Database Schema
```sql
-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  role TEXT NOT NULL, -- super_admin, moderator, support
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 0, -- 0-100
  user_whitelist UUID[], -- Specific users who get access
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Metrics (materialized view)
CREATE MATERIALIZED VIEW system_metrics AS
SELECT
  (SELECT COUNT(*) FROM auth.users) AS total_users,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') AS paid_users,
  (SELECT SUM(total_bytes) FROM storage_usage) AS total_storage_used,
  (SELECT COUNT(*) FROM trees) AS total_trees,
  (SELECT COUNT(*) FROM timeline_posts) AS total_posts
WITH DATA;

REFRESH MATERIALIZED VIEW system_metrics;
```

### API Endpoints (Admin Only)
```typescript
GET    /api/admin/users                   // List all users
PUT    /api/admin/users/:id/suspend       // Suspend user
DELETE /api/admin/users/:id               // Delete user
GET    /api/admin/reports                 // Content moderation queue
PUT    /api/admin/reports/:id/action      // Take action on report
GET    /api/admin/analytics               // System analytics
POST   /api/admin/feature-flags           // Update feature flag
```

### Admin Dashboard Layout
```
┌─────────────────────────────────────────┐
│  Lore Admin                             │
├─────────────────────────────────────────┤
│  Overview                               │
│  ┌─────────┐ ┌─────────┐ ┌───────────┐│
│  │ 10,234  │ │  1,456  │ │   523GB   ││
│  │  Users  │ │  Paid   │ │  Storage  ││
│  └─────────┘ └─────────┘ └───────────┘│
│                                         │
│  Recent Activity                        │
│  - User signup spike (+20%)             │
│  - 3 new content reports                │
│  - Storage at 65%                       │
│                                         │
│  [Moderation Queue]  [Analytics]        │
└─────────────────────────────────────────┘
```

---

## Summary Table

| Feature ID | Name | Priority | Status | Effort |
|------------|------|----------|--------|--------|
| F-008 | External Integrations | P2 | Post-MVP | 3-4 weeks |
| F-009 | Offline Mode & PWA | P1 | MVP | 1-2 weeks |
| F-010 | Search & Discovery | P1 | MVP | 2 weeks |
| F-011 | Privacy & Security | P0 | MVP | 2 weeks + ongoing |
| F-012 | Admin Dashboard | P2 | Post-MVP | 2-3 weeks |

---

## Implementation Order

### Phase 1: MVP (Weeks 1-12)
1. F-001: Authentication (Weeks 1-2)
2. F-002: Family Tree (Weeks 3-6)
3. F-003: Timeline (Weeks 7-9)
4. F-004: Cloud Storage (Weeks 10-11)
5. F-011: Privacy & Security (Ongoing)
6. F-009: PWA (Week 12)
7. F-010: Search (Week 12)

### Phase 2: Enhanced MVP (Weeks 13-18)
1. F-005: Community Feed (Weeks 13-14)
2. F-006: AI Assistant (Weeks 15-17)
3. F-007: Subscriptions (Week 18)

### Phase 3: Post-MVP (Weeks 19+)
1. F-008: External Integrations
2. F-012: Admin Dashboard
3. Native mobile apps (React Native)
4. Advanced features from future enhancements

---

## Notes

- All features depend on F-011 (Security) being implemented properly
- F-009 (PWA) is critical for mobile users - prioritize in MVP
- F-010 (Search) is expected by users - include in MVP
- F-008 and F-012 can wait until post-MVP
- Consider soft-launching features with feature flags (F-012)