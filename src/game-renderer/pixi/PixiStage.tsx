import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

import { appTheme } from '@/shared/constants/theme';

const SCENE_WIDTH = 360;
const SCENE_HEIGHT = 240;

interface PixiStageProps {
  animate: boolean;
  employeeCount: number;
  processLabel: string;
  scaleLabel: string;
}

export function PixiStage({ animate, employeeCount, processLabel, scaleLabel }: PixiStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = containerRef.current;

    if (!host) {
      return;
    }

    let isDisposed = false;
    const app = new Application();
    let cleanupTicker: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let scene: Container | null = null;

    const applyLayout = () => {
      if (!scene) {
        return;
      }

      const width = host.clientWidth || 360;
      const height = host.clientHeight || 288;
      const scale = Math.min(width / (SCENE_WIDTH + 48), height / (SCENE_HEIGHT + 24));

      app.renderer.resize(width, height);
      scene.scale.set(scale);
      scene.x = (width - SCENE_WIDTH * scale) / 2;
      scene.y = (height - SCENE_HEIGHT * scale) / 2;
    };

    void app
      .init({
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        width: host.clientWidth || 360,
        height: host.clientHeight || 288,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      })
      .then(() => {
        if (isDisposed) {
          void app.destroy(true, true);
          return;
        }

        host.appendChild(app.canvas);
        app.canvas.style.width = '100%';
        app.canvas.style.height = '100%';
        app.canvas.style.imageRendering = 'pixelated';

        scene = new Container();
        scene.x = 24;
        scene.y = 12;
        app.stage.addChild(scene);

        const background = new Graphics()
          .roundRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 20)
          .fill({ color: 0x1b1230, alpha: 0.94 })
          .stroke({ color: 0x5f4c8a, width: 2 });
        scene.addChild(background);

        const skyline = new Graphics()
          .rect(16, 18, 328, 68)
          .fill({ color: 0x151022, alpha: 1 });
        scene.addChild(skyline);

        const neonFrame = new Graphics()
          .roundRect(14, 16, 332, 158, 18)
          .stroke({ color: 0x73d9ff, width: 1, alpha: 0.3 });
        scene.addChild(neonFrame);

        for (let index = 0; index < 9; index += 1) {
          const windowLight = new Graphics()
            .roundRect(26 + index * 34, 30 + (index % 2) * 10, 16, 12, 3)
            .fill({ color: index % 3 === 0 ? 0xff8f3f : 0x87f5d2, alpha: 0.28 });
          scene.addChild(windowLight);
        }

        const codeBoard = new Graphics()
          .roundRect(44, 74, 150, 20, 6)
          .fill({ color: 0x25143f, alpha: 1 })
          .stroke({ color: 0x73d9ff, width: 1, alpha: 0.28 });
        scene.addChild(codeBoard);

        const desk = new Graphics()
          .roundRect(44, 132, 150, 28, 6)
          .fill({ color: 0x9c5d30 })
          .stroke({ color: 0xffc68b, width: 2 });
        scene.addChild(desk);

        const monitor = new Graphics()
          .roundRect(84, 86, 52, 38, 6)
          .fill({ color: 0x141323 })
          .stroke({ color: 0x73d9ff, width: 2 });
        scene.addChild(monitor);

        const monitorGlow = new Graphics()
          .roundRect(91, 93, 42, 28, 5)
          .fill({ color: 0x72f2d6, alpha: 0.9 });
        scene.addChild(monitorGlow);

        const puppy = new Graphics()
          .roundRect(222, 112, 52, 42, 12)
          .fill({ color: 0xffd39b })
          .stroke({ color: 0x8b4c20, width: 2 });
        scene.addChild(puppy);

        const earLeft = new Graphics()
          .poly([232, 114, 240, 96, 248, 114])
          .fill({ color: 0x8b4c20 });
        const earRight = new Graphics()
          .poly([250, 114, 258, 96, 266, 114])
          .fill({ color: 0x8b4c20 });
        scene.addChild(earLeft, earRight);

        const laptop = new Graphics()
          .roundRect(212, 136, 26, 16, 4)
          .fill({ color: 0xc5a0ff })
          .stroke({ color: 0x31224e, width: 2 });
        scene.addChild(laptop);

        const stickyNote = new Graphics()
          .roundRect(220, 86, 30, 20, 4)
          .fill({ color: 0xffd38b, alpha: 0.95 });
        scene.addChild(stickyNote);

        const badgeStyle = new TextStyle({
          fontFamily: 'Pixelify Sans',
          fontSize: 16,
          fill: appTheme.colors.accentSoft,
        });
        const title = new Text({
          text: `${scaleLabel.toUpperCase()} / ${processLabel.toUpperCase()}`,
          style: badgeStyle,
        });
        title.x = 26;
        title.y = 190;
        scene.addChild(title);

        const subStyle = new TextStyle({
          fontFamily: 'IBM Plex Sans KR',
          fontSize: 11,
          fill: appTheme.colors.sky,
        });
        const subtitle = new Text({
          text: `팀 규모 ${employeeCount} / 오늘도 제품을 밀어내는 중`,
          style: subStyle,
        });
        subtitle.x = 26;
        subtitle.y = 212;
        scene.addChild(subtitle);

        for (let index = 0; index < Math.max(0, employeeCount - 1); index += 1) {
          const deskX = 188 + (index % 2) * 58;
          const deskY = 58 + Math.floor(index / 2) * 60;

          const satelliteDesk = new Graphics()
            .roundRect(deskX, deskY, 34, 16, 4)
            .fill({ color: 0x8d5630 })
            .stroke({ color: 0xffc68b, width: 2 });
          const satelliteMonitor = new Graphics()
            .roundRect(deskX + 6, deskY - 20, 20, 14, 4)
            .fill({ color: 0x141323 })
            .stroke({ color: 0x87f5d2, width: 2 });

          scene.addChild(satelliteDesk, satelliteMonitor);
        }

        let elapsed = 0;
        const tick = () => {
          if (!animate) {
            return;
          }

          elapsed += 0.045;
          puppy.y = 112 + Math.sin(elapsed) * 3;
          earLeft.rotation = Math.sin(elapsed * 1.3) * 0.06;
          earRight.rotation = -Math.sin(elapsed * 1.3) * 0.06;
          monitorGlow.alpha = 0.64 + Math.sin(elapsed * 2.2) * 0.24;
          laptop.tint = Math.sin(elapsed * 1.7) > 0 ? 0xff8f3f : 0xc5a0ff;
          stickyNote.alpha = 0.82 + Math.sin(elapsed * 1.4) * 0.1;
        };

        app.ticker.add(tick);
        cleanupTicker = () => app.ticker.remove(tick);

        applyLayout();
        resizeObserver = new ResizeObserver(() => {
          applyLayout();
        });
        resizeObserver.observe(host);
      });

    return () => {
      isDisposed = true;
      resizeObserver?.disconnect();
      cleanupTicker?.();
      void app.destroy(true, true);
      if (host.firstChild) {
        host.innerHTML = '';
      }
    };
  }, [animate, employeeCount, processLabel, scaleLabel]);

  return <div className="stage-shell__viewport" ref={containerRef} />;
}
