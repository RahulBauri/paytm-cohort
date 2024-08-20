const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');
const zod = require('zod');
const router = express.Router();

const transactionBody = zod.object({
  amount: zod.number(),
  to: zod.string(),
});

router.get('/balance', authMiddleware, async (req, res) => {
  const { userId } = req;
  const userAccount = await Account.findOne({ userId });
  res.status(200).json({ balance: userAccount.balance });
});

router.post('/transfer', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  const { amount, to } = req.body;

  const { success } = transactionBody.safeParse(req.body);

  if (!success) {
    await session.abortTransaction();
    return res.status(411).json({
      message: 'Incorrect inputs',
    });
  }

  const debtorsAccount = await Account.findOne({
    userId: req.userId,
  }).session(session);

  if (!debtorsAccount || debtorsAccount.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: 'Insufficient balance',
    });
  }

  const creaditorsAccount = await Account.findOne({
    userId: to,
  }).session(session);

  if (!creaditorsAccount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: 'Invalid account',
    });
  }

  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);

  await Account.updateOne(
    { userId: to },
    { $inc: { balance: amount } }
  ).session(session);

  await session.commitTransaction();

  res.json({
    message: 'Transfer successful',
  });
});

module.exports = router;
