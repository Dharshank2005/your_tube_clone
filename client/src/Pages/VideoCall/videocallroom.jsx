import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom';
import './videocallroom.css'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { BsRecordCircle, BsStopCircle } from 'react-icons/bs'


const VideoCallRoom = () => {
  const { roomId } = useParams();
  const currentuser=useSelector(state => state.currentuserreducer);
  // console.log(currentuser?.result._id)
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

 
  const myVideoCall = async(element) =>{
    const appId = 377178805;
    const serverSecret = '3d2d6f0b15c34151d3a63382330b9d0f'
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appId, serverSecret, roomId, currentuser?.result._id , 'Enter Name')
    const zc = ZegoUIKitPrebuilt.create(kitToken);
    zc.joinRoom({
      container: element,
      showRoomTimer: true,
      sharedLinks: [{
        name: 'Copy Room ID',
        url: roomId
      }],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      showScreenSharingButton: true,
      layout: "Grid",
      whiteboardConfig: {
        showCreateAndCloseButton: true,
      },
      showPinButton: true,
    })
    }

    const startRecording = async () => {
      try {
        alert('Select the screen to record!')
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: {
          displaySurface: 'monitor',
          logicalSurface: true,
          cursor: 'always'
        },
        audio: true,
        preferCurrentTab: false  
      });
        mediaRecorderRef.current = new MediaRecorder(screenStream);
  
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
  
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.style = 'display: none';
          a.href = url;
          a.download = 'screen-recording.webm';
          a.click();
          window.URL.revokeObjectURL(url);
          recordedChunksRef.current = [];
          setIsRecording(false);
        };
  
        mediaRecorderRef.current.start();
        setIsRecording(true);

  
        screenStream.getVideoTracks()[0].onended = () => {
          stopRecording();
        };
  
      } catch (error) {
        console.error('Error starting screen recording:', error);
        setIsRecording(false);
      }
    };
  
    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      alert('Recording has Saved!')
    };

    const toggleRecording = () => {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    };


    return (
      <div className="video-call-container">
        <div
            className="myCallContainer"
            ref={myVideoCall}
          ></div>
        <div className='buttons'>
        <div className="record-button" onClick={toggleRecording}>
              {isRecording ? (
                <button className='stop-record' size={30}><BsStopCircle/> Stop</button>
            ) : (
              <button className='start-record' size={30}><BsRecordCircle/> Record</button>
            )}
        </div>
        <p className='recording'>{isRecording ? 'Recording...' : ''}</p>
      <button className='return-button' onClick={() => {
      window.history.go(-2);
      setTimeout(() => {
        window.location.reload();
    }, 800);
      }} >Return to Home</button>
      </div>  
      <p className='recording'>{isRecording ? 'Recording...' : ''}</p>
    </div>
    )

}

export default VideoCallRoom;