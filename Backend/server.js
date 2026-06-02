const express = require ('express');
const dotenv = require('dotenv');
 const bodyParser = require('body-parser');
 const cors = require('cors');
const pool = require('./config/db/db.js')
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use (cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


require ('./config/jobs/updateFixtureStatuses.js')
require ('./config/jobs/fetchMatchEventsCron.js')
require('./config/jobs/calculatePointsCron.js')
require('./config/jobs/updateFixtures.js')
const errorHandler = require ('./middlewares/errorHandler.js')
const adminRoutes = require('./routes/adminRoutes.js')
const userRoutes = require('./routes/userRoutes.js')
const authanticate = require ('./middlewares/authanticate.js')


app.use('/api/admin', adminRoutes)
app.use('/api/user', userRoutes)


// app.use ('/api/user_teams',saveTeamsRoute)
//error handler middlerware

app.use(errorHandler);

async function connectDB(retries = 3) {
    while (retries > 0) {
        try {
            await pool.query('SELECT 1');
            console.log('MySQL Connected');
            return true;
        } catch (err) {
            console.log(
                `DB connection failed. Retrying in 1 second... (${retries} left)`
            );
            retries--;
            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );
        }
    }

    throw new Error('Unable to connect to DB');
}


(async () => {
  try {
    await connectDB(3);

    app.listen(PORT, () => {
      console.log(`app is running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Failed to connect to DB after multiple attempts:', err);
    process.exit(1);
  }
})();

