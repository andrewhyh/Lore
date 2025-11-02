# Feature F-004: Cloud Storage & Media Library

**Priority:** P0 (Must Have)  
**Status:** MVP  
**Dependencies:** F-001 (Authentication)  
**Estimated Effort:** 2-3 weeks

---

## Overview
Personal media library for each user with cloud storage for photos, videos, and documents. Organized in albums with search and bulk upload capabilities.

---

## Requirements

### Core Features
- **F-004.1:** Personal media library for each user
- **F-004.2:** Upload photos, videos, documents
- **F-004.3:** Organize media into albums/folders
- **F-004.4:** Bulk upload (select multiple files)
- **F-004.5:** Drag-and-drop upload interface
- **F-004.6:** Storage quota display (used/total)
- **F-004.7:** Grid/list view toggle
- **F-004.8:** Search media by filename, date, tags
- **F-004.9:** Download original files
- **F-004.10:** Delete media (with confirmation)

### Storage Tiers
- **F-004.11:** Free tier: 5GB storage
- **F-004.12:** Premium tier: 100GB storage
- **F-004.13:** Family tier: 500GB shared storage
- **F-004.14:** Storage usage analytics

---

## Technical Implementation

### Tech Stack
- **Storage:** Supabase Storage
- **Database:** PostgreSQL
- **File Processing:** Sharp (images)
- **Upload Library:** react-dropzone
- **Progress Tracking:** XMLHttpRequest with progress events

### Database Schema
```sql
-- Media Library
CREATE TABLE media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image, video, document, audio
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  width INTEGER, -- For images/videos
  height INTEGER, -- For images/videos
  duration INTEGER, -- For videos/audio (seconds)
  metadata JSONB, -- EXIF data, location, camera info
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Albums
CREATE TABLE media_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Album Media (junction table)
CREATE TABLE album_media (
  album_id UUID REFERENCES media_albums(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_library(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (album_id, media_id)
);

-- Storage Usage Tracking
CREATE TABLE storage_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_bytes BIGINT DEFAULT 0,
  image_bytes BIGINT DEFAULT 0,
  video_bytes BIGINT DEFAULT 0,
  document_bytes BIGINT DEFAULT 0,
  audio_bytes BIGINT DEFAULT 0,
  last_calculated TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_media_library_user_id ON media_library(user_id);
CREATE INDEX idx_media_library_uploaded_at ON media_library(uploaded_at DESC);
CREATE INDEX idx_media_library_file_type ON media_library(file_type);
CREATE INDEX idx_album_media_album_id ON album_media(album_id);
CREATE INDEX idx_storage_usage_user_id ON storage_usage(user_id);

-- Full-text search
CREATE INDEX idx_media_library_search ON media_library 
  USING gin(to_tsvector('english', file_name));

-- RLS Policies
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own media"
  ON media_library FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can upload own media"
  ON media_library FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own media"
  ON media_library FOR DELETE
  USING (user_id = auth.uid());

-- Trigger to update storage usage
CREATE OR REPLACE FUNCTION update_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO storage_usage (user_id, total_bytes)
    VALUES (NEW.user_id, NEW.file_size)
    ON CONFLICT (user_id)
    DO UPDATE SET
      total_bytes = storage_usage.total_bytes + NEW.file_size,
      last_calculated = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE storage_usage
    SET total_bytes = total_bytes - OLD.file_size,
        last_calculated = NOW()
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER storage_usage_trigger
AFTER INSERT OR DELETE ON media_library
FOR EACH ROW EXECUTE FUNCTION update_storage_usage();
```

### API Endpoints
```typescript
// Media
POST   /api/media/upload              // Upload file(s)
GET    /api/media                     // List media (paginated)
GET    /api/media/:mediaId            // Get media details
DELETE /api/media/:mediaId            // Delete media
POST   /api/media/:mediaId/download   // Get download URL

// Albums
POST   /api/albums                    // Create album
GET    /api/albums                    // List albums
GET    /api/albums/:albumId           // Get album with media
PUT    /api/albums/:albumId           // Update album
DELETE /api/albums/:albumId           // Delete album
POST   /api/albums/:albumId/media     // Add media to album
DELETE /api/albums/:albumId/media/:mediaId // Remove from album

// Storage
GET    /api/storage/usage             // Get storage usage stats
GET    /api/storage/quota             // Get storage quota for user tier
```

### Upload Flow Architecture
```typescript
// Client-side upload with progress
async function uploadFile(file: File) {
  // 1. Check quota
  const quota = await checkStorageQuota();
  if (quota.remaining < file.size) {
    throw new Error('Storage quota exceeded');
  }

  // 2. Generate thumbnail if image
  let thumbnailBlob;
  if (file.type.startsWith('image/')) {
    thumbnailBlob = await generateThumbnail(file);
  }

  // 3. Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('user-media')
    .upload(`${userId}/${uuid()}-${file.name}`, file, {
      onUploadProgress: (progress) => {
        updateProgressBar(progress);
      }
    });

  // 4. Upload thumbnail
  if (thumbnailBlob) {
    await supabase.storage
      .from('thumbnails')
      .upload(`${userId}/${uuid()}-thumb.jpg`, thumbnailBlob);
  }

  // 5. Save metadata to database
  await supabase.from('media_library').insert({
    user_id: userId,
    file_url: data.path,
    thumbnail_url: thumbnailPath,
    file_name: file.name,
    file_type: getFileType(file),
    mime_type: file.type,
    file_size: file.size
  });
}
```

### Supabase Storage Configuration
```typescript
// Bucket setup
Buckets:
  - user-media (private, per-user access)
  - thumbnails (private, per-user access)
  - tree-media (shared across tree members)

// Storage policies (in Supabase Dashboard)
Policy: "Users can upload to own folder"
  ON user-media FOR INSERT
  WITH CHECK (
    auth.uid()::text = (storage.foldername(name))[1]
  )

Policy: "Users can read own files"
  ON user-media FOR SELECT
  USING (
    auth.uid()::text = (storage.foldername(name))[1]
  )

Policy: "Users can delete own files"
  ON user-media FOR DELETE
  USING (
    auth.uid()::text = (storage.foldername(name))[1]
  )
```

---

## User Flows

### Upload Flow
1. User navigates to Media Library
2. Clicks "Upload" or drags files onto page
3. File picker opens (or drag-drop zone activates)
4. User selects 10 photos
5. Upload modal appears showing:
   - File list with thumbnails
   - Progress bars for each file
   - Overall progress
   - Cancel button
6. Files upload with progress indicator
7. Thumbnails generate automatically
8. Upload completes, files appear in library
9. Success notification with link to view

### Album Creation Flow
1. User clicks "Create Album"
2. Modal appears: Enter album name, description
3. User optionally selects cover image
4. Album created
5. User can drag media into album
6. Or select multiple media and click "Add to Album"

### Search Flow
1. User types in search bar
2. Results filter in real-time
3. Search across: filename, metadata, date
4. Results show thumbnails in grid
5. User can click to view full image

---

## UI/UX Requirements

### Media Library Layout
```
┌─────────────────────────────────────────┐
│  Media Library                          │
│  [Upload] [Search...] [Grid/List] [5GB/5GB] │
├─────────────────────────────────────────┤
│  Albums                                 │
│  [+] [Family Reunion] [Vacation 2024]   │
├─────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │IMG │ │IMG │ │VID │ │DOC │           │
│  └────┘ └────┘ └────┘ └────┘           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │IMG │ │IMG │ │IMG │ │IMG │           │
│  └────┘ └────┘ └────┘ └────┘           │
│                                         │
│  [Load More...]                         │
└─────────────────────────────────────────┘
```

### Grid View
- 4 columns on desktop
- 2 columns on mobile
- Thumbnail size: 200x200px
- Hover shows: filename, size, date
- Checkbox overlay for multi-select
- Video files show play icon
- Documents show file type icon

### List View
- File icon, filename, size, date, actions
- Sortable by name, date, size, type
- Bulk actions: Delete, Download, Add to Album

### Upload Modal
- Drag-drop zone (prominent)
- "Or click to browse" button
- File previews with thumbnails
- Individual progress bars
- Pause/cancel upload buttons
- Error states for failed uploads

### Storage Quota Display
- Progress bar showing used/total
- Color-coded:
  - Green: <70% used
  - Yellow: 70-90% used
  - Red: >90% used
- Upgrade prompt when near limit

---

## Media Processing

### Image Processing (Sharp)
```typescript
// Generate thumbnails
const thumbnail = await sharp(imageBuffer)
  .resize(400, 400, { fit: 'cover' })
  .jpeg({ quality: 80 })
  .toBuffer();

// Extract EXIF data
const metadata = await sharp(imageBuffer).metadata();
// Store: width, height, format, date taken, GPS coords
```

### Supported File Types
- **Images:** JPEG, PNG, GIF, WebP, HEIC, TIFF (max 50MB)
- **Videos:** MP4, MOV, WebM, AVI (max 500MB)
- **Documents:** PDF, DOCX, XLSX, TXT (max 50MB)
- **Audio:** MP3, WAV, M4A, FLAC (max 100MB)

### File Validation
- Check file type against whitelist
- Check file size against limits
- Scan for malware (future: ClamAV integration)
- Verify image dimensions (max 10000x10000px)

---

## Storage Quota Enforcement

### Quota Check Flow
```typescript
async function checkQuota(userId: string, uploadSize: number) {
  // Get user's subscription tier
  const subscription = await getSubscription(userId);
  
  // Get quota limit
  const quotas = {
    free: 5 * 1024 * 1024 * 1024,      // 5GB
    premium: 100 * 1024 * 1024 * 1024, // 100GB
    family: 500 * 1024 * 1024 * 1024   // 500GB
  };
  const quota = quotas[subscription.tier];
  
  // Get current usage
  const { total_bytes } = await supabase
    .from('storage_usage')
    .select('total_bytes')
    .eq('user_id', userId)
    .single();
  
  // Check if upload would exceed quota
  if (total_bytes + uploadSize > quota) {
    throw new QuotaExceededError();
  }
  
  return {
    used: total_bytes,
    total: quota,
    remaining: quota - total_bytes
  };
}
```

### Quota Exceeded Handling
1. Show modal: "Storage limit reached"
2. Options:
   - Upgrade plan (link to pricing)
   - Delete old files
   - Cancel upload
3. If user deletes files, recalculate usage
4. Allow upload to proceed if space freed

---

## Performance Optimization

### Lazy Loading
- Load 50 media items initially
- Load 25 more as user scrolls
- Virtual scrolling for large libraries (1000+ items)

### Thumbnail Strategy
- Generate 400x400px thumbnails on upload
- Serve thumbnails in grid view
- Load full image only when clicked
- Use Supabase Storage CDN for fast delivery

### Caching
- Cache file list for 5 minutes
- Cache thumbnails indefinitely (immutable)
- Use ETag/If-None-Match for efficient caching

### Bulk Operations
- Batch delete: Process in chunks of 50
- Bulk download: Create zip file server-side
- Show progress for long operations

---

## Validation Rules

### File Name
- Max 255 characters
- Sanitize special characters
- Prevent path traversal (.., /)

### Album Name
- 3-100 characters
- Required field
- No profanity

### Upload Limits
- Max 50 files per upload
- Max 500MB per file (video)
- Max 50MB per file (image/document)
- Total upload size: Max 2GB per batch

---

## Acceptance Criteria

✅ Users can upload files via drag-drop or file picker  
✅ Upload progress shows for each file  
✅ Thumbnails generate automatically for images  
✅ Storage quota displays accurately  
✅ Grid view shows 50 items smoothly  
✅ Search returns results in <500ms  
✅ Albums organize media correctly  
✅ Delete removes files from storage and database  
✅ Download provides original file  
✅ Quota enforcement prevents over-limit uploads  

---

## Accessibility

- **Keyboard navigation:** Tab through grid, Enter to open
- **Screen reader:** Announce filename, type, date
- **Alt text:** Generate from filename or user-provided
- **Focus indicators:** Clear border on focused item
- **High contrast:** Ensure thumbnails have borders

---

## Testing Checklist

### Unit Tests
- [ ] File validation logic
- [ ] Quota calculation
- [ ] Thumbnail generation
- [ ] Filename sanitization

### Integration Tests
- [ ] Upload single file
- [ ] Upload multiple files (bulk)
- [ ] Delete file and verify storage updates
- [ ] Create album and add media
- [ ] Search media by filename

### E2E Tests
- [ ] Complete upload flow (drag-drop)
- [ ] Exceed quota and verify error
- [ ] Download file and verify integrity
- [ ] Delete multiple files

### Performance Tests
- [ ] Grid with 1000 items renders smoothly
- [ ] Bulk upload of 50 files completes
- [ ] Search 10,000 files returns in <1s

---

## Error Handling

| Error | Message | Action |
|-------|---------|--------|
| Quota exceeded | "Storage limit reached. Upgrade or delete old files." | Show upgrade modal |
| Upload failed | "Upload failed. Check connection and try again." | Retry button |
| File too large | "File exceeds 500MB limit. Please compress." | Show guide |
| Invalid file type | "File type not supported. Upload JPEG, PNG, PDF, etc." | Show supported types |
| Network error | "Connection lost. Uploads will resume when reconnected." | Auto-retry |

---

## Success Metrics

- Average storage used per user: >2GB
- Upload success rate: >98%
- Average uploads per user per month: >10
- Album usage: >50% of users
- Search usage: >30% of users
- Download rate: >20% of uploaded files

---

## Future Enhancements (Post-MVP)

- Automatic photo organization (by date, location, people)
- Duplicate detection
- Facial recognition (auto-tagging)
- Smart albums (auto-generated based on criteria)
- Shared albums (collaborate with family)
- Import from Google Photos, iCloud, Dropbox
- Automatic backup from phone (mobile app)
- Photo editing (crop, filters, adjust)
- Slideshow creator
- Print photo books

---

## Notes

- Supabase Storage is cost-effective and integrates seamlessly
- Focus on fast uploads and reliable progress tracking
- Thumbnails are critical for performance with large libraries
- Consider adding automatic backup reminders for users
- Mobile upload is high priority - make it seamless