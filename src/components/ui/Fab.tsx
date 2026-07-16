export function Fab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="AI-assisted search"
      className="fixed bottom-20 right-4 z-30 flex h-13 w-13 items-center justify-center rounded-full bg-accent shadow-[0_8px_18px_rgba(168,118,63,0.4)] transition-transform hover:scale-105 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4L12 2z"
          fill="#FFF"
        />
      </svg>
    </button>
  );
}
