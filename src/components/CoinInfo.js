import { useEffect, useState, useMemo, useCallback } from "react";
import { HistoricalChart } from "../config/api";
import { Line } from "react-chartjs-2";
import {
  CircularProgress,
  createTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core";
import SelectButton from "./SelectButton";
import { chartDays } from "../config/data";
import { CryptoState } from "../CryptoContext";
import { defaultChartOptions } from "../utils/chartSetup";
import { apiRequest } from "../utils/apiService";

const CoinInfo = ({ coin }) => {
  const [historicData, setHistoricData] = useState();
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currency } = CryptoState();

  const useStyles = makeStyles((theme) => ({
    container: {
      width: "75%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing(3),
      padding: theme.spacing(5),
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      borderRadius: "20px",
      border: "1px solid rgba(255, 215, 0, 0.1)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      [theme.breakpoints.down("md")]: {
        width: "100%",
        marginTop: 0,
        padding: theme.spacing(3),
        paddingTop: 0,
        borderRadius: "16px",
      },
      [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(2),
        borderRadius: "12px",
      },
    },
    chartContainer: {
      width: "100%",
      height: "400px",
      position: "relative",
      marginBottom: theme.spacing(3),
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "12px",
      padding: theme.spacing(2),
      border: "1px solid rgba(255, 255, 255, 0.1)",
      [theme.breakpoints.down("sm")]: {
        height: "300px",
        padding: theme.spacing(1),
      },
    },
    buttonContainer: {
      display: "flex",
      gap: theme.spacing(1),
      flexWrap: "wrap",
      justifyContent: "center",
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        gap: theme.spacing(0.5),
      },
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      gap: theme.spacing(2),
      color: "#ffd700",
    },
    loadingText: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: "1.1rem",
      fontWeight: 500,
      animation: "$pulse 1.5s ease-in-out infinite",
    },
    errorContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      gap: theme.spacing(3),
      background: "rgba(255, 82, 82, 0.1)",
      borderRadius: "12px",
      border: "1px solid rgba(255, 82, 82, 0.2)",
      padding: theme.spacing(4),
      color: "#ff5252",
      textAlign: "center",
    },
    errorIcon: {
      fontSize: "3rem",
      marginBottom: theme.spacing(1),
    },
    errorMessage: {
      fontSize: "1.1rem",
      fontWeight: 500,
      marginBottom: theme.spacing(2),
    },
    retryButton: {
      padding: theme.spacing(1.5, 3),
      background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
      color: "#1a1d3a",
      border: "none",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "'Poppins', sans-serif",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(255, 215, 0, 0.3)",
      },
    },
    "@keyframes pulse": {
      "0%, 100%": {
        opacity: 0.7,
      },
      "50%": {
        opacity: 1,
      },
    },
  }));

  const classes = useStyles();

  const fetchHistoricData = useCallback(async () => {
    if (!coin?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      // Note: CoinMarketCap historical data requires paid plan
      // So we'll use CoinGecko for chart data
      console.log('Fetching historical data from CoinGecko...');
      const { data } = await apiRequest(HistoricalChart(coin.id, days, currency), {
        useCache: true,
        retries: 2,
      });
      setHistoricData(data.prices);
    } catch (err) {
      // If CoinGecko fails, create mock data for demonstration
      console.warn("Historical data API failed, showing mock data:", err.message);
      setError("Chart data temporarily unavailable. Showing sample data.");
      
      // Generate sample data for demonstration
      const now = Date.now();
      const sampleData = [];
      const basePrice = 50000; // Sample base price
      
      for (let i = days; i >= 0; i--) {
        const timestamp = now - (i * 24 * 60 * 60 * 1000);
        const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const price = basePrice * (1 + randomVariation);
        sampleData.push([timestamp, price]);
      }
      
      setHistoricData(sampleData);
    } finally {
      setLoading(false);
    }
  }, [coin?.id, days, currency]);

  useEffect(() => {
    fetchHistoricData();
  }, [fetchHistoricData]);

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!historicData) return null;

    return {
      labels: historicData.map((coin) => {
        let date = new Date(coin[0]);
        let time =
          date.getHours() > 12
            ? `${date.getHours() - 12}:${date.getMinutes().toString().padStart(2, '0')} PM`
            : `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} AM`;
        return days === 1 ? time : date.toLocaleDateString();
      }),
      datasets: [
        {
          data: historicData.map((coin) => coin[1]),
          label: `Price ( Past ${days} Days ) in ${currency}`,
          borderColor: "#EEBC1D",
          backgroundColor: "rgba(238, 188, 29, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.1,
        },
      ],
    };
  }, [historicData, days, currency]);

  // Memoize chart options for better performance
  const chartOptions = useMemo(() => ({
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        ...defaultChartOptions.plugins.legend,
        labels: {
          ...defaultChartOptions.plugins.legend.labels,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.datasets.map((dataset, i) => ({
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                index: i,
              }));
            }
            return [];
          },
        },
      },
    },
  }), []);

  const handleDayChange = useCallback((selectedDays) => {
    setDays(selectedDays);
  }, []);

  const darkTheme = createTheme({
    palette: {
      primary: {
        main: "#fff",
      },
      type: "dark",
    },
  });

  if (error) {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className={classes.container}>
          <div className={classes.errorContainer}>
            <div className={classes.errorIcon}>⚠️</div>
            <div className={classes.errorMessage}>
              {error}
            </div>
            <button 
              onClick={fetchHistoricData}
              className={classes.retryButton}
            >
              Retry Loading Chart
            </button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={classes.container}>
        {loading || !chartData ? (
          <div className={classes.loadingContainer}>
            <CircularProgress
              style={{ color: "#ffd700" }}
              size={60}
              thickness={4}
            />
            <div className={classes.loadingText}>
              Loading price chart...
            </div>
          </div>
        ) : (
          <>
            <div className={classes.chartContainer}>
              <Line
                data={chartData}
                options={chartOptions}
              />
            </div>
            <div className={classes.buttonContainer}>
              {chartDays.map((day) => (
                <SelectButton
                  key={day.value}
                  onClick={() => handleDayChange(day.value)}
                  selected={day.value === days}
                >
                  {day.label}
                </SelectButton>
              ))}
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

export default CoinInfo;
