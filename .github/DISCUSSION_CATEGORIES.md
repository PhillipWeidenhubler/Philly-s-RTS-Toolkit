# Discussion Categories Configuration Reference

This file serves as a reference for setting up GitHub Discussions categories.
# GitHub Discussions categories must be configured through the repository settings UI at:
# https://github.com/PhillipWeidenhubler/Philly-s-RTS-Toolkit/settings
#
# Navigate to: Settings > Features > Discussions > Categories
#
# Below is the recommended configuration for each category:

---

## Category 1: Announcements
- **Name:** Announcements
- **Description:** Official announcements about releases, updates, and important news
- **Emoji:** 📢
- **Format:** Announcement (maintainers can post, others can comment)
- **Purpose:** Keep community informed about official updates

## Category 2: General
- **Name:** General
- **Description:** General conversations about the toolkit and RTS game design
- **Emoji:** 💬
- **Format:** Open discussion
- **Purpose:** Catch-all for discussions that don't fit other categories

## Category 3: Unit Design Showcase
- **Name:** Unit Design Showcase
- **Description:** Share your unit designs, get feedback, and inspire others
- **Emoji:** 🎨
- **Format:** Open discussion
- **Purpose:** Community showcase and feedback on unit statcards

## Category 4: Weapons & Ballistics
- **Name:** Weapons & Ballistics
- **Description:** Discuss weapon systems, ammunition, and ballistic calculations
- **Emoji:** ⚔️
- **Format:** Open discussion
- **Purpose:** Technical discussions about weapon mechanics and balance

## Category 5: Formations & Nations
- **Name:** Formations & Nations
- **Description:** Share organizational structures and nation designs
- **Emoji:** 🏛️
- **Format:** Open discussion
- **Purpose:** Discussion of military organization and faction design

## Category 6: Ideas & Feature Requests
- **Name:** Ideas
- **Description:** Suggest new features and improvements
- **Emoji:** 💡
- **Format:** Open discussion
- **Purpose:** Gather community input on potential features

## Category 7: Technical Support
- **Name:** Technical Support
- **Description:** Get help with installation, bugs, and technical issues
- **Emoji:** 🔧
- **Format:** Open discussion
- **Purpose:** Community-driven support and troubleshooting

## Category 8: Development & Contributing
- **Name:** Development
- **Description:** Discuss development topics, architecture, and contributions
- **Emoji:** 👨‍💻
- **Format:** Open discussion
- **Purpose:** Developer collaboration and contribution coordination

## Category 9: Data Libraries
- **Name:** Data Libraries
- **Description:** Share and request unit, weapon, and formation libraries
- **Emoji:** 📚
- **Format:** Open discussion
- **Purpose:** Community data sharing and collaboration

## Category 10: Show & Tell
- **Name:** Show & Tell
- **Description:** Showcase projects and creative uses of the toolkit
- **Emoji:** 🎯
- **Format:** Open discussion
- **Purpose:** Community showcase of completed work

## Category 11: Q&A
- **Name:** Q&A
- **Description:** Ask and answer specific questions about the toolkit
- **Emoji:** ❓
- **Format:** Q&A (answers can be marked as solved)
- **Purpose:** Knowledge base of questions and answers

---

## Setup Instructions

To configure these categories in your repository:

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. In the left sidebar, click **General**
4. Scroll down to **Features** section
5. Check the **Discussions** checkbox to enable it
6. Click **Set up discussions**
7. GitHub will create a welcome discussion
8. Navigate to the **Discussions** tab
9. Click the **⚙️** (gear icon) or **Categories** section
10. Click **New category** for each category above
11. Fill in the Name, Description, and Emoji
12. Select the appropriate Format (Open discussion, Q&A, or Announcement)
13. Save each category

## Category Management

### Recommended Category Order
Present categories in this order for best user experience:
1. Announcements (pinned at top)
2. General
3. Q&A
4. Unit Design Showcase
5. Weapons & Ballistics
6. Formations & Nations
7. Data Libraries
8. Show & Tell
9. Ideas
10. Technical Support
11. Development

### Category Moderation
- **Announcements:** Restricted to maintainers/collaborators only
- **All others:** Open to all community members
- Consider adding category-specific moderators as community grows
- Pin important discussions within each category
- Archive or lock resolved discussions to keep categories clean

### Labels and Tags
Consider using these labels across categories:
- `beginner-friendly` - Good for newcomers
- `help-wanted` - Community assistance needed
- `documentation` - Related to docs
- `good-first-issue` - For new contributors
- `historical` - Historical units/weapons
- `modern` - Modern warfare
- `sci-fi` - Science fiction setting
- `fantasy` - Fantasy setting

---

## Automation Ideas

Consider setting up automation with GitHub Actions:

1. **Auto-label discussions** based on keywords
2. **Welcome message** for first-time posters
3. **Stale discussion** management
4. **Cross-posting** from Issues to appropriate categories
5. **Weekly digest** of top discussions

---

## Integration with Other Tools

### Discord/Slack
- Share discussion links in community chat
- Create webhooks for new discussions
- Mirror important announcements

### Documentation
- Link to DISCUSSIONS.md from README.md
- Create a "Community" section in docs
- Reference discussions in tutorials

### Project Management
- Convert feature requests to Issues
- Link PRs to relevant discussions
- Update discussions when features ship

---

## Metrics to Track

Monitor these metrics to understand community engagement:
- Total discussions created
- Active discussions per category
- Average response time
- Number of solved Q&A discussions
- Top contributors per category
- Most upvoted discussions

---

## Future Expansion

As the community grows, consider adding:
- **Tutorials & Guides** - Community-created learning resources
- **Events & Competitions** - Design challenges and contests
- **Integrations** - Third-party tool integrations
- **Localization** - Non-English discussions
- **Off-Topic** - Casual conversation area

---

Last Updated: 2025-11-20
For questions about discussion setup, see: https://docs.github.com/en/discussions
