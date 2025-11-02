# Feature F-002: Family Tree Builder

**Priority:** P0 (Must Have)  
**Status:** MVP  
**Dependencies:** F-001 (Authentication)  
**Estimated Effort:** 4-5 weeks

---

## Overview
Interactive visual family tree builder supporting traditional families and any community type (churches, sports teams, schools). Built with React Flow for smooth, intuitive visualization.

---

## Requirements

### Tree Creation & Management
- **F-002.1:** Create multiple family trees/community groups
- **F-002.2:** Add members to trees with:
  - Name, photo, birth/death dates
  - Relationship type (parent, child, sibling, spouse, friend, member)
  - Custom relationship labels for communities
- **F-002.3:** Define relationships between members (edges)
- **F-002.4:** Visual tree rendering with React Flow
- **F-002.5:** Interactive navigation (zoom, pan, click members)
- **F-002.6:** Auto-layout algorithm for clean tree visualization
- **F-002.7:** Search/filter members within tree
- **F-002.8:** Export tree as image (PNG/PDF)

### Tree Privacy
- **F-002.9:** Public trees (viewable by anyone with link)
- **F-002.10:** Private trees (invite-only)
- **F-002.11:** Member-level privacy controls

### Tree Management
- **F-002.12:** Tree owner/admin roles
- **F-002.13:** Invite members to tree via email/link
- **F-002.14:** Accept/decline tree invitations
- **F-002.15:** Edit/remove members (admin only)
- **F-002.16:** Transfer tree ownership

---

## Technical Implementation

### Tech Stack
- **Visualization:** React Flow
- **Database:** PostgreSQL
- **Storage:** Supabase Storage (member photos)
- **Layout Algorithm:** Dagre (hierarchical) or D3-force (organic)

### Database Schema
```sql
-- Trees
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tree_type TEXT DEFAULT 'family', -- family, church, team, school, friends
  privacy_level TEXT DEFAULT 'private', -- public, link_only, private
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tree Members
CREATE TABLE tree_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NULL, -- NULL if unclaimed profile
  name TEXT NOT NULL,
  bio TEXT,
  birth_date DATE,
  death_date DATE,
  photo_url TEXT,
  position_x FLOAT, -- For saving layout positions
  position_y FLOAT,
  is_claimed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships (edges in tree)
CREATE TABLE tree_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  from_member_id UUID REFERENCES tree_members(id) ON DELETE CASCADE,
  to_member_id UUID REFERENCES tree_members(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- parent, child, sibling, spouse, friend, etc.
  custom_label TEXT, -- For custom community relationships
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tree_id, from_member_id, to_member_id, relationship_type)
);

-- Tree Roles
CREATE TABLE tree_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- owner, admin, editor, viewer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tree_id, user_id)
);

-- Tree Invitations
CREATE TABLE tree_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES auth.users(id),
  invitee_email TEXT NOT NULL,
  invitee_user_id UUID REFERENCES auth.users(id) NULL,
  role TEXT DEFAULT 'viewer',
  status TEXT DEFAULT 'pending', -- pending, accepted, declined, expired
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tree_members_tree_id ON tree_members(tree_id);
CREATE INDEX idx_tree_relationships_tree_id ON tree_relationships(tree_id);
CREATE INDEX idx_tree_roles_user_id ON tree_roles(user_id);
CREATE INDEX idx_tree_invitations_email ON tree_invitations(invitee_email);

-- RLS Policies
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public trees viewable by all"
  ON trees FOR SELECT
  USING (privacy_level = 'public' OR id IN (
    SELECT tree_id FROM tree_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tree members viewable if tree is accessible"
  ON tree_members FOR SELECT
  USING (tree_id IN (
    SELECT id FROM trees WHERE privacy_level = 'public'
    UNION
    SELECT tree_id FROM tree_roles WHERE user_id = auth.uid()
  ));
```

### API Endpoints
```typescript
// Trees
POST   /api/trees                    // Create tree
GET    /api/trees                    // List user's trees
GET    /api/trees/:treeId            // Get tree details
PUT    /api/trees/:treeId            // Update tree
DELETE /api/trees/:treeId            // Delete tree
POST   /api/trees/:treeId/export     // Export as image

// Members
POST   /api/trees/:treeId/members              // Add member
GET    /api/trees/:treeId/members              // List members
GET    /api/trees/:treeId/members/:memberId    // Get member details
PUT    /api/trees/:treeId/members/:memberId    // Update member
DELETE /api/trees/:treeId/members/:memberId    // Remove member

// Relationships
POST   /api/trees/:treeId/relationships        // Create relationship
GET    /api/trees/:treeId/relationships        // List relationships
DELETE /api/trees/:treeId/relationships/:relId // Delete relationship

// Invitations
POST   /api/trees/:treeId/invitations          // Send invitation
GET    /api/invitations                        // List user's invitations
PUT    /api/invitations/:inviteId/accept       // Accept invitation
PUT    /api/invitations/:inviteId/decline      // Decline invitation

// Roles
PUT    /api/trees/:treeId/roles/:userId        // Update user role
```

### React Flow Configuration
```typescript
// Node types
const nodeTypes = {
  member: MemberNode,      // Standard member
  user: UserMemberNode,    // Claimed profile
  deceased: DeceasedNode,  // Deceased member
};

// Edge types
const edgeTypes = {
  parent: ParentEdge,      // Parent-child
  spouse: SpouseEdge,      // Spouse/partner
  sibling: SiblingEdge,    // Siblings
  custom: CustomEdge,      // Custom relationships
};

// Layout algorithms
- Hierarchical (Dagre): Traditional family tree layout
- Force-directed (D3): Organic community network layout
- Manual: User can drag and save positions
```

---

## User Flows

### Create Tree Flow
1. User clicks "Create New Tree"
2. Modal appears: Enter tree name, type, description
3. User sets privacy level
4. Tree created, user redirected to empty tree canvas
5. Prompt: "Add your first member"

### Add Member Flow
1. User clicks "Add Member" button or "+" on existing member
2. Modal appears with form:
   - Name (required)
   - Photo upload (optional)
   - Birth date (optional)
   - Bio (optional)
3. If adding from existing member, relationship pre-selected
4. User clicks "Add"
5. Member appears on tree, auto-layout runs

### Connect Members Flow
1. User clicks "Connect" on member card
2. Tree enters "connection mode"
3. User clicks second member
4. Modal appears: Select relationship type
5. Edge drawn between members
6. Layout adjusts automatically

### Invite Member Flow
1. Tree admin clicks "Invite Members"
2. Enters email addresses (comma-separated)
3. Selects role (viewer, editor, admin)
4. Invitations sent
5. Invitees receive email with link
6. Invitees click link, accept/decline
7. If accepted, tree appears in their tree list

---

## UI/UX Requirements

### Tree Canvas
- **Zoom:** Scroll wheel or pinch gesture
- **Pan:** Click-and-drag background
- **Node interaction:** Click member to view details
- **Controls:** Floating toolbar with:
  - Add member
  - Search members
  - Change layout
  - Export tree
  - Settings
- **Minimap:** Small overview map in corner

### Member Node Design
```
┌─────────────────────┐
│   [Profile Photo]   │
│   Name              │
│   Birth - Death     │
│   [Edit] [Connect]  │
└─────────────────────┘
```
- Circular photo (80x80px)
- Name truncated to 15 chars
- Visual indicators:
  - Blue border: User's own profile
  - Gray background: Deceased
  - Green dot: Claimed profile

### Relationship Lines
- **Parent-child:** Solid line, arrow pointing to child
- **Spouse:** Dashed line, no arrow
- **Sibling:** Dotted line
- **Custom:** Solid line with label

### Mobile Optimizations
- Larger touch targets (60x60px minimum)
- Simplified controls (hamburger menu)
- Single-tap to view, long-press to edit
- Gesture controls (two-finger zoom/pan)

---

## Validation Rules

### Tree Name
- 3-100 characters
- No profanity

### Member Name
- 2-100 characters
- Required field

### Birth/Death Dates
- Valid date format
- Death date must be after birth date
- Birth date cannot be in future

### Relationships
- Cannot create circular relationships (A is parent of B, B is parent of A)
- Cannot create duplicate relationships
- Spouse relationships must be mutual

### Tree Limits (by subscription tier)
- **Free:** 1 tree, 50 members max
- **Premium:** Unlimited trees, 200 members per tree
- **Family:** Unlimited trees, unlimited members

---

## Layout Algorithms

### Hierarchical (Dagre)
- Best for: Traditional family trees
- Characteristics:
  - Generations in horizontal layers
  - Children below parents
  - Clean, organized appearance
- Performance: Good up to 500 nodes

### Force-Directed (D3)
- Best for: Community networks, friend groups
- Characteristics:
  - Organic, natural clustering
  - Related members gravitate together
  - More dynamic appearance
- Performance: Good up to 300 nodes

### Manual
- User-controlled positioning
- Positions saved to database
- Auto-layout can be reapplied anytime

---

## Export Functionality

### Image Export (PNG)
- Captures entire tree as single image
- Resolution: 3000x3000px max
- Background: White or transparent (user choice)
- Watermark: "Created with Lore" (removable in premium)

### PDF Export
- Multi-page if tree is large
- Includes tree metadata (name, description)
- Pagination at sensible break points

### Data Export (JSON)
- Complete tree structure
- All member data
- All relationships
- For backup or migration

---

## Acceptance Criteria

✅ Users can create and name trees within 30 seconds  
✅ Adding members is intuitive and fast (<20 seconds per member)  
✅ Tree renders smoothly with 100+ members (60fps)  
✅ Mobile users can navigate trees with touch gestures  
✅ Auto-layout produces clean, readable trees  
✅ Invitations send and accept successfully  
✅ Privacy settings are enforced (private trees not accessible)  
✅ Export produces high-quality images  
✅ Search finds members instantly (<500ms)  
✅ Undo/redo works for member and relationship changes  

---

## Performance Considerations

- **Lazy loading:** Only render visible nodes
- **Virtualization:** Use react-window for large trees
- **Debounced layout:** Run layout algorithm after 500ms of inactivity
- **Cached positions:** Save layout to avoid recalculation
- **Image optimization:** Compress member photos to thumbnails
- **Indexed queries:** All tree queries use indexes

---

## Accessibility

- **Keyboard navigation:** Tab through members, Enter to open
- **Screen reader:** Announce member names and relationships
- **High contrast mode:** Ensure edges visible
- **Focus indicators:** Clear visual focus on selected node
- **Alternative view:** List view for screen reader users

---

## Testing Checklist

### Unit Tests
- [ ] Tree creation logic
- [ ] Member addition validation
- [ ] Relationship validation (no circular refs)
- [ ] Layout algorithm correctness

### Integration Tests
- [ ] Create tree and add members
- [ ] Connect members with relationships
- [ ] Invite user and accept invitation
- [ ] Export tree as PNG and PDF
- [ ] Search members in large tree

### E2E Tests
- [ ] Complete tree creation flow
- [ ] Multi-generational family tree
- [ ] Community tree with custom relationships
- [ ] Mobile tree navigation

### Performance Tests
- [ ] 500-member tree renders in <3s
- [ ] Zoom/pan remains smooth (60fps)
- [ ] Search returns results in <500ms

---

## Error Handling

| Error | Message | Action |
|-------|---------|--------|
| Member limit reached | "You've reached the member limit for your plan. Upgrade to add more." | Show upgrade modal |
| Invalid relationship | "This relationship would create a circular reference." | Prevent creation |
| Invitation failed | "Could not send invitation. Please check the email address." | Retry button |
| Export failed | "Export failed. Please try again or contact support." | Retry button |

---

## Success Metrics

- Trees created per user: >2
- Members added per tree: >10
- Average tree views per week: >5
- Invitation acceptance rate: >60%
- Export usage: >30% of users
- Mobile vs desktop usage: Track for optimization

---

## Future Enhancements (Post-MVP)

- DNA integration (Ancestry.com, 23andMe)
- Collaborative editing (real-time multi-user)
- Tree templates (pre-built structures)
- 3D tree visualization
- Tree comparison (find common ancestors)
- Historical timeline integration
- Print-ready templates

---

## Notes

- React Flow is the best choice for performance and customization
- Focus on mobile UX - many users will add members from phone photos
- Auto-layout should be "smart" - detect family structure and choose best algorithm
- Consider adding "quick add" flow for bulk member import (CSV)
- Privacy is critical - ensure RLS policies are bulletproof