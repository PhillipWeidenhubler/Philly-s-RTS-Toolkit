# Discussion Channel Structure

This document provides a visual overview of the discussion channel organization and flow.

## Channel Hierarchy

```
GitHub Discussions (Philly's RTS Toolkit)
│
├── 📢 Announcements (Maintainers Only)
│   ├── Release announcements
│   ├── Major feature announcements
│   ├── Breaking changes
│   └── Community milestones
│
├── 💬 General Discussion
│   ├── Getting started
│   ├── General questions
│   ├── Community chat
│   └── Off-topic RTS talk
│
├── ❓ Q&A (Questions & Answers)
│   ├── How-to questions
│   ├── Feature usage
│   ├── Best practices
│   └── Tips and tutorials
│
├── 🎨 Unit Design Showcase
│   ├── Unit designs and feedback
│   ├── Historical recreations
│   ├── Balance discussions
│   └── Design patterns
│
├── ⚔️ Weapons & Ballistics
│   ├── Weapon templates
│   ├── Ammunition types
│   ├── Ballistic calculations
│   ├── Fire modes
│   └── Damage models
│
├── 🏛️ Formations & Nations
│   ├── Formation compositions
│   ├── Nation hierarchies
│   ├── Tactical organization
│   ├── Tech trees
│   └── Faction design
│
├── 📚 Data Libraries
│   ├── Unit libraries
│   ├── Weapon collections
│   ├── Formation presets
│   ├── Nation configurations
│   └── Complete data packages
│
├── 🎯 Show & Tell
│   ├── Project showcases
│   ├── Exported visualizations
│   ├── Integration examples
│   ├── Custom workflows
│   └── Creative uses
│
├── 💡 Ideas & Feature Requests
│   ├── New feature proposals
│   ├── UI/UX improvements
│   ├── Export format ideas
│   ├── Tool integrations
│   └── Quality of life improvements
│
├── 🔧 Technical Support
│   ├── Installation help
│   ├── Bug troubleshooting
│   ├── Data import/export issues
│   ├── Performance problems
│   └── Configuration help
│
└── 👨‍💻 Development & Contributing
    ├── Code architecture
    ├── Pull request discussions
    ├── Database design
    ├── Implementation details
    ├── Testing strategies
    └── Documentation
```

## User Journey Map

### New User Journey
```
1. Discovery
   ↓
2. Read README → See Community section
   ↓
3. Check DISCUSSIONS.md guide
   ↓
4. Browse existing discussions
   ↓
5. Ask question in Q&A or General
   ↓
6. Get help, learn the toolkit
   ↓
7. Create first unit → Share in Unit Design Showcase
   ↓
8. Become active community member
```

### Contributor Journey
```
1. Use toolkit, identify improvement
   ↓
2. Search Ideas category for similar suggestions
   ↓
3. Post feature request in Ideas
   ↓
4. Discuss with community
   ↓
5. Move to Development category
   ↓
6. Implement feature
   ↓
7. Submit Pull Request
   ↓
8. Share result in Show & Tell
```

### Designer Journey
```
1. Learn toolkit basics (General, Q&A)
   ↓
2. Browse unit designs for inspiration
   ↓
3. Create units using toolkit
   ↓
4. Share in Unit Design Showcase
   ↓
5. Get feedback, iterate
   ↓
6. Design weapons in Weapons & Ballistics
   ↓
7. Create formations
   ↓
8. Build complete faction/nation
   ↓
9. Share complete library in Data Libraries
   ↓
10. Showcase final project in Show & Tell
```

## Information Flow

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Discussions                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ├─────────────────┐
                          │                 │
                          ▼                 ▼
                   User Questions      Feature Ideas
                          │                 │
                          ▼                 ▼
                    Q&A Channel      Ideas Channel
                          │                 │
                          ▼                 ▼
                  Community Answers   Community Discussion
                          │                 │
                          ▼                 ▼
                  Knowledge Base      Refined Proposals
                                           │
                                           ▼
                                    GitHub Issues
                                           │
                                           ▼
                                    Implementation
                                           │
                                           ▼
                                    Pull Requests
                                           │
                                           ▼
                                    Announcements
```

## Category Relationships

```
Primary Content Channels:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Unit Design      │────▶│ Weapons &        │────▶│ Formations &     │
│ Showcase         │     │ Ballistics       │     │ Nations          │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                         │
        │                        │                         │
        └────────────────────────┴─────────────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Data Libraries   │
                        │ (Complete Sets)  │
                        └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Show & Tell      │
                        │ (Final Showcase) │
                        └──────────────────┘

Support Channels:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ General          │────▶│ Q&A              │────▶│ Technical        │
│ (Entry Point)    │     │ (Specific Qs)    │     │ Support          │
└──────────────────┘     └──────────────────┘     └──────────────────┘

Development Channels:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Ideas            │────▶│ Development      │────▶│ Announcements    │
│ (Suggestions)    │     │ (Implementation) │     │ (Release)        │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Templates & Categories Matrix

| Template | Primary Category | Secondary Categories | Purpose |
|----------|------------------|----------------------|---------|
| unit-design.md | Unit Design Showcase | Show & Tell | Share units |
| weapon-design.md | Weapons & Ballistics | Show & Tell | Discuss weapons |
| feature-request.md | Ideas | Development | Suggest features |
| technical-support.md | Technical Support | Q&A | Get help |
| data-library.md | Data Libraries | Show & Tell | Share complete sets |

## Discussion Lifecycle

```
1. CREATE
   └─ Use template or freeform
      └─ Post in appropriate category
         └─ Add labels/tags

2. ENGAGE
   └─ Community responds
      └─ Discussion evolves
         └─ Solutions emerge

3. RESOLVE
   └─ Q&A: Mark answer as accepted
   └─ Ideas: Move to Issues or close
   └─ Support: Problem solved
   └─ Showcase: Feedback received

4. ARCHIVE
   └─ Lock if complete
      └─ Pin if valuable
         └─ Reference in docs
```

## Moderation Flow

```
New Discussion
      │
      ▼
Auto-label (future automation)
      │
      ▼
Community engagement
      │
      ├─ Quality discussion → Pin if valuable
      │
      ├─ Needs attention → Moderator review
      │
      ├─ Convert to Issue → Good bug/feature
      │
      ├─ Resolved → Mark as solved/close
      │
      └─ Off-topic → Redirect to correct category
```

## Category Purpose Summary

```
┌────────────────────────────────────────────────────────────┐
│ CONTENT CREATION                                           │
│ 🎨 Unit Design Showcase    - Share and refine designs     │
│ ⚔️  Weapons & Ballistics    - Technical weapon discussion  │
│ 🏛️  Formations & Nations    - Strategic organization      │
│ 📚 Data Libraries          - Complete data packages       │
│ 🎯 Show & Tell             - Final project showcase       │
├────────────────────────────────────────────────────────────┤
│ COMMUNITY SUPPORT                                          │
│ 💬 General                 - Open discussion              │
│ ❓ Q&A                     - Questions & answers          │
│ 🔧 Technical Support       - Troubleshooting help         │
├────────────────────────────────────────────────────────────┤
│ PROJECT DEVELOPMENT                                        │
│ 💡 Ideas                   - Feature suggestions          │
│ 👨‍💻 Development            - Code collaboration           │
│ 📢 Announcements           - Official updates             │
└────────────────────────────────────────────────────────────┘
```

## Quick Decision Tree

**"Where should I post?"**

```
Do you have a question?
├─ YES → Specific question? → Q&A
└─ NO  → General discussion? → General

Want to share something?
├─ Unit design → Unit Design Showcase
├─ Weapon system → Weapons & Ballistics
├─ Formation/nation → Formations & Nations
├─ Complete library → Data Libraries
└─ Finished project → Show & Tell

Need help with a problem?
├─ Installation/error → Technical Support
├─ How to use feature → Q&A
└─ Bug report → GitHub Issues (not Discussions)

Want to suggest something?
├─ Feature idea → Ideas
├─ Code contribution → Development
└─ General feedback → General

Are you a maintainer?
└─ Official announcement → Announcements
```

---

**Last Updated:** 2025-11-20  
**Version:** 1.0
