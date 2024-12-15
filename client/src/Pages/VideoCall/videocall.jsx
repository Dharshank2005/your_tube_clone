import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './videocall.css';
import { AiFillVideoCamera } from "react-icons/ai";
import { useSelector } from 'react-redux'
import { FaUserSlash, FaCopy } from 'react-icons/fa';
import { useNavigate } from "react-router-dom"

const VideoCall = () => {
    const [roomId, setRoomId] = useState('');
    const [isRoomIdGenerated, setIsRoomIdGenerated] = useState(false);
    const currentuser=useSelector(state => state.currentuserreducer);
    const navigate = useNavigate()


    const generateRoomId = () => {
        const newRoomId = uuidv4();
        setRoomId(newRoomId);
        setIsRoomIdGenerated(true);
    };

    const enterRoomId = () => {
        const inputRoomId = prompt('Please enter the Room ID:');
        if (inputRoomId) {
            setRoomId(inputRoomId);
            navigate(`/VideoCall/${inputRoomId}`)
        }
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId).then(() => {
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <div className="video-call-container">
            {
                currentuser?(
                    <>
					<AiFillVideoCamera className='fi-Video1' size={25}/>
					<AiFillVideoCamera className='fi-Video2' size={50}/>
					<h4 className='call-logo'>Your-Tube Video Calls</h4>
                    <h2 className='title-call'>Make Video Call to your friends</h2>
                    <h4 className='note-call'>Note: Generate and then Enter your RoomId and Share it with your friends to Join in the Video Call or 
                         Enter the RoomId which your friend generated and sent you!</h4>
                    <button className="control-g-button" onClick={generateRoomId}>Generate Room ID</button>
                    <button className="control-e-button" onClick={enterRoomId}>Enter Room ID</button>   
                    {isRoomIdGenerated && (
                        <div className="copy-roomid-container">
                            <h3><b>Room ID:  </b>{roomId}</h3>
                            <FaCopy className="control-button" onClick={copyRoomId}/>
                        </div>
                    )}                
                    </>
                ):<>
                <FaUserSlash className='not_logged_in'/>
                <h2 className='not_user'>Pls Login to Make Video Calls</h2>
                </>
            }
            
        </div>
    );
};

export default VideoCall;