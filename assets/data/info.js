export const LineData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [
    {
      data: [20, 80, 0, 70, 20],
      color: (opacity = 1) => `rgba(99, 66, 232, ${opacity})`,
    },
  ],
};

export const PieData = [
  {
    name: "Organic",
    population: 8,
    color: "red",
    legendFontColor: "#7F7F7F",
    legendFontSize: 12,
  },
  {
    name: "Plastic",
    population: 8,
    color: "orange",
    legendFontColor: "#7F7F7F",
    legendFontSize: 12,
  },
  {
    name: "Paper",
    population: 7,
    color: "yellow",
    legendFontColor: "#7F7F7F",
    legendFontSize: 12,
  },
  {
    name: "Cardboard",
    population: 2,
    color: "blue",
    legendFontColor: "#7F7F7F",
    legendFontSize: 12,
  },
  {
    name: "Rock",
    population: 1,
    color: "green",
    legendFontColor: "#7F7F7F",
    legendFontSize: 12,
  },
];
