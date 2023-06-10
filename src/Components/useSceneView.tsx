import {
  Html,
  OrbitControls,
  PerspectiveCamera,
  SoftShadows,
  useGLTF,
  Stats,
} from "@react-three/drei";
import { Canvas, ReactThreeFiber, extend } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  HueSaturation,
} from "@react-three/postprocessing";
import TWEEN from "@tweenjs/tween.js";
import { App, theme } from "antd";
import Color from "color";
import { produce } from "immer";
import { cloneDeep } from "lodash-es";
import { BlendFunction } from "postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BufferGeometry, Euler, Line, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";
import carModel from "../assets/car.glb?url";
import { Spaces } from "./data";

extend({ Line_: THREE.Line });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      line_: ReactThreeFiber.Object3DNode<THREE.Line, typeof THREE.Line>;
    }
  }
}

const animate = () => {
  if (TWEEN.update()) {
    requestAnimationFrame(animate);
  }
};

type CarPos = { pos: Vector3; dir: number };

type CarMeshProps = {
  pos: CarPos;
  opacity: number;
  number: string;
};

const CarMesh: React.FC<CarMeshProps> = (props: CarMeshProps) => {
  const { token } = theme.useToken();
  const meshObject = useGLTF(carModel);
  const { nodes } = meshObject as any;
  const meshRef = useRef<any>();
  const { pos, number } = props;
  const offset = 1.42;
  return (
    <group
      {...props}
      ref={meshRef}
      position={[pos.pos.x, pos.pos.y, pos.pos.z]}
      rotation={[0, degToRad(pos.dir), 0]}
    >
      <group
        rotation={[degToRad(90), 0, degToRad(180)]}
        position={[0, 0, 0]}
        scale={3.5}
      >
        <mesh position={[0, 0, -2]}>
          <Html center>
            <div
              style={{
                padding: `2px 4px`,
                backgroundColor: token.colorBgMask,
                borderRadius: token.borderRadiusSM,
                color: token.colorTextLightSolid,
                backdropFilter: "blur(4px)",
                width: "64px",
                textAlign: "center",
                pointerEvents: "none",
                userSelect: "none",
                opacity: props.opacity,
                filter: `blur(${(1 - props.opacity) * 4}px)`,
              }}
            >
              {number}
            </div>
          </Html>
          <boxGeometry args={[0, 0, 0]} />
        </mesh>
        <mesh
          geometry={nodes["Car_Base_MR_(R8)_Circle"].geometry}
          position={[0, 0, offset]}
          castShadow
        >
          <meshStandardMaterial
            transparent
            opacity={props.opacity}
            roughness={0.2}
            color="#222"
          />
        </mesh>
        <mesh
          geometry={nodes["wheel_Circle001"].geometry}
          position={[0, 0, offset]}
          castShadow
        >
          <meshBasicMaterial transparent opacity={props.opacity} color="#BBB" />
        </mesh>
      </group>
    </group>
  );
};

const visualizerBoxGeometry = new THREE.BoxGeometry(2, 2, 2);

const ParkingSpaceVisualizer = (props: any) => {
  let { space } = props;
  let scale = 1;
  let spacePos = new Vector3(space.spacePosition.x, 0, space.spacePosition.y);
  let spaceDir = new Vector3(0, 0, -1).applyEuler(
    new Euler(0, degToRad(space.spaceDirection), 0)
  );
  let spaceVisualizer = (
    <>
      <mesh
        position={spacePos}
        scale={new Vector3(scale, scale, scale)}
        geometry={visualizerBoxGeometry}
      >
        <meshBasicMaterial color={0x77ccff} attach="material" />
      </mesh>
      <arrowHelper args={[spaceDir, spacePos, 5, 0x77ccff, 0.5, 0.5]} />
    </>
  );
  let parkPos = new Vector3(space.parkPosition.x, 0, space.parkPosition.y);
  let parkDir = new Vector3(0, 0, -1).applyEuler(
    new Euler(degToRad(0), degToRad(space.parkDirection), degToRad(0))
  );
  let parkVisualizer = (
    <>
      <mesh position={parkPos} geometry={visualizerBoxGeometry}>
        <meshBasicMaterial color={0x55ff88} attach="material" />
      </mesh>
      <arrowHelper args={[parkDir, parkPos, 5, 0x55ff88, 0.5, 0.5]} />
    </>
  );
  let line = (
    <>
      <line_
        geometry={new BufferGeometry().setFromPoints([spacePos, parkPos])}
        onUpdate={(line: Line) => line.computeLineDistances()}
      >
        <lineDashedMaterial scale={5} gapSize={5} />
      </line_>
    </>
  );
  let wireframe = (
    <>
      <mesh
        position={new Vector3(spacePos.x, spacePos.y, spacePos.z).add(
          new Vector3(0, -7.45, 0)
        )}
      >
        <boxGeometry attach="geometry" args={[10, 5, 16]} />
        <meshStandardMaterial wireframe />
      </mesh>
    </>
  );
  return (
    <group>
      {line}
      {spaceVisualizer}
      {parkVisualizer}
      {wireframe}
    </group>
  );
};

type CarData = {
  id: string;
  spaceIndex: number;
  pos: CarPos;
  opacity: number;
};

const useSceneView = () => {
  const { token } = theme.useToken();
  const [cars, setCars] = useState<CarData[]>([]);
  const colorBackground = "rgba(0,0,0,0.6)";
  const colorFill = Color(token.colorFillQuaternary).alpha(0.1);
  const setSpaces = (spaces: { id: string; parked: null | string }[]) => {
    let c = produce([] as CarData[], (carsTmp) => {
      for (let space of spaces) {
        if (space.parked) {
          let spaceIndex = parseInt(space.id);
          const spacePosition = Spaces[spaceIndex].spacePosition,
            spaceDirection = Spaces[spaceIndex].spaceDirection;
          const spacePos: CarPos & { opacity: number } = {
            pos: new Vector3(spacePosition.x, 0, spacePosition.y),
            dir: spaceDirection,
            opacity: 1,
          };
          carsTmp.push({
            id: space.parked,
            spaceIndex: spaceIndex,
            pos: spacePos,
            opacity: 1,
          });
        }
      }
    });
    setCars(() => c);
  };
  const parkCar = async (id: string, spaceIndex: number) => {
    let nextCars = produce(cars, (draft) => {
      for (let i in draft) {
        let spacePosition = Spaces[draft[i].spaceIndex].spacePosition,
          spaceDirection = Spaces[draft[i].spaceIndex].spaceDirection;
        draft[i].pos = {
          pos: new Vector3(spacePosition.x, 0, spacePosition.y),
          dir: spaceDirection,
        };
      }
      draft.push({
        id,
        spaceIndex,
        opacity: 0,
        pos: { pos: new Vector3(0, 0, -100), dir: 0 },
      });
    });
    setCars(nextCars);
    const parkPosition = Spaces[spaceIndex].parkPosition,
      parkDirection = Spaces[spaceIndex].parkDirection;
    const parkPos: CarPos & { opacity: number } = {
      pos: new Vector3(parkPosition.x, 0, parkPosition.y),
      dir: parkDirection,
      opacity: 1,
    };
    const spacePosition = Spaces[spaceIndex].spacePosition,
      spaceDirection = Spaces[spaceIndex].spaceDirection;
    const spacePos: CarPos & { opacity: number } = {
      pos: new Vector3(spacePosition.x, 0, spacePosition.y),
      dir: spaceDirection,
      opacity: 1,
    };
    const keyframes = [
      { pos: new Vector3(-70, 0, 20), dir: 0, opacity: 0 },
      { pos: new Vector3(-70, 0, 0), dir: 0, opacity: 1 },
      { pos: new Vector3(-60, 0, -5), dir: -90, opacity: 1 },
      parkPos,
      spacePos,
    ];
    while (keyframes.length - 1) {
      let curPos = keyframes.shift() as any;
      nextCars = produce(nextCars, (draft) => {
        const current = draft.find((item) => item.id === id);
        if (current) current.pos = cloneDeep(curPos);
      });
      setCars(nextCars);
      await new Promise<void>((res) => {
        new TWEEN.Tween({
          posx: curPos.pos.x,
          posy: curPos.pos.y,
          posz: curPos.pos.z,
          dir: curPos.dir,
          opacity: curPos.opacity,
        })
          .to(
            {
              posx: keyframes[0].pos.x,
              posy: keyframes[0].pos.y,
              posz: keyframes[0].pos.z,
              dir: keyframes[0].dir,
              opacity: keyframes[0].opacity,
            },
            keyframes[0].pos.distanceTo(curPos.pos) * 30
          )
          .onUpdate((tween) => {
            nextCars = produce(nextCars, (draft) => {
              const current = draft.find((item) => item.id === id);
              if (current) {
                current.pos = {
                  pos: new Vector3(tween.posx, tween.posy, tween.posz),
                  dir: tween.dir,
                };
                current.opacity = tween.opacity;
              }
            });
            setCars(nextCars);
          })
          .onComplete(res as any)
          .start();
        animate();
      });
    }
  };
  const leaveCar = async (id: string) => {
    const spaceIndex = cars.find((i) => i.id === id)!.spaceIndex;
    const parkPosition = Spaces[spaceIndex].parkPosition,
      parkDirection = Spaces[spaceIndex].parkDirection;
    const parkPos: CarPos = {
      pos: new Vector3(parkPosition.x, 0, parkPosition.y),
      dir: parkDirection,
    };
    const spacePosition = Spaces[spaceIndex].spacePosition,
      spaceDirection = Spaces[spaceIndex].spaceDirection;
    const spacePos: CarPos = {
      pos: new Vector3(spacePosition.x, 0, spacePosition.y),
      dir: spaceDirection,
    };
    const keyframes = [
      spacePos,
      parkPos,
      { pos: new Vector3(60, 0, -5), dir: -90 },
      { pos: new Vector3(70, 0, -5), dir: -180 },
      { pos: new Vector3(70, 0, 20), dir: -180 },
    ];
    let nextCars = cars;
    while (keyframes.length - 1) {
      let curPos = keyframes.shift() as any;
      nextCars = produce(nextCars, (draft) => {
        const current = draft.find((item) => item.id === id);
        if (current) current.pos = cloneDeep(curPos);
      });
      setCars(nextCars);
      await new Promise<void>((res) => {
        new TWEEN.Tween({
          posx: curPos.pos.x,
          posy: curPos.pos.y,
          posz: curPos.pos.z,
          dir: curPos.dir,
        })
          .to(
            {
              posx: keyframes[0].pos.x,
              posy: keyframes[0].pos.y,
              posz: keyframes[0].pos.z,
              dir: keyframes[0].dir,
            },
            keyframes[0].pos.distanceTo(curPos.pos) * 30
          )
          .onUpdate((tween) => {
            nextCars = produce(nextCars, (draft) => {
              const current = draft.find((item) => item.id === id);
              if (current)
                current.pos = {
                  pos: new Vector3(tween.posx, tween.posy, tween.posz),
                  dir: tween.dir,
                };
            });
            setCars(nextCars);
          })
          .onComplete(res as any)
          .start();
        animate();
      });
    }
    await new Promise<void>((res) => {
      new TWEEN.Tween({ opacity: 1 })
        .to({ opacity: 0 }, 500)
        .onUpdate((tween) => {
          nextCars = produce(nextCars, (draft) => {
            const current = draft.find((item) => item.id === id);
            if (current) current.opacity = tween.opacity;
          });
          setCars(nextCars);
        })
        .onComplete(res as any)
        .start();
      animate();
    });
    setCars(
      produce(nextCars, (draft) => {
        draft.splice(
          draft.findIndex((i) => i.id === id),
          1
        );
      })
    );
  };
  const [enableAutoRotate, setEnableAutoRotate] = useState(true);
  const [enablePostEffects, setEnablePostEffects] = useState(true);
  const [enableSoftShadows, setEnableSoftShadows] = useState(true);
  const [enableGround, setEnableGround] = useState(true);
  const [enableHD, setEnableHD] = useState(true);
  const [enableSpaceVisualization, setEnableSpaceVisualization] =
    useState(true);
  const [enableFPS, setEnableFPS] = useState(false);
  let component = (
    <>
      <div
        style={{
          flex: 2,
          overflowY: "hidden",
          backgroundColor: colorBackground,
          backgroundImage: `linear-gradient(to right bottom, rgba(0,0,0,0.5) 25%, transparent),linear-gradient(45deg, ${colorFill} 25%, transparent 0),
        linear-gradient(45deg, transparent 75%, ${colorFill} 0),
        linear-gradient(45deg, ${colorFill} 25%, transparent 0),
        linear-gradient(45deg, transparent 75%, ${colorFill} 0)`,
          backgroundSize: `cover,30px 30px,30px 30px,30px 30px,30px 30px`,
          backgroundPosition: `0 0,0 0, 15px 15px, 15px 15px, 30px 30px`,
        }}
      >
        <Canvas
          shadows={enableSoftShadows}
          gl={{ logarithmicDepthBuffer: true }}
          dpr={enableHD ? window.devicePixelRatio : 1}
        >
          {enableSoftShadows && (
            <SoftShadows size={8} samples={16} focus={1.0} />
          )}
          <PerspectiveCamera
            makeDefault
            fov={30}
            zoom={1}
            position={[0, 140, 170]}
            rotation={[degToRad(-45), 0, 0]}
          />
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[150, 300, 150]}
            intensity={0.5}
            castShadow
            shadow-mapSize={1024}
          >
            <PerspectiveCamera attach="shadow-camera" />
          </directionalLight>
          <ambientLight intensity={0.1} />
          {enableGround && (
            <>
              <mesh position={[0, -7.5, -5]} receiveShadow>
                <boxGeometry args={[160, 5, 70]} />
                <meshLambertMaterial color="rgb(55,55,55)" />
              </mesh>
            </>
          )}
          <OrbitControls
            maxPolarAngle={degToRad(60)}
            autoRotate={enableAutoRotate}
          />

          {enablePostEffects && (
            <EffectComposer multisampling={1}>
              <Bloom
                kernelSize={5}
                luminanceThreshold={0.25}
                luminanceSmoothing={1}
                intensity={2}
              />
              <HueSaturation
                blendFunction={BlendFunction.NORMAL}
                saturation={0.2}
              />
            </EffectComposer>
          )}
          {enableSpaceVisualization &&
            Spaces.map((space, index) => (
              <ParkingSpaceVisualizer key={index} space={space} />
            ))}
          {cars.map((i) => (
            <CarMesh key={i.id} number={i.id} pos={i.pos} opacity={i.opacity} />
          ))}
          {enableFPS && <Stats />}
        </Canvas>
      </div>
    </>
  );
  return {
    component,
    setSpaces,
    parkCar,
    leaveCar,
    cars,
    enableAutoRotate,
    setEnableAutoRotate,
    enablePostEffects,
    setEnablePostEffects,
    enableSoftShadows,
    setEnableSoftShadows,
    enableGround,
    setEnableGround,
    enableHD,
    setEnableHD,
    enableSpaceVisualization,
    setEnableSpaceVisualization,
    enableFPS,
    setEnableFPS,
  };
};

export default useSceneView;
