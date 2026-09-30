# INTELLECT Phase 1 — Progress Tracker

## Phase A: Shared Engine
- [ ] A1. lib/progress.js — per-user progress storage (scores, streaks, XP, badges)
- [ ] A2. lib/scoring.js — pure scoring/combo/mult logic
- [ ] A3. lib/sound.js — Web Audio SFX (blip, buzz, jingle, ticks, fanfare)
- [ ] A4. lib/helpers.js — shuffle, random, timer utilities
- [ ] A5. lib/words.js — English word list for Word Scramble
- [ ] A6. components/game/GameShell.jsx — countdown, timer, pause, HUD, results, rules modal
- [ ] A7. components/game/ComboHUD.jsx — chips x mult badges, combo counter, mult bar
- [ ] A8. components/game/ParticleEffects.jsx — pixel particle bursts, confetti
- [ ] A9. components/game/ErrorBoundary.jsx — per-game error boundary
- [ ] A10. games/registry.js — game registry, auto-discovery
- [ ] A11. docs/ADDING_GAMES.md — how to add a game

## Phase B: 15 Games
### Memory
- [ ] B1. MemoryMatch
- [ ] B2. SequenceEcho
- [ ] B3. NumberFlash

### Attention
- [ ] B4. FocusFinder
- [ ] B5. ColorClash
- [ ] B6. TargetTap

### Speed
- [ ] B7. SpeedTap
- [ ] B8. NumberRush
- [ ] B9. QuickMath

### Flexibility
- [ ] B10. RuleSwitch
- [ ] B11. OppositeArrows
- [ ] B12. ReverseRecall

### Problem Solving
- [ ] B13. NumberSequence
- [ ] B14. MissingOperator
- [ ] B15. WordScramble

## Phase C: Screens & Integration
- [ ] C1. Update constants.js — registry-based game list
- [ ] C2. Rewrite PixelCard — support play/lock/best-score from registry
- [ ] C3. Rewrite GamesScreen — category tabs, filters, locked→login flow
- [ ] C4. Add "play" screen state + GameShell integration to App.jsx
- [ ] C5. Update LoginScreen/RegisterScreen — redirect intent (→games after login from locked card)
- [ ] C6. Rewrite HomeScreen — full dashboard (XP, streak, daily workout, badges, skill bars)

## Phase D: Verification
- [ ] D1. Install Vitest, write pure-logic tests
- [ ] D2. Add ?fast=1 dev-only shortcut
- [ ] D3. npm run build — clean
- [ ] D4. Browser test all 15 games
- [ ] D5. Final bug fixes

---

# INTELLECT Phase 2 — 15 New Games

## Phase E: Memory Games (16-18)
- [ ] E1. PatternRecall — grid cells light up, player taps same cells
- [ ] E2. MissingItem — memorize icons, find the missing one
- [ ] E3. WordVault — memorize word list, YES/NO recognition

## Phase F: Attention Games (19-21)
- [ ] F1. TwinHunt — find the one identical pair in a grid
- [ ] F2. HeadCount — count colored blobs, pick from options
- [ ] F3. StopOrGo — tap green signals, ignore red signals

## Phase G: Speed Games (22-24)
- [ ] G1. ReactionBlitz — wait for green, tap fast, show reaction time
- [ ] G2. ArrowStorm — flanker task, press center arrow direction
- [ ] G3. PixelWhack — whack moles, avoid bombs

## Phase H: Flexibility Games (25-27)
- [ ] H1. OddEvenSwitch — alternating ODD/EVEN and HIGHER/LOWER rules
- [ ] H2. WordFlip — alternating ANIMAL? and >5 LETTERS? rules
- [ ] H3. BinFlip — sort items into bins, bins swap sides

## Phase I: Problem Solving Games (28-30)
- [ ] I1. ShapePattern — complete the repeating pattern
- [ ] I2. SumTarget — select numbers that sum to target
- [ ] I3. BalanceScale — compare two sums, pick heavier or equal

## Phase J: Integration
- [ ] J1. Update registry with all 15 new games
- [ ] J2. Add Explorer + Completionist badges
- [ ] J3. Verify Games screen (30 cards, categories, layout)
- [ ] J4. Verify Home screen (daily workout, skill bars, badges)

## Phase K: Verification
- [ ] K1. Write tests for new game generators
- [ ] K2. npm run build — clean
- [ ] K3. Browser test all 30 games
- [ ] K4. Fix all bugs found
