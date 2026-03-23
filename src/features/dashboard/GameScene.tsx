import { Suspense, lazy } from 'react';

const LazyPixiStage = lazy(async () => {
  const module = await import('@/game-renderer/pixi/PixiStage');
  return {
    default: module.PixiStage,
  };
});

interface GameSceneProps {
  animate: boolean;
  employeeCount: number;
  processLabel: string;
  scaleLabel: string;
}

export function GameScene(props: GameSceneProps) {
  return (
    <Suspense fallback={<div className="stage-shell__fallback">Loading pixel office...</div>}>
      <LazyPixiStage {...props} />
    </Suspense>
  );
}

