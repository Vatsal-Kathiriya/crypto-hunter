import React, { Suspense, lazy, useEffect, useState } from "react";
import { Container, makeStyles, Typography, Fade, Zoom } from "@material-ui/core";
import { TrendingUp, Timeline, Star } from "@material-ui/icons";

// Lazy load the Carousel component
const Carousel = lazy(() => import("./Carousel"));

const useStyles = makeStyles((theme) => ({
  banner: {
    background: `
      linear-gradient(135deg, rgba(26, 29, 58, 0.95) 0%, rgba(35, 39, 73, 0.85) 100%),
      radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
      url(./banner2.jpg)
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    position: "relative",
    overflow: "hidden",
    minHeight: "500px",
    [theme.breakpoints.down("md")]: {
      backgroundAttachment: "scroll",
      minHeight: "450px",
    },
    [theme.breakpoints.down("sm")]: {
      minHeight: "400px",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(45deg, rgba(255, 215, 0, 0.05) 0%, transparent 50%)",
      animation: "$shimmer 3s ease-in-out infinite",
    },
  },
  bannerContent: {
    height: "100%",
    minHeight: "500px",
    display: "flex",
    flexDirection: "column",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    justifyContent: "space-between",
    position: "relative",
    zIndex: 2,
    [theme.breakpoints.down("md")]: {
      minHeight: "450px",
      paddingTop: theme.spacing(3),
    },
    [theme.breakpoints.down("sm")]: {
      minHeight: "400px",
      paddingTop: theme.spacing(2),
    },
  },
  tagline: {
    display: "flex",
    height: "auto",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    padding: theme.spacing(2, 0),
    animation: "$fadeInUp 1s ease-out",
  },
  mainTitle: {
    fontWeight: 800,
    marginBottom: theme.spacing(2),
    fontFamily: "'Montserrat', sans-serif",
    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
    letterSpacing: "2px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    fontSize: "3.5rem",
    [theme.breakpoints.down("md")]: {
      fontSize: "2.8rem",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "2.2rem",
      flexDirection: "column",
      gap: theme.spacing(0.5),
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.8rem",
    },
  },
  titleIcon: {
    fontSize: "1.2em",
    color: "#ffd700",
    animation: "$pulse 2s ease-in-out infinite",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1em",
    },
  },
  subtitle: {
    color: "#b8bcc8",
    textTransform: "none",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "1.1rem",
    lineHeight: 1.6,
    maxWidth: "600px",
    margin: "0 auto",
    fontWeight: 400,
    opacity: 0.9,
    [theme.breakpoints.down("sm")]: {
      fontSize: "1rem",
      maxWidth: "90%",
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.9rem",
    },
  },
  featuresContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(4),
    marginTop: theme.spacing(3),
    flexWrap: "wrap",
    [theme.breakpoints.down("sm")]: {
      gap: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: "#b8bcc8",
    fontSize: "0.9rem",
    fontWeight: 500,
    opacity: 0.8,
    transition: "all 0.3s ease",
    "&:hover": {
      color: "#ffd700",
      opacity: 1,
      transform: "translateY(-2px)",
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.8rem",
    },
  },
  featureIcon: {
    fontSize: "1.2rem",
    color: "#ffd700",
  },
  carousel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(4),
    animation: "$fadeInUp 1s ease-out 0.5s both",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(3),
    },
  },
  carouselLoading: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffd700",
    fontSize: "1.1rem",
    fontWeight: 500,
    animation: "$pulse 1.5s ease-in-out infinite",
  },
  decorativeElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 1,
  },
  floatingElement: {
    position: "absolute",
    borderRadius: "50%",
    background: "rgba(255, 215, 0, 0.1)",
    animation: "$float 6s ease-in-out infinite",
    "&:nth-child(1)": {
      width: "80px",
      height: "80px",
      top: "10%",
      left: "10%",
      animationDelay: "0s",
    },
    "&:nth-child(2)": {
      width: "60px",
      height: "60px",
      top: "20%",
      right: "15%",
      animationDelay: "2s",
    },
    "&:nth-child(3)": {
      width: "100px",
      height: "100px",
      bottom: "15%",
      left: "20%",
      animationDelay: "4s",
    },
  },
  "@keyframes fadeInUp": {
    "0%": {
      opacity: 0,
      transform: "translateY(30px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  "@keyframes pulse": {
    "0%, 100%": {
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.05)",
    },
  },
  "@keyframes shimmer": {
    "0%, 100%": {
      opacity: 0.5,
    },
    "50%": {
      opacity: 0.8,
    },
  },
  "@keyframes float": {
    "0%, 100%": {
      transform: "translateY(0px) rotate(0deg)",
    },
    "33%": {
      transform: "translateY(-20px) rotate(120deg)",
    },
    "66%": {
      transform: "translateY(10px) rotate(240deg)",
    },
  },
}));

function Banner() {
  const classes = useStyles();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { icon: <TrendingUp />, text: "Real-time Prices" },
    { icon: <Timeline />, text: "Advanced Charts" },
    { icon: <Star />, text: "Top Cryptocurrencies" },
  ];

  return (
    <div className={classes.banner}>
      {/* Decorative floating elements */}
      <div className={classes.decorativeElements}>
        <div className={classes.floatingElement}></div>
        <div className={classes.floatingElement}></div>
        <div className={classes.floatingElement}></div>
      </div>

      <Container className={classes.bannerContent} maxWidth="lg">
        <Fade in={isVisible} timeout={1000}>
          <div className={classes.tagline}>
            <Zoom in={isVisible} timeout={1200}>
              <Typography variant="h1" className={classes.mainTitle}>
                <TrendingUp className={classes.titleIcon} />
                Crypto Hunter
              </Typography>
            </Zoom>
            
            <Typography variant="h5" className={classes.subtitle}>
              Discover, track, and analyze your favorite cryptocurrencies with real-time data and comprehensive market insights
            </Typography>

            <div className={classes.featuresContainer}>
              {features.map((feature, index) => (
                <Fade key={index} in={isVisible} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                  <div className={classes.featureItem}>
                    <span className={classes.featureIcon}>{feature.icon}</span>
                    {feature.text}
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </Fade>

        <div className={classes.carousel}>
          <Suspense 
            fallback={
              <div className={classes.carouselLoading}>
                <TrendingUp style={{ marginRight: "8px" }} />
                Loading trending cryptocurrencies...
              </div>
            }
          >
            <Carousel />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}

export default Banner;
