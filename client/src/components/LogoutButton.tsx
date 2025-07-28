// src/components/LogoutButton.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used
import type { AppDispatch } from '../app/store';
import { logoutUser } from '../features/userSlice'; // Import the new logoutUser thunk

const LogoutButton: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); // Use AppDispatch type
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Dispatch the async thunk for logout
    const resultAction = await dispatch(logoutUser());

    // You can check the result of the thunk if needed, but the clearUserState
    // action is dispatched regardless inside the thunk for client-side cleanup.
    if (logoutUser.fulfilled.match(resultAction)) {
      console.log('Logout successful!');
      navigate('/login'); // Redirect to login page
    } else {
      console.error('Logout failed (client-side state cleared anyway).');
      // Optionally show a user-friendly error message if server-side logout failed
      // You can access the error from resultAction.payload or resultAction.error
      navigate('/login'); // Still redirect for consistency
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;