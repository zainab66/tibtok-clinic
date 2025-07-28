// features/sessions/sessionSlice.ts

import { createAsyncThunk, createSlice,type PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../services/api';
import { v4 as uuidv4 } from 'uuid';
interface Session {
  id: string;
  patient_id: string;
  user_id: string;
  transcript: string;
  ai_summary: string;
  created_at: string;
  status:string
}

interface SessionState {
  isRecording: boolean;
  isPaused: boolean;
  timer: number;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  transcript: string | null;
  summary: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed' | 'processing';
  error: string | null;
  currentPatientId: string | null;
  currentTemplate: string | null;
  currentSessionId: string | null;
  sessions: Session[];
fetchSessionsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
 currentSession: Session | null;
  fetchSessionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateStatus?: 'idle' | 'loading' | 'succeeded' | 'failed';
deleteStatus?: 'idle' | 'loading' | 'succeeded' | 'failed';

}

const initialState: SessionState = {
  isRecording: false,
  isPaused: false,
  timer: 0,
  mediaRecorder: null,
  audioChunks: [],
  transcript: null,
  summary: null,
  status: 'idle',
  error: null,
  currentPatientId: null,
  currentTemplate: null,
  currentSessionId: null,
  sessions: [],              
  fetchSessionsStatus: 'idle',
     currentSession: null,
  fetchSessionStatus: 'idle',
   updateStatus: 'idle',
  deleteStatus: 'idle',
};

export const sendAudioForProcessing = createAsyncThunk<
  { transcript: string; summary: string },
  { audioBlob: Blob; patientId: string; template: string; userId: string,language:string },
  { rejectValue: string }
>(
  'session/sendAudioForProcessing',
  async ({ audioBlob, patientId, template, userId,language }, { rejectWithValue }) => {
    try {
      const sessionId = uuidv4();
      const formData = new FormData();
      formData.append('file', audioBlob, `audio-${sessionId}.webm`);
      formData.append('patient_id', patientId);
      formData.append('language', language);
      formData.append('template', template);
      formData.append('session_id', sessionId);
      formData.append('user_id', userId);

      const response = await axiosInstance.post('/sessions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (err: any) {
      console.error('Send Audio Error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to process audio'
      );
    }
  }
);


export const fetchSessionsByPatientId = createAsyncThunk<
  Session[],
  string,
  { rejectValue: string; state: { user: { token: string | null } } }
>('session/fetchSessionsByPatientId', async (patientId, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('No authentication token');

    const response = await axiosInstance.get(`/sessions?patientId=${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (err: any) {
    console.error('Fetch Sessions Error:', err.response?.data || err.message);
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch sessions');
  }
});






// New thunk for fetching a single session by ID
export const fetchSessionById = createAsyncThunk<
  Session,
  string,
  { rejectValue: string; state: { user: { token: string | null } } }
>(
  'session/fetchSessionById',
  async (sessionId, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) return rejectWithValue('No authentication token');

      const response = await axiosInstance.get(`/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data as Session;
    } catch (err: any) {
      console.error('Fetch Session By ID Error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch session');
    }
  }
);

export const updateSessionById = createAsyncThunk<
  Session, // return type
  { id: string; data: Partial<Session> }, // input
  { rejectValue: string; state: { user: { token: string | null } } }
>('session/updateSessionById', async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('No authentication token');

    const response = await axiosInstance.put(`/sessions/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (err: any) {
    console.error('Update Session Error:', err.response?.data || err.message);
    return rejectWithValue(err.response?.data?.message || 'Failed to update session');
  }
});




export const deleteSessionById = createAsyncThunk<
  string, // returns deleted ID
  string, // input: sessionId
  { rejectValue: string; state: { user: { token: string | null } } }
>('session/deleteSessionById', async (id, { getState, rejectWithValue }) => {
  try {
    const token = getState().user.token;
    if (!token) return rejectWithValue('No authentication token');

    await axiosInstance.delete(`/sessions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return id;
  } catch (err: any) {
    console.error('Delete Session Error:', err.response?.data || err.message);
    return rejectWithValue(err.response?.data?.message || 'Failed to delete session');
  }
});







const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startRecording: (
      state,
      action: PayloadAction<{
        mediaRecorder: MediaRecorder;
        patientId: string;
        template: string;
        sessionId: string;
      }>
    ) => {
      state.isRecording = true;
      state.isPaused = false;
      state.timer = 0;
      state.audioChunks = [];
      state.mediaRecorder = action.payload.mediaRecorder;
      state.transcript = null;
      state.summary = null;
      state.error = null;
      state.status = 'idle';
      state.currentPatientId = action.payload.patientId;
      state.currentTemplate = action.payload.template;
      state.currentSessionId = action.payload.sessionId;
    },
    stopRecording: (state) => {
      state.isRecording = false;
      state.isPaused = false;
       state.timer = 0;  // Reset timer here
      try {
        if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
          state.mediaRecorder.stop();
        }
      } catch (err) {
        console.warn('Tried to stop inactive MediaRecorder:', err);
      }
      state.mediaRecorder = null;
    },
    pauseRecording: (state) => {
      if (state.mediaRecorder && state.mediaRecorder.state === 'recording') {
        state.mediaRecorder.pause();
        state.isPaused = true;
      }
    },
    resumeRecording: (state) => {
      if (state.mediaRecorder && state.mediaRecorder.state === 'paused') {
        state.mediaRecorder.resume();
        state.isPaused = false;
      }
    },
    addAudioChunk: (state, action: PayloadAction<Blob>) => {
      state.audioChunks.push(action.payload);
    },
    incrementTimer: (state) => {
      if (state.isRecording && !state.isPaused) {
        state.timer += 1;
      }
    },
    resetSession: (state) => {
      Object.assign(state, initialState);
    },
    setCurrentPatientId: (state, action: PayloadAction<string>) => {
      state.currentPatientId = action.payload;
    },
    setCurrentTemplate: (state, action: PayloadAction<string>) => {
      state.currentTemplate = action.payload;
    },
     setStatus: (state, action: PayloadAction<SessionState['status']>) => {
      state.status = action.payload;
    },
     clearCurrentSession(state) {
      state.currentSession = null;
      state.fetchSessionStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAudioForProcessing.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
   
.addCase(
  sendAudioForProcessing.fulfilled,
  (state, action: PayloadAction<{ transcript: string; summary: string }>) => {
    // Only mark as succeeded if we actually got both pieces of data
    if (action.payload.transcript && action.payload.summary) {
      state.status = 'succeeded';
      state.transcript = action.payload.transcript;
      state.summary = action.payload.summary;
    } else {
      state.status = 'failed';
      state.error = 'Received incomplete data from server';
    }
    state.audioChunks = [];
  }
)
      .addCase(sendAudioForProcessing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to process audio';
      })
      

  .addCase(fetchSessionsByPatientId.pending, (state) => {
    state.fetchSessionsStatus = 'loading';
    state.error = null;
  })
  .addCase(fetchSessionsByPatientId.fulfilled, (state, action: PayloadAction<Session[]>) => {
    state.fetchSessionsStatus = 'succeeded';
    state.sessions = action.payload;
  })
  .addCase(fetchSessionsByPatientId.rejected, (state, action) => {
    state.fetchSessionsStatus = 'failed';
    state.error = action.payload || 'Failed to fetch sessions';
  }) 
  .addCase(fetchSessionById.pending, (state) => {
        state.fetchSessionStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchSessionById.fulfilled, (state, action: PayloadAction<Session>) => {
        state.fetchSessionStatus = 'succeeded';
        state.currentSession = action.payload;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.fetchSessionStatus = 'failed';
        state.error = action.payload || 'Failed to fetch session';
      })
      .addCase(updateSessionById.pending, (state) => {
  state.updateStatus = 'loading';
  state.error = null;
})
.addCase(updateSessionById.fulfilled, (state, action: PayloadAction<Session>) => {
  state.updateStatus = 'succeeded';
  state.sessions = state.sessions.map(session =>
    session.id === action.payload.id ? action.payload : session
  );
  if (state.currentSession?.id === action.payload.id) {
    state.currentSession = action.payload;
  }
})
.addCase(updateSessionById.rejected, (state, action) => {
  state.updateStatus = 'failed';
  state.error = action.payload || 'Failed to update session';
})

.addCase(deleteSessionById.pending, (state) => {
  state.deleteStatus = 'loading';
  state.error = null;
})
.addCase(deleteSessionById.fulfilled, (state, action: PayloadAction<string>) => {
  state.deleteStatus = 'succeeded';
  state.sessions = state.sessions.filter(session => session.id !== action.payload);
  if (state.currentSession?.id === action.payload) {
    state.currentSession = null;
  }
})
.addCase(deleteSessionById.rejected, (state, action) => {
  state.deleteStatus = 'failed';
  state.error = action.payload || 'Failed to delete session';
});

  },
});

export const {setStatus,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  addAudioChunk,
  incrementTimer,
  resetSession,
  setCurrentPatientId,
  setCurrentTemplate,
  clearCurrentSession,

} = sessionSlice.actions;


export default sessionSlice.reducer;
