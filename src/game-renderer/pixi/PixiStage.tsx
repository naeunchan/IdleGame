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

        const frame = new Graphics()
          .roundRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 12)
          .fill({ color: 0xf3ddb0 })
          .stroke({ color: 0x6a4324, width: 4 });
        scene.addChild(frame);

        const sky = new Graphics()
          .roundRect(8, 8, 344, 116, 8)
          .fill({ color: 0x7ec4ee });
        scene.addChild(sky);

        const haze = new Graphics()
          .rect(8, 82, 344, 42)
          .fill({ color: 0xcfe8a1, alpha: 0.5 });
        scene.addChild(haze);

        const sunGlow = new Graphics().circle(294, 34, 26).fill({ color: 0xf7df8a, alpha: 0.22 });
        const sun = new Graphics().circle(294, 34, 14).fill({ color: 0xf3d575 });
        scene.addChild(sunGlow, sun);

        const cloudLeft = new Graphics()
          .roundRect(34, 28, 44, 18, 8)
          .fill({ color: 0xf5fbff })
          .roundRect(48, 18, 32, 18, 8)
          .fill({ color: 0xf5fbff });
        const cloudRight = new Graphics()
          .roundRect(264, 58, 52, 18, 8)
          .fill({ color: 0xf5fbff })
          .roundRect(282, 48, 28, 18, 8)
          .fill({ color: 0xf5fbff });
        scene.addChild(cloudLeft, cloudRight);

        const mountainBack = new Graphics()
          .poly([8, 106, 58, 64, 92, 78, 132, 50, 184, 88, 232, 58, 282, 84, 352, 46, 352, 124, 8, 124])
          .fill({ color: 0x7ca770 });
        const mountainFront = new Graphics()
          .poly([8, 120, 64, 84, 108, 98, 168, 72, 214, 104, 258, 78, 312, 102, 352, 88, 352, 128, 8, 128])
          .fill({ color: 0x5f8b45 });
        scene.addChild(mountainBack, mountainFront);

        const grass = new Graphics()
          .rect(8, 124, 344, 50)
          .fill({ color: 0x7ea955 });
        const dirt = new Graphics()
          .rect(8, 174, 344, 58)
          .fill({ color: 0x9d6a3c });
        scene.addChild(grass, dirt);

        const path = new Graphics()
          .poly([154, 232, 210, 232, 220, 174, 146, 174])
          .fill({ color: 0xc7965d });
        scene.addChild(path);

        const farmhouseShadow = new Graphics()
          .roundRect(198, 96, 110, 82, 6)
          .fill({ color: 0x7b4928, alpha: 0.25 });
        scene.addChild(farmhouseShadow);

        const farmhouseRoof = new Graphics()
          .poly([198, 108, 252, 68, 308, 108])
          .fill({ color: 0xb65f31 })
          .stroke({ color: 0x73401f, width: 3 });
        const farmhouseBody = new Graphics()
          .roundRect(208, 104, 90, 62, 4)
          .fill({ color: 0xe4c58c })
          .stroke({ color: 0x8b5a2f, width: 3 });
        const farmhouseDoor = new Graphics()
          .roundRect(242, 130, 18, 36, 4)
          .fill({ color: 0x7c4a25 })
          .stroke({ color: 0x5c3319, width: 2 });
        const farmhouseWindow = new Graphics()
          .roundRect(218, 122, 18, 18, 4)
          .fill({ color: 0x9fd6f0 })
          .stroke({ color: 0x7b5228, width: 2 })
          .roundRect(270, 122, 18, 18, 4)
          .fill({ color: 0x9fd6f0 })
          .stroke({ color: 0x7b5228, width: 2 });
        scene.addChild(farmhouseRoof, farmhouseBody, farmhouseDoor, farmhouseWindow);

        const fence = new Graphics()
          .rect(16, 168, 94, 6)
          .fill({ color: 0x7a4a27 })
          .rect(16, 184, 94, 6)
          .fill({ color: 0x7a4a27 })
          .rect(22, 164, 6, 32)
          .fill({ color: 0x9a683d })
          .rect(52, 164, 6, 32)
          .fill({ color: 0x9a683d })
          .rect(82, 164, 6, 32)
          .fill({ color: 0x9a683d });
        scene.addChild(fence);

        const cropBeds = new Graphics()
          .rect(20, 176, 102, 42)
          .fill({ color: 0x7f5329 })
          .rect(22, 178, 30, 18)
          .fill({ color: 0x915f2d })
          .rect(56, 178, 30, 18)
          .fill({ color: 0x915f2d })
          .rect(90, 178, 30, 18)
          .fill({ color: 0x915f2d })
          .rect(22, 198, 30, 18)
          .fill({ color: 0x915f2d })
          .rect(56, 198, 30, 18)
          .fill({ color: 0x915f2d })
          .rect(90, 198, 30, 18)
          .fill({ color: 0x915f2d });
        scene.addChild(cropBeds);

        const sprouts = new Graphics();
        const sproutPositions = [
          [34, 189],
          [68, 189],
          [102, 189],
          [34, 209],
          [68, 209],
          [102, 209],
        ];
        for (const [x, y] of sproutPositions) {
          sprouts
            .rect(x, y, 4, 8)
            .fill({ color: 0x5b8d3c })
            .rect(x - 4, y - 2, 6, 4)
            .fill({ color: 0x84b65d })
            .rect(x + 2, y - 3, 6, 4)
            .fill({ color: 0x84b65d });
        }
        scene.addChild(sprouts);

        const workTable = new Graphics()
          .roundRect(132, 152, 58, 16, 4)
          .fill({ color: 0x83512d })
          .stroke({ color: 0x5d381e, width: 2 })
          .rect(138, 168, 6, 18)
          .fill({ color: 0x5d381e })
          .rect(178, 168, 6, 18)
          .fill({ color: 0x5d381e });
        const laptop = new Graphics()
          .roundRect(144, 142, 24, 14, 4)
          .fill({ color: 0x7fbba3 })
          .stroke({ color: 0x4f7f69, width: 2 });
        const coffee = new Graphics()
          .roundRect(172, 146, 10, 12, 4)
          .fill({ color: 0xf6ecdb })
          .stroke({ color: 0x94633b, width: 2 });
        scene.addChild(workTable, laptop, coffee);

        const boardPost = new Graphics()
          .rect(122, 126, 8, 44)
          .fill({ color: 0x734721 });
        const boardSign = new Graphics()
          .roundRect(96, 110, 56, 22, 6)
          .fill({ color: 0xe9c682 })
          .stroke({ color: 0x8e5b31, width: 3 });
        scene.addChild(boardPost, boardSign);

        const boardText = new Text({
          text: 'CODE',
          style: new TextStyle({
            fontFamily: 'Pixelify Sans',
            fontSize: 14,
            fill: appTheme.colors.ink,
          }),
        });
        boardText.x = 107;
        boardText.y = 113;
        scene.addChild(boardText);

        const puppyBody = new Graphics()
          .roundRect(150, 170, 34, 24, 8)
          .fill({ color: 0xf0c88d })
          .stroke({ color: 0x855430, width: 3 });
        const puppyHead = new Graphics()
          .roundRect(158, 154, 22, 18, 8)
          .fill({ color: 0xf5d59f })
          .stroke({ color: 0x855430, width: 3 });
        const hatBrim = new Graphics()
          .roundRect(154, 148, 30, 6, 3)
          .fill({ color: 0xbd8b4c });
        const hatTop = new Graphics()
          .roundRect(160, 142, 18, 8, 3)
          .fill({ color: 0xd4a763 });
        const earLeft = new Graphics()
          .poly([160, 158, 164, 146, 168, 158])
          .fill({ color: 0x855430 });
        const earRight = new Graphics()
          .poly([170, 158, 174, 146, 178, 158])
          .fill({ color: 0x855430 });
        const tail = new Graphics()
          .poly([0, 0, 14, -8, 14, 2])
          .fill({ color: 0x855430 });
        tail.x = 182;
        tail.y = 186;
        const nose = new Graphics().circle(168, 166, 2).fill({ color: 0x5d371f });
        scene.addChild(puppyBody, puppyHead, hatBrim, hatTop, earLeft, earRight, tail, nose);

        const title = new Text({
          text: 'DOT FARM BUILD',
          style: new TextStyle({
            fontFamily: 'Pixelify Sans',
            fontSize: 22,
            fill: appTheme.colors.accentSoft,
            stroke: {
              color: 0x734622,
              width: 3,
            },
          }),
        });
        title.x = 16;
        title.y = 14;
        scene.addChild(title);

        const subtitle = new Text({
          text: 'Cozy dev field',
          style: new TextStyle({
            fontFamily: 'IBM Plex Sans KR',
            fontSize: 12,
            fill: appTheme.colors.panelStrong,
          }),
        });
        subtitle.x = 18;
        subtitle.y = 40;
        scene.addChild(subtitle);

        let elapsed = 0;
        const tick = () => {
          elapsed += 0.03;
          cloudLeft.x = Math.sin(elapsed * 0.35) * 8;
          cloudRight.x = -Math.sin(elapsed * 0.3) * 6;
          sunGlow.alpha = 0.2 + Math.sin(elapsed * 0.8) * 0.05;
          puppyHead.y = 154 + Math.sin(elapsed * 1.6) * 1.5;
          puppyBody.y = 170 + Math.sin(elapsed * 1.6) * 1.2;
          earLeft.rotation = Math.sin(elapsed * 1.4) * 0.04;
          earRight.rotation = -Math.sin(elapsed * 1.4) * 0.04;
          tail.rotation = -0.12 + Math.sin(elapsed * 2.6) * 0.2;
          laptop.tint = Math.sin(elapsed * 2.2) > 0 ? 0x7fbba3 : 0x9dd3b4;
          coffee.y = 146 - Math.sin(elapsed * 1.7) * 0.6;
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
