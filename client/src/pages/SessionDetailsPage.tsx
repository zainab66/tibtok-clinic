import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchSessionById,
  clearCurrentSession,
  deleteSessionById
} from '../features/sessions/sessionSlice';
import { useTranslation } from 'react-i18next';

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const session = useAppSelector((state) => state.session.currentSession);
  const fetchStatus = useAppSelector((state) => state.session.fetchSessionStatus);
  const error = useAppSelector((state) => state.session.error);

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSessionById(sessionId));
    }
    return () => {
      dispatch(clearCurrentSession());
    };
  }, [dispatch, sessionId]);

  const handleEdit = () => {
    navigate(`/dashboard/sessions/edit/${sessionId}`);
  };

  const handleDelete = async () => {
    if (sessionId && window.confirm(t('dashboard.confirmDelete'))) {
      const resultAction = await dispatch(deleteSessionById(sessionId));
      if (deleteSessionById.fulfilled.match(resultAction)) {
        navigate('/dashboard/sessions'); // redirect after successful deletion
      }
    }
  };

  return (
    <div className="container py-3">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        {t('back')}
      </button>

      {fetchStatus === 'loading' && <p>{t('dashboard.loading')}</p>}
      {fetchStatus === 'failed' && <p className="text-danger">{t('dashboard.error')}: {error}</p>}

      {fetchStatus === 'succeeded' && session && (
        <>
          <h3>{t('dashboard.sessionDetails')}</h3>
          <p><strong>{t('dashboard.sessionId')}:</strong> {session.id}</p>
          <p><strong>{t('dashboard.status')}:</strong> {session.status}</p>
          <p><strong>{t('dashboard.createdAt')}:</strong> {new Date(session.created_at).toLocaleString()}</p>
          <p><strong>{t('dashboard.transcript')}:</strong> {session.transcript || t('dashboard.noTranscript')}</p>
          <div>
            <strong>{t('dashboard.aiSummary')}:</strong>
            <div
              className="border rounded p-2 mt-1"
              dangerouslySetInnerHTML={{
                __html: session.ai_summary?.trim() || t('dashboard.noSummary'),
              }}
            />
          </div>

          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary" onClick={handleEdit}>
              ✏️ {t('dashboard.edit')}
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              🗑 {t('dashboard.delete')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
