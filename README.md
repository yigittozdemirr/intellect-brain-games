# 🧠 INTELLECT

![Intellect Banner](https://via.placeholder.com/1200x400.png?text=INTELLECT+-+Cognitive+Training+Platform)

**INTELLECT** is a modern, web-based cognitive training platform designed to sharpen your mind through a suite of engaging mini-games. Built with React and Vite, the platform tracks your progress, builds your streaks, and rewards you with badges as you improve across five key cognitive domains.

---

## 🎥 Project Demo

Check out the video overview of INTELLECT in action:

[![INTELLECT Demo Video](https://img.youtube.com/vi/Zt3W2iLLf9E/0.jpg)](https://youtu.be/Zt3W2iLLf9E)

*(Click the image above to watch the demo on YouTube)*

---

## ✨ Features

- **🎮 30 Unique Mini-Games**: A diverse collection of games targeting different cognitive skills.
- **📊 Comprehensive Progress Tracking**: Tracks user scores, XP, streaks, and awards badges.
- **📈 Skill Bars & Daily Workouts**: Personalized daily training routines with visual skill progression.
- **🎨 Modern UI/UX**: Built with Tailwind CSS and Framer Motion for a sleek, responsive, and animated experience.
- **🎵 Interactive Sound Engine**: Custom Web Audio SFX for immersive gameplay (blips, buzzes, fanfare).
- **⚡ Blazing Fast**: Powered by Vite for instant server starts and lightning-fast HMR.

---

## 🧠 Cognitive Domains

The platform offers games categorized into 5 distinct areas:

1. **Memory**: *MemoryMatch, SequenceEcho, NumberFlash, PatternRecall, MissingItem, WordVault*
2. **Attention**: *FocusFinder, ColorClash, TargetTap, TwinHunt, HeadCount, StopOrGo*
3. **Speed**: *SpeedTap, NumberRush, QuickMath, ReactionBlitz, ArrowStorm, PixelWhack*
4. **Flexibility**: *RuleSwitch, OppositeArrows, ReverseRecall, OddEvenSwitch, WordFlip, BinFlip*
5. **Problem Solving**: *NumberSequence, MissingOperator, WordScramble, ShapePattern, SumTarget, BalanceScale*

---

## 🚀 Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)
- **Linting**: [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)

---

## 🛠️ Installation & Setup

To run INTELLECT locally on your machine, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/intellect.git
   cd intellect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to view the app.

---

## 📁 Project Structure

```text
src/
├── components/   # Reusable UI and game shell components
├── games/        # Game implementations grouped by category
│   ├── memory/
│   ├── attention/
│   ├── speed/
│   ├── flexibility/
│   └── problem-solving/
├── lib/          # Core engine logic (progress, scoring, sound, helpers)
├── screens/      # Main application screens (Home, Games, Login)
└── App.jsx       # Main application entry point
```

---

## 🤝 Contributing

Contributions are welcome! If you have an idea for a new game or a feature enhancement, please check `docs/ADDING_GAMES.md` for guidelines on how to hook into the game registry.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Developed with focus and precision.*
