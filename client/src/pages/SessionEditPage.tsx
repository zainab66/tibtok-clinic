// src/pages/SessionEditPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchSessionById, updateSessionById } from '../features/sessions/sessionSlice';

export default function SessionEditPage() {
  const { sessionId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const session = useAppSelector((state) => state.session.currentSession);
  const updateStatus = useAppSelector((state) => state.session.updateStatus);

  const [formData, setFormData] = useState({
    transcript: '',
    ai_summary: '',
    status: '',
  });

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSessionById(sessionId));
    }
  }, [dispatch, sessionId]);

  useEffect(() => {
    if (session) {
      setFormData({
        transcript: session.transcript || '',
        ai_summary: session.ai_summary || '',
        status: session.status || '',
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    await dispatch(updateSessionById({ id: sessionId, data: formData }));
    navigate(`/dashboard/session/${sessionId}`); // or wherever you want
  };

  return (
    <div className="container">
      <h2>Edit Session</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Transcript</label>
          <textarea
            name="transcript"
            className="form-control"
            value={formData.transcript}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label>AI Summary</label>
          <textarea
            name="ai_summary"
            className="form-control"
            value={formData.ai_summary}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label>Status</label>
          <input
            name="status"
            className="form-control"
            value={formData.status}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={updateStatus === 'loading'}>
          {updateStatus === 'loading' ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
