# Feature F-003: Interactive Timeline

**Priority:** P0 (Must Have)  
**Status:** MVP  
**Dependencies:** F-001 (Authentication), F-002 (Family Tree)  
**Estimated Effort:** 3-4 weeks

---

## Overview
Chronological timeline for documenting life events, memories, stories, and media tied to specific dates. Custom-built with Framer Motion for smooth animations and transitions.

---

## Requirements

### Timeline Structure
- **F-003.1:** Chronological timeline view for trees/communities
- **F-003.2:** Add timeline posts with:
  - Title, description, date
  - Photos/videos (multiple)
  - Location (optional)
  - Tagged members
- **F-003.3:** Timeline post types:
  - Life events (birth, marriage, graduation)
  - Memories/stories
  - Recipes
  - Letters/documents
  - Audio recordings
- **F-003.4:** Visual timeline with date markers
- **F-003.5:** Zoom timeline (decades → years → months)
- **F-003.6:** Filter by date range, member, or post type
- **F-003.7:** Click posts to expand full view
- **F-003.8:** Edit/delete posts (creator only)
- **F-003.9:** Comment on posts
- **F-003.10:** React to posts (like, love, etc.)

### Media Handling
- **F-003.11:** Support for images (JPEG, PNG, HEIC)
- **F-003.12:** Support for videos (MP4, MOV, max 500MB)
- **F-003.13:** Support for documents (PDF, DOCX)
- **F-003.14:** Automatic thumbnail generation
- **F-003.15:** Lazy loading for performance

---

## Technical Implementation

### Tech Stack
- **UI Framework:** Custom React components
- **Animations:** Framer Motion
- **Media Processing:** Sharp (server-side)
- **Video Transcoding:** Not implemented in MVP (future: Mux or AWS MediaConvert)
- **Database:** PostgreSQL
- **Storage:** Supabase Storage

### Database Schema
```sql
-- Timeline Posts
CREATE TABLE timeline_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  post_type TEXT DEFAULT 'memory', -- memory, event, recipe, letter, audio
  post_date DATE NOT NULL, -- The date this post is about
  location TEXT,
  privacy_level TEXT DEFAULT 'tree', -- tree, tagged_only, private
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Media
CREATE TABLE post_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES timeline_posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL, -- image, video, document, audio
  thumbnail_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  duration INTEGER, -- For video/audio in seconds
  width INTEGER, -- For images
  height INTEGER, -- For images
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Tags (which members are in this post)
CREATE TABLE post_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES timeline_posts(id) ON DELETE CASCADE,
  member_id UUID REFERENCES tree_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, member_id)
);

-- Post Reactions
CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES timeline_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL, -- like, love, celebrate, laugh
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Post Comments
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES timeline_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  parent_comment_id UUID REFERENCES post_comments(id) NULL, -- For nested replies
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_timeline_posts_tree_id ON timeline_posts(tree_id);
CREATE INDEX idx_timeline_posts_date ON timeline_posts(post_date DESC);
CREATE INDEX idx_timeline_posts_creator ON timeline_posts(creator_id);
CREATE INDEX idx_post_media_post_id ON post_media(post_id);
CREATE INDEX idx_post_tags_member_id ON post_tags(member_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);

-- Full-text search index
CREATE INDEX idx_timeline_posts_search ON timeline_posts 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- RLS Policies
ALTER TABLE timeline_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts viewable by tree members"
  ON timeline_posts FOR SELECT
  USING (
    tree_id IN (
      SELECT tree_id FROM tree_roles WHERE user_id = auth.uid()
    )
    OR 
    tree_id IN (
      SELECT id FROM trees WHERE privacy_level = 'public'
    )
  );

CREATE POLICY "Users can create posts in their trees"
  ON timeline_posts FOR INSERT
  WITH CHECK (
    tree_id IN (
      SELECT tree_id FROM tree_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own posts"
  ON timeline_posts FOR UPDATE
  USING (creator_id = auth.uid());
```

### API Endpoints
```typescript
// Posts
POST   /api/trees/:treeId/posts              // Create post
GET    /api/trees/:treeId/posts              // List posts (paginated)
GET    /api/posts/:postId                    // Get post details
PUT    /api/posts/:postId                    // Update post
DELETE /api/posts/:postId                    // Delete post

// Media
POST   /api/posts/:postId/media              // Upload media to post
DELETE /api/posts/:postId/media/:mediaId     // Remove media

// Tags
POST   /api/posts/:postId/tags               // Tag members
DELETE /api/posts/:postId/tags/:memberId     // Untag member

// Reactions
POST   /api/posts/:postId/reactions          // Add reaction
DELETE /api/posts/:postId/reactions/:type    // Remove reaction

// Comments
POST   /api/posts/:postId/comments           // Add comment
PUT    /api/comments/:commentId              // Edit comment
DELETE /api/comments/:commentId              // Delete comment
```

### Timeline Component Architecture
```typescript
// Main timeline component
<Timeline>
  <TimelineControls />        // Zoom, filter, search
  <TimelineAxis />            // Date markers and scale
  <TimelineContent>
    <TimelinePost />          // Individual post cards
    <TimelinePost />
    ...
  </TimelineContent>
  <TimelineNavigation />      // Jump to date, scroll controls
</Timeline>

// Framer Motion animations
- Entrance: Fade + slide up
- Exit: Fade + slide down
- Zoom: Smooth scale transition
- Filter: Stagger animation for filtered posts
```

---

## User Flows

### Create Post Flow
1. User clicks "Add Memory" button
2. Modal opens with form:
   - Title (required)
   - Date picker (required)
   - Description
   - Upload photos/videos (drag-drop or click)
   - Tag members (search dropdown)
   - Location (autocomplete)
   - Post type selector
3. User uploads 5 photos
4. Thumbnails generate automatically
5. User tags 3 family members
6. User clicks "Post"
7. Post appears on timeline with animation
8. Success notification shown

### View Post Flow
1. User scrolls timeline
2. Posts lazy-load as user scrolls
3. User clicks post card
4. Full-screen modal opens with:
   - Full-size media gallery
   - Complete description
   - Tagged members (clickable)
   - Comments section
   - Reaction buttons
5. User can swipe through photos
6. User adds comment or reaction
7. User closes modal

### Filter Timeline Flow
1. User clicks filter icon
2. Filter panel slides in:
   - Date range picker
   - Member selector (multi-select)
   - Post type checkboxes
3. User selects "2010-2015" and tags "Mom"
4. Timeline re-animates showing only matching posts
5. Filter chip appears above timeline
6. User can clear filter with X button

---

## UI/UX Requirements

### Timeline Layout
```
┌─────────────────────────────────────────┐
│  [Filter] [Search] [Zoom: Month ▼]     │
├─────────────────────────────────────────┤
│                                         │
│  2024 ─────────────────────────────────│
│                                         │
│  ┌─────────────────┐                   │
│  │ Dec 25, 2024    │                   │
│  │ Christmas       │                   │
│  │ [Photo] [Photo] │                   │
│  │ ❤️ 12  💬 5      │                   │
│  └─────────────────┘                   │
│                                         │
│  2023 ─────────────────────────────────│
│                                         │
│  ┌─────────────────┐                   │
│  │ Jul 4, 2023     │                   │
│  │ Family BBQ      │                   │
│  │ [Photo]         │                   │
│  │ ❤️ 8   💬 3      │                   │
│  └─────────────────┘                   │
│                                         │
└─────────────────────────────────────────┘
```

### Post Card Design
- **Compact view (default):**
  - Thumbnail (300x200px)
  - Title and date
  - Reaction count
  - Comment count
  - Tagged member avatars (max 3 shown)

- **Expanded view (click):**
  - Full-size media carousel
  - Complete description
  - All tagged members
  - Full comment thread
  - Reaction details

### Mobile Optimizations
- Swipeable post cards
- Tap to expand, swipe down to close
- Optimized image sizes (3 sizes: thumbnail, medium, full)
- Progressive image loading (blur-up)
- Video poster images (don't autoplay on mobile)

---

## Media Processing

### Image Upload Pipeline
1. Client: Resize to max 2000px width (client-side)
2. Upload to Supabase Storage
3. Server: Generate thumbnails via Sharp:
   - Thumbnail: 400x300px
   - Medium: 1000x750px
   - Original: Preserved
4. Store URLs in `post_media` table

### Video Upload Pipeline (MVP)
1. Client: Upload raw video to Supabase Storage
2. Server: Extract first frame as poster image via Sharp
3. Store video URL and poster URL
4. Note: No transcoding in MVP - users must upload web-compatible formats (MP4 H.264)

### Supported File Types
- **Images:** JPEG, PNG, HEIC, WebP, GIF
- **Videos:** MP4, MOV, WebM (max 500MB)
- **Documents:** PDF, DOCX, TXT (max 50MB)
- **Audio:** MP3, WAV, M4A (max 100MB)

---

## Timeline Zoom Levels

### Decade View
- Show year markers only
- Aggregate post counts per year
- Best for browsing long timelines (50+ years)

### Year View
- Show month markers
- Group posts by month
- Default view for most users

### Month View
- Show day markers
- Individual posts visible
- Best for detailed browsing

### Navigation
- Click year marker → jump to year view
- Click month marker → jump to month view
- Scroll wheel or pinch to zoom smoothly

---

## Validation Rules

### Post Title
- 3-200 characters
- Required field

### Post Date
- Must be valid date
- Cannot be more than 1 year in future
- Can be historical (e.g., 1900)

### Post Content
- Max 10,000 characters
- Markdown support (bold, italic, links)

### Media Upload
- Max 20 files per post
- Max 500MB per video
- Max 50MB per document
- Max 100MB per audio

### Comments
- Max 2,000 characters
- No nested replies deeper than 3 levels

---

## Performance Optimization

### Lazy Loading
- Load 20 posts initially
- Load 10 more as user scrolls
- Infinite scroll with loading indicator

### Image Optimization
- Serve WebP with JPEG fallback
- Responsive images (srcset)
- Lazy load images (Intersection Observer)
- Blur-up effect for better perceived performance

### Caching Strategy
- Cache timeline posts for 5 minutes
- Cache media URLs for 1 hour
- Invalidate cache on new post

### Database Optimization
- Paginated queries (LIMIT/OFFSET)
- Indexed date field for fast sorting
- Materialized view for post counts

---

## Acceptance Criteria

✅ Users can create posts in <1 minute  
✅ Media uploads show progress bar  
✅ Timeline scrolls smoothly (60fps) with 100+ posts  
✅ Images load progressively (blur-up effect)  
✅ Videos have poster images and don't autoplay on mobile  
✅ Tagging members is intuitive (search autocomplete)  
✅ Reactions and comments update in real-time  
✅ Filters apply instantly (<500ms)  
✅ Mobile users can swipe through photo galleries  
✅ Edit/delete works only for post creator  

---

## Accessibility

- **Alt text:** Required for all images (user-provided or AI-generated)
- **Keyboard navigation:** Arrow keys to navigate posts
- **Screen reader:** Announce post details (date, title, media count)
- **Color contrast:** All text meets WCAG AA standards
- **Focus indicators:** Clear visual focus on selected post
- **Captions:** Support for video captions (future)

---

## Testing Checklist

### Unit Tests
- [ ] Post creation validation
- [ ] Media upload handling
- [ ] Date parsing and formatting
- [ ] Filter logic

### Integration Tests
- [ ] Create post with multiple media files
- [ ] Tag members in post
- [ ] Add comments and reactions
- [ ] Filter timeline by date range
- [ ] Edit and delete posts

### E2E Tests
- [ ] Complete post creation flow
- [ ] Upload 10 photos and verify thumbnails
- [ ] Tag members and verify they appear
- [ ] Add comment and reaction
- [ ] Filter timeline and verify results

### Performance Tests
- [ ] Timeline with 500 posts loads in <3s
- [ ] Scrolling remains smooth (60fps)
- [ ] Image uploads complete successfully

---

## Error Handling

| Error | Message | Action |
|-------|---------|--------|
| Upload failed | "Upload failed. Please check your connection and try again." | Retry button |
| File too large | "Video must be under 500MB. Please compress and try again." | Show guide link |
| Invalid date | "Please enter a valid date." | Highlight field |
| No title | "Please add a title for this memory." | Focus title field |
| Media processing failed | "We're processing your media. It may take a few minutes." | Show in queue |

---

## Success Metrics

- Posts created per user per month: >5
- Average media per post: >2
- Comments per post: >1
- Timeline views per week: >10
- Filter usage: >40% of users
- Mobile upload rate: >60%

---

## Future Enhancements (Post-MVP)

- Video transcoding for multiple formats/qualities
- Audio waveform visualization
- Collaborative posts (multiple contributors)
- Post templates (birthday, anniversary, recipe)
- Bulk import from Google Photos, iCloud
- Timeline playback (auto-scroll through years)
- Print timeline as book
- AI-generated captions for photos

---

## Notes

- Framer Motion provides smooth animations with minimal code
- Focus on mobile upload experience - users will add memories on-the-go
- Consider adding "quick post" flow for single-photo memories
- Implement optimistic UI updates for reactions/comments (feel instant)
- Media processing should happen asynchronously (background jobs)