import { Modal, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

interface PatientFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  error: string | null;
  patient?: any;
  isEditMode?: boolean;
}

export default function PatientFormModal({ 
  show, 
  onClose, 
  onSubmit, 
  isLoading,
  error,
  patient = null,
  isEditMode = false
}: PatientFormModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    first_name: '', 
    last_name: '', 
    birth_date: '', 
    sex: '', 
    phone: '', 
    email: '', 
    address: '',
    status: 'New'
  });

  useEffect(() => {
    if (isEditMode && patient) {
      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        birth_date: patient.birth_date || '',
        sex: patient.sex || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        status: patient.status || 'New'
      });
    }
  }, [patient, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      ...(!isEditMode && { last_visit: new Date().toISOString().split('T')[0] })
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? t('dashboard.editPatient') : t('dashboard.addPatient')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formFirstName">
                <Form.Label>{t('dashboard.firstName')}</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formLastName">
                <Form.Label>{t('dashboard.lastName')}</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBirthDate">
                <Form.Label>{t('dashboard.birthDate')}</Form.Label>
                <Form.Control
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formSex">
                <Form.Label>{t('dashboard.sex')}</Form.Label>
                <Form.Select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">{t('dashboard.selectSex')}</option>
                  <option value="Male">{t('dashboard.male')}</option>
                  <option value="Female">{t('dashboard.female')}</option>
                  <option value="Other">{t('dashboard.other')}</option>
                  <option value="Unknown">{t('dashboard.unknown')}</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPhone">
                <Form.Label>{t('dashboard.phone')}</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>{t('dashboard.email')}</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="formAddress">
            <Form.Label>{t('dashboard.address')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formStatus">
            <Form.Label>{t('dashboard.status')}</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="New">{t('patientStatus.new')}</option>
              <option value="Follow-up">{t('patientStatus.follow-up')}</option>
              <option value="Recovered">{t('patientStatus.recovered')}</option>
            </Form.Select>
          </Form.Group>
          
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              {t('dashboard.cancel')}
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner as="span" size="sm" animation="border" role="status" />
                  <span className="ms-2">
                    {isEditMode ? t('common.updating') : t('common.saving')}
                  </span>
                </>
              ) : (
                isEditMode ? t('dashboard.update') : t('dashboard.save')
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}