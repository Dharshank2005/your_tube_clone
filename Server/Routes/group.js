import express from 'express';
import Group from '../Models/group.js'; // Make sure to use ES6 import

const router = express.Router();

// Create a new group
router.post('/create', async (req, res) => {
  const { leadername, name, description } = req.body;
  try {
    const newGroup = new Group({
      leadername,
      name,
      description,
    });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ message: 'Error creating group', error: err });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching groups', error: err });
  }
});

// Add a member to a group (simplified version)
router.post('/addMember', async (req, res) => {
  const { groupId, userId } = req.body; // userId should be passed for adding members
  try {
    const group = await Group.findById(groupId);
    group.members.push(userId);
    await group.save();
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Error adding member to group', error: err });
  }
});

export default router; // Use ES6 export