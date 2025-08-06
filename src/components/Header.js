import React from "react";
import {
  AppBar,
  Container,
  MenuItem,
  Select,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import {
  createTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { Menu as MenuIcon, TrendingUp, ShowChart } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { CryptoState } from "../CryptoContext";
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: "linear-gradient(135deg, rgba(26, 29, 58, 0.95) 0%, rgba(35, 39, 73, 0.95) 100%)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 215, 0, 0.1)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
  },
  toolbar: {
    padding: theme.spacing(1, 0),
    minHeight: "80px",
    [theme.breakpoints.down("sm")]: {
      minHeight: "64px",
      padding: theme.spacing(0.5, 0),
    },
  },
  title: {
    flex: 1,
    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontFamily: "Montserrat",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: "1.8rem",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.4rem",
    },
    "&:hover": {
      transform: "scale(1.02)",
      textShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
    },
  },
  logo: {
    fontSize: "2rem",
    color: "#ffd700",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.6rem",
    },
  },
  currencySelect: {
    minWidth: 120,
    height: 48,
    marginLeft: theme.spacing(2),
    borderRadius: "12px",
    background: "rgba(255, 215, 0, 0.1)",
    border: "1px solid rgba(255, 215, 0, 0.3)",
    transition: "all 0.3s ease",
    color: "#ffffff",
    fontWeight: 500,
    [theme.breakpoints.down("sm")]: {
      minWidth: 80,
      height: 40,
      marginLeft: theme.spacing(1),
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "&:hover": {
      background: "rgba(255, 215, 0, 0.2)",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(255, 215, 0, 0.2)",
    },
    "& .MuiSelect-icon": {
      color: "#ffd700",
    },
  },
  menuButton: {
    marginLeft: theme.spacing(1),
    color: "#ffd700",
    display: "none",
    [theme.breakpoints.down("xs")]: {
      display: "block",
    },
  },
  drawer: {
    "& .MuiDrawer-paper": {
      background: "linear-gradient(135deg, #1a1d3a 0%, #232749 100%)",
      color: "#ffffff",
      width: 250,
      padding: theme.spacing(2),
    },
  },
  drawerItem: {
    borderRadius: "8px",
    margin: theme.spacing(0.5, 0),
    transition: "all 0.3s ease",
    "&:hover": {
      background: "rgba(255, 215, 0, 0.1)",
      transform: "translateX(8px)",
    },
  },
  navigationLinks: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  navLink: {
    color: "#b8bcc8",
    fontWeight: 500,
    fontSize: "0.95rem",
    cursor: "pointer",
    padding: theme.spacing(1, 1.5),
    borderRadius: "8px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    "&:hover": {
      color: "#ffd700",
      background: "rgba(255, 215, 0, 0.1)",
      transform: "translateY(-2px)",
    },
  },
  activeNavLink: {
    color: "#ffd700",
    background: "rgba(255, 215, 0, 0.1)",
  },
}));

const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#ffd700",
    },
    secondary: {
      main: "#1a1d3a",
    },
    type: "dark",
  },
  typography: {
    fontFamily: "'Poppins', 'Montserrat', sans-serif",
  },
});

function Header() {
  const classes = useStyles();
  const { currency, setCurrency } = CryptoState();
  const history = useHistory();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(darkTheme.breakpoints.down("xs"));
  
  const currentPath = history.location.pathname;

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const navigationItems = [
    { label: "Market", path: "/", icon: <TrendingUp /> },
    { label: "Charts", path: "/charts", icon: <ShowChart /> },
  ];

  const renderNavigationLinks = () => (
    <div className={classes.navigationLinks}>
      {navigationItems.map((item) => (
        <div
          key={item.path}
          className={`${classes.navLink} ${
            currentPath === item.path ? classes.activeNavLink : ""
          }`}
          onClick={() => history.push(item.path)}
        >
          {item.icon}
          {item.label}
        </div>
      ))}
    </div>
  );

  const renderMobileDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      className={classes.drawer}
    >
      <List>
        {navigationItems.map((item) => (
          <ListItem
            button
            key={item.path}
            className={classes.drawerItem}
            onClick={() => {
              history.push(item.path);
              setDrawerOpen(false);
            }}
          >
            {item.icon}
            <ListItemText 
              primary={item.label} 
              style={{ marginLeft: "8px" }}
            />
          </ListItem>
        ))}
        <ListItem className={classes.drawerItem}>
          <Select
            variant="outlined"
            value={currency}
            onChange={handleCurrencyChange}
            className={classes.currencySelect}
            fullWidth
          >
            <MenuItem value="USD">🇺🇸 USD</MenuItem>
            <MenuItem value="INR">🇮🇳 INR</MenuItem>
            <MenuItem value="EUR">🇪🇺 EUR</MenuItem>
            <MenuItem value="GBP">🇬🇧 GBP</MenuItem>
          </Select>
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="static" className={classes.appBar} elevation={0}>
        <Container maxWidth="xl">
          <Toolbar className={classes.toolbar}>
            <Typography
              onClick={() => history.push("/")}
              variant="h4"
              className={classes.title}
            >
              <TrendingUp className={classes.logo} />
              Crypto Hunter
            </Typography>

            {!isMobile && (
              <>
                {renderNavigationLinks()}
                <Select
                  variant="outlined"
                  value={currency}
                  onChange={handleCurrencyChange}
                  className={classes.currencySelect}
                >
                  <MenuItem value="USD">🇺🇸 USD</MenuItem>
                  <MenuItem value="INR">🇮🇳 INR</MenuItem>
                  <MenuItem value="EUR">🇪🇺 EUR</MenuItem>
                  <MenuItem value="GBP">🇬🇧 GBP</MenuItem>
                </Select>
              </>
            )}

            {isMobile && (
              <IconButton
                className={classes.menuButton}
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
        {isMobile && renderMobileDrawer()}
      </AppBar>
    </ThemeProvider>
  );
}

export default Header;
