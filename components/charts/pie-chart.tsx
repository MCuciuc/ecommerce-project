"use client"

import * as React from "react";

type PieDatum = {
  label: string;
  value: number;
  color?: string;
};

interface PieChartProps {
  data: PieDatum[];
  size?: number; // width/height in px
  thickness?: number; // ring thickness in px (donut style)
  className?: string;
}

function getDefaultColor(index: number): string {
  const palette = [
    "#6366F1", // indigo
    "#10B981", // emerald
    "#F59E0B", // amber
    "#EF4444", // red
    "#3B82F6", // blue
    "#8B5CF6", // violet
    "#22C55E", // green
    "#EAB308", // yellow
    "#06B6D4", // cyan
    "#F97316", // orange
  ];
  return palette[index % palette.length];
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 240,
  thickness = 28,
  className,
}) => {
  const filtered = React.useMemo(() => data.filter(d => d.value > 0), [data]);
  const total = React.useMemo(
    () => filtered.reduce((sum, d) => sum + d.value, 0),
    [filtered]
  );

  const radius = Math.max(1, (size - thickness) / 2);
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <div className={className}>
      <div style={{ width: size, height: size, position: "relative" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            {total === 0 ? (
              <circle
                r={radius}
                fill="transparent"
                stroke="#E5E7EB"
                strokeWidth={thickness}
              />
            ) : (
              filtered.map((d, idx) => {
                const portion = d.value / total;
                const dash = portion * circumference;
                const gap = circumference - dash;
                const offset = -cumulative * circumference;
                cumulative += portion;
                return (
                  <circle
                    key={d.label + idx}
                    r={radius}
                    fill="transparent"
                    stroke={d.color ?? getDefaultColor(idx)}
                    strokeWidth={thickness}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={offset}
                    transform="rotate(-90)"
                    strokeLinecap="butt"
                  />
                );
              })
            )}
          </g>
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          {total === 0 ? "No data" : new Intl.NumberFormat(undefined, { notation: "compact" }).format(total)}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {filtered.map((d, idx) => {
          const color = d.color ?? getDefaultColor(idx);
          const pct = total === 0 ? 0 : (d.value / total) * 100;
          return (
            <div key={d.label + idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
                <span className="truncate" title={d.label}>{d.label}</span>
              </div>
              <div className="ml-4 tabular-nums text-muted-foreground">
                {pct.toFixed(0)}%
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground">No segments</div>
        )}
      </div>
    </div>
  );
};

export default PieChart;


