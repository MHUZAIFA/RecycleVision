export const LineData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [
    {
      data: [20, 80, 0, 70, 20],
      color: (opacity = 1) => `rgba(99, 66, 232, ${opacity})`,
    },
  ],
};
