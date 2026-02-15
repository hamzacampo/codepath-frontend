"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface TopicDonutChartProps {
  performance: {
    roadmapProblems: number;
    generalProblems: number;
    wrongSubmissions: number;
    acceptedSolutions: number;
  };
}

const COLORS = [
  "hsl(120, 50%, 65%)", // green - roadmap problems
  "hsl(45, 80%, 65%)", // yellow/gold - general problems
  "hsl(0, 70%, 60%)", // red - wrong submissions
  "hsl(220, 70%, 65%)", // blue - accepted solutions
];

export function TopicDonutChart({ performance }: TopicDonutChartProps) {
  const data = [
    { name: "Roadmap Problems", value: performance.roadmapProblems },
    { name: "General Problems", value: performance.generalProblems },
    { name: "Wrong Submissions", value: performance.wrongSubmissions },
    { name: "Accepted Solutions", value: performance.acceptedSolutions },
  ];

  return (
    <div className="w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${COLORS[index]}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

