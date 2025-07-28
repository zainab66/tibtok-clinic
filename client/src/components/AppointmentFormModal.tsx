import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface AppointmentFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  error: string | null;
  appointment?: any;
  patients: any[];
  isEditMode?: boolean;
}

export default function AppointmentFormModal({
  show,
  onClose,
  onSubmit,
  isLoading,
  error,
  appointment = null,
  patients = [],
  isEditMode = false
}: AppointmentFormModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    patient_id: '', // Changed to match API
    appointment_date: '', // Changed to match API
    appointment_time: '08:00', // Changed to match API
    reason: '', // Changed to match API
    status: 'scheduled' // Changed to lowercase
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (isEditMode && appointment) {
      // Transform data from API format to form format
      const appointmentDate = appointment.appointment_date 
        ? new Date(appointment.appointment_date) 
        : appointment.date 
        ? new Date(appointment.date) 
        : null;
      
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const validTime = (appointment.appointment_time || appointment.time) && 
        timeRegex.test(appointment.appointment_time || appointment.time) 
        ? (appointment.appointment_time || appointment.time) 
        : '08:00';

      setFormData({
        patient_id: appointment.patient_id || appointment.patientId || '',
        appointment_date: appointment.appointment_date || appointment.date || '',
        appointment_time: validTime,
        reason: appointment.reason || appointment.purpose || '',
        status: (appointment.status || 'scheduled').toLowerCase() // Ensure lowercase
      });
      
      setSelectedDate(isNaN(appointmentDate?.getTime() as number) ? new Date() : appointmentDate);
    } else {
      const now = new Date();
      const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
      setSelectedDate(nextHour);
      setFormData({
        patient_id: '',
        appointment_date: nextHour.toISOString().split('T')[0],
        appointment_time: `${nextHour.getHours().toString().padStart(2, '0')}:00`,
        reason: '',
        status: 'scheduled'
      });
    }
  }, [appointment, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({ 
        ...prev, 
        appointment_date: date.toISOString().split('T')[0] 
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.appointment_date || 
        !formData.appointment_time || !formData.reason) {
      return;
    }

    // Prepare data in correct format for API
    const submitData = {
      ...formData,
      // Include original ID if in edit mode
      ...(isEditMode && appointment && { id: appointment.id }),
      // Include created_by if needed
      ...(isEditMode && appointment && { created_by: appointment.created_by })
    };

    onSubmit(submitData);
  };

  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? t('appointments.editAppointment') : t('appointments.addAppointment')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" onClose={() => {}} dismissible>{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="formPatient">
                <Form.Label>{t('appointments.patient')} *</Form.Label>
                <Form.Select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isEditMode}
                >
                  <option value="">{t('appointments.selectPatient')}</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} (ID: {patient.id.substring(0, 8)}) - {patient.mobile}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="formStatus">
                <Form.Label>{t('appointments.status')} *</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                >
                  <option value="scheduled">{t('appointmentStatus.scheduled')}</option>
                  <option value="completed">{t('appointmentStatus.completed')}</option>
                  <option value="canceled">{t('appointmentStatus.cancelled')}</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="formDate">
                <Form.Label>{t('appointments.date')} *</Form.Label>
                <DatePicker
                  selected={selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : null}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  className="form-control"
                  dateFormat="MMMM d, yyyy"
                  required
                  disabled={isLoading}
                />
              </Form.Group>
            </div>
            
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="formTime">
                <Form.Label>{t('appointments.time')} *</Form.Label>
                <Form.Select
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3" controlId="formPurpose">
            <Form.Label>{t('appointments.purpose')} *</Form.Label>
            <Form.Control
              as="textarea"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              disabled={isLoading}
              rows={3}
              placeholder={t('appointments.purposePlaceholder')}
            />
          </Form.Group>
          
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={onClose} 
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner as="span" size="sm" animation="border" role="status" />
                  <span className="ms-2">
                    {isEditMode ? t('common.updating') : t('common.saving')}
                  </span>
                </>
              ) : (
                isEditMode ? t('common.update') : t('common.save')
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}