import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateContest from '../pages/contests/CreateContest.jsx';
import UserList from '../Features/UserList.jsx';
import EditContest from '../pages/contests/EditContest.jsx';
import DeleteContest from '../pages/contests/DeleteContest.jsx';
import ViewSquad from '../pages/squad/ViewSquad.jsx';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="create-contest/:matchId" element={<CreateContest />} />
      <Route path="view-squad/:matchId" element={< ViewSquad />} />
      <Route path="users" element={<UserList />} />
     <Route path="edit-contest/:contestId" element={<EditContest />} />
      <Route path='delete-contest/:contestId' element = {<DeleteContest/>}/>
    </Routes>
  );
};

export default AdminRoutes;