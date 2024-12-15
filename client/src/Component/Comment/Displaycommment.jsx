import React, { useState, useEffect } from "react";
import "./Comment.css";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { editcomment, deletecomment } from "../../action/comment";
import axios from "axios";



const Displaycommment = ({ 
    cid, 
    commentbody, 
    userid, 
    commenton, 
    usercommented, 
    city, 
    likes = 0, 
    dislikes = 0 
}) => {
    const [edit, setedit] = useState(false);
    const [cmtnody, setcommentbdy] = useState("");
    const [cmtid, setcmntid] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [targetLang, setTargetLang] = useState("en");
    const [localLikes, setLocalLikes] = useState(likes);
    const [localDislikes, setLocalDislikes] = useState(dislikes);
    const [detectedCity, setDetectedCity] = useState("Unknown");
    const dispatch = useDispatch();
    const currentuser = useSelector((state) => state.currentuserreducer);

    // Function to detect city based on IP
    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        fetchCityFromCoordinates(latitude, longitude);
                    },
                    (error) => {
                        console.error("Error getting location: ", error);
                        setDetectedCity("Unknown");
                    }
                );
            } else {
                console.log("Geolocation is not supported by this browser.");
                setDetectedCity("Unknown");
            }
        };

        getLocation();
    }, []);

    const fetchCityFromCoordinates = async (lat, lon) => {
        const apiKey = '6c25d88fe2a2d153683469e426979839'; // Replace with your OpenWeather API key
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

        try {
            const response = await axios.get(url);
            const cityName = response.data.name; // Get the city name from the response
            setDetectedCity(cityName);
        } catch (error) {
            console.error("Error fetching the weather data: ", error);
            setDetectedCity("Unknown");
        }
    };

    const handleedit = (ctid, ctbdy) => {
        setedit(true);
        setcmntid(ctid);
        setcommentbdy(ctbdy);
    };

    const haneleonsubmit = (e) => {
        e.preventDefault();
        if (!cmtnody) {
            alert("Type your comment");
        } else {
            dispatch(editcomment({ id: cmtid, commentbody: cmtnody }));
            setcommentbdy("");
        }
        setedit(false);
    };

    const handledel = (id) => {
        dispatch(deletecomment(id));
    };

    const handleTranslate = async () => {
        try {
            const response = await axios.post("https://translator-1-pi8c.onrender.com/translate", {
                text: commentbody,
                source_lang: "en", // Specify source language explicitly
                target_lang: targetLang,
            });
            setTranslatedText(response.data.translatedText);
        } catch (error) {
            console.error("Translation failed:", error);
        }
    };

    const handleLikeDislike = async (action) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/comment/like/${cid}`, 
                { action },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.removed) {
                dispatch(deletecomment(cid));
                return;
            }

            if (action === 'like') {
                setLocalLikes(response.data.likes);
            } else if (action === 'dislike') {
                setLocalDislikes(response.data.dislikes);
            }

        } catch (error) {
            console.error("Like/Dislike failed:", error.response?.data || error.message);

            if (error.response?.data?.removed) {
                dispatch(deletecomment(cid));
                return;
            }

            if (error.response) {
                alert(error.response.data.message || "Failed to like/dislike");
            } else if (error.request) {
                alert("No response from server");
            } else {
                alert("Error in request setup");
            }
        }
    };

    console.log('Comment Props Debug:', {
        cid,
        detectedCity,
        cityType: typeof detectedCity,
        commentBody: commentbody
    });

    return (
        <>
            {edit ? (
                <form 
                    className="comments_sub_form_commments" 
                    onSubmit={haneleonsubmit}
                >
                    <input
                        type="text"
                        onChange={(e) => setcommentbdy(e.target.value)}
                        placeholder="Edit comments.."
                        value={cmtnody}
                        className="comment_ibox"
                    />
                    <input 
                        type="submit" 
                        value="Change" 
                        className="comment_add_btn_comments" 
                    />
                </form>
            ) : (
                <p className="comment_body">{commentbody}</p>
            )}

            {translatedText && <p className="comment_translated">{translatedText}</p>}
            
            <div className="translate_options">
                <select 
                    onChange={(e) => setTargetLang(e.target.value)} 
                    value={targetLang}
                >
                    <option value="ar">Arabic</option>
                    <option value="zh">Chinese</option>
                    <option value="zh">Dutch</option>
                    <option value="en">French</option>
                    <option value="hi">German</option>
                    <option value="zh">Greek</option>
                    <option value="es">Hindi</option>
                    <option value="de">Italian</option>
                    <option value="zh">Japanese</option>
                    <option value="zh">Korean</option>
                    <option value="zh">Malay</option>
                    <option value="zh">Polish</option>
                    <option value="zh">Portuguese</option>
                    <option value="zh">Romanian</option>
                    <option value="zh">Russian</option>
                    <option value="zh">Spanish</option>
                    <option value="zh">Swedish</option>
                    <option value="zh">Tamil</option>
                    <option value="zh">Thai</option>
                    <option value="zh">Turkish</option>
                </select>
                <button onClick={handleTranslate}>Translate</button>
            </div>

            <p className="usercommented">
                {" "}- {usercommented} commented {moment(commenton).fromNow()}
            </p>

            {currentuser?.result?._id === userid && (
                <p className="EditDel_DisplayCommendt">
                    <i onClick={() => handleedit(cid, commentbody)}>Edit</i>
                    <i onClick={() => handledel(cid)}>Delete</i>
                </p>
            )}

            <p
                className="comment_city"
                style={{
                    color: detectedCity !== "Unknown" ? "green" : "red",
                    fontWeight: "bold",
                }}
            >
                City: {detectedCity}
            </p>

            <p className="Likesdislikescount">
                <button onClick={() => handleLikeDislike('like')}>👍 {localLikes}</button>
                <button onClick={() => handleLikeDislike('dislike')}>👎 {localDislikes}</button>
            </p>
        </>
    );
};

export default Displaycommment;
