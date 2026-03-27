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
  { x: 166, y: 186, scale: 1, fur: 0xf0c88d, accent: 0x7fbba3 },
  { x: 136, y: 198, scale: 0.82, fur: 0xd9b071, accent: 0xf0ce71 },
  { x: 200, y: 198, scale: 0.82, fur: 0xf2d9a8, accent: 0x8fc4ef },
  { x: 228, y: 184, scale: 0.74, fur: 0xe4b46d, accent: 0xe59b63 },
];

const workstationPositions: Array<[number, number]> = [
  [52, 160],
  [96, 160],
  [52, 198],
  [96, 198],
  [254, 164],
  [254, 202],
];

const serverRackPositions: Array<[number, number]> = [
  [310, 154],
  [310, 176],
  [310, 198],
  [310, 220],
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
      label: 'DOCS',
      subtitle: 'Stable release',
      color: 0x93c5fd,
      textColor: '#1d4ed8',
    };
  }

  if (processMode === 'spiral') {
    return {
      label: 'LOOP',
      subtitle: 'Review cycle',
      color: 0x86efac,
      textColor: '#166534',
    };
  }

  return {
    label: 'SHIP',
    subtitle: 'Fast sprint',
    color: 0xf8c15c,
    textColor: '#7c4a03',
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

      class DevStudioScene extends Phaser.Scene implements StageSceneHandle {
        private snapshot: PhaserStageSnapshot = snapshotRef.current;
        private root?: import('phaser').GameObjects.Container;
        private ambientGlow?: import('phaser').GameObjects.Graphics;
        private progressFill?: import('phaser').GameObjects.Rectangle;
        private progressLabel?: import('phaser').GameObjects.Text;
        private boardText?: import('phaser').GameObjects.Text;
        private subtitle?: import('phaser').GameObjects.Text;
        private processBadge?: import('phaser').GameObjects.Rectangle;
        private processBadgeText?: import('phaser').GameObjects.Text;
        private officeLevelTwoDecor?: import('phaser').GameObjects.Container;
        private officeLevelThreeDecor?: import('phaser').GameObjects.Container;
        private refreshStation?: import('phaser').GameObjects.Container;
        private refreshLights: import('phaser').GameObjects.Graphics[] = [];
        private releaseShelf?: import('phaser').GameObjects.Container;
        private releaseBadges: import('phaser').GameObjects.Graphics[] = [];
        private automationRig?: import('phaser').GameObjects.Container;
        private automationGlow?: import('phaser').GameObjects.Graphics;
        private secondMonitor?: import('phaser').GameObjects.Graphics;
        private keyboardGlow?: import('phaser').GameObjects.Rectangle;
        private agileProps?: import('phaser').GameObjects.Container;
        private spiralProps?: import('phaser').GameObjects.Container;
        private waterfallProps?: import('phaser').GameObjects.Container;
        private workstations: import('phaser').GameObjects.Container[] = [];
        private serverRacks: import('phaser').GameObjects.Container[] = [];
        private workers: WorkerVisual[] = [];
        private elapsed = 0;

        constructor() {
          super('dev-studio');
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
            this.addRoundedRect(-6, -4, 12, 8, 3, layout.accent),
            this.addRoundedRect(-3, -1, 6, 3, 2, 0x101827),
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

        private createWorkstation(x: number, y: number) {
          const root = this.add.container(x, y, [
            this.addRoundedRect(-14, -10, 28, 8, 3, 0x334155, 0x0f172a, 2),
            this.addRoundedRect(-10, -18, 20, 10, 3, 0xe2e8f0, 0x334155, 2),
            this.addRoundedRect(-7, -15, 14, 6, 2, 0x7dd3fc, 0x0f172a, 1),
            this.addRoundedRect(-3, -8, 6, 3, 1, 0x94a3b8),
            this.addRoundedRect(-16, -2, 4, 14, 2, 0x475569),
            this.addRoundedRect(12, -2, 4, 14, 2, 0x475569),
            this.addRoundedRect(-7, 4, 14, 5, 2, 0xcbd5e1, 0x64748b, 1),
          ]);

          return root;
        }

        private createServerRack(x: number, y: number) {
          const body = this.addRoundedRect(-10, -12, 20, 24, 3, 0x111827, 0x334155, 2);
          const panel = this.addRoundedRect(-7, -9, 14, 18, 2, 0x1f2937, 0x475569, 1);
          const lights = this.add.graphics();
          lights.fillStyle(0x60a5fa, 1);
          lights.fillRect(-4, -6, 8, 2);
          lights.fillStyle(0x34d399, 1);
          lights.fillRect(-4, -1, 8, 2);
          lights.fillStyle(0xfbbf24, 1);
          lights.fillRect(-4, 4, 8, 2);

          return this.add.container(x, y, [body, panel, lights]);
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
          this.workstations.forEach((workstation, index) => {
            workstation.setVisible(index < nextSnapshot.workstationCount);
          });
          this.serverRacks.forEach((rack, index) => {
            rack.setVisible(index < nextSnapshot.serverRackCount);
          });

          this.agileProps?.setVisible(nextSnapshot.processMode === 'agile');
          this.spiralProps?.setVisible(nextSnapshot.processMode === 'spiral');
          this.waterfallProps?.setVisible(nextSnapshot.processMode === 'waterfall');

          this.refreshStation?.setVisible(nextSnapshot.refreshStationLevel > 0);
          this.refreshLights.forEach((light, index) => {
            light.setVisible(index < nextSnapshot.refreshStationLevel);
          });
          this.releaseShelf?.setVisible(nextSnapshot.releaseArchiveLevel > 0);
          this.releaseBadges.forEach((badge, index) => {
            badge.setVisible(index < nextSnapshot.releaseArchiveLevel);
          });

          this.automationRig?.setVisible(nextSnapshot.automationLevel > 0);
          this.automationGlow?.setVisible(nextSnapshot.automationLevel > 0);
          this.secondMonitor?.setVisible(nextSnapshot.automationLevel > 1);
          this.keyboardGlow?.setVisible(nextSnapshot.automationLevel > 2);
        }

        create() {
          this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');

          this.root = this.add.container(0, 0);

          const frame = this.addRoundedRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 12, 0xf8fafc, 0x1f2937, 4);
          const wall = this.addRoundedRect(8, 8, 344, 120, 10, 0xf1f5f9, 0xcbd5e1, 2);
          const floor = this.addRoundedRect(8, 126, 344, 106, 10, 0xe5e7eb, 0xd1d5db, 2);
          const floorShadow = this.addRoundedRect(16, 168, 328, 56, 8, 0xd4d4d8, undefined, 0, 0.55);
          const focusZone = this.addRoundedRect(120, 156, 124, 54, 8, 0xdbeafe, 0xbfdbfe, 2);

          const wallGrid = this.add.graphics();
          wallGrid.lineStyle(1, 0xe2e8f0, 0.8);
          [36, 72, 108].forEach((y) => wallGrid.lineBetween(18, y, 342, y));
          [80, 138, 196, 254].forEach((x) => wallGrid.lineBetween(x, 16, x, 118));

          this.ambientGlow = this.addCircle(286, 38, 26, 0xdbeafe, 0.5);
          const windowFrame = this.addRoundedRect(262, 18, 74, 50, 6, 0xffffff, 0xcbd5e1, 2);
          const windowScene = this.add.graphics();
          windowScene.fillStyle(0xe0f2fe, 1);
          windowScene.fillRect(270, 26, 58, 34);
          windowScene.fillStyle(0x94a3b8, 1);
          windowScene.fillRect(276, 48, 8, 8);
          windowScene.fillRect(290, 42, 8, 14);
          windowScene.fillRect(304, 36, 8, 20);
          windowScene.fillRect(318, 44, 6, 12);

          const progressBoard = this.addRoundedRect(20, 18, 98, 62, 8, 0x0f172a, 0x334155, 2);
          const progressBoardStrip = this.addRoundedRect(28, 28, 34, 8, 2, 0x1e293b);
          const progressBoardAccent = this.addRoundedRect(28, 42, 82, 26, 4, 0x111827, 0x475569, 1);
          this.boardText = this.add.text(41, 46, '0%', {
            fontFamily: 'Pixelify Sans',
            fontSize: '18px',
            color: '#f8fafc',
          });

          const whiteboard = this.addRoundedRect(132, 76, 92, 44, 6, 0xffffff, 0xcbd5e1, 2);
          const whiteboardNotes = this.add.container(0, 0, [
            this.addRoundedRect(144, 86, 14, 8, 2, 0xfbbf24),
            this.addRoundedRect(164, 84, 14, 8, 2, 0x86efac),
            this.addRoundedRect(184, 88, 14, 8, 2, 0x93c5fd),
            this.addRoundedRect(144, 98, 56, 4, 2, 0xe2e8f0),
            this.addRoundedRect(144, 106, 42, 4, 2, 0xe2e8f0),
          ]);

          this.officeLevelTwoDecor = this.add.container(0, 0, [
            this.addRoundedRect(250, 76, 84, 50, 6, 0xffffff, 0xcbd5e1, 2),
            this.addRoundedRect(270, 94, 44, 10, 5, 0x94a3b8, 0x475569, 2),
            this.addCircle(266, 110, 6, 0xcbd5e1),
            this.addCircle(319, 110, 6, 0xcbd5e1),
            this.addRoundedRect(286, 82, 14, 8, 2, 0x0f172a, 0x334155, 2),
          ]);

          this.officeLevelThreeDecor = this.add.container(0, 0, [
            this.addRoundedRect(132, 122, 140, 18, 4, 0x111827, 0x334155, 2),
            this.add.text(144, 126, 'RELEASE PIPELINE', {
              fontFamily: 'Pixelify Sans',
              fontSize: '7px',
              color: '#f8fafc',
            }),
            this.addRoundedRect(244, 126, 18, 10, 2, 0x22c55e, 0x166534, 1),
          ]);

          const centralDesk = this.addRoundedRect(132, 164, 96, 18, 6, 0x334155, 0x0f172a, 2);
          const deskLegLeft = this.addRoundedRect(140, 182, 5, 18, 2, 0x475569);
          const deskLegRight = this.addRoundedRect(214, 182, 5, 18, 2, 0x475569);
          const mainMonitor = this.addRoundedRect(150, 148, 24, 14, 3, 0xe2e8f0, 0x334155, 2);
          const mainMonitorGlow = this.addRoundedRect(154, 151, 16, 8, 2, 0x7dd3fc, 0x0f172a, 1);
          const laptop = this.addRoundedRect(180, 152, 18, 10, 3, 0xcbd5e1, 0x334155, 2);
          this.secondMonitor = this.addRoundedRect(204, 149, 18, 13, 3, 0xe2e8f0, 0x334155, 2);
          this.keyboardGlow = this.add.rectangle(180, 170, 28, 4, 0x38bdf8).setAlpha(0.7);
          this.automationGlow = this.addCircle(226, 148, 10, 0x93c5fd, 0.3);
          this.automationRig = this.add.container(0, 0, [
            this.addRoundedRect(220, 154, 12, 8, 2, 0x1e293b, 0x334155, 2),
            this.addRoundedRect(224, 146, 4, 8, 1, 0x38bdf8),
            this.addRoundedRect(218, 162, 16, 3, 1, 0x64748b),
          ]);

          this.refreshStation = this.add.container(0, 0, [
            this.addRoundedRect(284, 188, 28, 24, 4, 0xffffff, 0xcbd5e1, 2),
            this.addRoundedRect(290, 194, 16, 6, 2, 0xe2e8f0, 0x94a3b8, 1),
            this.addRoundedRect(296, 180, 4, 10, 2, 0x94a3b8),
          ]);
          this.refreshLights = [
            this.addCircle(292, 205, 3, 0xfbbf24),
            this.addCircle(299, 205, 3, 0x86efac),
            this.addCircle(306, 205, 3, 0x93c5fd),
          ];
          this.refreshStation.add(this.refreshLights);

          this.releaseShelf = this.add.container(0, 0, [
            this.addRoundedRect(246, 74, 44, 10, 3, 0x334155, 0x1f2937, 2),
          ]);
          this.releaseBadges = [
            this.addRoundedRect(250, 62, 8, 10, 2, 0xfbbf24, 0x7c4a03, 2),
            this.addRoundedRect(263, 58, 8, 14, 2, 0x93c5fd, 0x1d4ed8, 2),
            this.addRoundedRect(276, 62, 8, 10, 2, 0x86efac, 0x166534, 2),
          ];
          this.releaseShelf.add(this.releaseBadges);

          this.agileProps = this.add.container(0, 0, [
            this.addRoundedRect(230, 96, 8, 8, 2, 0xfbbf24),
            this.addRoundedRect(241, 90, 8, 8, 2, 0xfb7185),
            this.addRoundedRect(252, 100, 8, 8, 2, 0xfcd34d),
          ]);
          this.spiralProps = this.add.container(0, 0, [
            this.addCircle(238, 96, 5, 0x86efac, 0.95),
            this.addCircle(247, 88, 3, 0x34d399, 0.95),
            this.addRoundedRect(237, 87, 14, 2, 1, 0x166534),
          ]);
          this.waterfallProps = this.add.container(0, 0, [
            this.addRoundedRect(232, 90, 12, 14, 2, 0xe0f2fe, 0x60a5fa, 2),
            this.addRoundedRect(244, 94, 12, 14, 2, 0xbfdbfe, 0x60a5fa, 2),
          ]);

          this.workstations = workstationPositions.map(([x, y]) => this.createWorkstation(x, y));
          this.serverRacks = serverRackPositions.map(([x, y]) => this.createServerRack(x, y));
          this.workers = workerLayouts.map((layout) => this.createWorker(layout));

          const progressTrack = this.add
            .rectangle(86, 104, PROGRESS_TRACK_WIDTH + 8, 12, 0xffffff)
            .setStrokeStyle(2, 0xcbd5e1);
          this.progressFill = this.add.rectangle(27, 104, 0, 6, 0xf8c15c).setOrigin(0, 0.5);
          this.progressLabel = this.add.text(156, 98, '0%', {
            fontFamily: 'Pixelify Sans',
            fontSize: '10px',
            color: '#111827',
          });

          this.processBadge = this.add.rectangle(312, 104, 60, 16, 0xf8c15c).setStrokeStyle(2, 0xcbd5e1);
          this.processBadgeText = this.add.text(289, 98, 'SHIP', {
            fontFamily: 'Pixelify Sans',
            fontSize: '10px',
            color: '#7c4a03',
          });

          const title = this.add.text(20, 136, 'DEV STUDIO', {
            fontFamily: 'Pixelify Sans',
            fontSize: '24px',
            color: '#111827',
          });
          this.subtitle = this.add.text(20, 154, '1 DOGS · Fast sprint', {
            fontFamily: 'IBM Plex Sans KR',
            fontSize: '12px',
            color: '#475569',
          });

          this.root.add([
            frame,
            wall,
            floor,
            floorShadow,
            focusZone,
            wallGrid,
            this.ambientGlow,
            windowFrame,
            windowScene,
            progressBoard,
            progressBoardStrip,
            progressBoardAccent,
            this.boardText,
            whiteboard,
            whiteboardNotes,
            this.officeLevelTwoDecor,
            this.officeLevelThreeDecor,
            centralDesk,
            deskLegLeft,
            deskLegRight,
            mainMonitor,
            mainMonitorGlow,
            laptop,
            this.secondMonitor,
            this.keyboardGlow,
            this.automationGlow,
            this.automationRig,
            this.refreshStation,
            this.releaseShelf,
            this.agileProps,
            this.spiralProps,
            this.waterfallProps,
            ...this.workstations,
            ...this.serverRacks,
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

          if (this.ambientGlow) {
            this.ambientGlow.alpha = 0.4 + Math.sin(this.elapsed * 0.9) * 0.08;
          }

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

          this.workstations.forEach((workstation, index) => {
            if (!workstation.visible) {
              return;
            }

            workstation.y = workstationPositions[index][1] + Math.sin(this.elapsed * 0.8 + index * 0.4) * 0.3;
          });

          if (this.automationGlow?.visible) {
            this.automationGlow.alpha = 0.24 + Math.sin(this.elapsed * 1.6) * 0.06;
          }

          if (this.refreshStation?.visible) {
            this.refreshStation.y = Math.sin(this.elapsed * 1.1) * 0.5;
          }
        }
      }

      if (isDisposed) {
        return;
      }

      const scene = new DevStudioScene();
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
