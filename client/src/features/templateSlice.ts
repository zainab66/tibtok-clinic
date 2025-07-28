// features/templates/templateSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import axiosInstance from '../services/api';

interface Template {
  id: string;
  template_type: string;
  template_slug: string;
  // Add other fields if needed
}

interface TemplateState {
  templates: Template[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TemplateState = {
  templates: [],
  status: 'idle',
  error: null,
};

export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (_, { getState, rejectWithValue }) => {
    try {
      // 1. Get token from Redux state (if API requires auth)
      const state = getState() as RootState;
      const token = state.user.token; // Optional: Only if templates need auth

      // 2. Configure headers conditionally
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 3. Make API call
      const response = await axiosInstance.get('/prompt-templates', { headers });

      // 4. Validate response
      if (!response.data) {
        throw new Error('API returned empty data');
      }

      return response.data as Template[];
    } catch (err: any) {
      // 5. Consistent error handling
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch templates';
      console.error('Fetch Templates Error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch templates';
      });
  },
});

export const selectAllTemplates = (state: RootState) => state.templates.templates;
export const selectTemplatesStatus = (state: RootState) => state.templates.status;
export const selectTemplatesError = (state: RootState) => state.templates.error;

export default templateSlice.reducer;