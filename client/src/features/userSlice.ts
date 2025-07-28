// src/store/userSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// -------------------- Types --------------------
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization_name: string;
  organization_country?: string;
    token: string | null; // The authentication token

}

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  organization_name: string;
  organization_country?: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// -------------------- Initial State --------------------
const getInitialState = (): UserState => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  return {
    user: userString ? JSON.parse(userString) : null,
    token: token || null,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  };
};

const initialState: UserState = getInitialState();

// -------------------- Thunks --------------------
export const registerUser = createAsyncThunk(
  'user/register',
  async (formData: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      return response.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (err: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (localOnly: boolean = false, { rejectWithValue }) => {
    try {
      if (!localOnly) {
        await axios.post('http://localhost:5000/api/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    } catch (err: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(err.response?.data?.message || 'Logout completed (frontend only)');
    }
  }
);


// -------------------- Slice --------------------
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
  clearUserState: (state) => {
      console.log('USER SLICE: clearUserState reducer called.');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('USER SLICE: localStorage REMOVED by clearUserState.');
      console.log('USER SLICE: State after clearUserState:', state);
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

       // Logout
      .addCase(logoutUser.pending, (state) => {
        console.log('USER SLICE: logoutUser.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('USER SLICE: logoutUser.fulfilled');
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        // localStorage.removeItem('token'); // This is often done here too, but clearUserState handles it explicitly.
        // localStorage.removeItem('user');
        console.log('USER SLICE: localStorage should be clear now from logoutUser fulfillment (if not already)');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        console.log('USER SLICE: logoutUser.rejected');
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload as string || 'Logout completed (frontend only)';
        // localStorage.removeItem('token'); // Similarly, handled by clearUserState or explicit call
        // localStorage.removeItem('user');
        console.log('USER SLICE: localStorage should be clear now from logoutUser rejection (if not already)');
      });
  }
});

export const { clearUserState } = userSlice.actions;
export default userSlice.reducer;
