import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { Grid, Paper } from "@mui/material";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import Grid_comp from "./comp/Grid_comp";
import Chart from "./comp/Chart";
import PieChart from "./comp/PieChart";
import Table from "./comp/Table_comp";
import Table_comp from "./comp/Table_comp";
import { DonorForm } from "./comp/Form";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cal_comp_pick from "../../Components/calendar/Cal_comp_pick";
import CollectorSchedule from "../Dashboard/CollectorSchedule";
import CollectorResponse from "../Dashboard/UserDistance";
import UserDistance from "./UserDistance";
import axios from "axios";
import { useState } from "react";
import haversine from "haversine";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsIcon from '@mui/icons-material/Notifications';
import socket from '../../socket';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const Dashboard_collector = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = React.useState([]);
  const [user, setUser] = React.useState([]);
  const [isNot, setIsNot] = React.useState(false);
  const [longitude, setlongitude] = useState(0);
  const [latitude, setlatitude] = useState(0);
  socket.emit('join_room', 'room2')
  socket.on('newRequest', () => {
    console.log('frontend new request');
    setIsNot(true);
  })
  const getRequests = async () => {
    await axios
      .get("http://localhost:8000/getRequests")
      .then((res) => {
        console.log(res.data);
        return res.data;
      })
      .then((res) => {
        const data = res.filter((item) => item.status === "pending");
        return data;
      })
      .then((res) => {
        for (let i = 0; i < res.length; i++) {
          const dist = haversine(
            { latitude: latitude, longitude: longitude },
            { latitude: res[i].latitude, longitude: res[i].longitude },
            { unit: "meter" }
          );
          res[i].distance = dist;
          console.log(dist);
        }
        return res;
      })
      .then((res) => {
        // console.log(res.data);
        console.log(res);
        setRequests(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const locationfinder = () => {
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log("Latitude is :", position.coords.latitude);
      setlatitude(position.coords.latitude);
      console.log("Longitude is :", position.coords.longitude);
      setlongitude(position.coords.longitude);
    });
  };

  useEffect(() => {
    locationfinder();
    const token = JSON.parse(localStorage.getItem("token"));
    const User = JSON.parse(localStorage.getItem("user"));
    if (token && User.role === "collector" && User.status === "verified") {
    }
    setUser(User);
    getRequests();
    // else
    //   navigate('/');
  }, []);

  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };



  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Waste Bin
          </Typography>
          <IconButton 
            sx = {{float : "right"}}
            onClick = {() => {
              setIsNot(false);
            }}
            >
            {isNot ? <NotificationsActiveIcon  sx = {{color : "white"}}/> : <NotificationsIcon sx = {{color : "white"}}/>}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="History" sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Grid container spacing={6}>
          <Grid_comp />
          <Grid_comp />
          <Grid_comp />
        </Grid>

        <div
          style={{
            display: "flex",
            padding: "5px 20px",
            gap: "20px",
            marignTop: "8rem",
          }}
        >
          <PieChart />
          <Chart />
        </div>

        <div className="calendar" style={{ marginTop: "10rem" }}>
          <Cal_comp_pick />
        </div>

        {/* <CollectorSchedule /> */}
        <UserDistance data={requests} getRequests = {getRequests} email= {user?.email}/>
      </Box>
    </Box>
  );
};

export default Dashboard_collector;
