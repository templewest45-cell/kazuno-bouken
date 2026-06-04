import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { unlockSpeech } from '../utils/speak';
import { lockKidsScroll, unlockKidsScroll } from '../utils/scrollLock';

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
    const lockDragScroll = (event) => {
      if (event.target?.closest?.('[draggable="true"]')) lockKidsScroll();
    };
    const preventLockedTouchMove = (event) => {
      if (document.body.classList.contains('kids-drag-lock')) event.preventDefault();
    };
    document.documentElement.classList.add('kids-mode-active');
    document.body.classList.add('kids-mode-active');
    document.addEventListener('pointerdown', unlockSpeech, true);
    document.addEventListener('touchstart', unlockSpeech, true);
    document.addEventListener('touchmove', preventLockedTouchMove, { capture: true, passive: false });
    document.addEventListener('dragstart', lockDragScroll, true);
    document.addEventListener('dragend', unlockKidsScroll, true);
    document.addEventListener('drop', unlockKidsScroll, true);
    window.scrollTo(0, 0);

    return () => {
      document.documentElement.classList.remove('kids-mode-active');
      document.body.classList.remove('kids-mode-active');
      unlockKidsScroll();
      document.removeEventListener('pointerdown', unlockSpeech, true);
      document.removeEventListener('touchstart', unlockSpeech, true);
      document.removeEventListener('touchmove', preventLockedTouchMove, true);
      document.removeEventListener('dragstart', lockDragScroll, true);
      document.removeEventListener('dragend', unlockKidsScroll, true);
      document.removeEventListener('drop', unlockKidsScroll, true);
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
