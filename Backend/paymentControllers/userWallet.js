const pool = require('../config/db/db');

const createWallet = async (userId, joiningBonus = 100) => {
    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        await connection.query(
            `
            INSERT INTO user_wallet
            (
                user_id,
                balance
            )
            VALUES (?,?)
            `,
            [userId, joiningBonus]
        );

        await connection.query(
            `
            INSERT INTO wallet_transactions
            (
                user_id,
                amount,
                transaction_type,
                balance_before,
                balance_after,
                remarks
            )
            VALUES (?,?,?,?,?,?)
            `,
            [
                userId,
                joiningBonus,
                'JOIN_BONUS',
                0,
                joiningBonus,
                'Registration Bonus'
            ]
        );

        await connection.commit();

        return true;

    } catch (err) {

        await connection.rollback();
        throw err;

    } finally {

        connection.release();

    }
};


const getBalance = async (userId) => {

    const [rows] = await pool.query(
        `
        SELECT balance
        FROM user_wallet
        WHERE user_id = ?
        `,
        [userId]
    );

    return rows[0] || { balance: 0 };
};




const getTransactionHistory = async (
    userId,
    limit = 20
) => {

    const [rows] = await pool.query(
        `
        SELECT
            id,
            amount,
            transaction_type,
            remarks,
            created_at
        FROM wallet_transactions
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT ?
        `,
        [userId, Number(limit)]
    );

    return rows;
};


module.exports = {
    createWallet,
    getBalance,
    getTransactionHistory
};
