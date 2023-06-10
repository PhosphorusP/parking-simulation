import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { App, Button, Checkbox, Form, Popover, theme } from "antd";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { useCallback, useEffect, useState } from "react";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";
import { DropFile } from "./Components/DropFile";
import { Parking } from "./Components/Parking";
import { Records } from "./Components/Records";
import { particles } from "./Components/particles";
import useSceneView from "./Components/useSceneView";
import background from "./assets/city-people-street-night-163772.jpg?url";
import { useSocket } from "./socket";
import useFullscreen from "@jdthornton/usefullscreen";

function MyApp() {
  const { notification } = App.useApp();
  const [isFullScreen, toggleFullscreen] = useFullscreen();
  const {
    component: sceneView,
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
  } = useSceneView();
  const { token } = theme.useToken();
  const [parking, setParking] = useState([]);
  const [records, setRecords] = useState([]);
  const socket = useSocket();
  useEffect(() => {
    socket.on("connect", () => {
      notification.success({
        message: "WebSocket连接成功。",
        placement: "bottomRight",
      });
    });
    socket.on("all", (data) => {
      setSpaces(data);
    });
    socket.on("parking", (data) => {
      setParking(data.parking);
      setRecords(data.records);
    });
    socket.emit("getAll");
  }, [socket]);
  useEffect(() => {
    const onPatch = ({
      status,
      number,
      spaceIndex,
    }: {
      status: "park" | "leave";
      number: string;
      spaceIndex: number;
    }) => {
      notification.success({
        message: `${number} ${status === "park" ? "进入" : "离开"}了停车场。`,
        placement: "bottomRight",
        duration: 2,
      });
      if (status === "park") parkCar(number, spaceIndex);
      else leaveCar(number);
    };

    socket.on("patch", onPatch);

    return () => {
      socket.off("patch");
    };
  }, [cars]);
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);
  return (
    <>
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          width: "100vw",
          height: "100vh",
          backgroundImage: `linear-gradient(to right bottom,rgba(255,255,255,0.1),rgba(0,0,0,1)),url(${background})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            height: "56px",
            backgroundImage:
              "linear-gradient(to right,rgba(0,0,0,0.9),rgba(0,0,0,0.2))",
          }}
        >
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={particles as any}
            height="56px"
            style={{
              transform: "translateY(-20px)",
              marginBottom: "-56px",
            }}
          />
          <div
            style={{
              height: "56px",
              marginTop: "-20px",
              display: "flex",
              alignItems: "center",
              padding: "0 8px",
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: "24px",
                fontWeight: "200",
                pointerEvents: "none",
              }}
            >
              基于WebSocket与WebGL的实时可视化智能停车场管理系统
            </span>
            <Popover
              title="图形设置"
              content={
                <>
                  <Form colon={false}>
                    <Form.Item label="自动旋转场景">
                      <Checkbox
                        checked={enableAutoRotate}
                        onChange={(e) => setEnableAutoRotate(e.target.checked)}
                      />
                    </Form.Item>
                    <Form.Item label="启用后期特效">
                      <Checkbox
                        checked={enablePostEffects}
                        onChange={(e) => setEnablePostEffects(e.target.checked)}
                      />
                    </Form.Item>
                    <Form.Item label="启用软阴影">
                      <Checkbox
                        checked={enableSoftShadows}
                        onChange={(e) => setEnableSoftShadows(e.target.checked)}
                      />
                    </Form.Item>
                    <Form.Item label="显示地面">
                      <Checkbox
                        checked={enableGround}
                        onChange={(e) => setEnableGround(e.target.checked)}
                      />
                    </Form.Item>
                    <Form.Item label="高清渲染">
                      <Checkbox
                        checked={enableHD}
                        onChange={(e) => setEnableHD(e.target.checked)}
                      />
                    </Form.Item>
                    <Form.Item label="可视化车位">
                      <Checkbox
                        checked={enableSpaceVisualization}
                        onChange={(e) =>
                          setEnableSpaceVisualization(e.target.checked)
                        }
                      />
                    </Form.Item>
                    <Form.Item label="显示性能面板">
                      <Checkbox
                        checked={enableFPS}
                        onChange={(e) => setEnableFPS(e.target.checked)}
                      />
                    </Form.Item>
                  </Form>
                </>
              }
              trigger="click"
            >
              <Button type="text" size="large" icon={<SettingOutlined />} />
            </Popover>
            <Button
              type="text"
              size="large"
              icon={
                isFullScreen ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )
              }
              onClick={toggleFullscreen}
            />
          </div>
        </div>
        <div style={{ flex: 1, display: "flex" }}>
          <div
            style={{
              flex: 1,
              backgroundImage: `linear-gradient(to right bottom,rgba(0,0,0,0),rgba(0,0,0,0.5)),linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: "100% 100%,15px 15px,15px 15px",
              overflowY: "hidden",
              height: "calc(100svh - 56px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "9px 8px",
                fontSize: "16px",
                fontWeight: "200",
                backgroundImage:
                  "linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.1))",
              }}
            >
              计费中
              <span style={{ marginLeft: "4px", fontSize: "12px" }}>
                ({parking.length}/22)
              </span>
            </div>
            <div style={{ flex: 1, overflowY: "scroll" }}>
              <Parking parking={parking} />
            </div>
          </div>
          <div
            style={{
              flex: 2,
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              borderLeft: `1px solid ${token.colorBorderBg}`,
              borderRight: `1px solid ${token.colorBorderBg}`,
            }}
          >
            {sceneView}
            <div style={{ flex: 1 }}>
              <DropFile
                handler={async (file) => {
                  const compressed = await imageCompression(file, {
                    maxWidthOrHeight: 1000,
                    initialQuality: 0.7,
                    maxIteration: 1,
                    useWebWorker: false,
                  });
                  const dataurl = (await new Promise((res) => {
                    const fileReader = new FileReader();
                    fileReader.onload = (e) => {
                      res(e.target!.result as string);
                    };
                    fileReader.readAsDataURL(compressed);
                  })) as string;
                  let { err, msg } = (
                    await axios.post("http://localhost:2000/park", {
                      image: dataurl,
                    })
                  ).data;
                  if (err)
                    notification.error({
                      message: msg,
                      placement: "bottomRight",
                    });
                }}
              />
            </div>
          </div>
          <div
            style={{
              flex: 1,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(0,0,0,0.3),rgba(0,0,0,0.3) 30px,transparent 0,transparent 60px)",
              overflowY: "hidden",
              height: "calc(100svh - 56px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "9px 8px",
                fontSize: "16px",
                fontWeight: "200",
                backgroundImage:
                  "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.1))",
              }}
            >
              记录
            </div>
            <div style={{ flex: 1, overflowY: "scroll" }}>
              <Records records={records} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyApp;
