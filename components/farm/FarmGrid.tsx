'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import { CROP_DEFINITIONS, FARM_CONFIG } from '@/lib/constants';
import { computeGrowthStage, getCropImagePath, isDirtTile } from '@/lib/game-mechanics';
import { HarvestAnimation } from './HarvestAnimation';
import type { CropType, FarmPlot, GrowthStage } from '@/lib/types';

const DRAG_THRESHOLD = 6;
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 2.2;
const ZOOM_STEP = 0.12;
const VIEW_BUFFER_TILES = 2;

function getPointFromEvent(event: React.PointerEvent<HTMLDivElement>) {
  return { x: event.clientX, y: event.clientY };
}

export function FarmGrid() {
  const farm = useGameStore((state) => state.farm);
  const plantCrop = useGameStore((state) => state.plantCrop);
  const harvestCrop = useGameStore((state) => state.harvestCrop);

  const [tick, setTick] = useState(0);
  void tick;
  const [selectedCrop] = useState<CropType>('wheat');
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [harvestingPlot, setHarvestingPlot] = useState<{
    crop: CropType;
    gold: number;
    xp: number;
  } | null>(null);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({
    pointerId: -1,
    startPointer: { x: 0, y: 0 },
    startCamera: { x: 0, y: 0 },
    moved: false,
  });
  const pinchRef = useRef({
    active: false,
    startDistance: 0,
    startZoom: 1,
  });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const rafDragRef = useRef<number | null>(null);
  const pendingCameraRef = useRef<{ x: number; y: number } | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), FARM_CONFIG.POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const plotsByCoord = useMemo(() => {
    const map = new Map<string, FarmPlot>();
    for (const plot of farm.plots) {
      map.set(`${plot.x},${plot.y}`, plot);
    }
    return map;
  }, [farm.plots]);

  const tileSize = FARM_CONFIG.TILE_SIZE;
  const worldPixelWidth = farm.worldWidth * tileSize;
  const worldPixelHeight = farm.worldHeight * tileSize;

  const clampCamera = useCallback((next: { x: number; y: number }, scale: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return next;

    const scaledWidth = worldPixelWidth * scale;
    const scaledHeight = worldPixelHeight * scale;
    const maxOffsetX = Math.max(0, scaledWidth - viewport.clientWidth);
    const maxOffsetY = Math.max(0, scaledHeight - viewport.clientHeight);

    return {
      x: Math.min(0, Math.max(-maxOffsetX, next.x)),
      y: Math.min(0, Math.max(-maxOffsetY, next.y)),
    };
  }, [worldPixelWidth, worldPixelHeight]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
      setCamera((prev) => clampCamera(prev, zoom));
    });
    observer.observe(viewport);
    setViewportSize({
      width: viewport.clientWidth,
      height: viewport.clientHeight,
    });
    return () => observer.disconnect();
  }, [clampCamera, zoom]);

  const handleHarvest = useCallback((plot: FarmPlot) => {
    if (!plot.crop || plot.plantedAt === null) return;

    const cropDef = CROP_DEFINITIONS[plot.crop];
    const stage = computeGrowthStage(plot.plantedAt, cropDef.growthDuration);
    if (stage < 5) return;

    setHarvestingPlot({
      crop: plot.crop,
      gold: cropDef.goldReward,
      xp: cropDef.xpReward,
    });
    harvestCrop(plot.x, plot.y);
  }, [harvestCrop]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!isDirtTile(x, y, farm.dirtRect)) return;

    const plot = plotsByCoord.get(`${x},${y}`);
    if (!plot) return;

    if (plot.crop && plot.plantedAt !== null) {
      handleHarvest(plot);
      return;
    }

    if (selectedCrop) {
      plantCrop(x, y, selectedCrop);
    }
  }, [farm.dirtRect, plotsByCoord, handleHarvest, selectedCrop, plantCrop]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const point = getPointFromEvent(event);
    dragRef.current = {
      pointerId: event.pointerId,
      startPointer: point,
      startCamera: camera,
      moved: false,
    };
    setIsDragging(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;

    const point = getPointFromEvent(event);
    const deltaX = point.x - dragRef.current.startPointer.x;
    const deltaY = point.y - dragRef.current.startPointer.y;
    const moved = Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD;

    if (moved) {
      dragRef.current.moved = true;
      setIsDragging(true);
    }

    if (!dragRef.current.moved) return;

    const next = {
      x: dragRef.current.startCamera.x + deltaX,
      y: dragRef.current.startCamera.y + deltaY,
    };

    pendingCameraRef.current = clampCamera(next, zoom);
    if (rafDragRef.current === null) {
      rafDragRef.current = requestAnimationFrame(() => {
        if (pendingCameraRef.current) {
          setCamera(pendingCameraRef.current);
        }
        rafDragRef.current = null;
      });
    }
  };

  const updateZoomAtPoint = useCallback((nextZoomRaw: number, clientX?: number, clientY?: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoomRaw));
    if (Math.abs(nextZoom - zoom) < 0.0001) return;

    const rect = viewport.getBoundingClientRect();
    const focusX = clientX ?? rect.left + rect.width / 2;
    const focusY = clientY ?? rect.top + rect.height / 2;
    const focusLocalX = focusX - rect.left;
    const focusLocalY = focusY - rect.top;

    const worldX = (focusLocalX - camera.x) / zoom;
    const worldY = (focusLocalY - camera.y) / zoom;

    const nextCamera = {
      x: focusLocalX - worldX * nextZoom,
      y: focusLocalY - worldY * nextZoom,
    };

    setZoom(nextZoom);
    setCamera(clampCamera(nextCamera, nextZoom));
  }, [camera.x, camera.y, zoom, clampCamera]);

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    updateZoomAtPoint(zoom + direction * ZOOM_STEP, event.clientX, event.clientY);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current.active = false;
    }

    if (dragRef.current.pointerId !== event.pointerId) return;

    const moved = dragRef.current.moved;
    dragRef.current.pointerId = -1;
    setIsDragging(false);

    if (moved) return;

    const target = event.target as HTMLElement;
    const xAttr = target.getAttribute('data-tile-x');
    const yAttr = target.getAttribute('data-tile-y');
    if (!xAttr || !yAttr) return;

    handleTileClick(Number(xAttr), Number(yAttr));
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (dragRef.current.pointerId === event.pointerId) {
      dragRef.current.pointerId = -1;
      setIsDragging(false);
    }
    if (pointersRef.current.size < 2) {
      pinchRef.current.active = false;
    }
  };

  useEffect(() => {
    return () => {
      if (rafDragRef.current !== null) {
        cancelAnimationFrame(rafDragRef.current);
      }
    };
  }, []);

  const onPointerDownEnhanced = (event: React.PointerEvent<HTMLDivElement>) => {
    const point = getPointFromEvent(event);
    pointersRef.current.set(event.pointerId, point);
    onPointerDown(event);
  };

  const onPointerMoveEnhanced = (event: React.PointerEvent<HTMLDivElement>) => {
    const point = getPointFromEvent(event);
    pointersRef.current.set(event.pointerId, point);

    if (pointersRef.current.size === 2) {
      const points = Array.from(pointersRef.current.values());
      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;
      const distance = Math.hypot(dx, dy);
      const centerX = (points[0].x + points[1].x) / 2;
      const centerY = (points[0].y + points[1].y) / 2;

      if (!pinchRef.current.active) {
        pinchRef.current.active = true;
        pinchRef.current.startDistance = distance;
        pinchRef.current.startZoom = zoom;
      } else if (pinchRef.current.startDistance > 0) {
        const zoomFactor = distance / pinchRef.current.startDistance;
        updateZoomAtPoint(pinchRef.current.startZoom * zoomFactor, centerX, centerY);
      }

      dragRef.current.moved = true;
      setIsDragging(true);
      return;
    }

    onPointerMove(event);
  };

  const visibleRange = useMemo(() => {
    const scaledTileSize = tileSize * zoom;
    if (scaledTileSize <= 0 || viewportSize.width <= 0 || viewportSize.height <= 0) {
      return { startX: 0, endX: farm.worldWidth - 1, startY: 0, endY: farm.worldHeight - 1 };
    }

    const rawStartX = Math.floor((-camera.x) / scaledTileSize) - VIEW_BUFFER_TILES;
    const rawStartY = Math.floor((-camera.y) / scaledTileSize) - VIEW_BUFFER_TILES;
    const rawEndX = Math.ceil((-camera.x + viewportSize.width) / scaledTileSize) + VIEW_BUFFER_TILES;
    const rawEndY = Math.ceil((-camera.y + viewportSize.height) / scaledTileSize) + VIEW_BUFFER_TILES;

    return {
      startX: Math.max(0, rawStartX),
      startY: Math.max(0, rawStartY),
      endX: Math.min(farm.worldWidth - 1, rawEndX),
      endY: Math.min(farm.worldHeight - 1, rawEndY),
    };
  }, [camera.x, camera.y, zoom, tileSize, viewportSize.width, viewportSize.height, farm.worldWidth, farm.worldHeight]);

  return (
    <>
      <div
        ref={viewportRef}
        className="relative w-full h-full overflow-hidden border border-stone-300/60 dark:border-stone-700/60 bg-gradient-to-b from-sky-100/80 to-emerald-100/80 dark:from-stone-900 dark:to-stone-800 shadow-xl select-none touch-none"
        onPointerDown={onPointerDownEnhanced}
        onPointerMove={onPointerMoveEnhanced}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onWheel={onWheel}
      >
        <div
          className="absolute top-3 left-3 z-20 rounded-full bg-black/50 text-white px-3 py-1 text-xs"
        >
          {selectedCrop ? `Seed: ${CROP_DEFINITIONS[selectedCrop].name}` : 'Seed: none'}
        </div>

        <div
          className="relative"
          style={{
            width: worldPixelWidth,
            height: worldPixelHeight,
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 100ms linear',
          }}
        >
          {Array.from({ length: visibleRange.endY - visibleRange.startY + 1 }).map((_, rowIndex) => {
            const y = visibleRange.startY + rowIndex;
            return (
            <div
              key={y}
              className="flex absolute"
              style={{
                top: y * tileSize,
                left: visibleRange.startX * tileSize,
              }}
            >
              {Array.from({ length: visibleRange.endX - visibleRange.startX + 1 }).map((__, colIndex) => {
                const x = visibleRange.startX + colIndex;
                const isDirt = isDirtTile(x, y, farm.dirtRect);
                const plot = plotsByCoord.get(`${x},${y}`);

                let cropSrc: string | null = null;
                let isReady = false;
                if (plot?.crop && plot.plantedAt !== null) {
                  const cropDef = CROP_DEFINITIONS[plot.crop];
                  const stage = computeGrowthStage(plot.plantedAt, cropDef.growthDuration);
                  cropSrc = getCropImagePath(plot.crop, Math.max(1, stage) as GrowthStage);
                  isReady = stage >= 5;
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    data-tile-x={x}
                    data-tile-y={y}
                    className="relative"
                    style={{
                      width: tileSize,
                      height: tileSize,
                      backgroundImage: `url(${FARM_CONFIG.TILESET_PATH})`,
                      backgroundPosition: isDirt
                        ? `-${FARM_CONFIG.TILE_ATLAS.DIRT.col * FARM_CONFIG.TILE_ATLAS_STEP_PX}px -${FARM_CONFIG.TILE_ATLAS.DIRT.row * FARM_CONFIG.TILE_ATLAS_STEP_PX}px`
                        : `-${FARM_CONFIG.TILE_ATLAS.GRASS.col * FARM_CONFIG.TILE_ATLAS_STEP_PX}px -${FARM_CONFIG.TILE_ATLAS.GRASS.row * FARM_CONFIG.TILE_ATLAS_STEP_PX}px`,
                      backgroundSize: `${FARM_CONFIG.TILESET_COLUMNS * tileSize}px ${FARM_CONFIG.TILESET_ROWS * tileSize}px`,
                      imageRendering: 'pixelated',
                    }}
                  >
                    {cropSrc && (
                      <img
                        src={cropSrc}
                        alt="Crop"
                        draggable={false}
                        style={{ imageRendering: 'pixelated' }}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      />
                    )}
                    {isReady && (
                      <div className="absolute inset-0 ring-2 ring-amber-400/80 pointer-events-none animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )})}
        </div>
      </div>

      {harvestingPlot && (
        <HarvestAnimation
          crop={harvestingPlot.crop}
          goldReward={harvestingPlot.gold}
          xpReward={harvestingPlot.xp}
          onComplete={() => setHarvestingPlot(null)}
        />
      )}
    </>
  );
}
