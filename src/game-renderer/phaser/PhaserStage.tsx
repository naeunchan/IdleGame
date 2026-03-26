import { useEffect, useRef } from 'react';

import type { ProcessMode } from '@/entities/process';
import type { PhaserStageSnapshot } from '@/game-renderer/phaser/createStageSnapshot';

const SCENE_WIDTH = 360;
const SCENE_HEIGHT = 240;
const FRAME_PADDING_X = 18;
const FRAME_PADDING_Y = 18;
const PROGRESS_TRACK_WIDTH = 118;

type PhaserType = typeof import('phaser');

interface WorkerLayout {
  x: number;
  y: number;
  scale: number;
  fur: number;
  accent: number;
}

interface WorkerVisual {
  root: import('phaser').GameObjects.Container;
  head: import('phaser').GameObjects.Container;
  body: import('phaser').GameObjects.Container;
  tail: import('phaser').GameObjects.Graphics;
  baseY: number;
}

interface StageSceneHandle {
  layout: (width: number, height: number) => void;
  syncSnapshot: (snapshot: PhaserStageSnapshot) => void;
}

const workerLayouts: WorkerLayout[] = [
  { x: 164, y: 186, scale: 1, fur: 0xf0c88d, accent: 0x7fbba3 },
  { x: 132, y: 193, scale: 0.82, fur: 0xd9b071, accent: 0xf0ce71 },
  { x: 202, y: 191, scale: 0.82, fur: 0xf2d9a8, accent: 0x8fc4ef },
  { x: 236, y: 184, scale: 0.74, fur: 0xe4b46d, accent: 0xe59b63 },
];

const cropPatchPositions: Array<[number, number]> = [
  [34, 186],
  [68, 186],
  [102, 186],
  [34, 206],
  [68, 206],
  [102, 206],
];

const deliveryCratePositions: Array<[number, number]> = [
  [220, 184],
  [244, 180],
  [268, 176],
  [292, 172],
];

function getViewportSize(host: HTMLDivElement) {
  return {
    width: Math.max(host.clientWidth, SCENE_WIDTH + FRAME_PADDING_X * 2),
    height: Math.max(host.clientHeight, SCENE_HEIGHT + FRAME_PADDING_Y * 2),
  };
}

function getProcessPalette(processMode: ProcessMode) {
  if (processMode === 'waterfall') {
    return {
      label: 'FLOW',
      subtitle: 'Stable release',
      color: 0x8bbfe8,
      textColor: '#234864',
    };
  }

  if (processMode === 'spiral') {
    return {
      label: 'LOOP',
      subtitle: 'Risk review',
      color: 0x8fcfa7,
      textColor: '#204d2d',
    };
  }

  return {
    label: 'AGILE',
    subtitle: 'Fast sprint',
    color: 0xf2bf65,
    textColor: '#6a421e',
  };
}

export function PhaserStage({ snapshot }: { snapshot: PhaserStageSnapshot }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<StageSceneHandle | null>(null);
  const snapshotRef = useRef(snapshot);

  snapshotRef.current = snapshot;

  useEffect(() => {
    sceneRef.current?.syncSnapshot(snapshot);
  }, [snapshot]);

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

      class DotFarmScene extends Phaser.Scene implements StageSceneHandle {
        private snapshot: PhaserStageSnapshot = snapshotRef.current;
        private root?: import('phaser').GameObjects.Container;
        private cloudLeft?: import('phaser').GameObjects.Container;
        private cloudRight?: import('phaser').GameObjects.Container;
        private sunGlow?: import('phaser').GameObjects.Graphics;
        private progressFill?: import('phaser').GameObjects.Rectangle;
        private progressLabel?: import('phaser').GameObjects.Text;
        private boardText?: import('phaser').GameObjects.Text;
        private subtitle?: import('phaser').GameObjects.Text;
        private processBadge?: import('phaser').GameObjects.Rectangle;
        private processBadgeText?: import('phaser').GameObjects.Text;
        private officeLevelTwoDecor?: import('phaser').GameObjects.Container;
        private officeLevelThreeDecor?: import('phaser').GameObjects.Container;
        private snackCart?: import('phaser').GameObjects.Container;
        private snackTreats: import('phaser').GameObjects.Graphics[] = [];
        private showcaseShelf?: import('phaser').GameObjects.Container;
        private showcaseAwards: import('phaser').GameObjects.Graphics[] = [];
        private deskLamp?: import('phaser').GameObjects.Container;
        private deskLampGlow?: import('phaser').GameObjects.Graphics;
        private secondMonitor?: import('phaser').GameObjects.Graphics;
        private keyboardGlow?: import('phaser').GameObjects.Rectangle;
        private agileProps?: import('phaser').GameObjects.Container;
        private spiralProps?: import('phaser').GameObjects.Container;
        private waterfallProps?: import('phaser').GameObjects.Container;
        private cropPatches: import('phaser').GameObjects.Container[] = [];
        private deliveryCrates: import('phaser').GameObjects.Container[] = [];
        private workers: WorkerVisual[] = [];
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

        private addPolygon(
          points: Array<[number, number]>,
          fillColor: number,
          strokeColor?: number,
          strokeWidth = 2,
        ) {
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

        private createWorker(layout: WorkerLayout) {
          const tail = this.addPolygon(
            [
              [10, 1],
              [20, -7],
              [19, 3],
            ],
            0x855430,
          );
          const body = this.add.container(0, 0, [
            this.addRoundedRect(-12, -8, 24, 16, 6, layout.fur, 0x855430, 2),
            this.addRoundedRect(-3, -3, 6, 4, 2, layout.accent),
          ]);
          const head = this.add.container(0, 0, [
            this.addRoundedRect(-9, -18, 18, 15, 6, 0xf7d9aa, 0x855430, 2),
            this.addPolygon(
              [
                [-7, -8],
                [-4, -18],
                [-1, -8],
              ],
              0x855430,
            ),
            this.addPolygon(
              [
                [1, -8],
                [4, -18],
                [7, -8],
              ],
              0x855430,
            ),
            this.addCircle(-3, -11, 1.3, 0x4b2d19),
            this.addCircle(3, -11, 1.3, 0x4b2d19),
            this.addCircle(0, -7, 1.4, 0x4b2d19),
          ]);
          const root = this.add.container(layout.x, layout.y, [tail, body, head]);
          root.setScale(layout.scale);

          return {
            root,
            head,
            body,
            tail,
            baseY: layout.y,
          };
        }

        private createCropPatch(x: number, y: number) {
          const root = this.add.container(x, y, [
            this.addRoundedRect(-9, -5, 18, 10, 3, 0x8a5d2d, 0x6b4324, 2),
            this.addCircle(0, -2, 3, 0x84b65d),
            this.addCircle(-4, 0, 2, 0x6f9f49),
            this.addCircle(4, 0, 2, 0x6f9f49),
          ]);

          return root;
        }

        private createDeliveryCrate(x: number, y: number) {
          const box = this.addRoundedRect(-9, -7, 18, 14, 3, 0xc79561, 0x6b4324, 2);
          const tape = this.addRoundedRect(-2, -7, 4, 14, 1, 0xf1ddb3);
          const label = this.add.text(-6, -4, 'DEV', {
            fontFamily: 'Pixelify Sans',
            fontSize: '6px',
            color: '#4c2d1a',
          });

          return this.add.container(x, y, [box, tape, label]);
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

        syncSnapshot(nextSnapshot: PhaserStageSnapshot) {
          this.snapshot = nextSnapshot;

          if (!this.root) {
            return;
          }

          const processPalette = getProcessPalette(nextSnapshot.processMode);
          const fillWidth = Math.max(0, (PROGRESS_TRACK_WIDTH * nextSnapshot.projectProgressPercent) / 100);

          this.progressFill?.setDisplaySize(Math.max(fillWidth, fillWidth > 0 ? 4 : 0), 6);
          this.progressFill?.setFillStyle(processPalette.color, 1);
          this.progressFill?.setVisible(fillWidth > 0);
          this.progressLabel?.setText(nextSnapshot.projectProgressLabel);
          this.boardText?.setText(nextSnapshot.projectProgressLabel);
          this.subtitle?.setText(`${nextSnapshot.workerCount} DOGS · ${processPalette.subtitle}`);
          this.processBadge?.setFillStyle(processPalette.color, 1);
          this.processBadgeText?.setText(processPalette.label);
          this.processBadgeText?.setColor(processPalette.textColor);

          this.officeLevelTwoDecor?.setVisible(nextSnapshot.officeLevel >= 2);
          this.officeLevelThreeDecor?.setVisible(nextSnapshot.officeLevel >= 3);

          this.workers.forEach((worker, index) => {
            worker.root.setVisible(index < nextSnapshot.workerCount);
          });
          this.cropPatches.forEach((patch, index) => {
            patch.setVisible(index < nextSnapshot.cropPatchCount);
          });
          this.deliveryCrates.forEach((crate, index) => {
            crate.setVisible(index < nextSnapshot.deliveryCrateCount);
          });

          this.agileProps?.setVisible(nextSnapshot.processMode === 'agile');
          this.spiralProps?.setVisible(nextSnapshot.processMode === 'spiral');
          this.waterfallProps?.setVisible(nextSnapshot.processMode === 'waterfall');

          this.snackCart?.setVisible(nextSnapshot.snackCartLevel > 0);
          this.snackTreats.forEach((treat, index) => {
            treat.setVisible(index < nextSnapshot.snackCartLevel);
          });
          this.showcaseShelf?.setVisible(nextSnapshot.showcaseWallLevel > 0);
          this.showcaseAwards.forEach((award, index) => {
            award.setVisible(index < nextSnapshot.showcaseWallLevel);
          });

          this.deskLamp?.setVisible(nextSnapshot.warmDeskLevel > 0);
          this.deskLampGlow?.setVisible(nextSnapshot.warmDeskLevel > 0);
          this.secondMonitor?.setVisible(nextSnapshot.warmDeskLevel > 1);
          this.keyboardGlow?.setVisible(nextSnapshot.warmDeskLevel > 2);
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

          this.officeLevelTwoDecor = this.add.container(0, 0, [
            this.addRoundedRect(298, 118, 28, 34, 4, 0xedcf91, 0x8b5a2f, 3),
            this.addPolygon(
              [
                [296, 122],
                [312, 108],
                [328, 122],
              ],
              0xd57a43,
              0x73401f,
              3,
            ),
            this.addRoundedRect(304, 128, 14, 10, 3, 0x9fd6f0, 0x7b5228, 2),
            this.addRoundedRect(306, 146, 18, 8, 3, 0x92b75b, 0x5c7d33, 2),
          ]);

          this.officeLevelThreeDecor = this.add.container(0, 0, [
            this.addRoundedRect(226, 88, 54, 12, 4, 0x7c4a25, 0x5c3319, 2),
            this.add.text(235, 90, 'DOG DEV', {
              fontFamily: 'Pixelify Sans',
              fontSize: '8px',
              color: '#fff5db',
            }),
            this.addRoundedRect(248, 102, 10, 8, 2, 0x9fd6f0, 0x7b5228, 2),
          ]);

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

          this.cropPatches = cropPatchPositions.map(([x, y]) => this.createCropPatch(x, y));

          const workTable = this.add.graphics();
          workTable.fillStyle(0x83512d, 1);
          workTable.fillRoundedRect(128, 154, 72, 16, 4);
          workTable.lineStyle(2, 0x5d381e, 1);
          workTable.strokeRoundedRect(128, 154, 72, 16, 4);
          workTable.fillStyle(0x5d381e, 1);
          workTable.fillRect(136, 170, 6, 18);
          workTable.fillRect(184, 170, 6, 18);

          const laptop = this.addRoundedRect(144, 142, 24, 14, 4, 0x7fbba3, 0x4f7f69, 2);
          const monitor = this.addRoundedRect(172, 140, 14, 16, 3, 0xa9d0e2, 0x4f7f69, 2);
          this.secondMonitor = this.addRoundedRect(188, 141, 12, 14, 3, 0xa9d0e2, 0x4f7f69, 2);
          this.keyboardGlow = this.add.rectangle(156, 158, 22, 3, 0xf7df8a).setAlpha(0.8);

          this.deskLampGlow = this.addCircle(199, 146, 12, 0xf6df8d, 0.18);
          this.deskLamp = this.add.container(0, 0, [
            this.addRoundedRect(195, 156, 10, 3, 2, 0x8b5a2f),
            this.addRoundedRect(198, 146, 3, 12, 2, 0x8b5a2f),
            this.addPolygon(
              [
                [196, 146],
                [206, 146],
                [202, 138],
              ],
              0xf5d488,
              0x8b5a2f,
              2,
            ),
          ]);

          const boardPost = this.add.graphics();
          boardPost.fillStyle(0x734721, 1);
          boardPost.fillRect(122, 126, 8, 44);
          const boardSign = this.addRoundedRect(96, 110, 56, 22, 6, 0xe9c682, 0x8e5b31, 3);
          this.boardText = this.add.text(109, 113, '0%', {
            fontFamily: 'Pixelify Sans',
            fontSize: '14px',
            color: '#4c2d1a',
          });

          this.snackCart = this.add.container(0, 0, [
            this.addRoundedRect(306, 176, 26, 12, 4, 0xd7a16c, 0x73401f, 2),
            this.addRoundedRect(314, 166, 10, 10, 3, 0xf3dfbc, 0x73401f, 2),
            this.addCircle(311, 190, 4, 0x73401f),
            this.addCircle(327, 190, 4, 0x73401f),
          ]);
          this.snackTreats = [
            this.addRoundedRect(309, 168, 4, 4, 1, 0xf08a68),
            this.addRoundedRect(315, 168, 4, 4, 1, 0xf3d575),
            this.addRoundedRect(321, 168, 4, 4, 1, 0x7fc8b1),
          ];
          this.snackCart.add(this.snackTreats);

          this.showcaseShelf = this.add.container(0, 0, [
            this.addRoundedRect(220, 108, 42, 10, 3, 0x7c4a25, 0x5c3319, 2),
          ]);
          this.showcaseAwards = [
            this.addRoundedRect(225, 97, 8, 11, 2, 0xf0ce71, 0x8b5a2f, 2),
            this.addRoundedRect(238, 95, 8, 13, 2, 0xa6d8ef, 0x5c7d91, 2),
            this.addRoundedRect(251, 97, 8, 11, 2, 0x9ed17e, 0x5c7d33, 2),
          ];
          this.showcaseShelf.add(this.showcaseAwards);

          this.agileProps = this.add.container(0, 0, [
            this.addRoundedRect(138, 128, 8, 10, 2, 0xf2bf65),
            this.addRoundedRect(148, 132, 8, 10, 2, 0xf39a66),
            this.addRoundedRect(156, 126, 8, 10, 2, 0xf0ce71),
          ]);
          this.spiralProps = this.add.container(0, 0, [
            this.addCircle(146, 132, 5, 0x8fcfa7, 0.9),
            this.addCircle(154, 124, 3, 0x7fbba3, 0.9),
            this.addRoundedRect(145, 123, 12, 2, 1, 0x285441),
          ]);
          this.waterfallProps = this.add.container(0, 0, [
            this.addRoundedRect(139, 126, 12, 14, 2, 0xdfeffd, 0x7b98b6, 2),
            this.addRoundedRect(150, 130, 12, 14, 2, 0xcde1f4, 0x7b98b6, 2),
          ]);

          this.deliveryCrates = deliveryCratePositions.map(([x, y]) => this.createDeliveryCrate(x, y));
          this.workers = workerLayouts.map((layout) => this.createWorker(layout));

          const progressTrack = this.add
            .rectangle(76, 28, PROGRESS_TRACK_WIDTH + 8, 12, 0xf7efdc)
            .setStrokeStyle(2, 0x6b4324);
          this.progressFill = this.add.rectangle(18, 28, 0, 6, 0xf2bf65).setOrigin(0, 0.5);
          this.progressLabel = this.add.text(145, 21, '0%', {
            fontFamily: 'Pixelify Sans',
            fontSize: '10px',
            color: '#4c2d1a',
          });

          this.processBadge = this.add.rectangle(309, 26, 58, 16, 0xf2bf65).setStrokeStyle(2, 0x734622);
          this.processBadgeText = this.add.text(287, 20, 'AGILE', {
            fontFamily: 'Pixelify Sans',
            fontSize: '10px',
            color: '#6a421e',
          });

          const title = this.add.text(16, 14, 'DOT FARM BUILD', {
            fontFamily: 'Pixelify Sans',
            fontSize: '22px',
            color: '#f0ce71',
            stroke: '#734622',
            strokeThickness: 3,
          });
          this.subtitle = this.add.text(18, 40, '1 DOGS · Fast sprint', {
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
            this.officeLevelTwoDecor,
            this.officeLevelThreeDecor,
            fence,
            cropBeds,
            ...this.cropPatches,
            workTable,
            laptop,
            monitor,
            this.secondMonitor,
            this.keyboardGlow,
            this.deskLampGlow,
            this.deskLamp,
            boardPost,
            boardSign,
            this.boardText,
            this.snackCart,
            this.showcaseShelf,
            this.agileProps,
            this.spiralProps,
            this.waterfallProps,
            ...this.deliveryCrates,
            ...this.workers.map((worker) => worker.root),
            progressTrack,
            this.progressFill,
            this.progressLabel,
            this.processBadge,
            this.processBadgeText,
            title,
            this.subtitle,
          ]);

          this.syncSnapshot(this.snapshot);
        }

        update(_: number, delta: number) {
          this.elapsed += delta / 1000;

          if (!this.cloudLeft || !this.cloudRight || !this.sunGlow) {
            return;
          }

          this.cloudLeft.x = Math.sin(this.elapsed * 0.35) * 8;
          this.cloudRight.x = -Math.sin(this.elapsed * 0.3) * 6;
          this.sunGlow.alpha = 0.2 + Math.sin(this.elapsed * 0.8) * 0.05;

          this.workers.forEach((worker, index) => {
            if (!worker.root.visible) {
              return;
            }

            const phase = this.elapsed * this.snapshot.workPace + index * 0.7;
            worker.root.y = worker.baseY + Math.sin(phase * 1.4) * 1.6;
            worker.head.y = Math.sin(phase * 1.8) * 1.4;
            worker.body.y = Math.sin(phase * 1.4) * 1.1;
            worker.tail.rotation = -0.14 + Math.sin(phase * 2.3) * 0.18;
          });

          this.cropPatches.forEach((patch, index) => {
            if (!patch.visible) {
              return;
            }

            patch.y = cropPatchPositions[index][1] + Math.sin(this.elapsed * 1.1 + index * 0.5) * 0.4;
          });

          if (this.deskLampGlow?.visible) {
            this.deskLampGlow.alpha = 0.16 + Math.sin(this.elapsed * 1.7) * 0.05;
          }

          if (this.snackCart?.visible) {
            this.snackCart.y = Math.sin(this.elapsed * 1.2) * 0.5;
          }
        }
      }

      if (isDisposed) {
        return;
      }

      const scene = new DotFarmScene();
      sceneRef.current = scene;
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
        scene.syncSnapshot(snapshotRef.current);
      });
    })();

    return () => {
      isDisposed = true;
      resizeObserver?.disconnect();
      sceneRef.current = null;

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
