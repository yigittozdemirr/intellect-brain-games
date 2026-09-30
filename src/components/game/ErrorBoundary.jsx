import { Component } from "react";
import PixelButton from "../ui/PixelButton";
import PixelPanel from "../ui/PixelPanel";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-pixel-dark">
          <PixelPanel className="max-w-md text-center">
            <div className="text-4xl mb-4">💀</div>
            <h2 className="font-pixel-label text-sm text-pixel-pink mb-3">
              GAME CRASHED
            </h2>
            <p className="font-pixel-body text-xs text-pixel-cream/60 mb-6">
              Something went wrong. Don&apos;t worry, your progress is saved.
            </p>
            <PixelButton
              variant="orange"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onBack?.();
              }}
            >
              BACK TO GAMES
            </PixelButton>
          </PixelPanel>
        </div>
      );
    }
    return this.props.children;
  }
}
