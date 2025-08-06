import { makeStyles } from "@material-ui/core";

const SelectButton = ({ children, selected, onClick }) => {
  const useStyles = makeStyles((theme) => ({
    selectbutton: {
      border: "2px solid rgba(255, 215, 0, 0.3)",
      borderRadius: "12px",
      padding: theme.spacing(1.5, 3),
      fontFamily: "'Poppins', sans-serif",
      cursor: "pointer",
      backgroundColor: selected ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)" : "rgba(255, 255, 255, 0.05)",
      background: selected ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)" : "rgba(255, 255, 255, 0.05)",
      color: selected ? "#1a1d3a" : "#b8bcc8",
      fontWeight: selected ? 700 : 500,
      fontSize: "0.9rem",
      letterSpacing: "0.5px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: "blur(10px)",
      position: "relative",
      overflow: "hidden",
      minWidth: "80px",
      textAlign: "center",
      userSelect: "none",
      [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(1, 2),
        fontSize: "0.8rem",
        minWidth: "70px",
      },
      [theme.breakpoints.down("xs")]: {
        padding: theme.spacing(0.8, 1.5),
        fontSize: "0.75rem",
        minWidth: "60px",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent)",
        transition: "left 0.5s ease",
      },
      "&:hover": {
        backgroundColor: selected ? undefined : "rgba(255, 215, 0, 0.1)",
        background: selected ? undefined : "rgba(255, 215, 0, 0.1)",
        color: selected ? undefined : "#ffd700",
        borderColor: "rgba(255, 215, 0, 0.6)",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(255, 215, 0, 0.2)",
        "&::before": {
          left: "100%",
        },
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow: "0 4px 15px rgba(255, 215, 0, 0.3)",
      },
    },
  }));

  const classes = useStyles();

  return (
    <span onClick={onClick} className={classes.selectbutton}>
      {children}
    </span>
  );
};

export default SelectButton;
