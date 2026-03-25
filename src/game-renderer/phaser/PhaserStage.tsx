import { useEffect, useRef } from 'react';

const SCENE_WIDTH = 360;
const SCENE_HEIGHT = 240;
const FRAME_PADDING_X = 18;
const FRAME_PADDING_Y = 18;

type PhaserType = typeof import('phaser');

function getViewportSize(host: HTMLDivElement) {
  return {
    width: Math.max(host.clientWidth, SCENE_WIDTH + FRAME_PADDING_X * 2),
    height: Math.max(host.clientHeight, SCENE_HEIGHT + FRAME_PADDING_Y * 2),
  };
}

export function PhaserStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = containerRef.current;

    if (!host) {
      return;
    }

    let isDisposed = false;
    let game: import('phaser').Game | null = null;
    let resizeObserver: ResizeObserver | null = null;

    void (async () => {
      const phaserModule = await import('phaser');
      const Phaser = ('default' in phaserModule ? phaserModule.default : phaserModule) as PhaserType;

      class DotFarmScene extends Phaser.Scene {
        private root?: import('phaser').GameObjects.Container;
        private cloudLeft?: import('phaser').GameObjects.Container;
        private cloudRight?: import('phaser').GameObjects.Container;
        private sunGlow?: import('phaser').GameObjects.Graphics;
        private puppyHead?: import('phaser').GameObjects.Container;
        private puppyBody?: import('phaser').GameObjects.Container;
        private tail?: import('phaser').GameObjects.Graphics;
        private coffee?: import('phaser').GameObjects.Graphics;
        private elapsed = 0;

        constructor() {
          super('dot-farm');
        }

        private addRoundedRect(
          x: number,
          y: number,
          width: number,
          height: number,
          radius: number,
          fillColor: number,
          strokeColor?: number,
          strokeWidth = 2,
          alpha = 1,
        ) {
          const graphic = this.add.graphics();
          graphic.fillStyle(fillColor, alpha);
          graphic.fillRoundedRect(x, y, width, height, radius);

          if (strokeColor !== undefined) {
            graphic.lineStyle(strokeWidth, strokeColor, 1);
            graphic.strokeRoundedRect(x, y, width, height, radius);
          }

          return graphic;
        }

        private addPolygon(points: Array<[number, number]>, fillColor: number, strokeColor?: number, strokeWidth = 2) {
          const graphic = this.add.graphics();
          graphic.fillStyle(fillColor, 1);

          if (strokeColor !== undefined) {
            graphic.lineStyle(strokeWidth, strokeColor, 1);
          }

          graphic.beginPath();
          graphic.moveTo(points[0][0], points[0][1]);

          for (let index = 1; index < points.length; index += 1) {
            graphic.lineTo(points[index][0], points[index][1]);
          }

          graphic.closePath();

          if (strokeColor !== undefined) {
            graphic.strokePath();
          }

          graphic.fillPath();

          return graphic;
        }

        private addCircle(x: number, y: number, radius: number, fillColor: number, alpha = 1) {
          const graphic = this.add.graphics();
          graphic.fillStyle(fillColor, alpha);
          graphic.fillCircle(x, y, radius);
          return graphic;
        }

        layout(width: number, height: number) {
          if (!this.root) {
            return;
          }

          const scale = Math.min(
            (width - FRAME_PADDING_X * 2) / SCENE_WIDTH,
            (height - FRAME_PADDING_Y * 2) / SCENE_HEIGHT,
          );

          this.root.setScale(scale);
          this.root.setPosition((width - SCENE_WIDTH * scale) / 2, (height - SCENE_HEIGHT * scale) / 2);
        }

        create() {
          this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');

          this.root = this.add.container(0, 0);

          const frame = this.addRoundedRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 12, 0xf3ddb0, 0x6a4324, 4);
          const sky = this.addRoundedRect(8, 8, 344, 116, 8, 0x7ec4ee);
          const haze = this.add.graphics();
          haze.fillStyle(0xcfe8a1, 0.5);
          haze.fillRect(8, 82, 344, 42);

          this.sunGlow = this.addCircle(294, 34, 26, 0xf7df8a, 0.22);
          const sun = this.addCircle(294, 34, 14, 0xf3d575);

          this.cloudLeft = this.add.container(0, 0, [
            this.addRoundedRect(34, 28, 44, 18, 8, 0xf5fbff),
            this.addRoundedRect(48, 18, 32, 18, 8, 0xf5fbff),
          ]);

          this.cloudRight = this.add.container(0, 0, [
            this.addRoundedRect(264, 58, 52, 18, 8, 0xf5fbff),
            this.addRoundedRect(282, 48, 28, 18, 8, 0xf5fbff),
          ]);

          const mountainBack = this.addPolygon(
            [
              [8, 106],
              [58, 64],
              [92, 78],
              [132, 50],
              [184, 88],
              [232, 58],
              [282, 84],
              [352, 46],
              [352, 124],
              [8, 124],
            ],
            0x7ca770,
          );
          const mountainFront = this.addPolygon(
            [
              [8, 120],
              [64, 84],
              [108, 98],
              [168, 72],
              [214, 104],
              [258, 78],
              [312, 102],
              [352, 88],
              [352, 128],
              [8, 128],
            ],
            0x5f8b45,
          );

          const grass = this.add.graphics();
          grass.fillStyle(0x7ea955, 1);
          grass.fillRect(8, 124, 344, 50);

          const dirt = this.add.graphics();
          dirt.fillStyle(0x9d6a3c, 1);
          dirt.fillRect(8, 174, 344, 58);

          const path = this.addPolygon(
            [
              [154, 232],
              [210, 232],
              [220, 174],
              [146, 174],
            ],
            0xc7965d,
          );

          const farmhouseShadow = this.addRoundedRect(198, 96, 110, 82, 6, 0x7b4928, undefined, 0, 0.25);
          const farmhouseRoof = this.addPolygon(
            [
              [198, 108],
              [252, 68],
              [308, 108],
            ],
            0xb65f31,
            0x73401f,
            3,
          );
          const farmhouseBody = this.addRoundedRect(208, 104, 90, 62, 4, 0xe4c58c, 0x8b5a2f, 3);
          const farmhouseDoor = this.addRoundedRect(242, 130, 18, 36, 4, 0x7c4a25, 0x5c3319, 2);
          const farmhouseWindowLeft = this.addRoundedRect(218, 122, 18, 18, 4, 0x9fd6f0, 0x7b5228, 2);
          const farmhouseWindowRight = this.addRoundedRect(270, 122, 18, 18, 4, 0x9fd6f0, 0x7b5228, 2);

          const fence = this.add.graphics();
          fence.fillStyle(0x7a4a27, 1);
          fence.fillRect(16, 168, 94, 6);
          fence.fillRect(16, 184, 94, 6);
          fence.fillStyle(0x9a683d, 1);
          fence.fillRect(22, 164, 6, 32);
          fence.fillRect(52, 164, 6, 32);
          fence.fillRect(82, 164, 6, 32);

          const cropBeds = this.add.graphics();
          cropBeds.fillStyle(0x7f5329, 1);
          cropBeds.fillRect(20, 176, 102, 42);
          cropBeds.fillStyle(0x915f2d, 1);
          [[22, 178], [56, 178], [90, 178], [22, 198], [56, 198], [90, 198]].forEach(([x, y]) => {
            cropBeds.fillRect(x, y, 30, 18);
          });

          const sprouts = this.add.graphics();
          sprouts.fillStyle(0x5b8d3c, 1);
          const sproutPositions = [
            [34, 189],
            [68, 189],
            [102, 189],
            [34, 209],
            [68, 209],
            [102, 209],
          ];
          sproutPositions.forEach(([x, y]) => {
            sprouts.fillRect(x, y, 4, 8);
            sprouts.fillStyle(0x84b65d, 1);
            sprouts.fillRect(x - 4, y - 2, 6, 4);
            sprouts.fillRect(x + 2, y - 3, 6, 4);
            sprouts.fillStyle(0x5b8d3c, 1);
          });

          const workTable = this.add.graphics();
          workTable.fillStyle(0x83512d, 1);
          workTable.fillRoundedRect(132, 152, 58, 16, 4);
          workTable.lineStyle(2, 0x5d381e, 1);
          workTable.strokeRoundedRect(132, 152, 58, 16, 4);
          workTable.fillStyle(0x5d381e, 1);
          workTable.fillRect(138, 168, 6, 18);
          workTable.fillRect(178, 168, 6, 18);

          const laptop = this.addRoundedRect(144, 142, 24, 14, 4, 0x7fbba3, 0x4f7f69, 2);
          this.coffee = this.addRoundedRect(172, 146, 10, 12, 4, 0xf6ecdb, 0x94633b, 2);

          const boardPost = this.add.graphics();
          boardPost.fillStyle(0x734721, 1);
          boardPost.fillRect(122, 126, 8, 44);
          const boardSign = this.addRoundedRect(96, 110, 56, 22, 6, 0xe9c682, 0x8e5b31, 3);
          const boardText = this.add.text(107, 113, 'CODE', {
            fontFamily: 'Pixelify Sans',
            fontSize: '14px',
            color: '#4c2d1a',
          });

          this.puppyBody = this.add.container(0, 0, [
            this.addRoundedRect(150, 170, 34, 24, 8, 0xf0c88d, 0x855430, 3),
          ]);
          this.puppyHead = this.add.container(0, 0, [
            this.addRoundedRect(158, 154, 22, 18, 8, 0xf5d59f, 0x855430, 3),
            this.addRoundedRect(154, 148, 30, 6, 3, 0xbd8b4c),
            this.addRoundedRect(160, 142, 18, 8, 3, 0xd4a763),
            this.addPolygon(
              [
                [160, 158],
                [164, 146],
                [168, 158],
              ],
              0x855430,
            ),
            this.addPolygon(
              [
                [170, 158],
                [174, 146],
                [178, 158],
              ],
              0x855430,
            ),
            this.addCircle(168, 166, 2, 0x5d371f),
          ]);
          this.tail = this.addPolygon(
            [
              [182, 186],
              [196, 178],
              [196, 188],
            ],
            0x855430,
          );

          const title = this.add.text(16, 14, 'DOT FARM BUILD', {
            fontFamily: 'Pixelify Sans',
            fontSize: '22px',
            color: '#f0ce71',
            stroke: '#734622',
            strokeThickness: 3,
          });
          const subtitle = this.add.text(18, 40, 'Cozy dev field', {
            fontFamily: 'IBM Plex Sans KR',
            fontSize: '12px',
            color: '#fff5db',
          });

          this.root.add([
            frame,
            sky,
            haze,
            this.sunGlow,
            sun,
            this.cloudLeft,
            this.cloudRight,
            mountainBack,
            mountainFront,
            grass,
            dirt,
            path,
            farmhouseShadow,
            farmhouseRoof,
            farmhouseBody,
            farmhouseDoor,
            farmhouseWindowLeft,
            farmhouseWindowRight,
            fence,
            cropBeds,
            sprouts,
            workTable,
            laptop,
            this.coffee,
            boardPost,
            boardSign,
            boardText,
            this.puppyBody,
            this.puppyHead,
            this.tail,
            title,
            subtitle,
          ]);
        }

        update(_: number, delta: number) {
          this.elapsed += delta / 1000;

          if (!this.cloudLeft || !this.cloudRight || !this.sunGlow || !this.puppyHead || !this.puppyBody || !this.tail || !this.coffee) {
            return;
          }

          this.cloudLeft.x = Math.sin(this.elapsed * 0.35) * 8;
          this.cloudRight.x = -Math.sin(this.elapsed * 0.3) * 6;
          this.sunGlow.alpha = 0.2 + Math.sin(this.elapsed * 0.8) * 0.05;
          this.puppyHead.y = Math.sin(this.elapsed * 1.6) * 1.5;
          this.puppyBody.y = Math.sin(this.elapsed * 1.6) * 1.2;
          this.tail.rotation = -0.12 + Math.sin(this.elapsed * 2.6) * 0.2;
          this.coffee.y = 146 - Math.sin(this.elapsed * 1.7) * 0.6;
        }
      }

      if (isDisposed) {
        return;
      }

      const scene = new DotFarmScene();
      const viewport = getViewportSize(host);

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host,
        width: viewport.width,
        height: viewport.height,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        transparent: true,
        scene,
        banner: false,
        audio: {
          noAudio: true,
        },
        render: {
          pixelArt: true,
          antialias: false,
          roundPixels: true,
        },
        scale: {
          mode: Phaser.Scale.NONE,
          width: viewport.width,
          height: viewport.height,
        },
      });

      const applyLayout = () => {
        if (!game) {
          return;
        }

        const nextViewport = getViewportSize(host);
        game.scale.resize(nextViewport.width, nextViewport.height);
        scene.layout(nextViewport.width, nextViewport.height);
      };

      resizeObserver = new ResizeObserver(() => {
        applyLayout();
      });
      resizeObserver.observe(host);

      game.events.once(Phaser.Core.Events.READY, () => {
        applyLayout();
      });
    })();

    return () => {
      isDisposed = true;
      resizeObserver?.disconnect();

      if (game) {
        game.destroy(true);
      }

      if (host.firstChild) {
        host.innerHTML = '';
      }
    };
  }, []);

  return <div className="stage-shell__viewport" ref={containerRef} />;
}
