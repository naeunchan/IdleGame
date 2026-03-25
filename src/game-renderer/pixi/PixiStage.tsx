import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

import { appTheme } from '@/shared/constants/theme';

const SCENE_WIDTH = 360;
const SCENE_HEIGHT = 240;
const FRAME_PADDING_X = 18;
const FRAME_PADDING_Y = 18;

export function PixiStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = containerRef.current;

    if (!host) {
      return;
    }

    let isDisposed = false;
    const app = new Application();
    let cleanupTicker: (() => void) | null = null;
    let cleanupResizeObserver: (() => void) | null = null;
    let scene: Container | null = null;

    const getViewportSize = () => ({
      width: Math.max(host.clientWidth, SCENE_WIDTH + FRAME_PADDING_X * 2),
      height: Math.max(host.clientHeight, SCENE_HEIGHT + FRAME_PADDING_Y * 2),
    });

    const layoutScene = () => {
      if (!scene) {
        return;
      }

      const { width, height } = getViewportSize();
      app.renderer.resize(width, height);

      const scale = Math.min(
        (width - FRAME_PADDING_X * 2) / SCENE_WIDTH,
        (height - FRAME_PADDING_Y * 2) / SCENE_HEIGHT,
      );

      scene.scale.set(scale);
      scene.x = (width - SCENE_WIDTH * scale) / 2;
      scene.y = (height - SCENE_HEIGHT * scale) / 2;
    };

    void app
      .init({
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        width: getViewportSize().width,
        height: getViewportSize().height,
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
        app.canvas.style.display = 'block';
        app.canvas.style.imageRendering = 'pixelated';

        scene = new Container();
        app.stage.addChild(scene);

        const room = new Graphics()
          .roundRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 28)
          .fill({ color: 0xf7eccd })
          .stroke({ color: 0x9d7149, width: 4 });
        scene.addChild(room);

        const skyPanel = new Graphics()
          .roundRect(18, 18, 324, 102, 18)
          .fill({ color: 0x94cbf8 });
        scene.addChild(skyPanel);

        const sun = new Graphics().circle(294, 42, 18).fill({ color: 0xf7de8f });
        scene.addChild(sun);

        const sunGlow = new Graphics().circle(294, 42, 28).fill({ color: 0xf7de8f, alpha: 0.18 });
        scene.addChild(sunGlow);

        const hillBack = new Graphics()
          .poly([18, 102, 74, 74, 124, 90, 178, 62, 232, 82, 288, 56, 342, 102])
          .fill({ color: 0x94bc7a });
        scene.addChild(hillBack);

        const hillFront = new Graphics()
          .poly([18, 118, 84, 88, 144, 102, 202, 84, 268, 108, 342, 88, 342, 120, 18, 120])
          .fill({ color: 0x74a55d });
        scene.addChild(hillFront);

        const curtainLeft = new Graphics()
          .roundRect(24, 22, 34, 88, 10)
          .fill({ color: 0xe7a55a })
          .stroke({ color: 0xb56d32, width: 2 });
        const curtainRight = new Graphics()
          .roundRect(302, 22, 34, 88, 10)
          .fill({ color: 0xe7a55a })
          .stroke({ color: 0xb56d32, width: 2 });
        scene.addChild(curtainLeft, curtainRight);

        const windowFrame = new Graphics()
          .roundRect(54, 28, 132, 82, 14)
          .fill({ color: 0xf8f2e2, alpha: 0.35 })
          .stroke({ color: 0x9d7149, width: 4 });
        const windowCross = new Graphics()
          .rect(118, 28, 4, 82)
          .fill({ color: 0x9d7149 })
          .rect(54, 67, 132, 4)
          .fill({ color: 0x9d7149 });
        scene.addChild(windowFrame, windowCross);

        const wallBand = new Graphics().rect(18, 120, 324, 28).fill({ color: 0xf1dfbb });
        const floor = new Graphics().rect(18, 148, 324, 74).fill({ color: 0xc18a57 });
        scene.addChild(wallBand, floor);

        const rug = new Graphics()
          .roundRect(186, 180, 118, 32, 10)
          .fill({ color: 0xd38a51 })
          .stroke({ color: 0x9d5d31, width: 3 });
        scene.addChild(rug);

        const desk = new Graphics()
          .roundRect(168, 132, 132, 26, 8)
          .fill({ color: 0x9e6e44 })
          .stroke({ color: 0x71472a, width: 3 });
        const deskLegs = new Graphics()
          .rect(180, 158, 8, 34)
          .fill({ color: 0x71472a })
          .rect(280, 158, 8, 34)
          .fill({ color: 0x71472a });
        scene.addChild(desk, deskLegs);

        const notebook = new Graphics()
          .roundRect(194, 122, 42, 24, 5)
          .fill({ color: 0x89b77a })
          .stroke({ color: 0x57753d, width: 2 });
        const pencil = new Graphics()
          .roundRect(229, 130, 24, 4, 2)
          .fill({ color: 0xf1c770 });
        scene.addChild(notebook, pencil);

        const mug = new Graphics()
          .roundRect(266, 121, 14, 18, 5)
          .fill({ color: 0xf3ead5 })
          .stroke({ color: 0x9d7149, width: 2 });
        scene.addChild(mug);

        const steamLeft = new Graphics().circle(0, 0, 4).fill({ color: 0xffffff, alpha: 0.42 });
        const steamRight = new Graphics().circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.3 });
        steamLeft.x = 270;
        steamLeft.y = 116;
        steamRight.x = 278;
        steamRight.y = 110;
        scene.addChild(steamLeft, steamRight);

        const plantPot = new Graphics()
          .roundRect(46, 150, 28, 22, 6)
          .fill({ color: 0xb66d43 })
          .stroke({ color: 0x754228, width: 2 });
        const plantLeafLeft = new Graphics()
          .poly([0, 0, -10, -22, 2, -18])
          .fill({ color: 0x6f9d57 });
        const plantLeafRight = new Graphics()
          .poly([0, 0, 12, -24, 4, -18])
          .fill({ color: 0x7aaa64 });
        plantLeafLeft.x = 58;
        plantLeafLeft.y = 150;
        plantLeafRight.x = 62;
        plantLeafRight.y = 150;
        scene.addChild(plantPot, plantLeafLeft, plantLeafRight);

        const puppyBody = new Graphics()
          .roundRect(212, 134, 54, 34, 12)
          .fill({ color: 0xf3c886 })
          .stroke({ color: 0x8f6035, width: 3 });
        const puppyHead = new Graphics()
          .roundRect(224, 114, 36, 28, 12)
          .fill({ color: 0xf7d399 })
          .stroke({ color: 0x8f6035, width: 3 });
        const earLeft = new Graphics()
          .poly([230, 118, 238, 100, 246, 118])
          .fill({ color: 0x8f6035 });
        const earRight = new Graphics()
          .poly([244, 118, 252, 100, 260, 118])
          .fill({ color: 0x8f6035 });
        const tail = new Graphics()
          .poly([0, 0, 18, -10, 18, 2])
          .fill({ color: 0x8f6035 });
        tail.x = 262;
        tail.y = 153;
        const nose = new Graphics().circle(242, 129, 2.5).fill({ color: 0x5f3d22 });
        const blushLeft = new Graphics().circle(234, 130, 3).fill({ color: 0xe9a38d, alpha: 0.55 });
        const blushRight = new Graphics().circle(250, 130, 3).fill({ color: 0xe9a38d, alpha: 0.55 });
        const laptop = new Graphics()
          .roundRect(204, 144, 26, 16, 4)
          .fill({ color: 0x7fba9e })
          .stroke({ color: 0x4a7e68, width: 2 });
        scene.addChild(
          puppyBody,
          puppyHead,
          earLeft,
          earRight,
          tail,
          nose,
          blushLeft,
          blushRight,
          laptop,
        );

        const wallFrame = new Graphics()
          .roundRect(228, 34, 84, 44, 12)
          .fill({ color: 0xf8f2e2 })
          .stroke({ color: 0x9d7149, width: 3 });
        const wallFrameArt = new Graphics()
          .poly([244, 62, 260, 48, 274, 58, 292, 42, 302, 62])
          .fill({ color: 0x8bb777 })
          .circle(252, 46, 6)
          .fill({ color: 0xf2cb79 });
        scene.addChild(wallFrame, wallFrameArt);

        const title = new Text({
          text: 'SPRING BUILD',
          style: new TextStyle({
            fontFamily: 'Pixelify Sans',
            fontSize: 24,
            fill: appTheme.colors.accent,
            stroke: {
              color: 0xf8f2e2,
              width: 2,
            },
          }),
        });
        title.x = 26;
        title.y = 184;
        scene.addChild(title);

        const subtitle = new Text({
          text: 'Cozy starter studio',
          style: new TextStyle({
            fontFamily: 'IBM Plex Sans KR',
            fontSize: 13,
            fill: appTheme.colors.subInk,
          }),
        });
        subtitle.x = 28;
        subtitle.y = 212;
        scene.addChild(subtitle);

        let elapsed = 0;
        const tick = () => {
          elapsed += 0.03;
          puppyHead.y = 114 + Math.sin(elapsed * 1.3) * 1.4;
          puppyBody.y = 134 + Math.sin(elapsed * 1.3) * 1.2;
          earLeft.rotation = Math.sin(elapsed) * 0.05;
          earRight.rotation = -Math.sin(elapsed) * 0.05;
          tail.rotation = -0.18 + Math.sin(elapsed * 2.3) * 0.14;
          sunGlow.alpha = 0.16 + Math.sin(elapsed * 1.1) * 0.06;
          steamLeft.y = 116 - Math.sin(elapsed * 1.8) * 3;
          steamRight.y = 110 - Math.sin(elapsed * 1.8 + 0.5) * 2.5;
          steamLeft.alpha = 0.28 + Math.sin(elapsed * 1.6) * 0.08;
          steamRight.alpha = 0.22 + Math.sin(elapsed * 1.6 + 0.5) * 0.07;
          plantLeafLeft.rotation = Math.sin(elapsed * 1.2) * 0.07;
          plantLeafRight.rotation = -Math.sin(elapsed * 1.2) * 0.06;
          curtainLeft.x = 24 + Math.sin(elapsed * 0.7) * 1.6;
          curtainRight.x = 302 - Math.sin(elapsed * 0.7) * 1.6;
        };

        app.ticker.add(tick);
        cleanupTicker = () => app.ticker.remove(tick);

        const resizeObserver = new ResizeObserver(() => {
          layoutScene();
        });
        resizeObserver.observe(host);
        cleanupResizeObserver = () => resizeObserver.disconnect();

        layoutScene();
      });

    return () => {
      isDisposed = true;
      cleanupTicker?.();
      cleanupResizeObserver?.();
      void app.destroy(true, true);

      if (host.firstChild) {
        host.innerHTML = '';
      }
    };
  }, []);

  return <div className="stage-shell__viewport" ref={containerRef} />;
}
