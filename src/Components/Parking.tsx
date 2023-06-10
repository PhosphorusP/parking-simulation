import { CarFilled, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import duration from "dayjs/plugin/duration";
import { useEffect, useState } from "react";

dayjs.extend(duration);
dayjs.locale("zh-cn");

const plate_colors = {
  blue: "linear-gradient(#06D, #06D)",
  green: "linear-gradient(#EEE, #7F7)",
  white: "linear-gradient(#EEE, #EEE)",
  yellow: "linear-gradient(#FA0, #FA0)",
};

const text_colors = {
  blue: "#FFF",
  green: "#000",
  white: "#000",
  yellow: "#000",
};

type ParkingProps = {
  parking: {
    number: string;
    color: string;
    model: string;
    timestamp: number;
  }[];
};

export const Parking: React.FC<ParkingProps> = ({
  parking: parkingArr,
}: ParkingProps) => {
  const [, upd] = useState(0);
  useEffect(() => {
    let interval = setInterval(() => upd(Math.random()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <>
      {parkingArr.map((parking) => (
        <div key={parking.number} style={{ margin: "16px 8px" }}>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  fontSize: "16px",
                  whiteSpace: "nowrap",
                  height: "24px",
                  display: "inline-block",
                  padding: "4px 8px",
                  backgroundImage: `linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(0,0,0,0.2)),${
                    (plate_colors as any)[parking.color]
                  }`,
                  borderRadius: "4px",
                  color: (text_colors as any)[parking.color],
                  textShadow: "1px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {parking.number}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                marginLeft: "8px",
                fontFamily: "monospace",
              }}
            >
              <span>
                <ClockCircleOutlined style={{ marginRight: "4px" }} />
                {dayjs
                  .duration(new Date().getTime() - parking.timestamp)
                  .format("HH:mm:ss")}
              </span>
              <span>
                <span
                  style={{
                    display: "inline-block",
                    textAlign: "center",
                    width: "12px",
                    marginRight: "4px",
                  }}
                >
                  ¥
                </span>
                {(
                  Math.floor(
                    (new Date().getTime() - parking.timestamp) / 1000
                  ) * 0.005
                ).toFixed(2)}
              </span>
            </div>
          </div>
          {parking.model.length ? (
            <div
              style={{
                fontSize: "12px",
                margin: "-2px 0 16px 0",
                opacity: 0.6,
              }}
            >
              <CarFilled style={{ margin: "4px" }} />
              {parking.model}
            </div>
          ) : undefined}
        </div>
      ))}
    </>
  );
};
