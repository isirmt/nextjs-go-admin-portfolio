"use client";

import { useSelectingCubeContext } from "@/contexts/selectingCubeContext";
import { useWorksContext } from "@/contexts/worksContext";
import { lightenHex } from "@/lib/sketch/colorChanger";
import { Canvas, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  ConvexHullCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type WorkClickEvent = {
  type: "work_click";
  workId: string;
  seq: number;
};

type FallingBox = {
  id: string;
  workId: string;
  position: [number, number, number];
  velocity: [number, number, number];
  impulse: [number, number, number];
  torque: [number, number, number];
  spin: number;
};

const MAX_BOXES = 30;
const DEFAULT_COLOR = "#6dd3ce";
const BOX_DEPTH = 0.25;
const AUTO_SPAWN_COUNT = 5;
const AUTO_SPAWN_INTERVAL_MS = 3000;

const createBoxId = (workId: string) =>
  `${workId}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const randomInRange = (min: number, max: number) =>
  min + Math.random() * (max - min);

function FallingBoxBody({
  box,
  boxSize,
  wallDepth,
  color,
}: {
  box: FallingBox;
  boxSize: number;
  wallDepth: number;
  color: string;
}) {
  const { setSelectingCubeId, emitCubeClick } = useSelectingCubeContext();
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const lighterColor = useMemo(() => lightenHex(color, 0.1), [color]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.setLinvel(
      { x: box.velocity[0], y: box.velocity[1], z: box.velocity[2] },
      true,
    );
    body.applyImpulse(
      { x: box.impulse[0], y: box.impulse[1], z: box.impulse[2] },
      true,
    );
    body.applyTorqueImpulse(
      { x: box.torque[0], y: box.torque[1], z: box.torque[2] },
      true,
    );
    body.setAngvel({ x: 0, y: 0, z: box.spin }, true);
  }, [box.id, box.velocity, box.impulse, box.torque, box.spin]);

  return (
    <RigidBody
      ref={bodyRef}
      position={box.position}
      colliders="cuboid"
      enabledTranslations={[true, true, false]}
      enabledRotations={[false, false, true]}
      friction={0.6}
      restitution={0.7}
      linearDamping={0.2}
      angularDamping={0.15}
      canSleep
    >
      <mesh
        onPointerEnter={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          setSelectingCubeId(box.workId);
          setIsHovering(true);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "auto";
          setSelectingCubeId(null);
          setIsHovering(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          emitCubeClick(box.workId);
        }}
      >
        <boxGeometry args={[boxSize, boxSize, wallDepth]} />
        <meshStandardMaterial color={isHovering ? "#751aab" : lighterColor} />
      </mesh>
    </RigidBody>
  );
}

function WorkClickPhysics({ onSpawnEnded }: { onSpawnEnded?: () => void }) {
  const { works } = useWorksContext();
  const { viewport, size } = useThree();
  const [boxes, setBoxes] = useState<FallingBox[]>([]);
  const lastSeqRef = useRef(0);
  const retryRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const shouldReconnectRef = useRef(true);
  const autoSpawnStartedRef = useRef(false);
  const boxSize = useMemo(() => {
    const base = viewport.width > 0 ? viewport.width / 10 : 1;
    return Math.min(1, Math.max(0.5, base));
  }, [viewport.width]);
  const spawnX = viewport.width / 2 - boxSize * 1.2;
  const spawnY = viewport.height / 2 + boxSize * 1.2;
  const wallThickness = boxSize * 0.6;
  const wallDepth = Math.max(BOX_DEPTH, boxSize * 0.4);
  const pixelToWorld = viewport.height / size.height;
  const floorOffset = pixelToWorld * 96;
  const floorY = -viewport.height / 2 + floorOffset;
  const rightWallX = viewport.width / 2;
  const triangleSize = pixelToWorld * 300;
  const triangleVertices = useMemo(() => {
    const halfDepth = wallDepth / 2;
    return new Float32Array([
      0,
      0,
      -halfDepth,
      -triangleSize,
      0,
      -halfDepth,
      0,
      triangleSize,
      -halfDepth,
      0,
      0,
      halfDepth,
      -triangleSize,
      0,
      halfDepth,
      0,
      triangleSize,
      halfDepth,
    ]);
  }, [triangleSize, wallDepth]);

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    works.forEach((work) => {
      map.set(work.id, work.accent_color);
    });
    return map;
  }, [works]);

  const spawnBox = useCallback(
    (workId: string) => {
      const position: [number, number, number] = [
        spawnX + randomInRange(-boxSize * 0.4, boxSize * 0.4),
        spawnY + randomInRange(-boxSize * 0.4, boxSize * 0.4),
        0,
      ];
      const angleDeg = randomInRange(200, 255);
      const angle = (angleDeg * Math.PI) / 180;
      const speed = Math.max(10, boxSize * randomInRange(18, 26));
      const velocity: [number, number, number] = [
        0,
        Math.sin(angle) * speed,
        0,
      ];
      const impulse: [number, number, number] = [
        0,
        Math.sin(angle) * speed * randomInRange(0.4, 0.7),
        0,
      ];
      const torque: [number, number, number] = [0, 0, randomInRange(-3.5, 3.5)];
      const spin = randomInRange(-10, 10);
      setBoxes((prev) => {
        if (prev.length >= MAX_BOXES) return prev;
        return [
          ...prev,
          {
            id: createBoxId(workId),
            workId,
            position,
            velocity,
            impulse,
            torque,
            spin,
          },
        ];
      });
    },
    [boxSize, spawnX, spawnY],
  );

  useEffect(() => {
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${protocol}://${window.location.host}/api/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (typeof event.data !== "string") return;
        try {
          const parsed = JSON.parse(event.data) as WorkClickEvent;
          if (!parsed || parsed.type !== "work_click") return;
          if (!parsed.workId) return;
          const seq = Number(parsed.seq);
          if (!Number.isFinite(seq) || seq <= lastSeqRef.current) return;
          lastSeqRef.current = seq;
          spawnBox(parsed.workId);
        } catch {
          // do nothing
        }
      };

      ws.onclose = () => {
        if (disposed || !shouldReconnectRef.current) return;
        const retryCount = retryRef.current;
        const delay = Math.min(10000, 500 * 2 ** retryCount);
        retryRef.current = Math.min(retryCount + 1, 6);
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      wsRef.current?.close();
    };
  }, [spawnBox]);

  useEffect(() => {
    if (boxes.length < MAX_BOXES) return;
    if (!shouldReconnectRef.current) return;
    shouldReconnectRef.current = false;
    onSpawnEnded?.();
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
    }
    wsRef.current?.close();
  }, [boxes.length, onSpawnEnded]);

  useEffect(() => {
    if (autoSpawnStartedRef.current) return;
    if (works.length === 0) return;
    autoSpawnStartedRef.current = true;
    let runCount = 0;
    const spawnOnce = () => {
      const index = Math.floor(Math.random() * works.length);
      const work = works[index];
      if (!work) return;
      spawnBox(work.id);
      runCount += 1;
      if (runCount >= AUTO_SPAWN_COUNT) {
        window.clearInterval(timer);
      }
    };

    const timer = window.setInterval(spawnOnce, AUTO_SPAWN_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [spawnBox, works]);

  return (
    <Physics gravity={[0, -4.9, 0]} timeStep={1 / 60}>
      <RigidBody type="fixed" colliders={false} friction={0} restitution={0.7}>
        <CuboidCollider
          args={[viewport.width / 2, wallThickness / 2, wallDepth / 2]}
          position={[0, floorY - wallThickness / 2, 0]}
        />
        <CuboidCollider
          args={[wallThickness / 2, viewport.height / 2, wallDepth / 2]}
          position={[-viewport.width / 2 - wallThickness / 2, 0, 0]}
        />
        <CuboidCollider
          args={[wallThickness / 2, viewport.height / 2, wallDepth / 2]}
          position={[rightWallX + wallThickness / 2, 0, 0]}
        />
        <ConvexHullCollider
          args={[triangleVertices]}
          position={[rightWallX, floorY, 0]}
        />
      </RigidBody>

      {boxes.map((box) => (
        <FallingBoxBody
          key={box.id}
          box={box}
          boxSize={boxSize}
          wallDepth={wallDepth}
          color={colorMap.get(box.workId) ?? DEFAULT_COLOR}
        />
      ))}
    </Physics>
  );
}

export default function RealtimeWorld() {
  const searchParams = useSearchParams();
  const isLock = searchParams.get("lock") === "true";

  const [isStoppingScroll, setIsStoppingScroll] = useState<boolean>(isLock);
  const [isSpawnEnded, setIsSpawnEnded] = useState<boolean>(false);

  useEffect(() => {
    if (!isStoppingScroll) {
      return;
    }
    const { style } = document.body;
    window.scrollTo({ top: 0, behavior: "smooth" });
    const previousOverflow = style.overflow;
    const previousOverscroll = style.overscrollBehavior;
    const previousTouchAction = style.touchAction;
    const previousPaddingRight = style.paddingRight;
    style.overflow = "hidden";
    style.overscrollBehavior = "contain";
    style.touchAction = "none";
    return () => {
      style.overflow = previousOverflow;
      style.overscrollBehavior = previousOverscroll;
      style.touchAction = previousTouchAction;
      style.paddingRight = previousPaddingRight;
    };
  }, [isStoppingScroll]);

  return (
    <React.Fragment>
      <div className="absolute top-0 left-0 size-full saturate-200">
        <Canvas
          onContextMenu={(e) => e.preventDefault()}
          orthographic
          camera={{ position: [0, 0, 10], zoom: 80 }}
          gl={{
            antialias: true,
          }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[3, 4, 5]} intensity={1} />
          <WorkClickPhysics onSpawnEnded={() => setIsSpawnEnded(true)} />
        </Canvas>
      </div>
      <div className="absolute top-6 right-6 flex flex-row-reverse gap-4">
        <div className="font-dot relative flex items-center gap-2 rounded-full border border-[#ccc] bg-white/60 px-4 py-1 text-xl leading-none text-[#333] shadow-md shadow-[#ccc] backdrop-blur-2xl select-none">
          <span
            className={`size-3 rounded-full ${isSpawnEnded ? "bg-[#777]" : "animate-pulse bg-[#f06363]"}`}
          />
          <span>LIVE</span>
        </div>
        <button
          onClick={() => setIsStoppingScroll((prev) => !prev)}
          className="font-dot pointer-events-auto relative flex cursor-pointer items-center gap-2 rounded-full border border-[#ccc] bg-white/60 px-4 py-1 text-xl leading-none text-[#333] shadow-md shadow-[#ccc] backdrop-blur-2xl select-none hover:border-[#777]"
        >
          <span
            className={`size-3 rounded-full ${isStoppingScroll ? "bg-[#f06363]" : "bg-[#8ff0ab]"}`}
          />
          <span>TOGGLE SCROLL</span>
        </button>
      </div>
    </React.Fragment>
  );
}
