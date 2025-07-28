import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { 
  addPatient,
  fetchPatients,
  updatePatient,
  deletePatient,
  resetPatientStatus
} from '../features/dashboard/dashboardSlice';
import { toast } from 'react-toastify';
import PatientFormModal from '../components/PatientFormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

export default function PatientPage() {
  const { t, i18n } = useTranslation();
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const dispatch = useAppDispatch();
  
  const { patients, status, error, addPatientStatus, updatePatientStatus, deletePatientStatus } = useAppSelector((state) => state.dashboard);
const navigate = useNavigate();

  // Reset patient form status on mount
  useEffect(() => {
    dispatch(resetPatientStatus());
  }, [dispatch]);

  // Fetch dashboard data
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPatients());
    }
  }, [status, dispatch]);

  // Handle all status changes
  useEffect(() => {
    if (addPatientStatus === 'succeeded') {
      toast.success(t('dashboard.patientAddedSuccess'));
      dispatch(fetchPatients());
      setShowAddPatientModal(false);
    } else if (addPatientStatus === 'failed') {
      toast.error(t('dashboard.failedToAddPatient'));
    }

    if (updatePatientStatus === 'succeeded') {
      toast.success(t('dashboard.patientUpdatedSuccess'));
      dispatch(fetchPatients());
      setShowEditPatientModal(false);
    } else if (updatePatientStatus === 'failed') {
      toast.error(t('dashboard.failedToUpdatePatient'));
    }

    if (deletePatientStatus === 'succeeded') {
      toast.success(t('dashboard.patientDeletedSuccess'));
      dispatch(fetchPatients());
      setShowDeleteModal(false);
    } else if (deletePatientStatus === 'failed') {
      toast.error(t('dashboard.failedToDeletePatient'));
    }

    // Reset status after showing toast
    if (addPatientStatus === 'succeeded' || updatePatientStatus === 'succeeded' || deletePatientStatus === 'succeeded') {
      dispatch(resetPatientStatus());
    }
  }, [addPatientStatus, updatePatientStatus, deletePatientStatus, dispatch, t]);

  const handleAddPatient = async (patientData: any) => {
    try {
      const user = JSON.parse(localStorage.getItem('user')!);
      const payload = {
        ...patientData,
        created_by: user.id,
      };

      await dispatch(addPatient(payload)).unwrap();
    } catch (err) {
      console.error('Failed to add patient:', err);
    }
  };

  const handleUpdatePatient = async (patientData: any) => {
    try {
      await dispatch(updatePatient({
        id: selectedPatient.id,
        ...patientData
      })).unwrap();
    } catch (err) {
      console.error('Failed to update patient:', err);
    }
  };

  const handleDeletePatient = async () => {
    try {
      await dispatch(deletePatient(selectedPatient.id)).unwrap();
    } catch (err) {
      console.error('Failed to delete patient:', err);
    }
  };

  const openEditModal = (patient: any) => {
    setSelectedPatient(patient);
    setShowEditPatientModal(true);
  };

  const openDeleteModal = (patient: any) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  // Format patient name for display
  const formatPatientName = (patient: any) => {
    return `${patient.first_name} ${patient.last_name}`;
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  return (
    <div className={`container-fluid px-3 px-md-4 py-3 ${i18n.language === 'ar' ? 'text-right' : ''}`}>
    

      <div className="card">
        <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center py-3">
          <h5 className="mb-2 mb-md-0">{t('dashboard.recentPatients')}</h5>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => setShowAddPatientModal(true)}
            disabled={addPatientStatus === 'loading'}
          >
            <i className={`bi bi-plus ${i18n.language === 'ar' ? 'ms-1' : 'me-1'}`}></i>
            {t('dashboard.addPatient')}
          </button>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>{t('dashboard.patientId')}</th>
                  <th>{t('dashboard.name')}</th>
                  <th>{t('dashboard.mobile')}</th>
                  <th>{t('dashboard.status')}</th>
                  <th>{t('dashboard.actions')}</th> {/* You can add this to your translations */}

                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.slice(0, 5).map((patient) => (
                    <tr key={patient.id}>
                      <td>#{patient.id}</td>
                      <td><div className="d-flex flex-column">
                          <strong>{formatPatientName(patient)}</strong>
                          
                        </div></td>
                      <td>{patient.phone ? formatPhoneNumber(patient.phone) : '-'}</td>
                      <td>
                        <span className={`badge ${patient.status === 'New' ? 'bg-primary' : patient.status === 'Recovered' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {t(`patientStatus.${patient.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td>
 <td className="d-flex gap-2">
  <button
    className="btn btn-outline-primary btn-sm"
    onClick={() => navigate(`/dashboard/sessions?patientId=${patient.id}`)}
    title={t('dashboard.viewSessions')}
  >
    <i className="bi bi-journal-text"></i>
  </button>

  <button
    className="btn btn-outline-warning btn-sm"
    onClick={() => openEditModal(patient)}
    title={t('dashboard.editPatient')}
  >
    <i className="bi bi-pencil-square"></i>
  </button>

  <button
    className="btn btn-outline-danger btn-sm"
    onClick={() => openDeleteModal(patient)}
    title={t('dashboard.deletePatient')}
  >
    <i className="bi bi-trash"></i>
  </button>
</td>

</td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      {t('dashboard.noPatients')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Add Patient Modal */}
      <PatientFormModal
        show={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onSubmit={handleAddPatient}
        isLoading={addPatientStatus === 'loading'}
        error={addPatientStatus === 'failed' ? error : null}
      />

      {/* Edit Patient Modal */}
      <PatientFormModal
        show={showEditPatientModal}
        onClose={() => setShowEditPatientModal(false)}
        onSubmit={handleUpdatePatient}
        isLoading={updatePatientStatus === 'loading'}
        error={updatePatientStatus === 'failed' ? error : null}
        patient={selectedPatient}
        isEditMode={true}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePatient}
        isLoading={deletePatientStatus === 'loading'}
        title={t('dashboard.confirmDelete')}
        message={t('dashboard.areYouSureDeletePatient', { name: selectedPatient ? formatPatientName(selectedPatient) : '' })}
      />
    </div>
  );
}