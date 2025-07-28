import { useTranslation } from 'react-i18next';
import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { 
  fetchPatients,
  fetchAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  resetAppointmentStatus
} from '../features/dashboard/dashboardSlice';
import { toast } from 'react-toastify';
import AppointmentFormModal from '../components/AppointmentFormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Link } from 'react-router-dom';

// Utility function for safe date formatting
const safeFormatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const dispatch = useAppDispatch();
  
  const { 
    appointments,
    patients,
    status,
    addAppointmentStatus,
    updateAppointmentStatus,
    deleteAppointmentStatus,
    error
  } = useAppSelector((state) => state.dashboard);

  // Debugging
  useEffect(() => {
    console.log('Appointments data:', {
      count: appointments.length,
      sample: appointments[0],
      loadingStatus: status
    });
  }, [appointments, status]);

  // Reset status on mount
  useEffect(() => {
    dispatch(resetAppointmentStatus());
  }, [dispatch]);

  // Fetch data on mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAppointments());
      dispatch(fetchPatients());
    }
  }, [status, dispatch]);

  // Memoize status effect dependencies
  const statusEffectDeps = useMemo(() => [
    addAppointmentStatus, 
    updateAppointmentStatus, 
    deleteAppointmentStatus, 
    t, 
    error
  ], [addAppointmentStatus, updateAppointmentStatus, deleteAppointmentStatus, t, error]);

  // Handle status changes
  useEffect(() => {
    if (addAppointmentStatus === 'succeeded') {
      toast.success(t('appointments.addedSuccess'));
      setShowAddModal(false);
    } else if (addAppointmentStatus === 'failed') {
      toast.error(error || t('appointments.failedToAdd'));
    }

    if (updateAppointmentStatus === 'succeeded') {
      toast.success(t('appointments.updatedSuccess'));
      setShowEditModal(false);
    } else if (updateAppointmentStatus === 'failed') {
      toast.error(error || t('appointments.failedToUpdate'));
    }

    if (deleteAppointmentStatus === 'succeeded') {
      toast.success(t('appointments.deletedSuccess'));
      setShowDeleteModal(false);
    } else if (deleteAppointmentStatus === 'failed') {
      toast.error(error || t('appointments.failedToDelete'));
    }
  }, statusEffectDeps);

 const handleAddAppointment = async (appointmentData: any) => {
    try {
        // You'll need to get the 'created_by' value from your application's state,
        // likely from an authentication context or a user slice in Redux.
        // For demonstration, let's assume you have a 'userId' variable.
              const user = JSON.parse(localStorage.getItem('user')!);
 // Replace with actual user ID from your app's state

      await dispatch(addAppointment({
            ...appointmentData,
            created_by: user.id // Add the missing created_by field
        })).unwrap();
    } catch (err) {
      console.error('Failed to add appointment:', err);
    }
  };

  const handleUpdateAppointment = async (appointmentData: any) => {
    try {
      await dispatch(updateAppointment({
        ...appointmentData,
        id: selectedAppointment.id,
        patient_id: selectedAppointment.patient_id,
        created_by: selectedAppointment.created_by
      })).unwrap();
    } catch (err) {
      console.error('Failed to update appointment:', err);
    }
  };

  const handleDeleteAppointment = async () => {
    try {
      await dispatch(deleteAppointment(selectedAppointment.id)).unwrap();
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    }
  };

  const openEditModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const openDeleteModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // Display only hours and minutes
  };


 // Format patient name for display
  const formatPatientName = (patient: any) => {
    return `${patient.first_name} ${patient.last_name}`;
  };


  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t('appointments.appointments') || 'Appointments'}</h4>
        <div>
         
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            disabled={addAppointmentStatus === 'loading'}
          >
            {addAppointmentStatus === 'loading' ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-plus-lg me-2"></i>
            )}
            {t('appointments.addAppointment') || 'Add Appointment'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{t('appointments.patient') || 'Patient'}</th>
                  <th>{t('appointments.date') || 'Date'}</th>
                  <th>{t('appointments.time') || 'Time'}</th>
                  <th>{t('appointments.purpose') || 'Purpose'}</th>
                  <th>{t('appointments.status') || 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                         <div className="d-flex flex-column">
                          <strong>{formatPatientName(appointment)}</strong>
                          
                        </div>
                        <small className="text-muted">
                          ID: {appointment.patient_id?.substring(0, 8) || 'N/A'}
                        </small>
                      </td>
                      <td>
                        {safeFormatDate(appointment.appointment_date)}
                      </td>
                      <td>{formatTime(appointment.appointment_time)}</td>
                      <td>{appointment.reason || 'N/A'}</td>
                      <td>
                        <span className={`badge ${
                          appointment.status === 'scheduled' ? 'bg-primary' : 
                          appointment.status === 'completed' ? 'bg-success' : 
                          appointment.status === 'canceled' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {appointment.status ? t(`appointmentStatus.${appointment.status.toLowerCase()}`) || appointment.status : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditModal(appointment)}
                            disabled={updateAppointmentStatus === 'loading'}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openDeleteModal(appointment)}
                            disabled={deleteAppointmentStatus === 'loading'}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      {status === 'loading' ? (
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        t('appointments.noAppointments') || 'No appointments found'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AppointmentFormModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddAppointment}
        isLoading={addAppointmentStatus === 'loading'}
        error={addAppointmentStatus === 'failed' ? error : null}
        patients={patients}
      />

      <AppointmentFormModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateAppointment}
        isLoading={updateAppointmentStatus === 'loading'}
        error={updateAppointmentStatus === 'failed' ? error : null}
        appointment={selectedAppointment}
        patients={patients}
        isEditMode={true}
      />

      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAppointment}
        isLoading={deleteAppointmentStatus === 'loading'}
        title={t('appointments.confirmDelete') || 'Confirm Deletion'}
        message={t('appointments.areYouSureDelete', { 
          patient: selectedAppointment?.patient_name || 'this appointment',
          date: selectedAppointment?.appointment_date ? 
            safeFormatDate(selectedAppointment.appointment_date) : ''
        }) || `Are you sure you want to delete this appointment?`}
      />
    </div>
  );
}