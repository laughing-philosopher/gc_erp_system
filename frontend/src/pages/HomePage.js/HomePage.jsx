import "./HomePage.css";

import React, { useContext, useEffect, useState } from "react";

import LoginContext from "../../store/context/loginContext";
import Modal from "../../component/Modal";
import Navbar from "../../component/Navbar/Navbar";
import { PieChart } from "react-minimal-pie-chart";
import axios from "axios";
import { backendUrl } from "../../constant";
import { useAlert } from "../../store/context/Alert-context";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import classes from '../../component/admindashboard.module.css';
import { MdArrowBackIosNew } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";

const day = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function HomePage() {
  const [isSidebarOpen, setIsSideBarOpen] = useState(true);
  const navigate = useNavigate();
  const [cookies] = useCookies(["AccessToken", "RefreshToken"]);
  const alertCtx = useAlert();
  const LoginCtx = useContext(LoginContext);
  const [todayTimetable, setTodayTimetable] = useState([]);
  const [announcement, setAnnouncement] = useState([]);
  const [courses, setCourses] = useState([]);
  const date = new Date();
  const today = date.getDay();
  const [modalisOpen, setModalisOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [Attendance, setAttendance] = useState({
    total: 0,
    present: 0,
    absent: 0,
  });

  useEffect(() => {
    if (LoginCtx.role === 'admin') {
      navigate('/admin');
    }
  }, [LoginCtx, navigate]);

  console.log(day[today]);
  // useEffect(() => {
  //   setTimeout(() => {
  //     const asyncFunc0 = async () => {
  //       if (LoginCtx.user === null) {
  //         try {
  //           const resp = await axios.get(`${backendUrl}/api/v1/users/update`, {
  //             headers: {
  //               Authorization: `Bearer ${cookies.AccessToken}`,
  //             },
  //           });
  //           LoginCtx.setUser(resp.data.data);
  //           console.log(resp);
  //         } catch (err) {
  //           console.log(err);
  //         }
  //       }
  //     }
  //     asyncFunc0();
  //   }, 1000);
  // }, []);

  useEffect(() => {
    const asyncFunc1 = async () => {
      if (LoginCtx.user === null) {
        return;
      }
      let courseEnrolled;
      if (LoginCtx.role === "student") {
        courseEnrolled = LoginCtx.user?.courses_enrolled;
        courseEnrolled = courseEnrolled?.map((course) => {
          return course.course_id;
        });
      } else if (LoginCtx.role === "teacher") {
        courseEnrolled = LoginCtx?.user?.courses_taught;
      }
      courseEnrolled = Array.from(new Set(courseEnrolled));

      let data = await Promise.all(
        courseEnrolled.map(async (course) => {
          try {
            const response = await axios.get(
              `${backendUrl}/api/v1/courses/${course}`,
              {
                headers: {
                  Authorization: `Bearer ${cookies.AccessToken}`,
                },
              }
            );
            return response.data.data.data[0];
          } catch (err) {
            console.log(err);
            if (err?.response?.data?.message) {
              alertCtx.showAlert("danger", err.response.data.message);
              return;
            }
            alertCtx.showAlert("danger", "Something went wrong");
          }
        })
      );
      // console.log(data);

      data = Array.from(new Set(data));
      setCourses(data);
      let todayTimetable = data.map((course) => {
        let schedule = course.schedule;
        schedule = Array.from(new Set(schedule));
        if (schedule.length === 0) {
          return null;
        }
        let ifToday = schedule.map((obj) => {
          if (obj.day === day[today]) {
            return obj;
          } else return null;
        });
        ifToday = ifToday.filter((obj) => obj !== null);

        // console.log(ifToday);
        if (ifToday.length !== 0) {
          course.schedule = ifToday;
          return course;
        } else return null;
      });
      // console.log(todayTimetable);

      // remove null values from the array
      todayTimetable = todayTimetable.filter((course) => course !== null);
      console.log(todayTimetable);
      setTodayTimetable(Array.from(new Set(todayTimetable)));
    };

    asyncFunc1();
  }, [LoginCtx]);

  useEffect(() => {
    const asyncFunc = async () => {
      try {
        const resp = await axios.get(`${backendUrl}/api/v1/announcements`, {
          headers: {
            Authorization: `Bearer ${cookies.AccessToken}`,
          },
        });
        console.log(resp.data.announcements);
        const data = resp.data.announcements;
        data.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        }); // sort by date in descending order

        setAnnouncement(data);
      } catch (err) {
        console.log(err);
        if (err?.response?.data?.message) {
          alertCtx.showAlert("danger", err.response.data.message);
          return;
        }
      }
    };
    asyncFunc();
  }, []);

  useEffect(() => {
    const asyncFunc = async () => {
      if (LoginCtx.role === "student") {
        try {
          const resp = await axios.get(
            `${backendUrl}/api/v1/attendance/getpercent`,
            {
              headers: {
                Authorization: `Bearer ${cookies.AccessToken}`,
              },
            }
          );
          console.log(resp);
          const data = resp.data.data;
          const att = {
            total: data.totalA,
            present: data.presentA,
            absent: data.totalA - data.presentA,
          };
          console.log(att);
          setAttendance(att);
        } catch (err) {
          console.log(err);
          if (err?.response?.data?.message) {
            alertCtx.showAlert("danger", err.response.data.message);
            return;
          }
        }
      }
    };
    asyncFunc();
  }, [LoginCtx.user]);

  const handleAttendance = () => {
    if (LoginCtx.role === "student") {
      navigate("/attendance");
    } else {
      openModal("attendance");
    }
  };

  const openModal = (route) => {
    setModalData(route);
    setModalisOpen(true);
  };

  const openMyCoursesPage = () => {
    navigate("/my_courses");
  };

  const closeModal = () => {
    setModalisOpen(false);
    setModalData(null);
  };

  const openProfilePage = () => {
    navigate("/profile");
  };

  const handleSidebar = () => {
    setIsSideBarOpen(!isSidebarOpen);
  }
  // console.log(LoginCtx.user);
  return (
    <>
      <Modal
        isOpen={modalisOpen}
        close={closeModal}
        courses={courses}
        data={modalData}
      />
      <div>
        <div>
          <div className={classes.navbar}
            style={{
              width: isSidebarOpen ? '200px' : '20px'
            }}
          >

            <Navbar className={classes.navbar2}
              style={{
                width: isSidebarOpen ? '200px' : '0px',
                display: isSidebarOpen ? 'block' : 'none'
              }}
              handleAttendance={handleAttendance}
              openModal={openModal} />

            <div className={classes.icon}
              style={{
                left: isSidebarOpen ? '203px' : '5px',
                zIndex: 10
              }}
              onClick={handleSidebar}
            >
              {isSidebarOpen && <MdArrowBackIosNew />}
              {!isSidebarOpen && <>
                <MdArrowForwardIos style={{ boxShadow: "0 0 10px #00ff00" }} />
                <MdArrowForwardIos style={{ boxShadow: "0 0 10px #00ff00" }} />
              </>}
            </div>
          </div>
          <div className="maincontainer">
            <main className="main">
              <div className="container"
                style={{
                  left: isSidebarOpen ? '200px' : '0px',
                  // width: isSidebarOpen ? 'calc(100% - 50px)' : '100%'
                }}
              >
                <header className="header">
                  <div className="header-text">
                    <h1>Welcome,👋🏽</h1>
                  </div>
                  <div className="header-profile" onClick={openProfilePage}>
                    <p>{LoginCtx.role}</p>
                    <img
                      src={LoginCtx?.user?.personal_info?.profile_picture}
                      alt="profile_photo"
                    />
                    <p>{LoginCtx.name}</p>
                  </div>
                </header>
                <section className="today-timetable">
                  <h2>Today's Timetable</h2>
                  <div className="items">
                    {todayTimetable.map((course, index) => {
                      if (course === null) {
                        return null;
                      }
                      return (
                        <div className="timetable-card" key={index}>
                          <div className="time">{course.schedule[0].time}</div>
                          <div className="subject">{course.name}</div>
                          <div className="topic-name">
                            {course.professor[0]}
                          </div>
                        </div>
                      );
                    })}
                    {/* <div className="timetable-card">
                    <div className="time">9:00 AM - 10:00 AM</div>
                    <div className="subject">DBMS</div>
                    <div className="topic-name">FD's and Normalizations</div>
                  </div> */}
                  </div>
                </section>
                <main className="main">
                  <section className="materiais">
                    <h2>Materials</h2>
                    <div className="materiais-grid">
                      <div
                        className="materiais-card"
                        onClick={openMyCoursesPage}
                      >
                        <h3>Courses</h3>
                        <p>This Semester</p>
                      </div>
                      <div
                        className="materiais-card"
                        onClick={() => handleAttendance()}
                      >
                        <h3>Attendance</h3>
                        {LoginCtx?.role === "student" && <p>
                          This Semester: &nbsp;
                          {Attendance.total === 0
                            ? 0
                            : (Attendance.present / Attendance.total) *
                            100}{" "}
                          %
                        </p>}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "150px",
                              maxHeight: "200px",
                            }}
                          >
                            <PieChart
                              startAngle={-90}
                              lengthAngle={-360}
                              lineWidth={50}
                              // segmentsShift={(index) => (index === 0 ? 10 : 0)}
                              label={({ dataEntry }) => {
                                if (dataEntry.value === 0) {
                                  return null;
                                }
                                return `${dataEntry.title}: ${dataEntry.value}`;
                              }}
                              labelStyle={{
                                fontSize: "8px",
                                fontFamily: "sans-serif",
                                fill: "#121212",
                                // color: 'cyan'
                              }}
                              labelPosition={50}
                              data={[
                                {
                                  title: "Present",
                                  value: Attendance.present,
                                  // value: 7,
                                  color: "#D2DAFF",
                                },
                                {
                                  title: "Absent",
                                  value: Attendance.absent,
                                  color: "#B1B2FF",
                                },
                              ]}
                            />
                          </div>
                        </div>
                        {LoginCtx?.role === "student" && <p>Total : {Attendance.total}</p>}
                      </div>

                      <div
                        className="materiais-card"
                        onClick={() => openModal("assignment")}
                      >
                        <h3>Assignment</h3>
                        <p>This Semester</p>
                      </div>

                      <div
                        className="materiais-card"
                        onClick={() => openModal("feedback")}
                      >
                        <h3>Feedback</h3>
                        <p></p>
                      </div>
                    </div>
                  </section>
                  <section className="update">
                    <h2>Recent Updates</h2>
                    <div className="update-items">
                      {announcement.map((item, index) => {
                        return (
                          <li key={index}>
                            {item.time}
                            <p>{item.message}</p>
                          </li>
                        );
                      })}
                    </div>
                  </section>
                </main>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
