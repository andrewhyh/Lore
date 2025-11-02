# Feature F-006: AI Personal Assistant

**Priority:** P1 (Should Have)  
**Status:** MVP  
**Dependencies:** F-001 (Authentication), F-002 (Family Tree), F-003 (Timeline), F-004 (Media Library)  
**Estimated Effort:** 3-4 weeks

---

## Overview
AI-powered personal assistant using Google Gemini that provides contextual greetings, proactive suggestions, photo analysis, and conversational help for archiving memories.

---

## Requirements

### Personalized Greetings
- **F-006.1:** Personalized AI greetings on login via Gemini
- **F-006.2:** Contextual prompts based on user activity:
  - "You added a cousin 5 months ago. Upload new memories?"
  - "Haven't updated profile in weeks. New hairstyle?"
  - "It's your mom's birthday tomorrow. Post a memory?"

### Photo Analysis
- **F-006.3:** Photo analysis and suggestions:
  - Scan uploaded photos for faces
  - Suggest tagging family members
  - Identify duplicate photos
  - Extract dates from photo metadata
  
### Story Prompts
- **F-006.4:** Story prompts:
  - "Tell a story about this photo"
  - "What was happening in your family in 1995?"

### Conversational AI
- **F-006.5:** AI chat interface for questions:
  - "Who is related to John?"
  - "Show me all photos from Christmas 2010"
  - "Summarize my grandpa's life story"

### AI Capabilities
- **F-006.6:** Gemini 1.5 Flash for conversational AI
- **F-006.7:** Gemini Vision for image analysis
- **F-006.8:** Facial recognition and matching
- **F-006.9:** Content recommendations
- **F-006.10:** Privacy-first: user data not used for model training

---

## Technical Implementation

### Tech Stack
- **AI Model:** Google Gemini 1.5 Flash (text generation)
- **Vision Model:** Google Gemini Vision (image analysis)
- **API:** Google AI Studio / Vertex AI
- **Vector Database:** PostgreSQL with pgvector extension
- **Job Queue:** BullMQ + Redis (background processing)

### Database Schema
```sql
-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- AI Interactions (conversation history)
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB, -- Tree ID, member IDs, etc.
  interaction_type TEXT, -- greeting, suggestion, chat, analysis
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Suggestions (proactive prompts)
CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL, -- upload_memory, update_profile, tag_photo, etc.
  context JSONB NOT NULL, -- Specific details about the suggestion
  message TEXT NOT NULL,
  priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Face Embeddings (for facial recognition)
CREATE TABLE face_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES media_library(id) ON DELETE CASCADE,
  member_id UUID REFERENCES tree_members(id) NULL, -- NULL if unconfirmed
  embedding vector(512), -- 512-dimensional face embedding
  bounding_box JSONB, -- {x, y, width, height}
  confidence FLOAT,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo Analysis Results
CREATE TABLE photo_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES media_library(id) ON DELETE CASCADE,
  description TEXT, -- AI-generated description
  detected_objects JSONB, -- Array of detected objects/scenes
  detected_text TEXT, -- OCR results
  colors JSONB, -- Dominant colors
  quality_score FLOAT, -- 0-1 rating
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_suggestions_user_id ON ai_suggestions(user_id, dismissed);
CREATE INDEX idx_face_embeddings_media_id ON face_embeddings(media_id);
CREATE INDEX idx_face_embeddings_member_id ON face_embeddings(member_id);

-- Vector similarity index for face search
CREATE INDEX idx_face_embeddings_vector ON face_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RLS Policies
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own AI interactions"
  ON ai_interactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users see own suggestions"
  ON ai_suggestions FOR SELECT
  USING (user_id = auth.uid());
```

### API Endpoints
```typescript
// AI Chat
POST   /api/ai/chat                   // Send message to AI
GET    /api/ai/history                // Get chat history

// Suggestions
GET    /api/ai/suggestions            // Get active suggestions
POST   /api/ai/suggestions/:id/dismiss // Dismiss suggestion

// Photo Analysis
POST   /api/ai/analyze-photo          // Analyze single photo
POST   /api/ai/batch-analyze          // Analyze multiple photos
POST   /api/ai/find-similar-faces     // Find photos with similar faces

// Face Recognition
POST   /api/ai/confirm-face           // Confirm face-member match
POST   /api/ai/reject-face            // Reject face suggestion
GET    /api/ai/unconfirmed-faces      // Get faces pending confirmation
```

### Gemini Integration
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Text generation (greetings, suggestions, chat)
async function generateGreeting(userContext: UserContext) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `You are a friendly AI assistant for a family archiving app called Lore.
  
User context:
- Name: ${userContext.name}
- Last login: ${userContext.lastLogin}
- Trees: ${userContext.treeCount}
- Recent activity: ${userContext.recentActivity}

Generate a warm, personalized greeting that:
1. Welcomes them back
2. References something specific they did recently
3. Suggests a relevant action they might want to take

Keep it under 2 sentences and conversational.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Image analysis
async function analyzePhoto(imageBuffer: Buffer) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Analyze this photo and provide:
1. A brief description of what's happening
2. List any people visible (describe them, don't name them)
3. Location/setting description
4. Estimated time period (modern, vintage, etc.)
5. Any text visible in the image

Format as JSON.`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: 'image/jpeg'
    }
  };

  const result = await model.generateContent([prompt, imagePart]);
  return JSON.parse(result.response.text());
}

// Facial recognition
async function detectFaces(imageBuffer: Buffer) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Detect and describe all faces in this image.
For each face provide:
- Approximate bounding box coordinates (x, y, width, height as percentages)
- Age estimate
- Gender presentation
- Emotional expression
- Any distinctive features

Return as JSON array.`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: 'image/jpeg'
    }
  };

  const result = await model.generateContent([prompt, imagePart]);
  return JSON.parse(result.response.text());
}
```

### Background Job: Batch Photo Analysis
```typescript
// Process newly uploaded photos in background
import { Queue, Worker } from 'bullmq';

const photoQueue = new Queue('photo-analysis', {
  connection: redisConnection
});

// Add job when photo uploaded
await photoQueue.add('analyze', {
  mediaId: photo.id,
  userId: user.id,
  imageUrl: photo.url
});

// Worker processes jobs
const worker = new Worker('photo-analysis', async (job) => {
  const { mediaId, imageUrl } = job.data;
  
  // Download image
  const imageBuffer = await downloadImage(imageUrl);
  
  // Analyze with Gemini Vision
  const analysis = await analyzePhoto(imageBuffer);
  
  // Detect faces
  const faces = await detectFaces(imageBuffer);
  
  // Save results
  await supabase.from('photo_analysis').insert({
    media_id: mediaId,
    description: analysis.description,
    detected_objects: analysis.objects,
    detected_text: analysis.text
  });
  
  // Generate face embeddings (if faces detected)
  if (faces.length > 0) {
    for (const face of faces) {
      const embedding = await generateFaceEmbedding(imageBuffer, face.bbox);
      
      await supabase.from('face_embeddings').insert({
        media_id: mediaId,
        embedding: embedding,
        bounding_box: face.bbox,
        confidence: face.confidence
      });
      
      // Find similar faces to suggest matches
      await findSimilarFaces(embedding);
    }
  }
}, { connection: redisConnection });
```

---

## User Flows

### Login Greeting Flow
1. User logs in
2. AI generates greeting based on:
   - User's name
   - Time since last login
   - Pending suggestions
   - Recent tree activity
3. Greeting displays in welcome banner
4. User can click "Show me" to act on suggestion

### Photo Upload with AI Flow
1. User uploads 10 photos
2. Photos queue for background analysis
3. User receives notification: "Analyzing your photos..."
4. AI detects 3 faces, matches 2 to existing members
5. Suggestion appears: "Found potential matches! Confirm?"
6. User clicks, sees photo grid with suggested members
7. User confirms/rejects each match
8. Confirmed faces auto-tagged in future uploads

### Conversational Chat Flow
1. User clicks AI assistant icon
2. Chat panel slides in
3. User asks: "Show me all photos from Christmas 2010"
4. AI understands query, searches timeline
5. AI responds with: "I found 12 photos from Christmas 2010:"
6. Displays photo grid with links
7. User clicks photo to view full size

### Story Prompt Flow
1. User viewing old photo
2. AI suggests: "Tell a story about this photo"
3. User clicks, text editor opens
4. User writes story, AI helps with:
   - Grammar suggestions
   - Date/location verification
   - Related photo suggestions
5. Story posted to timeline

---

## UI/UX Requirements

### Welcome Banner (AI Greeting)
```
┌─────────────────────────────────────────┐
│  🤖 Hi Felix! You added your cousin     │
│      5 months ago. Upload new           │
│      memories to update their story.    │
│                                         │
│      [Upload Photos]  [Dismiss]         │
└─────────────────────────────────────────┘
```

### AI Chat Panel
```
┌─────────────────────────────────────────┐
│  Lore Assistant                    [X]  │
├─────────────────────────────────────────┤
│  🤖 How can I help you today?           │
│                                         │
│  You:                                   │
│  Show photos from last Christmas        │
│                                         │
│  🤖 I found 8 photos from December      │
│      2024 with "Christmas" tags:        │
│      [Photo] [Photo] [Photo]            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Ask anything...          [Send] │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Face Confirmation UI
```
┌─────────────────────────────────────────┐
│  Confirm Face Matches                   │
├─────────────────────────────────────────┤
│  Is this Sarah?                         │
│  ┌─────────────────┐                    │
│  │  [Cropped Face] │                    │
│  │  in photo from  │                    │
│  │  July 2020      │                    │
│  └─────────────────┘                    │
│                                         │
│  [✓ Yes, this is Sarah]                 │
│  [✗ No, not Sarah]                      │
│  [Not sure / Skip]                      │
└─────────────────────────────────────────┘
```

### AI Suggestion Card
```
┌─────────────────────────────────────────┐
│  💡 Suggestion                           │
│  You haven't updated your profile in    │
│  3 weeks. Did you get a new hairstyle?  │
│                                         │
│  [Update Profile]  [Dismiss]            │
└─────────────────────────────────────────┘
```

---

## AI Prompt Engineering

### Greeting Prompt Template
```
You are Lore Assistant, a warm and helpful AI for a family archiving app.

Context:
- User name: {name}
- Last login: {lastLogin}
- Trees: {treeCount}
- Recent activity: {recentActivity}
- Upcoming birthdays: {upcomingBirthdays}
- Untagged photos: {untaggedPhotos}

Generate a personalized greeting that:
1. Welcomes the user by name
2. References recent activity or suggests next action
3. Is warm but not overly enthusiastic
4. Is 1-2 sentences maximum
5. Includes a clear call-to-action if suggesting something

Examples:
- "Welcome back, Sarah! You added 3 photos last week. How about adding a story to bring them to life?"
- "Hi John! It's your mom's birthday tomorrow—a great time to share a favorite memory."
```

### Photo Description Prompt
```
Analyze this photo and provide:

1. Scene description (1-2 sentences, natural language)
2. People visible (count, describe but don't name)
3. Setting (indoor/outdoor, location type)
4. Time period indicators (modern, vintage, decade clues)
5. Activities or events happening
6. Notable objects or details
7. Emotional tone/mood
8. Any visible text

Format as JSON:
{
  "description": "...",
  "peopleCount": 3,
  "setting": "...",
  "timePeriod": "...",
  "activities": [...],
  "mood": "..."
}
```

### Conversational Chat System Prompt
```
You are Lore Assistant, an AI helper for a family archiving and genealogy app.

Your role:
- Help users find photos, posts, and family members
- Answer questions about family history
- Provide guidance on using the app
- Suggest meaningful ways to archive memories

Capabilities:
- Search timeline posts by date, person, keyword
- Search media library
- Query family tree relationships
- Provide app feature guidance

Guidelines:
- Be warm and conversational
- If you don't know something, say so
- Offer specific, actionable suggestions
- Respect family privacy (never make assumptions)
- Keep responses concise (2-3 sentences max usually)

Available data:
{context}
```

---

## Privacy & Ethics

### Data Usage
- User data NEVER sent to Gemini for training
- All requests use Gemini API with data isolation
- Face embeddings stored locally, not with Google
- Users can opt-out of AI features entirely

### Consent
- Explicit opt-in for facial recognition
- Clear explanation of what AI does
- Option to delete all AI-generated data
- Settings page for AI preferences

### Bias Mitigation
- Diverse test dataset for face recognition
- No demographic assumptions in descriptions
- Manual review of AI-generated content before showing
- User feedback mechanism for incorrect analysis

---

## Validation Rules

### Face Confirmation
- Confidence threshold: >70% for auto-suggestion
- Below 50%: Don't suggest, only show in manual review
- Max 10 unconfirmed faces shown at once

### Suggestions
- Max 3 active suggestions per user
- Don't repeat dismissed suggestions for 30 days
- Prioritize high-value suggestions (birthdays, milestones)

### Chat
- Max 10 messages per conversation context
- Response length: 500 tokens max
- Rate limit: 20 messages per hour per user

---

## Performance Optimization

### Batch Processing
- Analyze photos in batches of 10
- Process during off-peak hours when possible
- Low-priority queue for non-urgent analysis

### Caching
- Cache AI greetings for 1 hour
- Cache photo analysis results indefinitely
- Cache face embeddings for similarity search

### Cost Management
- Use Gemini 1.5 Flash (cheapest model)
- Compress images before sending to API
- Implement request queueing to avoid spikes
- Monitor API costs daily

---

## Acceptance Criteria

✅ AI greeting generates within 2 seconds  
✅ Greetings are contextually relevant  
✅ Photo analysis completes within 30 seconds per photo  
✅ Face detection accuracy >80%  
✅ Chat responses generate within 3 seconds  
✅ Users can dismiss suggestions permanently  
✅ Face confirmations update immediately  
✅ AI works offline with cached results  
✅ Privacy settings are respected  
✅ No user data sent for model training  

---

## Accessibility

- **Screen reader:** Read AI suggestions aloud
- **Keyboard:** Navigate suggestions with arrow keys
- **Focus:** Clear focus on suggestion actions
- **Alt text:** AI-generated descriptions used for images

---

## Testing Checklist

### Unit Tests
- [ ] Greeting generation logic
- [ ] Prompt template rendering
- [ ] Face similarity matching
- [ ] Suggestion prioritization

### Integration Tests
- [ ] Generate greeting with user context
- [ ] Analyze photo and save results
- [ ] Detect faces and create embeddings
- [ ] Chat query and response
- [ ] Dismiss suggestion

### E2E Tests
- [ ] Upload photo, AI analyzes, suggestion appears
- [ ] Confirm face match, future photos auto-tagged
- [ ] Ask AI question via chat, get relevant response
- [ ] Dismiss suggestion, doesn't reappear

### Performance Tests
- [ ] Batch analyze 100 photos
- [ ] Generate 100 greetings
- [ ] Face search with 10,000 embeddings

---

## Error Handling

| Error | Message | Action |
|-------|---------|--------|
| API limit exceeded | "AI assistant temporarily unavailable. Try again soon." | Queue for retry |
| Analysis failed | "Couldn't analyze this photo. Try re-uploading." | Retry button |
| Face detection error | "Couldn't detect faces in this photo." | Skip silently |
| Chat timeout | "Response taking longer than expected. Still thinking..." | Show loading |
| Rate limit hit | "You've reached your hourly limit. Try again in {X} minutes." | Show timer |

---

## Success Metrics

- AI greeting engagement: >40% click-through
- Suggestion dismissal rate: <30%
- Face confirmation accuracy: >80%
- Chat usage: >20% of users per month
- Photo analysis completion: >95%
- User satisfaction with AI: >4/5 stars

---

## Future Enhancements (Post-MVP)

- Voice input for AI chat
- AI-generated life story summaries
- Automatic story generation from photos
- Smart timeline gaps detection ("Missing photos from 2010?")
- Relationship inference (suggest family connections)
- Historical context (e.g., "This photo was likely taken during...")
- Multi-language support
- AI-powered photo restoration/enhancement

---

## Cost Estimation

### Gemini API Pricing (as of 2024)
- Text generation: ~$0.00025 per 1K characters
- Image analysis: ~$0.002 per image

### Monthly Cost Projection (1000 users)
- Greetings: 30,000/month × $0.00025 = $7.50
- Photo analysis: 10,000 photos/month × $0.002 = $20
- Chat: 5,000 conversations × $0.01 = $50
- **Total:** ~$77.50/month

Scales linearly with user count.

---

## Notes

- Gemini 1.5 Flash is fast and cost-effective for MVP
- Focus on high-value AI features (face recognition, greetings)
- Don't over-prompt - users should feel AI is helpful, not intrusive
- Consider adding "AI suggestion fatigue" detection (too many ignored suggestions = pause)
- Face recognition should improve over time as more faces are confirmed