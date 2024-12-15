import React, { useState, useEffect } from 'react';
import '../../Pages/Groups/Group.css';
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar';
import axios from 'axios';

const Group = () => {
  const [activeTab, setActiveTab] = useState('createGroup');
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({
    leadername: '',
    name: '',
    description: '',
  });
  const [newPerson, setNewPerson] = useState({
    groupName: '',
    email: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Fetch groups from the server
  useEffect(() => {
    axios.get('http://localhost:5000/group')
      .then(response => {
        setGroups(response.data);
      })
      .catch(error => {
        console.error('Error fetching groups:', error);
      });
  }, []);

  // Handle Create Group
  const createGroup = () => {
    if (newGroup.name && newGroup.description && newGroup.leadername) {
      axios.post('http://localhost:5000/group/create', newGroup)
        .then(response => {
          setGroups([...groups, response.data]);
          alert('Group Created Successfully!');
          setNewGroup({ leadername: '', name: '', description: '' });
        })
        .catch(() => {
          alert('Error creating group');
        });
    } else {
      alert('Please fill in all fields!');
    }
  };

  // Handle Add Person to Group
  const addPersonToGroup = () => {
  if (!newPerson.email || !newPerson.groupName) {
    alert('Please fill in both group name and email!');
    return;
  }

  // Generate a token for the invitation link
  const token = localStorage.getItem('token');
  const invitationLink = `http://localhost:3000/invite?group=${encodeURIComponent(newPerson.groupName)}&email=${encodeURIComponent(newPerson.email)}&token=${token}`;
  
  axios.post('http://localhost:5000/invite/send-invite', {
    email: newPerson.email,
    groupName: newPerson.groupName,
    invitationLink
  })
  .then(() => {
    alert(`Invitation sent to ${newPerson.email} for group "${newPerson.groupName}"`);
    setNewPerson({ groupName: '', email: '' });
  })
  .catch(error => {
    alert('Failed to send invitation');
    console.error(error);
  });
};
  

  // Filter groups based on the search query
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Group click for popup
  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setIsPopupVisible(true);
  };

  // Handle Close popup
  const closePopup = () => {
    setIsPopupVisible(false);
    setSelectedGroup(null);
  };

  return (
    <div className="container_Pages_App">
      <Leftsidebar />
      <div className="container2_Pages_App">
        <div className="groups-container">
          <div className="groups-options">
            <div className={`option ${activeTab === 'createGroup' ? 'active' : ''}`} onClick={() => setActiveTab('createGroup')}>
              Create Group
            </div>
            <div className={`option ${activeTab === 'addPerson' ? 'active' : ''}`} onClick={() => setActiveTab('addPerson')}>
              Add Person to Group
            </div>
            <div className={`option ${activeTab === 'searchGroup' ? 'active' : ''}`} onClick={() => setActiveTab('searchGroup')}>
              Search Groups
            </div>
          </div>

          <div className="group-content">
            {activeTab === 'createGroup' && (
              <div className="group-container">
                <h2>Create a New Group</h2>
                <input
                  type="text"
                  placeholder="Leader Name"
                  value={newGroup.leadername}
                  onChange={(e) => setNewGroup({ ...newGroup, leadername: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Group Name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                />
                <textarea
                  placeholder="Group Description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                />
                <button onClick={createGroup}>Create Group</button>
              </div>
            )}

            {activeTab === 'addPerson' && (
              <div className="group-container">
                <h2>Add Person to Group</h2>
                <input
                  type="text"
                  placeholder="Group Name"
                  value={newPerson.groupName}
                  onChange={(e) => setNewPerson({ ...newPerson, groupName: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Person's Email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                />
                <button onClick={addPersonToGroup}>Send Invitation</button>
              </div>
            )}

            {activeTab === 'searchGroup' && (
              <div className="group-container">
                <h2>Search for Groups</h2>
                <input
                  type="text"
                  placeholder="Search by Group Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="group-list">
                  {filteredGroups.length === 0 ? (
                    <p>No groups found</p>
                  ) : (
                    filteredGroups.map((group, index) => (
                      <p key={index} onClick={() => handleGroupClick(group)}>{group.name}</p>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPopupVisible && selectedGroup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>{selectedGroup.name}</h2>
            <p><strong>Leader:</strong> {selectedGroup.leadername}</p>
            <p><strong>Description:</strong> {selectedGroup.description}</p>
            <p><strong>Members:</strong>{selectedGroup.members && selectedGroup.members.join(', ')}</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Group;
