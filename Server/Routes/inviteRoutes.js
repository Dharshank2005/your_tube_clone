import express from 'express';
import sendInvitationEmail from '../Helper/sendInvitationEmail.js';
import Group from '../Models/group.js';
import User from '../Models/Auth.js'; // Import User model

const router = express.Router();

// Route to send invitation email
router.post('/send-invite', async (req, res) => {
  const { email, groupName, invitationLink } = req.body;

  try {
    await sendInvitationEmail(email, groupName, invitationLink);
    res.send('Invitation sent successfully!');
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).send('Failed to send invitation');
  }
});

router.post('/accept-invite', async (req, res) => {
  const { groupName, username, email } = req.body; // Add email to the request body

  console.log('Group Name:', groupName);
  console.log('Username:', username);
  console.log('Email:', email);

  try {
    // Check if the user exists in the User model
    const existingUser = await User.findOne({ email });
    
    if (!existingUser) {
      return res.status(401).json({ 
        message: 'You need to sign in first and then add to the group' 
      });
    }

    // Find the group
    const group = await Group.findOne({ 
      name: { $regex: new RegExp('^' + groupName.trim() + '$', 'i') } 
    });

    // Check if the group was found
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Ensure members is an array
    if (!Array.isArray(group.members)) {
      return res.status(500).json({ message: 'Members is not an array' });
    }

    // Check if user is already a member
    if (group.members.includes(username)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    // Add user to group members
    group.members.push(username);

    console.log('Updated members:', group.members);

    // Save the updated group
    await group.save();

    res.status(200).json({ message: 'Successfully joined the group', group });
  } catch (error) {
    console.error('Invitation acceptance error:', error);
    res.status(500).json({ message: 'Error accepting invitation', error: error.message });
  }
});

export default router;