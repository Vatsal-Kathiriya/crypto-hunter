import { LinearProgress, makeStyles, Typography } from "@material-ui/core";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import ReactHtmlParser from "react-html-parser";
import CoinInfo from "../components/CoinInfo";
import { SingleCoin } from "../config/api";
import { SingleCoinCMC, CoinMetadataCMC, convertSingleCoinCMC } from "../config/coinmarketcap-api";
import { numberWithCommas } from "../components/CoinsTable";
import { CryptoState } from "../CryptoContext";
import { apiRequest, cmcApiRequest } from "../utils/apiService";

const CoinPage = () => {
  const { id } = useParams();
  const [coin, setCoin] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currency, symbol } = CryptoState();

  const fetchCoin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try CoinMarketCap API first for single coin data
      try {
        console.log('Attempting to fetch coin data from CoinMarketCap...');
        const cmcConfig = SingleCoinCMC(id, currency);
        const metadataConfig = CoinMetadataCMC(id);
        
        // Fetch both quote and metadata
        const [coinResponse, metadataResponse] = await Promise.allSettled([
          cmcApiRequest(cmcConfig, { useCache: true, retries: 1 }),
          cmcApiRequest(metadataConfig, { useCache: true, retries: 1 })
        ]);
        
        if (coinResponse.status === 'fulfilled' && coinResponse.value.data) {
          const metadata = metadataResponse.status === 'fulfilled' ? metadataResponse.value.data : null;
          const convertedData = convertSingleCoinCMC(coinResponse.value.data, metadata);
          
          if (convertedData) {
            setCoin(convertedData);
            console.log('Successfully fetched coin data from CoinMarketCap');
            return;
          }
        }
      } catch (cmcError) {
        console.warn('CoinMarketCap single coin API failed, falling back to CoinGecko:', cmcError.message);
      }
      
      // Fallback to CoinGecko API
      console.log('Falling back to CoinGecko single coin API...');
      const { data } = await apiRequest(SingleCoin(id), {
        useCache: true,
        retries: 2,
      });
      setCoin(data);
      console.log('Successfully fetched coin data from CoinGecko');
      
    } catch (err) {
      setError("Failed to fetch coin data from both APIs. Please try again.");
      console.error("Error fetching coin from both APIs:", err);
    } finally {
      setLoading(false);
    }
  }, [id, currency]);

  useEffect(() => {
    fetchCoin();
  }, [fetchCoin]);

  const useStyles = makeStyles((theme) => ({
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "linear-gradient(135deg, rgba(26, 29, 58, 0.95) 0%, rgba(35, 39, 73, 0.95) 100%)",
      [theme.breakpoints.down("md")]: {
        flexDirection: "column",
        alignItems: "center",
      },
    },
    sidebar: {
      width: "30%",
      [theme.breakpoints.down("md")]: {
        width: "100%",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: theme.spacing(3),
      padding: theme.spacing(3),
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      borderRadius: "20px",
      border: "1px solid rgba(255, 215, 0, 0.1)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      margin: theme.spacing(2),
      [theme.breakpoints.down("md")]: {
        margin: theme.spacing(1),
        borderRadius: "16px",
      },
    },
    coinImage: {
      marginBottom: theme.spacing(2),
      width: "200px",
      height: "200px",
      borderRadius: "50%",
      border: "3px solid rgba(255, 215, 0, 0.3)",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "scale(1.05)",
        border: "3px solid rgba(255, 215, 0, 0.6)",
        boxShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
      },
      [theme.breakpoints.down("sm")]: {
        width: "150px",
        height: "150px",
      },
      [theme.breakpoints.down("xs")]: {
        width: "120px",
        height: "120px",
      },
    },
    heading: {
      fontWeight: 800,
      marginBottom: theme.spacing(3),
      fontFamily: "'Poppins', sans-serif",
      fontSize: "2.5rem",
      background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textAlign: "center",
      letterSpacing: "1px",
      [theme.breakpoints.down("sm")]: {
        fontSize: "2rem",
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: "1.7rem",
      },
    },
    description: {
      width: "100%",
      fontFamily: "'Poppins', sans-serif",
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(2),
      paddingTop: 0,
      textAlign: "justify",
      color: "#b8bcc8",
      lineHeight: 1.6,
      fontSize: "0.95rem",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "12px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      [theme.breakpoints.down("sm")]: {
        fontSize: "0.9rem",
        padding: theme.spacing(2),
      },
    },
    marketData: {
      alignSelf: "start",
      padding: theme.spacing(3),
      paddingTop: theme.spacing(2),
      width: "100%",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "12px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      marginTop: theme.spacing(2),
      [theme.breakpoints.down("md")]: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      },
    },
    marketDataItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing(1, 0),
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      "&:last-child": {
        borderBottom: "none",
      },
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        gap: theme.spacing(0.5),
        textAlign: "center",
      },
    },
    marketDataLabel: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
      color: "#b8bcc8",
      fontSize: "1rem",
      [theme.breakpoints.down("sm")]: {
        fontSize: "0.9rem",
      },
    },
    marketDataValue: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 700,
      color: "#ffffff",
      fontSize: "1.1rem",
      [theme.breakpoints.down("sm")]: {
        fontSize: "1rem",
      },
    },
    rank: {
      background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
      color: "#1a1d3a",
      padding: theme.spacing(0.5, 1.5),
      borderRadius: "20px",
      fontWeight: 700,
      fontSize: "0.9rem",
    },
    errorContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      gap: theme.spacing(3),
      background: "rgba(255, 82, 82, 0.1)",
      borderRadius: "12px",
      border: "1px solid rgba(255, 82, 82, 0.2)",
      padding: theme.spacing(4),
      margin: theme.spacing(2),
      color: "#ff5252",
      textAlign: "center",
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
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: theme.spacing(2),
      color: "#ffd700",
    },
  }));

  const classes = useStyles();

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <LinearProgress 
          style={{ 
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            width: "300px",
            height: "4px",
            borderRadius: "2px"
          }} 
        />
        <Typography style={{ marginTop: "16px", fontFamily: "'Poppins', sans-serif" }}>
          Loading coin data...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.errorContainer}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
        <Typography color="error" variant="h6" style={{ marginBottom: "16px" }}>
          {error}
        </Typography>
        <button 
          onClick={fetchCoin}
          className={classes.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className={classes.errorContainer}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
        <Typography variant="h6">
          Coin not found
        </Typography>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.sidebar}>
        <img
          src={coin?.image?.large || coin?.image}
          alt={coin?.name}
          className={classes.coinImage}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <Typography variant="h3" className={classes.heading}>
          {coin?.name}
        </Typography>
        <Typography variant="subtitle1" className={classes.description}>
          {coin?.description?.en ? 
            ReactHtmlParser(coin.description.en.split(". ")[0] + ".") :
            "No description available."
          }
        </Typography>
        
        <div className={classes.marketData}>
          <div className={classes.marketDataItem}>
            <span className={classes.marketDataLabel}>Rank:</span>
            <span className={classes.rank}>
              #{numberWithCommas(coin?.market_cap_rank || 0)}
            </span>
          </div>

          <div className={classes.marketDataItem}>
            <span className={classes.marketDataLabel}>Current Price:</span>
            <span className={classes.marketDataValue}>
              {symbol} {numberWithCommas(
                coin?.market_data?.current_price?.[currency.toLowerCase()] || 0
              )}
            </span>
          </div>
          
          <div className={classes.marketDataItem}>
            <span className={classes.marketDataLabel}>Market Cap:</span>
            <span className={classes.marketDataValue}>
              {symbol} {numberWithCommas(
                coin?.market_data?.market_cap?.[currency.toLowerCase()]?.toString().slice(0, -6) || 0
              )}M
            </span>
          </div>
        </div>
      </div>
      <CoinInfo coin={coin} />
    </div>
  );
};

export default CoinPage;
