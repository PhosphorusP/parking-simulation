import { Loading3QuartersOutlined, ScanOutlined } from "@ant-design/icons";
import { theme } from "antd";
import Color from "color";
import { useState } from "react";

type DropFileProps = {
  handler: (file: File) => Promise<void>;
};

export const DropFile: React.FC<DropFileProps> = ({
  handler,
}: DropFileProps) => {
  const { token } = theme.useToken();
  const preventDefaultEvent: any = (e: DragEvent) => {
    e.preventDefault();
  };
  const dropHandler: any = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer && e.dataTransfer.files.length) {
      let t = new Date().getTime();
      setPending(true);
      await handler(e.dataTransfer.files[0]);
      if (false && new Date().getTime() - t < 2000)
        await new Promise((res) =>
          setTimeout(res, 2000 - (new Date().getTime() - t))
        );
      0 && (await new Promise((res) => setTimeout(res, 1000)));
      setPending(false);
    }
  };
  const [pending, setPending] = useState(false);
  const colorFill = Color(token.colorFillQuaternary).alpha(0.05);
  const gridSize = 30;
  return (
    <div
      onDragLeave={preventDefaultEvent}
      onDragEnter={preventDefaultEvent}
      onDragOver={preventDefaultEvent}
      onDrop={dropHandler}
      style={{
        backgroundColor: pending
          ? Color(token.colorBgBase).alpha(0.75).toString()
          : "transparent",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(30,30,30,0.5)),linear-gradient(45deg, ${colorFill} 25%, transparent 0),
        linear-gradient(45deg, transparent 75%, ${colorFill} 0),
        linear-gradient(45deg, ${colorFill} 25%, transparent 0),
        linear-gradient(45deg, transparent 75%, ${colorFill} 0)`,
        backgroundSize: `100% 100%,${gridSize * 2}px ${gridSize * 2}px,${
          gridSize * 2
        }px ${gridSize * 2}px,${gridSize * 2}px ${gridSize * 2}px,${
          gridSize * 2
        }px ${gridSize * 2}px`,
        backgroundPosition: `0 0,0 0, ${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px, ${
          gridSize * 2
        }px ${gridSize * 2}px`,

        boxSizing: "border-box",
        borderTop: `1px solid ${token.colorBorderBg}`,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        transitionDuration: ".5s",
      }}
    >
      {pending ? (
        <Loading3QuartersOutlined
          spin
          style={{
            fontSize: "36px",
            height: "48px",
            filter:
              "drop-shadow(0 0 8px #55ff88) drop-shadow(0 0 8px #55ff88) drop-shadow(0 0 2px #55ff88)",
          }}
        />
      ) : (
        <ScanOutlined
          style={{
            fontSize: "24px",
            height: "48px",
            filter: "drop-shadow(0 0 8px #77ccff) drop-shadow(0 0 2px #77ccff)",
          }}
        />
      )}
      <span
        style={{
          fontWeight: "100",
          fontSize: "20px",
          marginTop: "8px",
        }}
      >
        {pending ? "正在识别" : "拖入图片以识别"}
      </span>
    </div>
  );
};
