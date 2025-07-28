import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchSessionsByPatientId } from '../features/sessions/sessionSlice';
import { FaEye } from 'react-icons/fa';  // We'll use react-icons for the view icon
import { useTranslation } from 'react-i18next';

export default function SessionsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const patientId = searchParams.get('patientId');

  // Pull sessions and loading/error state from Redux
  const sessions = useAppSelector((state) => state.session.sessions);
  const fetchStatus = useAppSelector((state) => state.session.fetchSessionsStatus);
  const error = useAppSelector((state) => state.session.error);
  const { t } = useTranslation();

  // Fetch sessions when patientId changes and is valid
  useEffect(() => {
    if (patientId) {
      dispatch(fetchSessionsByPatientId(patientId));
    }
  }, [dispatch, patientId]);

  return (
     <div className="container py-3">
      <h3>{t('dashboard.sessionsForPatient', { patientId })}</h3>

      <button
        className="btn btn-success mb-3"
        onClick={() => {
          sessionStorage.setItem('newSession', 'true');
          navigate(`/dashboard/sessions/create?patientId=${patientId}`);
        }}
        disabled={!patientId}
      >
        {t('dashboard.createSession')}
      </button>

      {fetchStatus === 'loading' && <p>{t('loading')}</p>}
      {fetchStatus === 'failed' && <p className="text-danger">{t('dashboard.error', { error })}</p>}
      {fetchStatus === 'succeeded' && sessions.length === 0 && <p>{t('dashboard.noSessions')}</p>}

      {fetchStatus === 'succeeded' && sessions.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>{t('dashboard.sessionId')}</th>
                <th>{t('dashboard.status')}</th>
                <th>{t('dashboard.createdAt')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/dashboard/session/${session.id}`)}
                >
                  <td>{session.id}</td>
                  <td>{session.status}</td>
                  <td>{new Date(session.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-link p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/session/${session.id}`);
                      }}
                      aria-label={t('dashboard.viewDetails')}
                    >
                      <FaEye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
