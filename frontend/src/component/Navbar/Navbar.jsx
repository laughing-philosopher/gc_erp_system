import "./Navbar.css";

import {
  // MdAdminPanelSettings,
  MdBarChart,
  MdFeedback,
  MdHome,
  MdInfo,
  MdInventory,
  MdAppRegistration
} from "react-icons/md";
import { BiLogOut } from "react-icons/bi";
import { HiAcademicCap } from "react-icons/hi2";
// import { IoMdDoneAll } from "react-icons/io";
import React, { useContext } from "react";
import iitbbslogo from "../../assets/iitbbs_logo.jpeg";
import { useNavigate } from "react-router";
import LoginContext from "../../store/context/loginContext";


function Navbar(props) {
  const LoginCtx = useContext(LoginContext);
  const navigate = useNavigate();
  const navItems = [
    {
      name: "home",
      path: "/",
      icon: <MdHome />,
    },
    {
      name: "attendance",
      path: "/attendance",
      icon: <MdBarChart />,
    },
    {
      name: "courses",
      path: "/my_courses",
      icon: <HiAcademicCap />,
    },
    {
      name: "feedback",
      path: "/feedback",
      icon: <MdFeedback />,
    },
    {
      name: "Registration",
      path: "/registration",
      icon: <MdAppRegistration />,
    },
    {
      name: "inventory",
      path: "/inventory",
      icon: <MdInventory />,
    },
    // {
    //   name: "results",
    //   path: "/results",
    //   icon: <IoMdDoneAll />,
    // },
    {
      name: "profile",
      path: "/profile",
      icon: <MdInfo />,
    },
    // {
    //   name: "admin",
    //   path: "/admin",
    //   icon: <MdAdminPanelSettings />,
    // },
  ];

  const navigateHandler = (path) => {
    console.log(path);
    // const role = LoginCtx?.role;
    if (path === '/attendance') {
      props.handleAttendance();
      return;
    } else if (path === '/feedback') {
      props.openModal('feedback');
      return;
    }
    navigate(path);
  }

  return (
    <div>
      <div className={`navbar ${props.className}`} style={props.style}>
        <div className="iitbbs" onClick={() => navigate("/")}>
          <img src={iitbbslogo} alt="" />
          <h3>IIT BBS</h3>
        </div>
        {navItems.map((item, index) => {

          return (
            <div
              className="navbar-item"
              key={index}
              onClick={() => navigateHandler(item.path)}
            >
              <div className="icon">{item.icon}</div>
              <div className="name">{item.name}</div>
            </div>
          );
        })}
        {LoginCtx.isLoggedIn && <div
          className="navbar-item"
          onClick={() => { LoginCtx.logout(); navigate("/login") }}
        >
          <div className="icon">{<BiLogOut />}</div>
          <div className="name">{"Logout"}</div>
        </div>}
      </div>
    </div>
  );
}

export default Navbar;
