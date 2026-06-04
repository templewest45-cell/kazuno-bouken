const DRAG_LOCK_CLASS = 'kids-drag-lock';

export function lockKidsScroll() {
  document.documentElement.classList.add(DRAG_LOCK_CLASS);
  document.body.classList.add(DRAG_LOCK_CLASS);
}

export function unlockKidsScroll() {
  document.documentElement.classList.remove(DRAG_LOCK_CLASS);
  document.body.classList.remove(DRAG_LOCK_CLASS);
}
