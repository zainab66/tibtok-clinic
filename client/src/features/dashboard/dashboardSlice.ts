import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../services/api';
import type { RootState } from '../../app/store';


interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  birth_date?: string;  // Date in ISO format (YYYY-MM-DD)
  sex?: 'Male' | 'Female' | 'Other' | 'Unknown';
  phone: string;        // Changed from number to string
  email?: string;
  address?: string;
  status: 'New' | 'Follow-up' | 'Recovered';
  last_visit: string;   // Changed from lastVisit to last_visit to match backend
  created_at?: string;  // Timestamp when record was created
  created_by?: string;  // Changed from number to string (UUID)
  updated_at?: string;  // Timestamp when record was last updated
}

interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'canceled';
  created_by: string;
}

interface DashboardState {
  appointments: Appointment[];
  patients: Patient[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  addPatientStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updatePatientStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  deletePatientStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  addAppointmentStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateAppointmentStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  deleteAppointmentStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DashboardState = {
  appointments: [],
  patients: [],
  status: 'idle',
  addPatientStatus: 'idle',
  updatePatientStatus: 'idle',
  deletePatientStatus: 'idle',
  addAppointmentStatus: 'idle',
  updateAppointmentStatus: 'idle',
  deleteAppointmentStatus: 'idle',
  error: null
};

// Patient thunks
export const fetchPatients = createAsyncThunk(
  'dashboard/fetchPatients',
  async (_, { getState, rejectWithValue }) => {
    try {
     const state = getState() as RootState; // Assume RootState is properly typed
      const token = state.user.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axiosInstance.get('/patients', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (err: any) {
      console.error('Fetch Patients Error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || 'Failed to fetch patients');
    }
  }
);



// Updated thunks with consistent token access

// Patient thunks
export const addPatient = createAsyncThunk(
  'dashboard/addPatient',
  async (patientData: Omit<Patient, 'id'>, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axiosInstance.post('/patients', patientData, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      return response.data;
    } catch (err: any) {
      console.error('Add Patient Error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || 'Failed to add patient');
    }
  }
);

export const updatePatient = createAsyncThunk(
  'dashboard/updatePatient',
  async (patientData: Patient, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axiosInstance.put(
        `/patients/${patientData.id}`,
        patientData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return response.data;
    } catch (err: any) {
      console.error('Update Patient Error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || 'Failed to update patient');
    }
  }
);

export const deletePatient = createAsyncThunk(
  'dashboard/deletePatient',
  async (patientId: string, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        return rejectWithValue('No authentication token found');
      }

      await axiosInstance.delete(
        `/patients/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return patientId;
    } catch (err: any) {
      console.error('Delete Patient Error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || 'Failed to delete patient');
    }
  }
);

// Appointment thunks
export const fetchAppointments = createAsyncThunk(
  'dashboard/fetchAppointments',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axiosInstance.get('/appointments', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch appointments');
    }
  }
);

export const addAppointment = createAsyncThunk(
  'dashboard/addAppointment',
  async (appointmentData: Omit<Appointment, 'id'>, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axiosInstance.post(
        '/appointments', 
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to add appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'dashboard/updateAppointment',
  async (appointmentData: Appointment, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axiosInstance.put(
        `/appointments/${appointmentData.id}`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to update appointment');
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'dashboard/deleteAppointment',
  async (appointmentId: string, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { token: string | null } };
      if (!user.token) {
        return rejectWithValue('No authentication token found');
      }

      await axiosInstance.delete(
        `/appointments/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      return appointmentId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to delete appointment');
    }
  }
);
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    resetPatientStatus: (state) => {
      state.addPatientStatus = 'idle';
      state.updatePatientStatus = 'idle';
      state.deletePatientStatus = 'idle';
      state.error = null;
    },
    resetAppointmentStatus: (state) => {
      state.addAppointmentStatus = 'idle';
      state.updateAppointmentStatus = 'idle';
      state.deleteAppointmentStatus = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Patients
      .addCase(fetchPatients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPatients.fulfilled, (state, action: PayloadAction<Patient[]>) => {
        state.status = 'succeeded';
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch patients';
      })

      .addCase(addPatient.pending, (state) => {
        state.addPatientStatus = 'loading';
      })
      .addCase(addPatient.fulfilled, (state, action: PayloadAction<Patient>) => {
        state.addPatientStatus = 'succeeded';
        state.patients.unshift(action.payload);
      })
      .addCase(addPatient.rejected, (state, action) => {
        state.addPatientStatus = 'failed';
        state.error = action.payload as string || 'Failed to add patient';
      })

      .addCase(updatePatient.pending, (state) => {
        state.updatePatientStatus = 'loading';
      })
      .addCase(updatePatient.fulfilled, (state, action: PayloadAction<Patient>) => {
        state.updatePatientStatus = 'succeeded';
        const index = state.patients.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.updatePatientStatus = 'failed';
        state.error = action.payload as string || 'Failed to update patient';
      })

      .addCase(deletePatient.pending, (state) => {
        state.deletePatientStatus = 'loading';
      })
      .addCase(deletePatient.fulfilled, (state, action: PayloadAction<string>) => {
        state.deletePatientStatus = 'succeeded';
        state.patients = state.patients.filter(patient => patient.id !== action.payload);
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.deletePatientStatus = 'failed';
        state.error = action.payload as string || 'Failed to delete patient';
      })

      // Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch appointments';
      })

      .addCase(addAppointment.pending, (state) => {
        state.addAppointmentStatus = 'loading';
      })
      .addCase(addAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.addAppointmentStatus = 'succeeded';
        state.appointments.unshift(action.payload);
      })
      .addCase(addAppointment.rejected, (state, action) => {
        state.addAppointmentStatus = 'failed';
        state.error = action.payload as string || 'Failed to add appointment';
      })

      .addCase(updateAppointment.pending, (state) => {
        state.updateAppointmentStatus = 'loading';
      })
      .addCase(updateAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.updateAppointmentStatus = 'succeeded';
        const index = state.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.updateAppointmentStatus = 'failed';
        state.error = action.payload as string || 'Failed to update appointment';
      })

      .addCase(deleteAppointment.pending, (state) => {
        state.deleteAppointmentStatus = 'loading';
      })
      .addCase(deleteAppointment.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteAppointmentStatus = 'succeeded';
        state.appointments = state.appointments.filter(appointment => appointment.id !== action.payload);
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.deleteAppointmentStatus = 'failed';
        state.error = action.payload as string || 'Failed to delete appointment';
      });
  }
});

export const { 
  resetPatientStatus,
  resetAppointmentStatus 
} = dashboardSlice.actions;
export default dashboardSlice.reducer;