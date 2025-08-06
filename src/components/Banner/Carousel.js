import React from "react";
import { makeStyles } from "@material-ui/core";
import { useEffect, useState, useMemo, useCallback } from "react";
import AliceCarousel from "react-alice-carousel";
import { Link } from "react-router-dom";
import { TrendingCoins } from "../../config/api";
import { TrendingCoinsCMC, convertCMCToCoinGeckoFormat } from "../../config/coinmarketcap-api";
import { CryptoState } from "../../CryptoContext";
import { numberWithCommas } from "../CoinsTable";
import { apiRequest, cmcApiRequest } from "../../utils/apiService";

// Memoized carousel item component
const CarouselItem = React.memo(({ coin, symbol, classes }) => {
  const profit = coin?.price_change_percentage_24h >= 0;

  return (
    <Link className={classes.carouselItem} to={`/coins/${coin.id}`}>
      <div className={classes.coinImageContainer}>
        <img
          src={coin?.image}
          alt={coin.name}
          className={classes.coinImage}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className={classes.coinGlow}></div>
      </div>
      
      <div className={classes.coinInfo}>
        <span className={classes.coinSymbol}>
          {coin?.symbol?.toUpperCase()}
        </span>
        <span className={classes.coinName}>
          {coin?.name}
        </span>
        <span className={`${classes.priceChange} ${profit ? classes.positive : classes.negative}`}>
          {profit && "+"}
          {coin?.price_change_percentage_24h?.toFixed(2)}%
        </span>
        <span className={classes.coinPrice}>
          {symbol} {numberWithCommas(coin?.current_price?.toFixed(2))}
        </span>
      </div>
    </Link>
  );
});

const Carousel = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currency, symbol } = CryptoState();

  const fetchTrendingCoins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try CoinMarketCap API first for trending coins
      try {
        console.log('Attempting to fetch trending coins from CoinMarketCap...');
        const cmcConfig = TrendingCoinsCMC(currency, 10);
        const { data } = await cmcApiRequest(cmcConfig, {
          useCache: true,
          retries: 1,
        });
        
        if (data && data.data) {
          const convertedData = convertCMCToCoinGeckoFormat(data);
          setTrending(convertedData.slice(0, 10)); // Take first 10
          console.log('Successfully fetched trending coins from CoinMarketCap');
          return;
        }
      } catch (cmcError) {
        console.warn('CoinMarketCap trending API failed, falling back to CoinGecko:', cmcError.message);
      }
      
      // Fallback to CoinGecko API
      console.log('Falling back to CoinGecko trending API...');
      const { data } = await apiRequest(TrendingCoins(currency), {
        useCache: true,
        retries: 2,
      });
      setTrending(data);
      console.log('Successfully fetched trending coins from CoinGecko');
      
    } catch (err) {
      setError("Failed to load trending coins");
      console.error("Error fetching trending coins from both APIs:", err);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchTrendingCoins();
  }, [fetchTrendingCoins]);

  const useStyles = makeStyles((theme) => ({
    carousel: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      width: "100%",
      "& .alice-carousel": {
        width: "100%",
      },
      "& .alice-carousel__wrapper": {
        width: "100%",
      },
    },
    carouselItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
      color: "white",
      textDecoration: "none",
      padding: theme.spacing(2),
      margin: theme.spacing(0, 1),
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 215, 0, 0.1)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      minHeight: "200px",
      justifyContent: "space-between",
      [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(1.5),
        minHeight: "180px",
      },
      [theme.breakpoints.down("xs")]: {
        padding: theme.spacing(1),
        minHeight: "160px",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent)",
        transition: "left 0.5s ease",
      },
      "&:hover": {
        transform: "translateY(-8px) scale(1.02)",
        background: "rgba(255, 215, 0, 0.1)",
        border: "1px solid rgba(255, 215, 0, 0.3)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.2)",
        "&::before": {
          left: "100%",
        },
        "& $coinImage": {
          transform: "scale(1.1) rotate(5deg)",
        },
        "& $coinGlow": {
          opacity: 1,
        },
      },
    },
    coinImageContainer: {
      position: "relative",
      marginBottom: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    coinImage: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      transition: "all 0.3s ease",
      position: "relative",
      zIndex: 2,
      [theme.breakpoints.down("sm")]: {
        width: "50px",
        height: "50px",
      },
      [theme.breakpoints.down("xs")]: {
        width: "40px",
        height: "40px",
      },
    },
    coinGlow: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)",
      opacity: 0,
      transition: "opacity 0.3s ease",
      zIndex: 1,
      [theme.breakpoints.down("sm")]: {
        width: "70px",
        height: "70px",
      },
      [theme.breakpoints.down("xs")]: {
        width: "60px",
        height: "60px",
      },
    },
    coinInfo: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: theme.spacing(0.5),
      width: "100%",
    },
    coinSymbol: {
      fontSize: "1rem",
      fontWeight: 700,
      color: "#ffd700",
      fontFamily: "'Poppins', sans-serif",
      letterSpacing: "1px",
      [theme.breakpoints.down("sm")]: {
        fontSize: "0.9rem",
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: "0.8rem",
      },
    },
    coinName: {
      fontSize: "0.8rem",
      color: "#b8bcc8",
      fontWeight: 400,
      textAlign: "center",
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      [theme.breakpoints.down("xs")]: {
        fontSize: "0.7rem",
      },
    },
    priceChange: {
      fontWeight: 600,
      fontSize: "0.85rem",
      padding: theme.spacing(0.3, 0.8),
      borderRadius: "12px",
      [theme.breakpoints.down("xs")]: {
        fontSize: "0.75rem",
        padding: theme.spacing(0.2, 0.6),
      },
    },
    positive: {
      color: "#00e676",
      background: "rgba(0, 230, 118, 0.1)",
      border: "1px solid rgba(0, 230, 118, 0.2)",
    },
    negative: {
      color: "#ff5252",
      background: "rgba(255, 82, 82, 0.1)",
      border: "1px solid rgba(255, 82, 82, 0.2)",
    },
    coinPrice: {
      fontSize: "1rem",
      fontWeight: 600,
      color: "#ffffff",
      fontFamily: "'Poppins', sans-serif",
      textAlign: "center",
      [theme.breakpoints.down("sm")]: {
        fontSize: "0.9rem",
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: "0.8rem",
      },
    },
    errorContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "200px",
      color: "#ff5252",
      background: "rgba(255, 82, 82, 0.1)",
      borderRadius: "12px",
      border: "1px solid rgba(255, 82, 82, 0.2)",
      margin: theme.spacing(2),
      fontSize: "1rem",
      fontWeight: 500,
    },
    loadingContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "200px",
      color: "#ffd700",
      fontSize: "1rem",
      fontWeight: 500,
      "& .loadingText": {
        animation: "$pulse 1.5s ease-in-out infinite",
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

  // Memoize carousel items to prevent unnecessary re-renders
  const items = useMemo(() => {
    return trending.map((coin) => (
      <CarouselItem
        key={coin.id}
        coin={coin}
        symbol={symbol}
        classes={classes}
      />
    ));
  }, [trending, symbol, classes]);

  const responsive = {
    0: {
      items: 1,
    },
    480: {
      items: 2,
    },
    768: {
      items: 3,
    },
    1024: {
      items: 4,
    },
    1200: {
      items: 5,
    },
  };

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <div className="loadingText">Loading trending cryptocurrencies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.errorContainer}>
        <div>⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div className={classes.carousel}>
      <AliceCarousel
        mouseTracking
        infinite
        autoPlayInterval={3000}
        animationDuration={800}
        disableDotsControls
        disableButtonsControls
        responsive={responsive}
        items={items}
        autoPlay
        touchTracking
        fadeOutAnimation
        paddingLeft={20}
        paddingRight={20}
      />
    </div>
  );
};

export default Carousel;
