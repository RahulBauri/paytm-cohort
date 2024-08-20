const express = require('express');
const router = express.Router();

const zod = require('zod');
const { User, Account } = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const authMiddleware = require('../middlewares/authMiddleware');

const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});
const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});
const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.post('/signup', async (req, res) => {
  const { username, firstName, lastName, password } = req.body;
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: 'Email already taken/ Incorrect inputs',
    });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(411).json({
      message: 'Email already taken/ Incorrect inputs',
    });
  }

  const user = await User.create(req.body);
  const userId = user._id;

  const balance = 1 + (Math.random() * 9999 + 1).toFixed(2);
  await Account.create({ userId, balance });

  const token = jwt.sign({ userId }, JWT_SECRET);

  res.status(200).json({ message: 'User created successfully', token });
});

router.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: 'Incorrect inputs',
    });
  }
  const user = await User.findOne({
    username,
    password,
  });

  if (!user) {
    return res.status(411).json({ message: 'Error while logging in' });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET);
  res.status(200).json({ token });
});

router.put('/', authMiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: 'Error while updating information',
    });
  }
  const { userId } = req;
  await User.updateOne({ _id: userId }, req.body);

  res.json({
    message: 'Updated successfully',
  });
});

router.get('/bulk', authMiddleware, async (req, res) => {
  const filter = req.query.filter || '';

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  }).select('firstName lastName _id');

  res.status(200).json({ users });
});

module.exports = router;
