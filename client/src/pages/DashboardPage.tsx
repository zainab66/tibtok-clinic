import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { resetPatientStatus, addPatient, fetchPatients } from '../features/dashboard/dashboardSlice';
import Spinner from '../components/Spinner';
import PatientFormModal from '../components/PatientFormModal';
import { toast } from 'react-toastify';

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


export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { 
    patients, 
    status, 
    error, 
    addPatientStatus 
  } = useAppSelector((state) => state.dashboard);

  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  useEffect(() => {
    dispatch(resetPatientStatus());
    dispatch(fetchPatients());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    if (addPatientStatus === 'succeeded') {
      toast.success(t('patient.patientAddedSuccess'));
      setShowAddPatientModal(false);
      dispatch(fetchPatients());
    } else if (addPatientStatus === 'failed') {
      toast.error(error || t('patient.failedToAddPatient'));
    }
  }, [addPatientStatus, dispatch, t, error]);

  const handleAddPatient = async (patientData: Omit<Patient, 'id'>) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        ...patientData,
        created_by: user.id,
      };
      await dispatch(addPatient(payload)).unwrap();
    } catch (err) {
      console.error('Failed to add patient:', err);
    }
  };

  if (status === 'loading') return <Spinner />;
if (status === 'failed') {
    // Determine the error message to display
    let errorMessageToDisplay = t('error.loading'); // Default fallback

    if (error) {
      if (typeof error === 'string') {
        errorMessageToDisplay = error;
      } else if (typeof error === 'object' && error !== null && 'msg' in error) {
        // This is the specific case for { msg: "Token is not valid" }
        errorMessageToDisplay = (error as { msg: string }).msg;
      }
      // You could add other checks if your backend sends other error object formats
    }
    
    return <div className="alert alert-danger">{errorMessageToDisplay}</div>;
  }
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
      <h4 className="mb-4">{t('dashboard.title')}</h4>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{t('dashboard.totalPatients')}</h5>
              <div className="d-flex align-items-center">
                <h2 className="mb-0">1,284</h2>
                <span className="text-success ms-2">
                  {t('dashboard.increasePercentage', { percentage: 12, period: t('time.thisMonth') })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{t('dashboard.todaysOPD')}</h5>
              <div className="d-flex align-items-center">
                <h2 className="mb-0">42</h2>
                <span className="text-success ms-2">
                  {t('dashboard.increasePercentage', { percentage: 3, period: t('time.fromYesterday') })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{t('dashboard.followUps')}</h5>
              <div className="d-flex align-items-center">
                <h2 className="mb-0">17</h2>
                <span className="text-danger ms-2">
                  {t('dashboard.decreasePercentage', { percentage: 5, period: t('time.fromLastWeek') })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{t('dashboard.revenue')}</h5>
              <div className="d-flex align-items-center">
                <h2 className="mb-0">
                  {t('dashboard.currencyValue', { value: '84,620' })}
                </h2>
                <span className="text-success ms-2">
                  {t('dashboard.increasePercentage', { percentage: 6, period: t('time.thisMonth') })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <PatientFormModal
        show={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onSubmit={handleAddPatient}
        isLoading={addPatientStatus === 'loading'}
        error={addPatientStatus === 'failed' ? error : null}
      />
    </div>
  );
}