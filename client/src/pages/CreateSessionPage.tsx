import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  setStatus,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  addAudioChunk,
  incrementTimer,
  sendAudioForProcessing,
  resetSession,
  setCurrentTemplate,
  setCurrentPatientId,
} from '../features/sessions/sessionSlice';
import type { RootState, AppDispatch } from '../app/store';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Form,
  Card,
  ProgressBar,
} from 'react-bootstrap';
import {
  fetchTemplates,
  selectAllTemplates,
  selectTemplatesStatus,
  selectTemplatesError,
} from '../features/templateSlice';

const mimeType = 'audio/webm;codecs=opus';

const CreateSessionPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const patientIdFromUrl = searchParams.get('patientId');
  const templates = useSelector(selectAllTemplates);
  const templatesStatus = useSelector(selectTemplatesStatus);
  const templatesError = useSelector(selectTemplatesError);
  const {
    isRecording,
    isPaused,
    timer,
    transcript,
    summary,
    status, // This is your Redux status ('idle' | 'loading' | 'succeeded' | 'failed' | 'processing')
    error,
    currentPatientId,
    currentTemplate,
    // mediaRecorder, // No direct use, but part of slice
    audioChunks,
  } = useSelector((state: RootState) => state.session);

  const { user: currentUserData, token: userTokenFromState } = useSelector(
    (state: RootState) => state.user
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isRetrying, setIsRetrying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

const [selectedLanguage, setSelectedLanguage] = useState('en-US'); // Default language

const languageOptions = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'ru', label: 'Russian' },
  { value: 'hi', label: 'Hindi' },
];


  // Add this useEffect to load persisted data
  useEffect(() => {
    if (currentPatientId && currentTemplate && !isRecording) {
      // This will use the persisted data automatically
    }
  }, [currentPatientId, currentTemplate, isRecording]);

  // --- START OF THE CRUCIAL CHANGE ---
  // Modify this useEffect to *only* set status to 'succeeded' if:
  // 1. Transcript and summary exist (implying data is loaded/persisted).
  // 2. The current status is 'idle' (meaning no active operation is underway
  //    that would naturally transition the status).
  // This prevents it from prematurely setting status to 'succeeded' while
  // sendAudioForProcessing is actively running and status is 'loading'.
  useEffect(() => {
    if (transcript && summary && status === 'idle') {
      dispatch(setStatus('succeeded'));
    }
  }, [status, transcript, summary, dispatch]);
  // --- END OF THE CRUCIAL CHANGE ---

  useEffect(() => {
    const isNewSession = sessionStorage.getItem('newSession') === 'true';

    if (isNewSession) {
      dispatch(resetSession());
      sessionStorage.removeItem('newSession'); // Clear the flag immediately
    }

    if (templatesStatus === 'idle') {
      dispatch(fetchTemplates());
    }

    if (patientIdFromUrl) {
      dispatch(setCurrentPatientId(patientIdFromUrl));
      dispatch(setCurrentTemplate(''));
    }
  }, [dispatch, patientIdFromUrl, templatesStatus]);

  useEffect(() => {
    if (templatesStatus === 'idle') {
      dispatch(fetchTemplates());
    }
  }, [templatesStatus, dispatch]);

  useEffect(() => {
    if (patientIdFromUrl && !currentPatientId) {
      dispatch(setCurrentTemplate('')); // Default template fallback
    }
  }, [patientIdFromUrl, currentPatientId, dispatch]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        dispatch(incrementTimer());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, isPaused, dispatch]);

  const handleStartRecording = async () => {
     
  if (!currentUserData?.id || !userTokenFromState) {
    alert('Authentication error: Please log in.');
    return;
  }

  if (!patientIdFromUrl) {
    alert('Missing patient ID.');
    return;
  }

  if (!currentTemplate) {
    alert('Please select a template before starting.');
    return;
  }
    const sessionId = uuidv4();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        alert('Browser does not support audio/webm;codecs=opus.');
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const localChunks: Blob[] = [];
      const newMediaRecorder = new MediaRecorder(stream, { mimeType });

      newMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          dispatch(addAudioChunk(event.data));
          localChunks.push(event.data);
        }
      };

      newMediaRecorder.onstop = async () => {
        const audioBlob = new Blob(localChunks, { type: mimeType });

        // Phase 1: Simulate Uploading (controlled by local state)
        setIsUploading(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate ~0.8 seconds upload
        setIsUploading(false); // End the local 'uploading' phase

        // Phase 2: Dispatch processing (controlled by Redux status 'loading')
        // The sendAudioForProcessing.pending action will set Redux status to 'loading'.
        const resultAction = await dispatch(
          sendAudioForProcessing({
            audioBlob,
            patientId: patientIdFromUrl!,
            template: currentTemplate,
            userId: currentUserData.id,
            language: selectedLanguage,
          })
        );

        if (sendAudioForProcessing.rejected.match(resultAction)) {
          console.error('Processing failed after stop:', resultAction.payload);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      newMediaRecorder.start();
      dispatch(
        startRecording({
          mediaRecorder: newMediaRecorder,
          patientId: patientIdFromUrl!,
          template: currentTemplate,
          sessionId,
        })
      );
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Microphone access failed.');
      dispatch(stopRecording());
    }
  };

  const handleStopRecording = () => {
    dispatch(stopRecording());
  };
  const handlePauseRecording = () => dispatch(pauseRecording());
  const handleResumeRecording = () => dispatch(resumeRecording());

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${
      remainingSeconds < 10 ? '0' : ''
    }${remainingSeconds}`;
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRecording || isUploading || status === 'loading') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [status, isRecording, isUploading]);



const showProcessingUI = isUploading || status === 'loading' || isRetrying;


useEffect(() => {
  // Initialize with empty template if none selected
  if (!currentTemplate) {
    dispatch(setCurrentTemplate('')); // Explicit empty string
  }
}, [dispatch, currentTemplate]);

console.log('Current template value:', currentTemplate);
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-5">Create New Session</h1>
        </Col>
      </Row>

     {/* Template Selection */}
<Row className="mb-4">
  <Col md={6}>
    <Form.Group controlId="templateSelect">
      <Form.Label>Select Template</Form.Label>
      {templatesStatus === 'loading' ? (
        <Spinner animation="border" size="sm" />
      ) : templatesError ? (
        <Alert variant="warning">
          Failed to load templates: {templatesError}
        </Alert>
      ) : (
        <>
          <Form.Select
            value={currentTemplate || ''}
            onChange={(e) => {
              if (!e.target.value) return;
              dispatch(setCurrentTemplate(e.target.value));
            }}
            required
            className={!currentTemplate ? 'is-invalid' : ''}
            disabled={isRecording || showProcessingUI}
          >
            <option value="">Select a template (required)</option>
            {templates.map((template) => (
              <option key={template.id} value={template.template_slug}>
                {template.template_slug}
              </option>
            ))}
          </Form.Select>
          {!currentTemplate && (
            <div className="invalid-feedback d-block">
              Please select a template to continue
            </div>
          )}
        </>
      )}
    </Form.Group>
  </Col>
</Row>


{/* Language Selection */}
<Row className="mb-4">
  <Col md={6}>
    <Form.Group controlId="languageSelect">
      <Form.Label>Select Language</Form.Label>
      <Form.Select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        disabled={isRecording || showProcessingUI}
      >
        {languageOptions.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  </Col>
</Row>

      {/* Recording Controls */}
      {status !== 'succeeded' && (
        <Row className="align-items-center mb-4">
          <Col md="auto">
            <h3 className="text-monospace border rounded p-2 bg-light">
              ⏱ {formatTime(timer)}
            </h3>
          </Col>

          <Col>
            <div className="d-flex flex-wrap gap-3">



<Button
  variant="success"
  size="lg"
  onClick={handleStartRecording}
  disabled={!currentTemplate || isRecording || status !== 'idle'}
  className={!currentTemplate ? 'disabled' : ''}
>
  {isRecording ? 'Recording...' : 'Start Recording'}
</Button>



  <Button
    variant="danger"
    size="lg"
    onClick={handleStopRecording}
    disabled={!isRecording || showProcessingUI}
  >
    Stop
  </Button>

  {isRecording && (
    <Button
      variant="warning"
      size="lg"
      onClick={isPaused ? handleResumeRecording : handlePauseRecording}
      disabled={showProcessingUI}
    >
      {isPaused ? 'Resume' : 'Pause'}
    </Button>
  )}
</div>
          </Col>
        </Row>
      )}

      {/* Modern Status & Progress */}
      {showProcessingUI && (
        <div className="mt-4 mb-4">
          {isUploading && (
            <Alert variant="info" className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              Uploading audio... Please wait.
            </Alert>
          )}

         {(status === 'loading' && !isUploading) && (
  <Alert variant="info" className="d-flex align-items-center">
    <Spinner animation="grow" size="sm" className="me-2" />
    Processing audio and generating summary... This may take a few moments.
  </Alert>
)}
          {isRetrying && (
            <Alert variant="warning" className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              Retrying upload and processing...
            </Alert>
          )}

          <ProgressBar animated now={100} className="mt-2" />
        </div>
      )}

      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <div>
            <strong>Error:</strong>{' '}
            {typeof error === 'string'
              ? error
              : (error as { message: string })?.message || 'An error occurred'}
          </div>
          <Button
            variant="outline-light"
            size="sm"
            disabled={
              isRetrying ||
              !audioChunks.length ||
              !currentUserData?.id ||
              !currentTemplate ||
              !patientIdFromUrl
            }
            onClick={async () => {
              setIsRetrying(true);
              try {
                if (
                  audioChunks.length &&
                  currentUserData?.id &&
                  currentTemplate &&
                  patientIdFromUrl
                ) {
                  const audioBlob = new Blob(audioChunks, { type: mimeType });
                  setIsUploading(true);
                  await new Promise(resolve => setTimeout(resolve, 800));
                  setIsUploading(false);

                  await dispatch(
                    sendAudioForProcessing({
                      audioBlob,
                      patientId: patientIdFromUrl,
                      template: currentTemplate,
                      userId: currentUserData.id,
                       language: selectedLanguage,
                    })
                  );
                }
              } finally {
                setIsRetrying(false);
              }
            }}
          >
            {isRetrying ? '⏳ Retrying...' : '🔁 Retry'}
          </Button>
        </Alert>
      )}

      {/* Transcript & Summary */}
      {status === 'succeeded'  && transcript && summary &&(
        <>
          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Transcription & Summary</Card.Title>

              <Card.Subtitle className="mt-3 mb-2 text-muted">Transcript</Card.Subtitle>
              <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
                {transcript?.trim() || '⚠️ Empty or missing transcript.'}
              </Card.Text>

              <Card.Subtitle className="mt-4 mb-2 text-muted">AI Summary</Card.Subtitle>
              <Card.Text
                dangerouslySetInnerHTML={{
                  __html: summary?.trim() || '⚠️ No summary generated.',
                }}
              />
            </Card.Body>
          </Card>

          <div className="mt-3 text-end">
            <Button variant="secondary" onClick={() => dispatch(resetSession())}>
              🔄 Start New Recording
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default CreateSessionPage;