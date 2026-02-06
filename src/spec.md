# Specification

## Summary
**Goal:** Remove the fixed “solve 5 questions” daily goal and switch to a flexible daily question count where solving ≥1 maintains/increments streak, and solving 0 resets streak with a flat ₹20 fine.

**Planned changes:**
- Update backend daily reset logic to persist each day’s questionsSolved and penaltyApplied, increment streak by 1 when questionsSolved ≥ 1 (no fine), and reset streak to 0 with a flat ₹20 fine when questionsSolved = 0.
- Update backend APIs for setting today’s problem count to accept any non-negative number (no max of 5) and to process a daily reset first when called past the reset boundary.
- Replace the frontend 5-checkbox daily tracker with a numeric input for “questions solved today”; treat empty input as 0 and save via the existing updateTodayProblems mutation.
- Update frontend reminder logic and English copy to trigger only when today’s logged questions are 0, removing any “complete 5 problems” framing.

**User-visible outcome:** Users can enter any number of questions solved today; solving at least 1 keeps/increments their streak with no fine, while logging 0 breaks the streak and applies a flat ₹20 fine, and reminders reflect the new rule.
