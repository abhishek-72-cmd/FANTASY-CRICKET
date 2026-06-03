const express = require('express');
const router = express.Router();

const { createWallet, getBalance, getTransactionHistory } = require('../../paymentControllers/userWallet');

const createUserWallet = async (req, res) => {
  try {
    await createWallet(req.params.userId);
    res.status(201).json({ success: true, message: 'Wallet created successfully' });
  } catch (err) {
    console.error('CREATE WALLET ERROR:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create wallet' });
  }
};

const getWalletBalance = async (req, res) => {
  try {
    const wallet = await getBalance(req.params.userId);
    res.json({ success: true, balance: Number(wallet.balance || 0) });
  } catch (err) {
    console.error('GET WALLET BALANCE ERROR:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch wallet balance' });
  }
};

const getWalletTransactions = async (req, res) => {
  try {
    const transactions = await getTransactionHistory(req.params.userId);
    res.json({ success: true, transactions });
  } catch (err) {
    console.error('GET WALLET TRANSACTIONS ERROR:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch wallet transactions' });
  }
};

router.post('/create_wallet/:userId', createUserWallet);
router.get('/getWalletBalance/:userId', getWalletBalance);
router.get('/getTransactionHistory/:userId', getWalletTransactions);

module.exports = router;

