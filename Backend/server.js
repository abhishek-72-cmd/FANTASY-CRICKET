const express = require ('express');
const dotenv = require('dotenv');
 const bodyParser = require('body-parser');
 const cors = require('cors');

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



app.listen (PORT , ()=>{
  console.log (`app is running on http://localhost:${PORT}`)
})