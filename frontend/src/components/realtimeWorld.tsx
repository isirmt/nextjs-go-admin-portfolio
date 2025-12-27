"use client";

import { useWorksContext } from "@/contexts/worksContext";
import { lightenHex } from "@/lib/sketch/colorChanger";
import { Canvas, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
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

const DEFAULT_COLOR = "#6dd3ce";
const BOX_DEPTH = 0.25;

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
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const lighterColor = useMemo(() => lightenHex(color, 0.4), [color]);

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
      restitution={0.2}
      linearDamping={0.2}
      angularDamping={0.15}
      canSleep
    >
      <mesh
        onPointerEnter={() => {
          document.body.style.cursor = "pointer";
          setIsHovering(true);
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "default";
          setIsHovering(false);
        }}
      >
        <boxGeometry args={[boxSize, boxSize, wallDepth]} />
        <meshStandardMaterial color={isHovering ? color : lighterColor} />
      </mesh>
    </RigidBody>
  );
}

function WorkClickPhysics() {
  const { works } = useWorksContext();
  const { viewport } = useThree();
  const [boxes, setBoxes] = useState<FallingBox[]>([]);
  const lastSeqRef = useRef(0);
  const retryRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const boxSize = useMemo(() => {
    const base = viewport.width > 0 ? viewport.width / 10 : 1;
    return Math.min(1, Math.max(0.5, base));
  }, [viewport.width]);
  const spawnX = viewport.width / 2 - boxSize * 1.2;
  const spawnY = viewport.height / 2 + boxSize * 1.2;
  const wallThickness = boxSize * 0.6;
  const wallDepth = Math.max(BOX_DEPTH, boxSize * 0.4);

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
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0,
      ];
      const impulse: [number, number, number] = [
        Math.cos(angle) * speed * randomInRange(0.4, 0.7),
        Math.sin(angle) * speed * randomInRange(0.4, 0.7),
        0,
      ];
      const torque: [number, number, number] = [0, 0, randomInRange(-3.5, 3.5)];
      const spin = randomInRange(-10, 10);
      setBoxes((prev) => [
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
      ]);
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
        if (disposed) return;
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

  return (
    <Physics gravity={[0, -4.9, 0]} timeStep={1 / 60}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[viewport.width / 2, wallThickness / 2, wallDepth / 2]}
          position={[0, -viewport.height / 2 - wallThickness / 2, 0]}
        />
        <CuboidCollider
          args={[wallThickness / 2, viewport.height / 2, wallDepth / 2]}
          position={[-viewport.width / 2 - wallThickness / 2, 0, 0]}
        />
        <CuboidCollider
          args={[wallThickness / 2, viewport.height / 2, wallDepth / 2]}
          position={[viewport.width / 2 + wallThickness / 2, 0, 0]}
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
  return (
    <React.Fragment>
      <div className="absolute top-0 left-0 size-full">
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
          <WorkClickPhysics />
        </Canvas>
      </div>
      <div className="font-dot absolute top-6 right-6 flex items-center gap-1 text-xl">
        <span className="size-3 animate-pulse rounded-full bg-[#f06363]" />
        <span>LIVE</span>
      </div>
    </React.Fragment>
  );
}
