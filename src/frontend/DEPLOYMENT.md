# Deployment Guide - Study Buddies DSA Tracker

## Publishing Draft Version 21 to Production

This guide provides a comprehensive checklist for promoting Draft Version 21 to production, ensuring the live deployment matches the draft environment exactly.

---

## Pre-Deployment Checklist

### 1. Verify Draft Build Identifier
- [ ] Confirm current draft is **Version 21**
- [ ] Note the commit hash/build timestamp from draft environment
- [ ] Verify all recent changes are included in Version 21

### 2. Review Recent Changes
Version 21 includes:
- Real-time leaderboard updates with 30-second polling
- Fair evaluation system (2:00 AM IST processing for all users)
- Enhanced chat dialog with purple/pink theme
- Cumulative progress tracking and visualization
- Badge system with streak-based achievements
- Daily reminder notifications
- Profile setup flow for new users

---

## Deployment Process

### Using GitHub Export & ICP CLI

The deployment uses the standard Internet Computer deployment workflow:

1. **Export to GitHub** (if not already done)
   ```bash
   # Ensure your code is committed to your repository
   git add .
   git commit -m "Release Version 21 to production"
   git push origin main
   ```

2. **Deploy to Internet Computer**
   ```bash
   # Navigate to project root
   cd [project-directory]
   
   # Install dependencies (if needed)
   npm install
   
   # Build frontend
   npm run build
   
   # Deploy to IC network
   dfx deploy --network ic
   ```

3. **Verify Deployment**
   - Note the production canister ID from deployment output
   - Save the production URL (typically: `https://[canister-id].ic0.app`)

---

## Post-Deployment Verification Checklist

### Core Functionality Tests

#### 1. Authentication & Login Flow
- [ ] Navigate to production URL
- [ ] Click "Login" button
- [ ] Internet Identity authentication completes successfully
- [ ] User is redirected to dashboard after login
- [ ] "Logout" button appears after successful login
- [ ] Logout clears session and returns to login screen

#### 2. Profile Setup (New Users)
- [ ] New user sees profile setup modal after first login
- [ ] Modal displays sparkles animation and bunny illustration
- [ ] Name input field accepts text input
- [ ] "Get Started" button creates profile successfully
- [ ] Modal closes after profile creation
- [ ] User name appears in header greeting

#### 3. Dashboard Functionality
- [ ] Dashboard loads without errors
- [ ] Daily tracker displays with 5 checkboxes (0-5 problems)
- [ ] Checking boxes updates count in real-time
- [ ] Stats card shows correct user name and badge
- [ ] Progress chart displays cumulative totals
- [ ] History timeline shows past daily records
- [ ] Motivational quote displays
- [ ] Fair evaluation alert is visible
- [ ] All cumulative totals are accurate

#### 4. Leaderboard Page
- [ ] Navigate to leaderboard via header button
- [ ] Leaderboard loads all users
- [ ] Real-time status indicator shows "Live"
- [ ] Auto-refresh badge displays last update time
- [ ] User rankings display correctly
- [ ] Charts update automatically (observe for 30+ seconds)
- [ ] Fair evaluation alert is visible
- [ ] Sorting and filtering work correctly

#### 5. Chat Functionality
- [ ] Chat button appears in header (sparkle icon)
- [ ] Click opens chat dialog
- [ ] User list displays other registered users
- [ ] Selecting a user opens conversation
- [ ] Sending messages works (smooth animation)
- [ ] Receiving messages displays correctly
- [ ] Message bubbles have purple/pink gradient styling
- [ ] Scroll behavior works smoothly

#### 6. Theme Toggle
- [ ] Theme toggle button appears in header
- [ ] Clicking toggles between light and dark mode
- [ ] All components render correctly in both themes
- [ ] Theme preference persists on page reload

#### 7. Responsive Design
- [ ] Test on mobile viewport (< 768px)
- [ ] Mobile navigation appears at bottom of header
- [ ] All buttons and interactive elements are accessible
- [ ] Test on tablet viewport (768px - 1024px)
- [ ] Test on desktop viewport (> 1024px)
- [ ] No horizontal scrolling on any viewport

### Data Integrity Tests

#### 8. Real-Time Updates
- [ ] Open production app in two browser windows
- [ ] Update problem count in window 1
- [ ] Verify leaderboard updates in window 2 (within 30 seconds)
- [ ] Check that cumulative totals are consistent

#### 9. Daily Reset System
- [ ] Verify users joining after midnight are included in evaluation
- [ ] Check that 2:00 AM IST reset processes all users fairly
- [ ] Confirm streak calculations are accurate
- [ ] Verify badge awards at 7, 14, and 21+ day streaks

#### 10. Badge System
- [ ] Users with < 7 day streak: No badge displayed
- [ ] Users with 7-13 day streak: "Persistent Rabbit" badge
- [ ] Users with 14-20 day streak: "DSA Master Cat" badge
- [ ] Users with 21+ day streak: "Legendary Scholar" badge
- [ ] Badge sparkle effects display correctly

### Performance Tests

#### 11. Load Times
- [ ] Initial page load completes in < 3 seconds
- [ ] Dashboard data loads in < 2 seconds
- [ ] Leaderboard data loads in < 2 seconds
- [ ] Chat messages load in < 1 second

#### 12. Background Polling
- [ ] Leaderboard auto-refreshes every 30 seconds
- [ ] No performance degradation after extended use
- [ ] Memory usage remains stable

---

## Comparison: Draft vs Production

### Visual Consistency
- [ ] Color scheme matches (purple/pink/violet gradient)
- [ ] Typography and spacing are identical
- [ ] Animations and transitions work the same
- [ ] Icons and illustrations display correctly

### Feature Parity
- [ ] All draft features are present in production
- [ ] No features are missing or broken
- [ ] User flows are identical
- [ ] Error handling works the same

### Data Consistency
- [ ] User profiles sync correctly
- [ ] Daily records are accurate
- [ ] Leaderboard rankings match expected behavior
- [ ] Chat messages persist correctly

---

## Rollback Plan

If critical issues are discovered:

1. **Immediate Actions**
   - Document the issue with screenshots/logs
   - Note the specific failure point
   - Determine if issue is blocking for all users

2. **Rollback Process**
   ```bash
   # Redeploy previous stable version
   git checkout [previous-stable-commit]
   dfx deploy --network ic
   ```

3. **Communication**
   - Notify users of temporary issues (if applicable)
   - Provide ETA for fix
   - Document root cause for future prevention

---

## Success Criteria

Production deployment is successful when:

✅ All authentication flows work correctly  
✅ Dashboard displays accurate real-time data  
✅ Leaderboard updates automatically every 30 seconds  
✅ Chat functionality works without errors  
✅ Fair evaluation system processes all users correctly  
✅ Badge system awards correctly based on streaks  
✅ No console errors or warnings  
✅ Performance meets or exceeds draft environment  
✅ Responsive design works on all devices  
✅ Theme toggle works in both light and dark modes  

---

## Post-Launch Monitoring

### First 24 Hours
- [ ] Monitor for authentication errors
- [ ] Check leaderboard update frequency
- [ ] Verify daily reset runs at 2:00 AM IST
- [ ] Watch for any user-reported issues

### First Week
- [ ] Verify badge awards are accurate
- [ ] Check cumulative totals for consistency
- [ ] Monitor chat message delivery
- [ ] Ensure no data loss or corruption

### Ongoing
- [ ] Weekly review of error logs
- [ ] Monthly performance analysis
- [ ] User feedback collection and review

---

## Support & Troubleshooting

### Common Issues

**Issue: Users can't log in**
- Verify Internet Identity service is operational
- Check canister authentication settings
- Ensure frontend is using correct canister IDs

**Issue: Leaderboard not updating**
- Verify React Query polling is active
- Check backend canister is responding
- Confirm 30-second interval is configured

**Issue: Chat messages not sending**
- Verify user authentication
- Check backend chat endpoints
- Ensure receiver exists in system

**Issue: Daily reset not running**
- Verify timer is configured (2:00 AM IST)
- Check backend timer initialization
- Confirm timezone calculations are correct

---

## Version History

- **Version 21** (Current): Real-time updates, fair evaluation system, enhanced chat
- **Version 20**: Previous stable release
- **Version 19**: Initial production release

---

## Contact & Resources

- **Internet Computer Documentation**: https://internetcomputer.org/docs
- **DFX CLI Reference**: https://internetcomputer.org/docs/current/references/cli-reference/
- **Project Repository**: [Your GitHub repository URL]

---

**Last Updated**: February 5, 2026  
**Deployment Target**: Internet Computer Mainnet  
**Build Version**: 21
