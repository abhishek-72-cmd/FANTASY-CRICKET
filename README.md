🏏 Pitch11 Fantasy Cricket Platform
A full-stack fantasy cricket platform built using React, Node.js, Express, MySQL, and SportMonks Cricket API.
The platform supports:
•	Fantasy team creation
•	Contest management
•	Automated fixture synchronization
•	Tentative and final squad processing
•	Automatic credit generation
•	Match activation
•	Live fantasy point calculation
•	Post-match automation
•	User rankings and winnings (upcoming)
________________________________________
Architecture
Frontend (React)
        │
        ▼
Backend (Node.js + Express)
        │
        ▼
MySQL Database
        │
        ▼
SportMonks Cricket API
________________________________________
Features
User Features
•	User Registration & Login
•	Google Authentication
•	Wallet System
•	Browse Upcoming Matches
•	Create Fantasy Teams
•	Join Contests
•	Edit Teams Before Match Lock
•	View Leaderboards
•	View Match Results
________________________________________
Admin Features
•	Sync Fixtures
•	Manage Contests
•	Manage Player Credits
•	Manage Fantasy Point Rules
•	View Match Squads
•	Activate Matches
•	Automation Controls
________________________________________
Automation System
When Automation Mode is enabled:
Fixture Sync
↓
Fetch Tentative Squads
↓
Generate Credits
↓
Create Contests
↓
Activate Match
↓
Final Lineup Sync
↓
Match Starts
↓
Fetch Match Events
↓
Calculate Points
↓
Calculate User Team Points
↓
Generate Rankings (Future)
↓
Prize Distribution (Future)
________________________________________
Tech Stack
Frontend
•	React
•	React Router
•	Axios
•	CSS
Backend
•	Node.js
•	Express.js
•	MySQL
•	node-cron
Third Party
•	SportMonks Cricket API
•	Google OAuth
________________________________________
Project Structure
project-root
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── config
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── db
│   ├── jobs
│   └── package.json
│
└── README.md
________________________________________
Installation
Clone Repository
git clone https://github.com/your-username/pitch11.git

cd pitch11
________________________________________
Frontend Setup
cd frontend

npm install
Create:
REACT_APP_API_URL=http://localhost:5000
Start frontend:
npm start
Frontend runs on:
http://localhost:3000
________________________________________
Backend Setup
cd backend

npm install
Create:
PORT=5000

CRICKET_API_KEY=YOUR_SPORTMONKS_KEY

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=fantasy_cricket

GOOGLE_CLIENT_ID=your_google_client_id
Start backend:
npm start
Backend runs on:
http://localhost:5000
________________________________________
Starting the Application
Frontend
cd frontend

npm start
Backend
cd backend

npm start
Both frontend and backend use:
npm start
as the application startup command.
________________________________________
Database
MySQL is used as the primary database.
Major tables:
users
fixtures
teams
players
22_match_players
contests
user_teams
match_events
player_match_points
user_team_points
player_points_cache
fantasy_point_rules
automation_logs
automation_settings
________________________________________
Pre-Match Automation
Runs After Fixture Sync
Checks:
Tentative Squad Available?
↓
Credits Generated?
↓
Contests Created?
↓
Match Activated?
Data Updated
players
player_points_cache
contests
fixtures
________________________________________
Final Lineup Processing
Runs every:
5 minutes
Checks:
Match starting within 1 hour?
↓
Fetch final lineup
↓
Save 22 players
↓
Sync credits
Updates:
22_match_players
________________________________________
Post-Match Automation
Runs every:
5 minutes
Checks:
Finished Match
↓
Events Missing?
↓
Fetch Events

Points Missing?
↓
Calculate Points
Updates:
match_events
player_match_points
user_team_points
________________________________________
Fantasy Point Rules
Batting
Run = +1

Boundary Bonus = +4

Six Bonus = +6

25 Runs Bonus = +8

50 Runs Bonus = +12

75 Runs Bonus = +16

Century Bonus = +20

Duck = -2
________________________________________
Bowling
Wicket = +20

LBW/Bowled Bonus = +8

4 Wicket Bonus = +4

5 Wicket Bonus = +8

6 Wicket Bonus = +12

Every 3 Dot Balls = +1
________________________________________
Fielding
Catch = +8

Stumping = +12

Run Out Direct = +12

Run Out Indirect = +6
________________________________________
General
Captain = 2x

Vice Captain = 1.5x

Starting XI = +4

Playing Substitute = +4
________________________________________
API Integrations
SportMonks
Used for:
Fixtures
Teams
Players
Squads
Final Lineups
Ball By Ball Events
Official Documentation:
https://docs.sportmonks.com
________________________________________
Deployment
Frontend
Can be deployed on:
•	Vercel
•	Netlify
________________________________________
Backend
Can be deployed on:
•	Render
•	Railway
•	VPS
________________________________________
Database
Recommended:
•	MySQL
•	PlanetScale
•	Aiven
•	Railway MySQL
________________________________________
Future Enhancements
•	Contest Ranking Engine
•	Prize Distribution Automation
•	Wallet Settlement Automation
•	Push Notifications
•	Referral System
•	Multi-Sport Support
________________________________________
Author
Abhishek Vibhute
Fantasy Cricket Platform – Pitch11
Built using React, Node.js, Express, MySQL, and SportMonks Cricket API.

