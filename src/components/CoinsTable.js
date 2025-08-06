import React, { useEffect, useState, useMemo, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Pagination from "@material-ui/lab/Pagination";
import {
  Container,
  createTheme,
  TableCell,
  LinearProgress,
  ThemeProvider,
  Typography,
  TextField,
  TableBody,
  TableRow,
  TableHead,
  TableContainer,
  Table,
  Paper,
} from "@material-ui/core";
import { CoinList } from "../config/api";
import { CoinListCMC, convertCMCToCoinGeckoFormat } from "../config/coinmarketcap-api";
import { useHistory } from "react-router-dom";
import { CryptoState } from "../CryptoContext";
import { apiRequest, cmcApiRequest } from "../utils/apiService";
import { debounce } from "../utils/performance";

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Memoized coin row component for better performance
const CoinRow = React.memo(({ row, symbol, onRowClick, classes }) => {
  const profit = row.price_change_percentage_24h > 0;
  
  return (
    <TableRow
      onClick={() => onRowClick(row.id)}
      className={classes.row}
      key={row.name}
    >
      <TableCell component="th" scope="row">
        <div className={classes.coinCell}>
          <img
            src={row?.image}
            alt={row.name}
            className={`${classes.coinImage} coinImage`}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className={classes.coinInfo}>
            <div className={classes.coinSymbol}>{row?.symbol?.toUpperCase()}</div>
            <div className={classes.coinName}>{row?.name}</div>
          </div>
        </div>
      </TableCell>
      <TableCell align="right" className={classes.priceCell}>
        {symbol} {numberWithCommas(row?.current_price?.toFixed(2))}
      </TableCell>
      <TableCell align="right">
        <span className={profit ? classes.changePositive : classes.changeNegative}>
          {profit && "+"}
          {row?.price_change_percentage_24h?.toFixed(2)}%
        </span>
      </TableCell>
      <TableCell align="right" className={classes.marketCapCell}>
        {symbol} {numberWithCommas(row?.market_cap?.toString().slice(0, -6))}M
      </TableCell>
    </TableRow>
  );
});

function CoinsTable() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const { currency, symbol } = CryptoState();

  const useStyles = makeStyles((theme) => ({
    tableContainer: {
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 215, 0, 0.1)",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    },
    table: {
      minWidth: 650,
      "& .MuiTableCell-root": {
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      },
    },
    tableHead: {
      background: "linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 237, 78, 0.9) 100%)",
      "& .MuiTableCell-head": {
        color: "#1a1d3a",
        fontWeight: 800,
        fontFamily: "'Poppins', sans-serif",
        fontSize: "1rem",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        padding: theme.spacing(2),
        [theme.breakpoints.down("sm")]: {
          fontSize: "0.9rem",
          padding: theme.spacing(1.5),
        },
        [theme.breakpoints.down("xs")]: {
          fontSize: "0.8rem",
          padding: theme.spacing(1),
        },
      },
    },
    row: {
      background: "rgba(255, 255, 255, 0.02)",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      fontFamily: "'Poppins', sans-serif",
      position: "relative",
      "&:hover": {
        background: "rgba(255, 215, 0, 0.08)",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(255, 215, 0, 0.15)",
        "& .MuiTableCell-root": {
          color: "#ffffff",
        },
        "& $coinImage": {
          transform: "scale(1.1)",
        },
      },
      "&:nth-child(even)": {
        background: "rgba(255, 255, 255, 0.01)",
      },
      "& .MuiTableCell-root": {
        color: "#b8bcc8",
        fontSize: "0.95rem",
        fontWeight: 500,
        padding: theme.spacing(2),
        [theme.breakpoints.down("sm")]: {
          fontSize: "0.85rem",
          padding: theme.spacing(1.5),
        },
        [theme.breakpoints.down("xs")]: {
          fontSize: "0.8rem",
          padding: theme.spacing(1),
        },
      },
    },
    coinCell: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(2),
      [theme.breakpoints.down("sm")]: {
        gap: theme.spacing(1.5),
      },
      [theme.breakpoints.down("xs")]: {
        gap: theme.spacing(1),
      },
    },
    coinImage: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      transition: "transform 0.3s ease",
      border: "2px solid rgba(255, 215, 0, 0.2)",
      [theme.breakpoints.down("sm")]: {
        width: "40px",
        height: "40px",
      },
      [theme.breakpoints.down("xs")]: {
        width: "32px",
        height: "32px",
      },
    },
    coinInfo: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(0.5),
    },
    coinSymbol: {
      textTransform: "uppercase",
      fontSize: "1rem",
      fontWeight: 700,
      color: "#ffffff",
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
      [theme.breakpoints.down("xs")]: {
        display: "none",
      },
    },
    priceCell: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
      fontSize: "1.1rem",
      color: "#ffffff",
      [theme.breakpoints.down("sm")]: {
        fontSize: "1rem",
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: "0.9rem",
      },
    },
    changePositive: {
      color: "#00e676",
      fontWeight: 600,
      background: "rgba(0, 230, 118, 0.1)",
      padding: theme.spacing(0.5, 1),
      borderRadius: "8px",
      border: "1px solid rgba(0, 230, 118, 0.2)",
    },
    changeNegative: {
      color: "#ff5252",
      fontWeight: 600,
      background: "rgba(255, 82, 82, 0.1)",
      padding: theme.spacing(0.5, 1),
      borderRadius: "8px",
      border: "1px solid rgba(255, 82, 82, 0.2)",
    },
    marketCapCell: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 500,
      color: "#b8bcc8",
    },
    pagination: {
      "& .MuiPaginationItem-root": {
        color: "#b8bcc8",
        borderColor: "rgba(255, 215, 0, 0.3)",
        fontWeight: 500,
        fontSize: "0.95rem",
        "&:hover": {
          backgroundColor: "rgba(255, 215, 0, 0.1)",
          color: "#ffd700",
        },
        "&.Mui-selected": {
          backgroundColor: "#ffd700",
          color: "#1a1d3a",
          fontWeight: 700,
          "&:hover": {
            backgroundColor: "#ffed4e",
          },
        },
      },
    },
    title: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 700,
      color: "#ffffff",
      textAlign: "center",
      marginBottom: theme.spacing(3),
      fontSize: "2.2rem",
      background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      [theme.breakpoints.down("sm")]: {
        fontSize: "1.8rem",
        marginBottom: theme.spacing(2),
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: "1.5rem",
      },
    },
    searchField: {
      marginBottom: theme.spacing(3),
      "& .MuiOutlinedInput-root": {
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        color: "#ffffff",
        fontFamily: "'Poppins', sans-serif",
        transition: "all 0.3s ease",
        "& fieldset": {
          borderColor: "rgba(255, 215, 0, 0.3)",
        },
        "&:hover fieldset": {
          borderColor: "rgba(255, 215, 0, 0.5)",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#ffd700",
        },
      },
      "& .MuiInputLabel-root": {
        color: "#b8bcc8",
        fontFamily: "'Poppins', sans-serif",
        "&.Mui-focused": {
          color: "#ffd700",
        },
      },
    },
    errorContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "300px",
      color: "#ff5252",
      background: "rgba(255, 82, 82, 0.1)",
      borderRadius: "12px",
      border: "1px solid rgba(255, 82, 82, 0.2)",
      margin: theme.spacing(2, 0),
      fontSize: "1.1rem",
      fontWeight: 500,
      textAlign: "center",
    },
    loadingProgress: {
      backgroundColor: "rgba(255, 215, 0, 0.2)",
      "& .MuiLinearProgress-bar": {
        backgroundColor: "#ffd700",
      },
    },
    paginationContainer: {
      padding: theme.spacing(3, 0),
      display: "flex",
      justifyContent: "center",
      marginTop: theme.spacing(2),
    },
  }));

  const classes = useStyles();
  const history = useHistory();

  const darkTheme = createTheme({
    palette: {
      primary: {
        main: "#fff",
      },
      type: "dark",
    },
  });

  const fetchCoins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try CoinMarketCap API first
      try {
        console.log('Attempting to fetch from CoinMarketCap...');
        const cmcConfig = CoinListCMC(currency, 100);
        const { data } = await cmcApiRequest(cmcConfig, {
          useCache: true,
          retries: 1,
        });
        
        if (data && data.data) {
          const convertedData = convertCMCToCoinGeckoFormat(data);
          setCoins(convertedData);
          console.log('Successfully fetched from CoinMarketCap');
          return;
        }
      } catch (cmcError) {
        console.warn('CoinMarketCap API failed, falling back to CoinGecko:', cmcError.message);
      }
      
      // Fallback to CoinGecko API
      console.log('Falling back to CoinGecko API...');
      const { data } = await apiRequest(CoinList(currency), {
        useCache: true,
        retries: 2,
      });
      setCoins(data);
      console.log('Successfully fetched from CoinGecko');
      
    } catch (err) {
      setError("Failed to fetch coins from both APIs. Please check your internet connection and try again.");
      console.error("Error fetching coins from both APIs:", err);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  // Memoized search filtering to prevent unnecessary recalculations
  const filteredCoins = useMemo(() => {
    if (!search) return coins;
    
    const searchTerm = search.toLowerCase();
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm) ||
        coin.symbol.toLowerCase().includes(searchTerm)
    );
  }, [coins, search]);

  // Memoized pagination calculations
  const paginatedCoins = useMemo(() => {
    const startIndex = (page - 1) * 10;
    return filteredCoins.slice(startIndex, startIndex + 10);
  }, [filteredCoins, page]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCoins.length / 10);
  }, [filteredCoins.length]);

  const handleRowClick = useCallback((coinId) => {
    history.push(`/coins/${coinId}`);
  }, [history]);

  // Debounced search to improve performance
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setSearch(value);
      setPage(1);
    }, 300),
    []
  );

  const handleSearchChange = useCallback((e) => {
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  const handlePageChange = useCallback((_, value) => {
    setPage(value);
    window.scroll(0, 450);
  }, []);

  if (error) {
    return (
      <ThemeProvider theme={darkTheme}>
        <Container style={{ textAlign: "center" }}>
          <div className={classes.errorContainer}>
            <div>
              <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⚠️</div>
              <div>{error}</div>
              <button
                onClick={fetchCoins}
                style={{
                  marginTop: "16px",
                  padding: "12px 24px",
                  background: "#ffd700",
                  color: "#1a1d3a",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Container style={{ textAlign: "center", padding: "32px 16px" }}>
        <Typography variant="h4" className={classes.title}>
          Cryptocurrency Prices by Market Cap
        </Typography>
        
        <TextField
          label="Search For a Crypto Currency..."
          variant="outlined"
          className={classes.searchField}
          onChange={handleSearchChange}
          placeholder="Type coin name or symbol..."
          fullWidth
        />
        
        <TableContainer component={Paper} className={classes.tableContainer}>
          {loading ? (
            <LinearProgress className={classes.loadingProgress} />
          ) : (
            <Table className={classes.table} aria-label="cryptocurrency table">
              <TableHead className={classes.tableHead}>
                <TableRow>
                  {["Coin", "Price", "24h Change", "Market Cap"].map((head) => (
                    <TableCell
                      key={head}
                      align={head === "Coin" ? "left" : "right"}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedCoins.map((row) => (
                  <CoinRow
                    key={row.id}
                    row={row}
                    symbol={symbol}
                    onRowClick={handleRowClick}
                    classes={classes}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={classes.paginationContainer}>
            <Pagination
              count={totalPages}
              page={page}
              classes={{ ul: classes.pagination }}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              size="large"
            />
          </div>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default CoinsTable;
