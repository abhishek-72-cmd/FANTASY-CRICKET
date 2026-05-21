import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserMatches from '../pages/Fixtures/UserMatches.jsx';
 import ViewContest from '../pages/Contests/ViewContest.jsx'
 import JoinContest from '../pages/Contests/JoinContest.jsx'
 import CreateTeam from '../pages/Teams/CreateTeam.jsx'
import UserTeamsPage from '../pages/Teams/UserTeamsPage.jsx';
import EditUserTeam from '../pages/Teams/EditUserTeam.jsx';
import DeleteUserTeam from '../pages/Teams/DeleteUserTeam.jsx'

const UserRoutes = () => {
  return (
    <Routes>

  <Route path="matches" element={<UserMatches />} />
         <Route path = 'viewContest/:fixtureId' element = {<ViewContest/>} />
         <Route path = 'joinContest/:id' element = {<JoinContest/>} />
         <Route path = 'create_team/:matchId' element = {<CreateTeam/>} />
         <Route path = 'teams' element = {<UserTeamsPage/>} />
         <Route path = 'editteams/:teamId' element = {<EditUserTeam/>} />
         <Route path = 'deleteteams/:teamId' element = {<DeleteUserTeam/>} />
         


    </Routes>
  );
};

export default UserRoutes;


          // <Route path='/user/*' element = {<UserRoutes/>} />    