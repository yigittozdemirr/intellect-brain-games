/**
 * Game registry — single source of truth for all games.
 * To add a new game: import it and add one line to the GAME_REGISTRY array.
 * Everything else (Games screen, Home dashboard, Daily Workout, progress) picks it up automatically.
 */

import MemoryMatch from "./memory/MemoryMatch";
import SequenceEcho from "./memory/SequenceEcho";
import NumberFlash from "./memory/NumberFlash";
import PatternRecall from "./memory/PatternRecall";
import MissingItem from "./memory/MissingItem";
import WordVault from "./memory/WordVault";
import FocusFinder from "./attention/FocusFinder";
import ColorClash from "./attention/ColorClash";
import TargetTap from "./attention/TargetTap";
import TwinHunt from "./attention/TwinHunt";
import HeadCount from "./attention/HeadCount";
import StopOrGo from "./attention/StopOrGo";
import SpeedTap from "./speed/SpeedTap";
import NumberRush from "./speed/NumberRush";
import QuickMath from "./speed/QuickMath";
import ReactionBlitz from "./speed/ReactionBlitz";
import ArrowStorm from "./speed/ArrowStorm";
import PixelWhack from "./speed/PixelWhack";
import RuleSwitch from "./flexibility/RuleSwitch";
import OppositeArrows from "./flexibility/OppositeArrows";
import ReverseRecall from "./flexibility/ReverseRecall";
import OddEvenSwitch from "./flexibility/OddEvenSwitch";
import WordFlip from "./flexibility/WordFlip";
import BinFlip from "./flexibility/BinFlip";
import NumberSequence from "./problem-solving/NumberSequence";
import MissingOperator from "./problem-solving/MissingOperator";
import WordScramble from "./problem-solving/WordScramble";
import ShapePattern from "./problem-solving/ShapePattern";
import SumTarget from "./problem-solving/SumTarget";
import BalanceScale from "./problem-solving/BalanceScale";

/** Categories */
export const CATEGORIES = [
  { id: "Memory",          color: "magenta", icon: "🧠" },
  { id: "Attention",       color: "blue",    icon: "👁️" },
  { id: "Speed",           color: "orange",  icon: "⚡" },
  { id: "Flexibility",     color: "pink",    icon: "🔄" },
  { id: "Problem Solving", color: "green",   icon: "🧩" },
];

/**
 * Master game registry.
 * Each entry: { id, name, category, description, rules, icon, Component, color }
 */
export const GAME_REGISTRY = [
  // ── Memory ──
  {
    id: "memory-match",
    name: "Memory Match",
    category: "Memory",
    description: "Flip cards and find matching pairs before time runs out.",
    rules: "Tap two cards to flip them. If they match, they stay face-up — that counts as a correct answer. Mismatches flip back and count as wrong. Grid grows as you level up!",
    icon: "🃏",
    Component: MemoryMatch,
    color: "magenta",
  },
  {
    id: "sequence-echo",
    name: "Sequence Echo",
    category: "Memory",
    description: "Watch the pattern, then repeat it from memory.",
    rules: "Colored pads will light up in a sequence. Watch carefully, then tap them in the same order. Sequences get longer as you level up!",
    icon: "🎵",
    Component: SequenceEcho,
    color: "magenta",
  },
  {
    id: "number-flash",
    name: "Number Flash",
    category: "Memory",
    description: "A number flashes briefly — can you remember it?",
    rules: "A number will flash on screen for a short time. After it disappears, type it in. Numbers get longer as you level up!",
    icon: "💡",
    Component: NumberFlash,
    color: "magenta",
  },
  {
    id: "pattern-recall",
    name: "Pattern Recall",
    category: "Memory",
    description: "Memorize which cells light up, then tap them back.",
    rules: "Cells on the grid will light up briefly. After they hide, tap the same cells from memory. Find all to score! Wrong cell starts a new pattern.",
    icon: "🔲",
    Component: PatternRecall,
    color: "magenta",
  },
  {
    id: "missing-item",
    name: "Missing Item",
    category: "Memory",
    description: "Which icon disappeared? Spot the missing one.",
    rules: "A set of icons is shown briefly. When they reappear, one slot is empty. Pick the missing icon from 4 choices! Fewer viewing time as you level up.",
    icon: "👻",
    Component: MissingItem,
    color: "magenta",
  },
  {
    id: "word-vault",
    name: "Word Vault",
    category: "Memory",
    description: "Memorize words, then decide: was it in the list?",
    rules: "A list of words is shown briefly. Then words appear one at a time — answer YES if it was in the list, NO if it wasn't. Lists get longer as you level up!",
    icon: "📖",
    Component: WordVault,
    color: "magenta",
  },

  // ── Attention ──
  {
    id: "focus-finder",
    name: "Focus Finder",
    category: "Attention",
    description: "Spot the odd one out in a grid of similar items.",
    rules: "One item in the grid is different from the rest. Find and tap it as fast as you can! Grids get bigger and differences get subtler.",
    icon: "🔍",
    Component: FocusFinder,
    color: "blue",
  },
  {
    id: "color-clash",
    name: "Color Clash",
    category: "Attention",
    description: "Does the word match its ink color? A classic Stroop test.",
    rules: "A color word is shown in a colored ink. Press YES if the word matches its ink color, NO if it doesn't. Don't get tricked!",
    icon: "🎨",
    Component: ColorClash,
    color: "blue",
  },
  {
    id: "target-tap",
    name: "Target Tap",
    category: "Attention",
    description: "Tap only the matching targets among distractors.",
    rules: "A target shape and color is shown at the top. Tap items that match the target. Ignore everything else — wrong taps count against you!",
    icon: "🎯",
    Component: TargetTap,
    color: "blue",
  },
  {
    id: "twin-hunt",
    name: "Twin Hunt",
    category: "Attention",
    description: "Find the one identical pair in a sea of symbols.",
    rules: "A grid of symbols has exactly ONE matching pair — all others are unique. Tap both twins to score! Wrong pairs count against you. Grid grows with level.",
    icon: "👯",
    Component: TwinHunt,
    color: "blue",
  },
  {
    id: "head-count",
    name: "Head Count",
    category: "Attention",
    description: "Count the blobs of the right color — fast!",
    rules: "Colored blobs bounce around briefly. Count only the TARGET color shown at the top, then pick the right number. More distractors at higher levels!",
    icon: "🫧",
    Component: HeadCount,
    color: "blue",
  },
  {
    id: "stop-or-go",
    name: "Stop or Go",
    category: "Attention",
    description: "Tap green signals, resist red ones.",
    rules: "GREEN signal = tap it fast! RED signal = don't tap. Tapping green = correct, tapping red = wrong, missing green = wrong, ignoring red = correct. Gets faster!",
    icon: "🚦",
    Component: StopOrGo,
    color: "blue",
  },

  // ── Speed ──
  {
    id: "speed-tap",
    name: "Speed Tap",
    category: "Speed",
    description: "Tap squares as fast as they appear.",
    rules: "Colored squares will appear on screen. Tap them before they disappear! They show up faster as you level up.",
    icon: "👆",
    Component: SpeedTap,
    color: "orange",
  },
  {
    id: "number-rush",
    name: "Number Rush",
    category: "Speed",
    description: "Tap scattered numbers in order from 1 to N.",
    rules: "Numbers are scattered on the screen. Tap them in order starting from 1. More numbers appear as you level up!",
    icon: "🔢",
    Component: NumberRush,
    color: "orange",
  },
  {
    id: "quick-math",
    name: "Quick Math",
    category: "Speed",
    description: "Is this equation true or false? Decide fast!",
    rules: "A math equation is shown. Tap TRUE if it's correct, FALSE if it's wrong. Equations get harder as you level up!",
    icon: "🧮",
    Component: QuickMath,
    color: "orange",
  },
  {
    id: "reaction-blitz",
    name: "Reaction Blitz",
    category: "Speed",
    description: "Wait for green, then tap as fast as possible!",
    rules: "The panel starts RED. When it turns GREEN, tap immediately! Your reaction time is measured in ms. Tapping too early is a penalty. Speed bonus for fast reactions!",
    icon: "⏱️",
    Component: ReactionBlitz,
    color: "orange",
  },
  {
    id: "arrow-storm",
    name: "Arrow Storm",
    category: "Speed",
    description: "Press the CENTER arrow — ignore the flankers!",
    rules: "Five arrows are shown. Press the direction of the CENTER arrow (highlighted in orange). Flanker arrows may point differently to trick you! Conflicting arrows increase with level.",
    icon: "➡️",
    Component: ArrowStorm,
    color: "orange",
  },
  {
    id: "pixel-whack",
    name: "Pixel Whack",
    category: "Speed",
    description: "Whack the moles, dodge the bombs!",
    rules: "Moles 🐹 pop up from holes — tap them! Bombs 💣 also appear — don't tap those. Moles that escape are simply missed. Speed increases with level!",
    icon: "🐹",
    Component: PixelWhack,
    color: "orange",
  },

  // ── Flexibility ──
  {
    id: "rule-switch",
    name: "Rule Switch",
    category: "Flexibility",
    description: "The rule keeps changing — match by color or shape.",
    rules: "A shape with a color is shown. A banner says COLOR or SHAPE. Pick the option that matches the current rule. The rule switches every few rounds!",
    icon: "🔀",
    Component: RuleSwitch,
    color: "pink",
  },
  {
    id: "opposite-arrows",
    name: "Opposite Arrows",
    category: "Flexibility",
    description: "Press the right direction — or the opposite!",
    rules: "An arrow points in a direction. When the banner says SAME, press that direction. When it says OPPOSITE, press the opposite direction!",
    icon: "↕️",
    Component: OppositeArrows,
    color: "pink",
  },
  {
    id: "reverse-recall",
    name: "Reverse Recall",
    category: "Flexibility",
    description: "See a sequence of digits, then enter them backwards.",
    rules: "A sequence of digits will be shown. Memorize them, then enter them in REVERSE order. Sequences get longer as you level up!",
    icon: "🔙",
    Component: ReverseRecall,
    color: "pink",
  },
  {
    id: "odd-even-switch",
    name: "Odd Even Switch",
    category: "Flexibility",
    description: "The rule alternates between odd/even and higher/lower!",
    rules: "A number appears. The rule alternates between ODD/EVEN and HIGHER/LOWER than a threshold. Watch the banner for the current rule — it switches every few rounds!",
    icon: "🔃",
    Component: OddEvenSwitch,
    color: "pink",
  },
  {
    id: "word-flip",
    name: "Word Flip",
    category: "Flexibility",
    description: "Is it an animal? Or does it have more than 5 letters?",
    rules: "A word appears. The rule alternates: 'Is it an ANIMAL?' or 'Does it have MORE THAN 5 LETTERS?' Answer YES or NO. Watch for rule switches!",
    icon: "📑",
    Component: WordFlip,
    color: "pink",
  },
  {
    id: "bin-flip",
    name: "Bin Flip",
    category: "Flexibility",
    description: "Sort items into bins — but the bins swap sides!",
    rules: "An item appears. Send it to the correct bin (LEFT or RIGHT). Every few rounds the bin labels SWAP sides — stay alert for the switch!",
    icon: "🗂️",
    Component: BinFlip,
    color: "pink",
  },

  // ── Problem Solving ──
  {
    id: "number-sequence",
    name: "Number Sequence",
    category: "Problem Solving",
    description: "What comes next in the pattern?",
    rules: "A sequence of numbers follows a pattern. Pick the number that comes next from the choices given!",
    icon: "📐",
    Component: NumberSequence,
    color: "green",
  },
  {
    id: "missing-operator",
    name: "Missing Operator",
    category: "Problem Solving",
    description: "Fill in the missing operator to make it work.",
    rules: "An equation is shown with a missing operator (+ - ×). Pick the one that makes the equation true!",
    icon: "➕",
    Component: MissingOperator,
    color: "green",
  },
  {
    id: "word-scramble",
    name: "Word Scramble",
    category: "Problem Solving",
    description: "Unscramble the letters to form a word.",
    rules: "Letters of a word are jumbled up. Type the correct word! Words get longer as you level up.",
    icon: "📝",
    Component: WordScramble,
    color: "green",
  },
  {
    id: "shape-pattern",
    name: "Shape Pattern",
    category: "Problem Solving",
    description: "Complete the repeating pattern of shapes.",
    rules: "A sequence of colored shapes repeats a pattern with the last element missing. Pick the shape that completes the pattern from 4 options!",
    icon: "🔷",
    Component: ShapePattern,
    color: "green",
  },
  {
    id: "sum-target",
    name: "Sum Target",
    category: "Problem Solving",
    description: "Pick numbers that add up to the target.",
    rules: "A target number is shown along with several numbers. Tap numbers to select them — when their sum equals the target, you score! Exceeding the target resets your selection.",
    icon: "🎯",
    Component: SumTarget,
    color: "green",
  },
  {
    id: "balance-scale",
    name: "Balance Scale",
    category: "Problem Solving",
    description: "Which side of the scale is heavier?",
    rules: "Two pans each show a sum. Choose LEFT heavier, RIGHT heavier, or EQUAL. The scale tilts to reveal the answer! Terms get bigger with level.",
    icon: "⚖️",
    Component: BalanceScale,
    color: "green",
  },
];

/** Get a game by ID */
export function getGameById(id) {
  return GAME_REGISTRY.find((g) => g.id === id) || null;
}

/** Get games by category */
export function getGamesByCategory(category) {
  if (!category || category === "All") return GAME_REGISTRY;
  return GAME_REGISTRY.filter((g) => g.category === category);
}
