import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../Pages/Groups/CreateInvitePage.css';

const InviteAcceptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [groupName, setGroupName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Extract group name and email from URL
    const searchParams = new URLSearchParams(location.search);
    const group = searchParams.get('group');
    const invitedEmail = searchParams.get('email');
    
    if (group) {
      setGroupName(group);
      setEmail(invitedEmail || '');
    } else {
      toast.error('Invalid invite link');
      navigate('/');
    }
  }, [location, navigate]);

  const handleAcceptInvite = async () => {
    // Validate username
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      //console.log('Sending request with:', { groupName, username, email });
      // API call to add member to group
      const response = await axios.post('https://your-tube-clone-1-tjmh.onrender.com/invite/accept-invite', {
        groupName,
        username,
        email
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Response:', response.data);
      
      // Success notification
      alert(`Successfully joined ${groupName} group!`)

      // Redirect to groups or home page
      navigate('/Group');
    } catch (err) {
      // Handle any errors
      const errorMessage = err.response?.data?.message || 'Failed to join group';
      
      if (err.response?.status === 401) {
        // If unauthorized (user not found), show login message
        alert("Sign in first and then Join the group using the Invitation link sent!!")
        navigate('/');
        return;
      }

      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="invite-container">
      <div className="invite-form">
        <h2>Join Group: {groupName}</h2>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label>Enter Your Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
          />
        </div>
        
        <button 
          className="btn-primary"
          onClick={handleAcceptInvite}
          disabled={!username.trim()}
        >
          Join Group
        </button>
      </div>
    </div>
  );
};

export default InviteAcceptPage;