# Setting Up GitHub Discussions - Quick Guide

This guide helps repository maintainers enable and configure GitHub Discussions with the categories we've designed.

## Step 1: Enable Discussions

1. Go to your repository on GitHub
2. Click **Settings** (requires admin access)
3. Scroll to the **Features** section
4. Check the **☑ Discussions** checkbox
5. Click **Set up discussions**

GitHub will automatically:
- Create a Discussions tab in your repository
- Generate a welcome discussion
- Create default categories (General, Ideas, Q&A, etc.)

## Step 2: Customize Categories

After enabling discussions, customize the categories:

1. Go to the **Discussions** tab
2. Click the **Categories** section or the ⚙️ gear icon
3. Remove or edit default categories as needed
4. Add new categories following our design

## Step 3: Create Our Custom Categories

Add these 11 categories (use the information from `.github/DISCUSSION_CATEGORIES.md`):

### Categories to Create:

| # | Name | Emoji | Description | Format |
|---|------|-------|-------------|--------|
| 1 | Announcements | 📢 | Official announcements about releases and updates | Announcement |
| 2 | General | 💬 | General conversations about the toolkit | Discussion |
| 3 | Unit Design Showcase | 🎨 | Share unit designs and get feedback | Discussion |
| 4 | Weapons & Ballistics | ⚔️ | Discuss weapon systems and ammunition | Discussion |
| 5 | Formations & Nations | 🏛️ | Share organizational structures | Discussion |
| 6 | Ideas | 💡 | Suggest new features and improvements | Discussion |
| 7 | Technical Support | 🔧 | Get help with installation and issues | Discussion |
| 8 | Development | 👨‍💻 | Discuss development and contributions | Discussion |
| 9 | Data Libraries | 📚 | Share unit/weapon/formation libraries | Discussion |
| 10 | Show & Tell | 🎯 | Showcase projects and visualizations | Discussion |
| 11 | Q&A | ❓ | Ask and answer specific questions | Q&A |

**For each category:**
1. Click **New Category**
2. Enter the **Name**
3. Enter the **Description**
4. Add the **Emoji** (paste the emoji directly)
5. Select the **Format**:
   - **Announcement** for Announcements (only maintainers can post)
   - **Q&A** for Q&A (answers can be marked as accepted)
   - **Discussion** for all others (open conversation)
6. Click **Create**

## Step 4: Post Welcome Discussion

1. Go to the Discussions tab
2. Create a new discussion in **General** or **Announcements**
3. Copy content from `.github/WELCOME_DISCUSSION.md`
4. Post it
5. **Pin** the welcome discussion to the top
6. Consider **locking** it if you only want it as a reference

## Step 5: Organize Categories

Recommended order (drag to reorder):
1. Announcements (pinned, announcement format)
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

## Step 6: Configure Discussion Settings

1. Go to **Settings** > **Discussions**
2. Enable recommended settings:
   - ☑ Allow users to convert issues to discussions
   - ☑ Enable comment threading
   - ☑ Enable discussion polls (optional)
   - ☑ Enable discussion reactions

## Step 7: Set Up Moderation (Optional)

1. Add moderators if needed:
   - Go to **Settings** > **Collaborators**
   - Invite moderators with "Maintain" or "Triage" role
2. Create discussion guidelines (already in `.github/DISCUSSIONS.md`)
3. Set up Code of Conduct if not already present

## Step 8: Promote Discussions

Update repository to promote discussions:

- ✅ README.md - Already updated with discussion links
- ✅ CONTRIBUTING.md - Consider creating or updating
- ✅ Issue templates - Add note about using discussions for questions
- ✅ Pull request template - Mention related discussions

## Templates Available

We've created several discussion templates in `.github/DISCUSSION_TEMPLATE/`:

1. **unit-design.md** - For sharing unit designs
2. **feature-request.md** - For suggesting features
3. **technical-support.md** - For getting help
4. **data-library.md** - For sharing libraries

**To use templates:**
- Users can reference them from `.github/DISCUSSION_TEMPLATE/`
- Consider pinning template discussions in relevant categories
- Link to templates in category descriptions

## Quick Reference Files

All documentation is in `.github/`:

- **DISCUSSIONS.md** - Complete guide for users
- **DISCUSSION_CATEGORIES.md** - Category configuration reference
- **DISCUSSION_TEMPLATE/** - Templates for structured posts
- **WELCOME_DISCUSSION.md** - Welcome post content

## Automation Ideas (Future)

Consider setting up GitHub Actions for:
- Auto-labeling discussions based on keywords
- Welcome messages for first-time participants
- Weekly digest of top discussions
- Auto-closing stale discussions
- Cross-posting between Issues and Discussions

## Maintenance Tasks

Regular maintenance:
- [ ] Pin important discussions in each category
- [ ] Archive or close resolved discussions
- [ ] Update templates based on feedback
- [ ] Monitor and respond to Technical Support
- [ ] Convert good Ideas to Issues for tracking
- [ ] Celebrate community contributions
- [ ] Update documentation based on common questions

## Troubleshooting

**Categories not showing up?**
- Make sure Discussions are enabled in Settings
- Refresh the page
- Check you have proper permissions

**Can't edit categories?**
- Need admin or maintain permissions
- Categories section may be hidden - look for ⚙️ icon

**Templates not working?**
- Templates are reference docs, not auto-loaded
- Users need to manually copy/paste content
- Consider creating pinned template examples

## Success Metrics

Track these to measure discussion success:
- Number of active discussions
- Response time to questions
- Solved Q&A discussions
- Community participation rate
- New contributor engagement

## Next Steps

After setup:
1. ✅ Post the welcome discussion
2. ✅ Pin important discussions
3. ✅ Create example discussions in each category
4. ✅ Announce discussions in project README
5. ✅ Monitor and engage with community
6. ✅ Iterate based on feedback

---

## Quick Setup Checklist

Use this checklist when setting up:

- [ ] Enable Discussions in repository settings
- [ ] Remove/edit default categories
- [ ] Create all 11 custom categories
- [ ] Set proper formats (Announcement, Q&A, Discussion)
- [ ] Reorder categories logically
- [ ] Post welcome discussion from WELCOME_DISCUSSION.md
- [ ] Pin welcome discussion
- [ ] Update README with discussion links (already done ✅)
- [ ] Configure discussion settings
- [ ] Add moderators if needed
- [ ] Create example discussions
- [ ] Announce to community

---

**Need Help?**

- [GitHub Discussions Documentation](https://docs.github.com/en/discussions)
- [Managing Categories](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-categories-for-discussions)
- [Discussion Formats](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-categories-for-discussions#about-categories-for-discussions)

Good luck with your community discussions! 🎉
