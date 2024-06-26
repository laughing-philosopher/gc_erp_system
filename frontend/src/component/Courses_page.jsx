import React, { useState, useEffect, useContext } from "react";
import classes from "./coursespage.module.css"
import { FaBookOpen } from "react-icons/fa";
import { MdAssignment } from "react-icons/md";
import { BsPersonRaisedHand } from "react-icons/bs";
import axios from 'axios';
import { backendUrl } from "../constant";
import { useNavigate } from "react-router"
import LoginContext from "../store/context/loginContext";

import image1 from "../assets/1.jpg"
import image2 from "../assets/2.jpg"
import image3 from "../assets/3.jpg"
import image4 from "../assets/4.jpg"
import image0 from "../assets/0.jpg"
import { useAlert } from "../store/context/Alert-context";

// const data = [
//     { "courseName": "Mathematics", "professorName": "Dr. Smith" },
//     { "courseName": "Physics", "professorName": "Prof. Johnson" },
//     { "courseName": "Biology", "professorName": "Dr. Anderson" },
//     { "courseName": "Chemistry", "professorName": "Prof. Wilson" },
//     { "courseName": "English", "professorName": "Dr. Brown" },
//     { "courseName": "History", "professorName": "Prof. Martinez" },
//     { "courseName": "Computer Science", "professorName": "Dr. Thompson" },
//     { "courseName": "Economics", "professorName": "Prof. Garcia" },
//     { "courseName": "Psychology", "professorName": "Dr. Lee" },
//     { "courseName": "Sociology", "professorName": "Prof. Davis" }
// ];

const linkarr = [image1, image2, image3, image4, image0]

const Courses_page = () => {
    const navigate = useNavigate();
    const alertCtx = useAlert();
    const Loginctx = useContext(LoginContext);
    const [coursesIds, setCoursesIds] = useState([]);
    const [courses, setCourses] = useState([]);
    const [message, setMessage] = useState('Loading...');

    useEffect(() => {

        const fetchdata = async () => {
            try {
                const resp = await axios.get(backendUrl + '/api/v1/users/update', {
                    headers: {
                        Authorization: `Bearer ${Loginctx.AccessToken}`
                    }
                });
                console.log(resp.data);
                const data = resp.data;
                const userCoursesIds = [...data.data.courses_enrolled, ...data?.data?.courses_taught];
                console.log("userCoursesIds", userCoursesIds);


                const courseNamePromises = userCoursesIds.map(courseId =>
                    axios.get(backendUrl + `/api/v1/courses/${courseId?.course_id ? courseId?.course_id : courseId}`, {
                        headers: {
                            Authorization: `Bearer ${Loginctx.AccessToken}`
                        }
                    }).then(courseResp => courseResp.data.data.data[0])
                );

                const courseNames = await Promise.all(courseNamePromises);
                console.log(courseNames);
                setCoursesIds(userCoursesIds);
                setCourses(courseNames);
                if (courseNames.length === 0) {
                    setMessage('No Courses Found');
                }
                else {
                    setMessage('');
                }

                return courses;
            } catch (err) {
                console.log(err);
                if (err?.response?.data?.message) {
                    alertCtx.showAlert("Error", err.response.data.message);
                    return;
                }
                setMessage('Error Fetching Data');
            }
        };
        fetchdata();
    }, []);

    const assignmentPage = (courseId) => {
        navigate(`/my_courses/${courseId}/assignments`);
        console.log(courseId);
    }

    const coursePage = (courseId) => {
        navigate(`/my_courses/${courseId}`);
        console.log(courseId);
    }

    return (<div className={classes.Body}>
        <h1 className={classes.title}><FaBookOpen color="Purple" /> &nbsp; Courses</h1>
        <p>{message}</p>
        <div className={classes.eqp}>
            <ul className={classes.list}>
                {courses.map((ele, ind) => {
                    return (<li key={ind}
                        className={classes.listitem}
                        onClick={() => { coursePage(ele._id) }}>
                        <img src={linkarr[ind % 5]} alt=""
                            style={{
                                minHeight: '150px'
                            }}
                        />
                        <div className={classes.details} >
                            <h4 className={classes.courceName}>{ele.name}</h4>
                            <p className={classes.profName}>{ele.professor[0]}</p>
                        </div>
                        <div className={classes.listfooter}>
                            <div className={classes.icons}>
                                <div onClick={(e) => { e.stopPropagation(); assignmentPage(ele._id) }}><MdAssignment color="blue" size={"25px"} /></div>
                                <div><BsPersonRaisedHand color="Green" size={"25px"} /></div>
                            </div>
                        </div>
                    </li>)
                })}
            </ul>
        </div>
    </div>)
}

export default Courses_page;