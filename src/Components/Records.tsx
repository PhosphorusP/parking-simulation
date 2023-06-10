import { Tag } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
dayjs.locale("zh-cn");

type RecordsProps = {
  records: {
    number: string;
    timestamp: number;
    isLeave: Boolean;
    cost: number;
  }[];
};

export const Records: React.FC<RecordsProps> = ({
  records: recordsArr,
}: RecordsProps) => {
  return (
    <>
      {recordsArr.map((record) => (
        <div
          key={record.timestamp}
          style={{
            padding: "16px 8px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "200",
              lineHeight: "18px",
            }}
          >
            {record.number}
            <Tag
              style={{
                marginLeft: "8px",
                transform: "translateY(-2px)",
                backdropFilter: "blur(4px)",
              }}
            >
              {record.isLeave ? "离开" : "进入"}
            </Tag>
            {record.isLeave && (
              <span
                style={{
                  display: "inline-block",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                  marginLeft: "8px",
                  transform: "translateY(-2px)",
                }}
              >
                ¥{record.cost.toFixed(2)}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "200",
              opacity: 0.9,
            }}
          >
            {dayjs(record.timestamp).format("YYYY[年]MM[月]DD[日] HH:mm:ss")}
          </div>
        </div>
      ))}
    </>
  );
};
