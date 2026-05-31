import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { unlockSpeech } from '../utils/speak';

export default function KidsModeViewport() {
  const { pathname } = useLocation();
  const isKidsMode = pathname.startsWith('/kids');

  useEffect(() => {
    if (!isKidsMode) return;
    document.querySelector('.app-container')?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [isKidsMode, pathname]);

  useEffect(() => {
    if (!isKidsMode) return undefined;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    document.documentElement.classList.add('kids-mode-active');
    document.body.classList.add('kids-mode-active');
    document.addEventListener('pointerdown', unlockSpeech, true);
    document.addEventListener('touchstart', unlockSpeech, true);
    window.scrollTo(0, 0);

    return () => {
      document.documentElement.classList.remove('kids-mode-active');
      document.body.classList.remove('kids-mode-active');
      document.removeEventListener('pointerdown', unlockSpeech, true);
      document.removeEventListener('touchstart', unlockSpeech, true);
      window.scrollTo(scrollX, scrollY);
    };
  }, [isKidsMode]);

  if (!isKidsMode) return null;

  return (
    <div className="kids-landscape-prompt" role="status" aria-live="polite">
      <div>
        <strong>よこむきに してね</strong>
        <span>タブレットを よこに すると はじめられるよ</span>
      </div>
    </div>
  );
}
