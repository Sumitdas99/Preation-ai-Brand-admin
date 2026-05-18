# Aegis AI Compliance Platform - Complete Project Documentation

## Table of Contents
1. [Overview](#overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [UI Screens & Workflows](#ui-screens--workflows)
4. [Sidebar Navigation by Role](#sidebar-navigation-by-role)
5. [Architecture Overview](#architecture-overview)
6. [Workflow Stages](#workflow-stages)
7. [Data Flow](#data-flow)
8. [Storage Systems](#storage-systems)
9. [Key Services](#key-services)
10. [Approval Flow](#approval-flow)
11. [Technical Implementation](#technical-implementation)

---

## Overview

Aegis AI Compliance Platform is a comprehensive solution for ensuring digital content compliance with EU AI Act Article 50 and brand safety requirements. The platform provides automated synthetic media detection, disclosure generation, brand suitability checks, consent verification, and immutable audit trails.

### Key Features
- **Multi-Modal Detection**: Analyzes images, videos, audio, and text for synthetic content
- **C2PA Verification**: Validates content credentials and provenance chains
- **Brand Suitability**: Multi-label classification for safety and appropriateness
- **Consent Management**: Face/voice presence detection for likeness verification
- **Evidence Generation**: Creates immutable PDF evidence packs for compliance
- **WORM Storage**: Write-Once-Read-Many audit trails for regulatory compliance
- **Real-time Notifications**: Slack/Teams integration for status updates

### Performance Targets
- Image scans: ≤2 seconds
- Video processing: ≤0.5× realtime
- ≥95% of assets routed through pre-flight publish gate

---

## User Roles & Permissions

### 1. Brand Manager / Content Reviewer

**Primary Responsibilities:**
- Upload and ingest assets via web UI or watched folders
- Run pre-flight scans (one-click orchestration)
- View dashboard with confidence scores and violations
- Fix/iterate on assets using disclosure templates
- Generate evidence packs
- Submit assets for legal approval

**Key Capabilities:**
1. **Upload / Ingest Asset**
   - Direct web upload (drag & drop)
   - Watch folder integration (GDrive, S3, SharePoint)
   - Batch upload support

2. **Run Pre-Flight Scan**
   - One-click scan trigger
   - Parallel processing: synthetic detection, brand suitability, consent, policy checks
   - Real-time progress tracking

3. **View Dashboard**
   - Compliance metrics (KPIs)
   - Confidence scores visualization
   - Flagged issues summary
   - Missing disclosures alerts

4. **Fix / Iterate**
   - Disclosure template insertion
   - Auto-generated Article 50 text per channel
   - Re-run pre-flight scans
   - Force pass with commentary (for Legal review)

5. **Generate Evidence Pack**
   - Automatic PDF generation
   - Detector results summary
   - Disclosure proof
   - C2PA status
   - Consent records

6. **Submit for Legal Approval**
   - Move asset to compliance review queue
   - Trigger email/Slack notifications
   - Deep-link to approval interface

**Access Level:** Workspace-level access, can view and edit own assets

---

### 2. Legal / Approver

**Primary Responsibilities:**
- Review assets from compliance queue
- Validate detection findings
- Approve or reject assets with attestations
- Create immutable approval records

**Key Capabilities:**
1. **Receive Review Notification**
   - Slack/Teams alerts: "Asset ready for legal review"
   - Deep-link to approval interface
   - Email notifications with asset summary

2. **Review Evidence Pack**
   - Split-screen approval interface
   - Left: Asset preview with violation markers
   - Right: Evidence pack PDF + attestation form
   - Scrollable evidence sections

3. **Validate Findings**
   - Confirm synthetic detection results
   - Verify disclosure correctness
   - Check consent status
   - Review brand-suitability overrides

4. **Approve or Reject**
   - **Approve**: Digital signature attestation
     - "Contains synthetic scenes - properly disclosed"
     - Custom attestation text
     - Override justifications
     - Validity period setting
   - **Reject**: Detailed remediation comments
     - "Missing AI disclosure overlay"
     - Specific violation references
     - Required actions list

5. **Immutable Record Creation**
   - WORM storage log
   - Digital signature
   - Timestamp (NTP-verified)
   - IP address capture
   - Audit trail entry

**Access Level:** Workspace-level access, can approve/reject assets in assigned queue

---

### 3. Brand Admin

**Primary Responsibilities:**
- Initial workspace setup and configuration
- Policy and threshold management
- Integration setup
- User management
- System monitoring and audits

**Key Capabilities:**
1. **Initial Setup**
   - Create workspaces (brands)
   - Configure user roles
   - Set default geo presets (DE, FR, IT, ES)
   - Workspace branding

2. **Policy & Threshold Configuration**
   - Brand-suitability thresholds (alcohol, minors, violence)
   - EU AI Act template configuration
   - Geo-specific rule sets
   - Channel requirements (Instagram, YouTube, TikTok)

3. **Integrations**
   - Storage connections (GDrive, SharePoint, S3)
   - Slack/Teams webhook setup
   - Billing tracking systems
   - API key management

4. **Monitoring & Audits**
   - System-wide dashboards
   - Metrics: % disclosed, average approval time, open violations
   - Export read-only audit logs from WORM bucket
   - Usage analytics

5. **User Management**
   - Add/remove users
   - Assign roles and permissions
   - Reset SSO access (OIDC)
   - User activity logs

**Additional Access:**
- Full access to Reviewer and Approver functionalities
- Read-only access to immutable logs
- Cannot alter approvals post-sign-off (regulatory safeguard)

**Access Level:** Workspace-level admin, full control over workspace settings

---

### 4. Super Admin (Aegis AI Founding Team)

**Primary Responsibilities:**
- System-wide oversight
- Global policy control
- Billing and metering
- Audit viewer access
- System alerts management

**Key Capabilities:**
1. **Admin Console (Dashboard)**
   - KPI cards:
     - Total assets scanned
     - Average approval time
     - Synthetic % disclosed
     - Violations by category
   - Filters: Brand, Geo, Time period
   - Cross-workspace analytics

2. **Policy Control Panel**
   - Global threshold sliders
     - Synthetic confidence ≥ 0.85 - block
     - Brand suitability thresholds
   - Geo presets editor (DE/FR/IT/ES)
   - Template management

3. **System Alerts Tab**
   - Assets with >3 overrides flagged
   - >90% synthetic confidence still approved
   - Slack/email notifications to Brand Admin
   - Anomaly detection

4. **Audit Viewer**
   - Read-only timeline from WORM storage
   - Search by: user, asset ID, violation type
   - Export audit reports
   - Compliance verification

5. **Billing & Metering Panel**
   - Real-time counters from Redis
   - Usage percentage vs plan limits
   - Per-workspace billing
   - Usage alerts (80%, 100%)

**Restrictions:**
- No manual override of user attestations
- No modification of WORM records
- Separate credentials (founding team only)
- Stored in secure vault

**Access Level:** System-wide admin, cross-workspace access

---

## UI Screens & Workflows

### Screen 1: Login / Authentication
**Access:** All users
**Features:**
- SSO integration (OIDC)
- Email/password fallback
- Workspace selection (if multiple)
- Role-based redirect after login

---

### Screen 2: Dashboard (Compliance Dashboard)
**Access:** All roles (content varies by role)
**Brand Manager/Reviewer View:**
- **Title:** "Compliance Dashboard"
- **Subtitle:** "Real-time compliance metrics for [Workspace Name]"
- **KPI Cards:**
  - **ASSETS WITH CONTENT COMPLIANT**: 95% (green), "3% from last month"
  - **SYNTHETIC DISCLOSED PROPERLY**: 89% (orange), "2% from last month"
  - **AVG APPROVAL TIME**: 18min (orange)
  - **OPEN VIOLATIONS**: 7 (red), "3 critical, 4 warnings"
- **Recent Assets Table:**
  - Columns: Asset, Type, Synthetic %, Violations, Status, Uploaded, Actions
  - Example rows:
    - spring-campaign-bars.mp4 | Video | 80% | 2 | Failed | 18 min ago | Review
    - product-launch-ad.jpg | Image | 12% | 0 | Passed | 35 min ago | View
    - instagram-story.mp4 | Video | 0% | 0 | Passed | 1 hr ago | View
- **Quick Actions:**
  - "Upload Assets" button
  - "Generate Report" button
  - "View All Assets" link

**Legal/Approver View:**
- **Pending Approvals Queue:**
  - List of assets awaiting review
  - Priority indicators
  - Time in queue
  - Quick preview thumbnails
- **Recent Approvals:**
  - Last 10 approved/rejected assets
  - Approval timestamps
  - Attestation summaries

**Brand Admin View:**
- **Workspace Overview:**
  - All KPIs from Reviewer view
  - User activity metrics
  - Integration status
  - Policy compliance rate

**Super Admin View:**
- **System-Wide KPIs:**
  - Total assets across all workspaces
  - Cross-workspace violation trends
  - System health metrics
  - Billing overview

---

### Screen 3: Upload & Scan Assets
**Access:** Brand Manager/Reviewer, Brand Admin
**Features:**
- **Upload Area:**
  - Large drag-and-drop zone
  - Cloud icon
  - "Drop files here or click to browse"
  - "Supports images, videos, audio, and text files up to 5GB"
  - "Select Files" button
- **Scan Options:**
  - **Target Channel** dropdown: YouTube, Instagram, TikTok, Facebook, etc.
  - **Target Geography** dropdown: EU (MD), Germany, France, Italy, Spain, etc.
  - Checkboxes:
    - "Auto-generate disclosure if needed"
    - "Embed Content Credentials on export"
- **Quick Actions:**
  - "Import from Google Drive" button
  - "Set up watch folder" button
- **Upload Progress:**
  - Real-time progress bars
  - File size and type validation
  - Error handling

---

### Screen 4: Asset Review
**Access:** Brand Manager/Reviewer, Brand Admin, Legal/Approver (read-only)
**Features:**
- **Header:**
  - Asset name: "spring-campaign-bars.mp4"
  - Upload timestamp: "Uploaded 10 minutes ago"
  - Status badge: Failed/Passed/Review Required
- **Asset Preview:**
  - Video player with frame navigation
  - Image viewer with zoom
  - Red bounding boxes on detected objects
  - Playback controls: Previous Frame, Play, Next Frame
- **Detection Results Section:**
  - **Synthetic Content**: 85% (red progress bar)
  - **C2PA Status**: Valid (green checkmark) / Invalid / Not Present
  - **Face/Voice Present**: Yes/No (with count)
- **Brand Suitability Section:**
  - **Alcohol**: 82% (red progress bar)
  - **Minors**: 3% (orange progress bar)
  - **Violence**: 0% (green progress bar)
  - Additional categories as configured
- **Violations Detected Section (Red Highlight):**
  - List of violations:
    - "Missing AI disclosure (85% synthetic confidence)"
    - "Possible alcohol content at 0:23-0:45"
  - Click to jump to violation location
- **Required Actions Section:**
  - Numbered action list:
    1. Add AI disclosure to video
    2. Review alcohol content
    3. Attach model consent
  - "Generate Disclosure" button
- **Action Buttons:**
  - "Reject Asset" (red)
  - "Request Changes" (orange)
  - "Save Draft" (gray)
  - "Pre-Flight Check" (primary, re-run scan)
  - "Submit for Approval" (green, if passed)

---

### Screen 5: Generate AI Disclosure
**Access:** Brand Manager/Reviewer, Brand Admin
**Features:**
- **Title:** "Generate AI Disclosure"
- **Select Disclosure Template Section:**
  - **Standard EU AI Act (Article 50)** (selected, blue border):
    - Text: "This content was generated/manipulated using artificial intelligence systems."
  - **Germany Specific (Stricter)**:
    - Text: "Dieses Material wurde mit künstlicher Intelligenz erstellt/bearbeitet."
  - **Creative Industry Standard**:
    - Text: "AI-enhanced imagery. Real product shown."
- **Customize Disclosure Section:**
  - **Disclosure Text** field (textarea):
    - Pre-filled with selected template
    - Editable
    - Character count
  - **Placement (Video)** Checkboxes:
    - "Lower third (10 sec)" (checked)
    - "Video description" (checked)
    - "Opening title card" (unchecked)
    - "End screen" (unchecked)
  - **Placement (Image)** Options:
    - Overlay position selector
    - Caption/description toggle
- **Compliance Check Section (Green Highlight):**
  - "This disclosure meets EU AI Act Article 50 requirements for Germany."
  - Warning if non-compliant
- **Action Buttons:**
  - "Apply Disclosure" (primary)
  - "Preview" (secondary, shows preview)
  - "Cancel" (ghost)

---

### Screen 6: Pre-Flight Approval (Evidence Pack)
**Access:** Legal/Approver, Brand Admin, Super Admin (read-only)
**Features:**
- **Title:** "Pre-Flight Approval"
- **Evidence Pack Tabs:**
  - **Summary** (selected)
  - **Synthetic Analysis**
  - **Disclosures**
  - **Brand Safety**
  - **Consent**
- **Split-Screen Layout:**
  - **Left Panel:** Asset preview with violation markers
  - **Right Panel:** Evidence pack viewer + attestation form
- **Compliance Summary Section:**
  - Asset ID: "ext_2025_10_20_323456"
  - Hash: "sha256:abc123..."
  - Synthetic Confidence: 86%
  - C2PA Status: Valid
  - Overall Status: Pass/Fail
- **Required Disclosures Applied Section (Yellow Highlight):**
  - List of applied disclosures:
    - "AI disclosure in lower third (10 sec)"
    - "AI notice in video description"
  - Screenshot thumbnails
- **Attestation & Approval Section:**
  - **Select Attestation** dropdown:
    - "Contains synthetic scenes - properly disclosed"
    - "No synthetic content detected"
    - "Custom attestation"
  - **Override Justification** textarea:
    - Pre-filled if overrides exist
    - "Background bottle in scene, not main focus of content. Does not promote alcohol consumption."
  - **Validity Period** field:
    - Date picker: "29/10/2024"
    - Calendar icon
  - **Legal Notice Section (Yellow Highlight):**
    - "By approving, you attest that this content complies with EU AI Act Article 50 and accept legal responsibility for this information."
  - **Checkbox:**
    - "I have reviewed the evidence pack and confirm compliance." (required)
  - **Action Buttons:**
    - "Approve & Sign" (green, primary)
    - "Reject" (red)
    - "Request Changes" (orange)
    - "Save Draft" (gray)

---

### Screen 7: Violations Dashboard
**Access:** All roles (filtered by permissions)
**Features:**
- **Filters:**
  - Severity: Critical, Warning, Info
  - Type: Missing Disclosure, Brand Suitability, Consent, C2PA
  - Status: Open, Resolved, Overridden
  - Date range
- **Violations Table:**
  - Asset name (link to review)
  - Violation type
  - Severity badge
  - Detected date
  - Assigned to
  - Status
  - Actions: Review, Override, Resolve
- **Summary Cards:**
  - Total violations
  - Critical violations
  - Resolved this month
  - Average resolution time

---

### Screen 8: Settings
**Access:** Brand Admin, Super Admin
**Features:**
- **Workspace Settings:**
  - Workspace name and branding
  - Default geo presets
  - Default channels
- **Policy Configuration:**
  - Synthetic confidence thresholds
  - Brand suitability thresholds (alcohol, minors, violence)
  - Disclosure requirements per geo
- **Integrations:**
  - Google Drive connection
  - SharePoint connection
  - S3 bucket configuration
  - Slack webhook
  - Teams webhook
- **User Management:**
  - User list with roles
  - Add/remove users
  - Role assignments
  - SSO configuration

---

### Screen 9: Super Admin Dashboard
**Access:** Super Admin only
**Features:**
- **System-Wide KPIs:**
  - Total assets scanned (all workspaces)
  - Average approval time
  - Synthetic % disclosed
  - Violations by category
- **Policy Control Panel:**
  - Global threshold sliders
  - Geo presets editor
  - Template management
- **System Alerts:**
  - Assets with >3 overrides
  - High-risk approvals (>90% synthetic)
  - System health alerts
- **Audit Viewer:**
  - Search interface
  - Timeline view
  - Export functionality
- **Billing & Metering:**
  - Real-time usage counters
  - Per-workspace billing
  - Plan limits and alerts

---

## Sidebar Navigation by Role

### Brand Manager / Content Reviewer Sidebar

```typescript
const reviewerNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload Assets", href: "/upload", icon: Upload },
  { name: "Recent Assets", href: "/assets", icon: FileText },
  { name: "Violations", href: "/violations", icon: AlertTriangle },
  { name: "Evidence Packs", href: "/evidence", icon: Package },
  { name: "Settings", href: "/settings", icon: Settings },
];
```

**Visible Buttons:**
- Upload Assets (primary action)
- View Assets
- Review Violations
- Download Evidence Packs
- Generate Disclosures
- Submit for Approval
- Re-run Pre-Flight Scan

---

### Legal / Approver Sidebar

```typescript
const approverNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pending Approvals", href: "/approvals", icon: CheckCircle },
  { name: "Evidence Packs", href: "/evidence", icon: Package },
  { name: "Violations", href: "/violations", icon: AlertTriangle },
  { name: "Audit Log", href: "/audit", icon: FileSearch },
  { name: "Settings", href: "/settings", icon: Settings },
];
```

**Visible Buttons:**
- Approve & Sign
- Reject
- Request Changes
- View Evidence Pack
- Download Certificate
- Add Attestation
- Override Violation (with justification)

---

### Brand Admin Sidebar

```typescript
const adminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload Assets", href: "/upload", icon: Upload },
  { name: "Recent Assets", href: "/assets", icon: FileText },
  { name: "Violations", href: "/violations", icon: AlertTriangle },
  { name: "Evidence Packs", href: "/evidence", icon: Package },
  { name: "Approvals", href: "/approvals", icon: CheckCircle },
  { name: "Team & Roles", href: "/team", icon: Users },
  { name: "Billing & Usage", href: "/billing", icon: CreditCard },
  { name: "Integrations", href: "/integrations", icon: Blocks },
  { name: "Policies", href: "/policies", icon: Shield },
  { name: "Audit Log", href: "/audit", icon: FileSearch },
  { name: "Settings", href: "/settings", icon: Settings },
];
```

**Visible Buttons:**
- All Reviewer buttons
- All Approver buttons
- Manage Users
- Configure Policies
- Setup Integrations
- View Billing
- Export Audit Logs
- Workspace Settings

---

### Super Admin Sidebar

```typescript
const superAdminNavigation = [
  { name: "Admin Console", href: "/super-admin", icon: LayoutDashboard },
  { name: "Policy Control", href: "/super-admin/policies", icon: Shield },
  { name: "System Alerts", href: "/super-admin/alerts", icon: AlertTriangle },
  { name: "Audit Viewer", href: "/super-admin/audit", icon: FileSearch },
  { name: "Billing & Metering", href: "/super-admin/billing", icon: CreditCard },
  { name: "Workspace Management", href: "/super-admin/workspaces", icon: Blocks },
  { name: "Settings", href: "/super-admin/settings", icon: Settings },
];
```

**Visible Buttons:**
- View All Workspaces
- Manage Global Policies
- View System Alerts
- Access Audit Viewer
- Manage Billing
- Configure System Settings
- Export System Reports

---

## Architecture Overview

### Entry Points
1. **User (Web UI)** - Mandatory for MVP
   - Direct browser uploads
   - Manual asset management
   - Review and approval interface

2. **Watch Folders** - Mandatory for MVP
   - Google Drive monitoring
   - SharePoint integration
   - S3 bucket watching
   - Auto-import every ≤2 minutes


### Frontend Layer
- **Technology:** React + TypeScript + Vite
- **UI Framework:** shadcn/ui (Radix UI components)
- **State Management:** Redux Toolkit + React Query
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Authentication:** OIDC (OpenID Connect)

### API Gateway
- **Purpose:**
  - Centralized authentication/authorization
  - Rate limiting
  - Request routing
  - API versioning
  - Error handling
- **Security:** OIDC bearer tokens required
- **Performance:**
  - Synchronous: Image scans ≤2s
  - Asynchronous: Video processing queued

### Orchestration Layer
- **Orchestrator Service:**
  - Workflow management
  - Service coordination
  - State management
  - Decision logic
  - Error handling
  - Performance optimization

---

## Workflow Stages

### 1. Asset Intake (Multiple Entry Points)
- Direct web upload
- Watch folder monitoring
- Adobe plugin export

### 2. Initial Processing
- Orchestrator coordinates operations
- Assets hashed and stored in Object Store
- Metadata extracted to Postgres
- Async jobs queued in Redis

### 3. Parallel Analysis Pipeline
Services work simultaneously:
- **Detection Service:** Synthetic media signals, watermark verification
- **C2PA Service:** Content credentials and provenance
- **Suitability Service:** Brand safety classifiers
- **Consent Service:** Face/voice presence detection
- **Policy Service:** EU AI Act Article 50 and geo-specific rules

### 4. Pre-Flight Gate
System aggregates all checks:
- Pass/Fail status with reasons
- Required disclosures
- Brand suitability violations
- Missing consent documentation

### 5. Evidence Generation
- Creates immutable PDF evidence packs
- Stores in WORM bucket
- Includes all detection results, attestations, compliance proof

### 6. Audit & Compliance
- Every action logged to immutable audit trail
- Billing events tracked
- Attestations captured with signer identity

---

## Data Flow

### Asset Intake Flow
```
User → Web Frontend → API Gateway → Orchestrator
Watch Folder → API Gateway → Orchestrator
Adobe Plugin → API Gateway → Orchestrator
```

### Orchestration Flow
```
Gateway → Orchestrator
Orchestrator → Object Store (Hash & Store)
Orchestrator → Postgres (Extract Metadata)
Orchestrator → Redis (Queue Analysis)
```

### Detection Pipeline
```
Orchestrator → Redis (Queue Analysis)
Redis → Detection Service (Async Job)
Detection Service → Postgres (Synthetic Signals)
Detection Service → Orchestrator (Confidence Scores)
```

### C2PA Verification
```
Orchestrator → C2PA Service (Verify Provenance)
C2PA Service → Postgres (Manifest Status)
C2PA Service → Object Store (Chain Preservation)
```

### Policy Checks
```
Orchestrator → Policy Service (Apply Rules)
Policy Service → Postgres (EU AI Act Article 50)
Policy Service → Orchestrator (Geo Filters)
```

### Brand Suitability
```
Orchestrator → Suitability Service (Safety Scan)
Suitability Service → Postgres (Multi-label Classification)
Suitability Service → Orchestrator (Violations)
```

### Consent Verification
```
Orchestrator → Consent Service (Likeness Check)
Consent Service → Postgres (Face/Voice Presence)
Consent Service → Orchestrator (Consent Status)
```

### Pre-Flight Gate
```
Orchestrator → Evidence Service (Aggregate Results)
Evidence Service → Object Store (Generate Pack)
Evidence Service → WORM (Certificate)
```

### Approval Flow
```
Evidence Pack → Web Frontend
Web Frontend → Gateway (Approve/Reject)
Gateway → Audit Service (Attestation)
Audit Service → WORM (Final Log)
```

---

## Storage Systems

### 1. Object Store (Assets/Evidence)
- **Purpose:** Store original assets and evidence packs
- **Contents:**
  - Original uploaded assets (images, videos, audio)
  - Generated evidence packs (PDFs)
  - Processed/transformed assets
  - Disclosure placement screenshots
- **Characteristics:**
  - Scalable for large media files
  - CDN-ready (S3 or similar)
  - Versioning support
  - Retention: 180 days for assets, 365 days for evidence

### 2. Postgres DB (Metadata)
- **Purpose:** Store business data and metadata
- **Contents:**
  - Asset metadata (filename, hash, upload time, owner)
  - Detection results and confidence scores
  - User accounts and RBAC permissions
  - Workspace/brand configurations
  - Policy thresholds and rules
  - Billing events and usage metrics
  - Consent attachments references
- **Characteristics:**
  - ACID compliance
  - Relational structure
  - Queryable for dashboards
  - Indexed for fast lookups

### 3. WORM Bucket (Immutable Logs)
- **Purpose:** Legal compliance and audit trails
- **Contents:**
  - Audit trail events
  - Signed attestations
  - Evidence pack copies
  - Approval records
  - Policy violation overrides
- **Characteristics:**
  - Write Once, Read Many
  - Cannot be modified or deleted
  - Cryptographic verification
  - Retention: 365+ days
  - Legal defensibility

### 4. Redis Queue (Async Jobs)
- **Purpose:** Task queuing and caching
- **Contents:**
  - Video processing job queues
  - Audio analysis tasks
  - Batch operation statuses
  - Rate limiting counters
  - Session data/temporary caches
  - Real-time notification queues
- **Characteristics:**
  - In-memory (fast)
  - Ephemeral (can be lost on restart)
  - Pub/Sub capable
  - TTL support

---

## Key Services

### Detection Service
- **Modalities:** Image, Video, Audio, Text
- **Output:** Confidence scores (0.0 to 1.0)
- **Processing:**
  - Images: Full resolution analysis (≤2s)
  - Video: Frame sampling + temporal analysis (≤0.5× realtime)
  - Audio: Spectral analysis + voice synthesis detection
  - Text: Token pattern analysis
- **Storage:** Results in Postgres, confidence scores to Orchestrator

### C2PA Service
- **Function:** Verify content credentials and provenance
- **Checks:**
  - C2PA manifest presence
  - Cryptographic signature validation
  - Provenance chain extraction
- **Outcomes:** Pass, Fail, Not Present
- **Storage:** Manifest status in Postgres, chain preservation in Object Store

### Policy Service
- **Function:** Apply regulatory requirements
- **Rules:**
  - EU AI Act Article 50
  - Geo-specific requirements (DE, FR, IT, ES)
  - Channel requirements (Instagram, YouTube, TikTok)
  - Industry vertical rules
- **Output:** Required disclosure level, specific text, placement requirements
- **Storage:** Compliance determinations in Postgres

### Suitability Service
- **Function:** Multi-label brand safety classification
- **Categories:**
  - Alcohol detection
  - Minor/under-18 detection
  - Nudity/sexual content
  - Violence/gore/weapons
  - Hate symbols
  - Drug references
  - Misleading health claims
  - Trademark/counterfeit detection
- **Output:** Confidence scores per category, violations with locations
- **Storage:** Classification results in Postgres

### Consent Service
- **Function:** Face/voice presence detection for likeness verification
- **Detection:**
  - Face detection (NOT recognition)
  - Voice detection (NOT voiceprint matching)
  - Synthetic likeness markers
- **Output:** Presence status, counts, prominence scores
- **Storage:** Detection results in Postgres
- **Privacy:** No biometric data stored (per PRD)

### Evidence Service
- **Function:** Generate comprehensive evidence packs
- **Contents:**
  - Cover sheet with asset ID and hash
  - Synthetic media analysis
  - Disclosure proof
  - C2PA status
  - Brand suitability results
  - Consent status
  - Attestation form
- **Format:** PDF
- **Storage:** Object Store (downloadable), WORM (immutable certificate)

### Audit Service
- **Function:** Create immutable audit trails
- **Events Logged:**
  - Asset uploads
  - Analysis initiation
  - Violations detected
  - Manual overrides
  - Disclosures generated
  - Approvals/rejections
  - Publishing actions
- **Storage:** WORM bucket (immutable), Postgres (attestations for quick access)

### Billing Service
- **Function:** Track usage for SaaS monetization
- **Metered Events:**
  - Image scans
  - Video processing minutes
  - Text analysis
  - Evidence packs generated
  - Active seats/users
  - Storage consumed
- **Storage:** Postgres (persistent records), Redis (real-time counters)
- **Alerts:** 80% and 100% usage warnings

---

## Approval Flow

### Step 1: Evidence Pack Generation
- Evidence Service aggregates all service results
- Generates comprehensive PDF evidence pack
- Stores in Object Store
- Creates certificate in WORM

### Step 2: Notification
- Slack/Teams alert: "Asset ready for legal review"
- Email notification with asset summary
- Deep-link to approval interface

### Step 3: Review Interface
- Split-screen layout:
  - Left: Asset preview with violation markers
  - Right: Evidence pack PDF viewer + attestation form
- Reviewer can:
  - Navigate evidence pack tabs
  - View detection results
  - Review disclosures
  - Check consent status

### Step 4: Approval Decision
- **Approve:**
  - Select attestation type
  - Add custom text if needed
  - Provide override justifications
  - Set validity period
  - Confirm legal notice
  - Digital signature
- **Reject:**
  - Specify rejection reasons
  - List remediation required
  - Add comments

### Step 5: Immutable Record Creation
- Audit Service creates WORM entry:
  - Event type: ASSET_APPROVAL or ASSET_REJECTION
  - Timestamp (NTP-verified)
  - Approver identity and credentials
  - Asset hash and evidence pack hash
  - Attestation text
  - Digital signature
  - IP address and device fingerprint
- Secondary indexes created (also immutable):
  - By asset ID
  - By approver
  - By date
  - By violation type

### Step 6: Notifications
- Approval/rejection notifications sent
- Asset status updated
- Stakeholders notified

---

## Technical Implementation

### Frontend Stack
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.8.3
- **Build Tool:** Vite 5.4.19
- **UI Components:** shadcn/ui (Radix UI)
- **Styling:** Tailwind CSS 3.4.17
- **State Management:**
  - Redux Toolkit 2.11.1
  - React Query 5.83.0
  - Redux Persist 6.0.0
- **Routing:** React Router DOM 6.30.1
- **Forms:** React Hook Form 7.61.1 + Zod 3.25.76
- **Charts:** Recharts 2.15.4
- **Icons:** Lucide React 0.462.0

### Key Dependencies
- **Authentication:** OIDC (to be implemented)
- **API Client:** Custom implementation with React Query
- **Notifications:** Sonner 1.7.4 (toast notifications)
- **Date Handling:** date-fns 3.6.0
- **Validation:** Zod 3.25.76

### Project Structure
```
src/
├── api/              # API service definitions
├── api-client/       # API client configuration
├── assets/           # Static assets (images, fonts)
├── components/       # Reusable components
│   ├── layout/      # Layout components (Header, Sidebar, AppLayout)
│   └── ui/          # shadcn/ui components
├── context/         # Redux store and slices
├── environment/     # Environment configuration
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── pages/           # Page components
├── routers/         # Route definitions
└── main.tsx         # Application entry point
```

### Environment Configuration
- Development, staging, production environments
- API endpoint configuration
- OIDC provider settings
- Feature flags

### Authentication Flow
1. User attempts to access protected route
2. Check for valid token in Redux store
3. If no token, redirect to login
4. Login page handles OIDC flow
5. On success, store token and user data
6. Redirect to original destination or dashboard

### Role-Based Access Control (RBAC)
- User roles stored in Redux store
- Route protection based on role
- Component-level permission checks
- Sidebar navigation filtered by role
- Button visibility based on permissions

---

## Button Visibility Matrix

### Brand Manager/Reviewer Buttons

| Button | Location | Condition |
|--------|----------|-----------|
| Upload Assets | Dashboard, Sidebar | Always visible |
| Generate Disclosure | Asset Review | When violations detected |
| Submit for Approval | Asset Review | When pre-flight passes |
| Re-run Pre-Flight | Asset Review | Always visible |
| Save Draft | Asset Review | Always visible |
| Request Changes | Asset Review | Always visible |
| Reject Asset | Asset Review | Always visible |
| View Evidence Pack | Assets List | When pack generated |
| Download Evidence Pack | Evidence Packs | Always visible |

### Legal/Approver Buttons

| Button | Location | Condition |
|--------|----------|-----------|
| Approve & Sign | Pre-Flight Approval | When evidence reviewed |
| Reject | Pre-Flight Approval | Always visible |
| Request Changes | Pre-Flight Approval | Always visible |
| View Evidence Pack | Pending Approvals | Always visible |
| Download Certificate | Pre-Flight Approval | After approval |
| Override Violation | Pre-Flight Approval | With justification required |
| Add Attestation | Pre-Flight Approval | Always visible |

### Brand Admin Buttons

| Button | Location | Condition |
|--------|----------|-----------|
| All Reviewer buttons | Various | Always visible |
| All Approver buttons | Various | Always visible |
| Manage Users | Team Page | Always visible |
| Configure Policies | Settings | Always visible |
| Setup Integrations | Integrations | Always visible |
| View Billing | Billing | Always visible |
| Export Audit Logs | Audit Log | Always visible |
| Workspace Settings | Settings | Always visible |

### Super Admin Buttons

| Button | Location | Condition |
|--------|----------|-----------|
| View All Workspaces | Admin Console | Always visible |
| Manage Global Policies | Policy Control | Always visible |
| View System Alerts | System Alerts | Always visible |
| Access Audit Viewer | Audit Viewer | Always visible |
| Manage Billing | Billing & Metering | Always visible |
| Configure System Settings | Settings | Always visible |
| Export System Reports | Admin Console | Always visible |

---

## Error Handling

### Upload Errors
- File size exceeded → Show error message with limit
- Unsupported format → List supported formats
- Network error → Retry mechanism
- Storage quota exceeded → Upgrade prompt

### Processing Errors
- Detection service failure → Fallback to advisory mode
- C2PA verification error → Log and continue
- Policy service error → Use default rules
- Timeout → Queue for retry

### Approval Errors
- Evidence pack missing → Regenerate and block approval
- Credentials expired → Require re-authentication
- Concurrent approval → First wins, second gets error
- WORM write failure → Retry with exponential backoff

---

## Notification System

### Slack/Teams Integration
- **Triggers:**
  - Asset scan complete (pass/fail)
  - High-risk violations detected
  - Approval required
  - Evidence pack ready
  - Processing errors
  - Monthly usage warnings
- **Message Format:**
  - Asset name and thumbnail
  - Pass/fail status with summary
  - Deep link to web dashboard
  - Quick stats (violations count, etc.)

### Email Notifications
- Approval requests
- Violation alerts
- Usage warnings
- System updates

### In-App Notifications
- Toast notifications for actions
- Badge counts for pending items
- Real-time status updates

---

## Compliance & Security

### Data Privacy
- No biometric data storage (face/voice presence only)
- GDPR compliance
- Data retention policies
- User data export capability

### Audit Trail
- Immutable WORM storage
- Cryptographic verification
- NTP-verified timestamps
- Complete action history

### Access Control
- OIDC authentication
- Role-based permissions
- Workspace isolation
- Session management

### Regulatory Compliance
- EU AI Act Article 50
- Geo-specific requirements
- Disclosure requirements
- Consent management

---

## Performance Optimization

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies

### Backend
- Async processing for videos
- Parallel service execution
- Redis caching
- Database indexing

### Monitoring
- Performance metrics
- Error tracking
- Usage analytics
- System health checks

---

## Future Enhancements

### Phase 2 Features
- Adobe CC Plugin full integration
- Zapier/Make.com API access
- Advanced analytics dashboard
- Custom disclosure templates
- Multi-language support
- Mobile app

### Integration Opportunities
- Project management tools
- Content management systems
- Marketing automation platforms
- Compliance reporting tools

---

## Setup Instructions

### Prerequisites
- Node.js 18+ or Bun
- npm/yarn/pnpm package manager
- Git

### Installation
```bash
# Clone repository
git clone <repository-url>
cd aegis-ui-pilot

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

### Environment Variables
Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_ISSUER=https://your-oidc-provider
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
```

### Build for Production
```bash
npm run build
# or
bun run build
```

---

## Conclusion

This documentation provides a comprehensive overview of the Aegis AI Compliance Platform, including user roles, UI screens, workflows, architecture, and technical implementation details. The platform ensures compliance with EU AI Act requirements while maintaining performance targets and providing complete traceability for regulatory audits.

For questions or clarifications, please refer to the codebase or contact the development team.


