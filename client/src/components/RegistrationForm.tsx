import React, { useState, useEffect } from 'react'; // Import useEffect
import { Form, Button, Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap'; // Import Card
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { registerUser } from '../features/userSlice';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

const RegisterForm: React.FC = () => {
  const { t, i18n } = useTranslation(); // Destructure i18n for dir
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const { loading, error, user } = useAppSelector((state) => state.user);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    organization_name: '',
    organization_country: '', // This was named organization_address in your render, let's keep it consistent
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  // Redirect after successful registration
  useEffect(() => {
    if (user) {
      // You might want to show a success message briefly before redirecting
      // For now, let's just redirect immediately to a dashboard or login page
      navigate('/login'); // Or '/login' if you want them to log in after registering
    }
  }, [user, navigate]);


  return (
    // Center the content both vertically and horizontally
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      {/* Ensure the Row takes full width and centers its children */}
      <Row className="w-100 justify-content-center">
        {/*
          Define column widths for responsiveness.
          A wider form on smaller screens, getting narrower and centered on larger screens.
          Adjust these values as per your design preference.
        */}
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg my-5"> {/* Added shadow and margin for better visual separation */}
            <Card.Body className="p-4 p-md-5"> {/* Added more padding */}
              <div className="text-center mb-4">
                <h3 className="fw-bold">{t('register.register')}</h3>
                <p className="text-muted mb-4">{t('register.create_account_prompt') || 'Create your account'}</p>
              </div>

              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              {user && (
                <Alert variant="success" className="text-center">
                  {t('registered_success', { email: user.email }) || `Successfully registered ${user.email}!`}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3"> {/* Group first and last name in one row */}
                  <Col md={6}>
                    <Form.Group controlId="formFirstName">
                      <Form.Label className="fw-medium">{t('register.first_name')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        onChange={handleChange}
                        required
                        className="py-2"
                        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formLastName">
                      <Form.Label className="fw-medium">{t('register.last_name')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        onChange={handleChange}
                        required
                        className="py-2"
                        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label className="fw-medium">{t('register.email')}</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    onChange={handleChange}
                    required
                    placeholder={t('register.email_placeholder') || 'Enter your email'}
                    className="py-2"
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label className="fw-medium">{t('register.password')}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    onChange={handleChange}
                    required
                    placeholder={t('register.password_placeholder') || 'Create a password'}
                    className="py-2"
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formOrganizationName">
                  <Form.Label className="fw-medium">{t('register.organization_name')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="organization_name"
                    onChange={handleChange}
                    required
                    placeholder={t('register.organization_name_placeholder') || 'Your organization name'}
                    className="py-2"
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formOrganizationCountry">
                  <Form.Label className="fw-medium">{t('register.organization_country')}</Form.Label>
                  <Form.Control
                    type="text" // Or use a <Form.Select> for countries
                    name="organization_country"
                    onChange={handleChange}
                    placeholder={t('register.organization_country_placeholder') || 'e.g., Canada'}
                    className="py-2"
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-100 py-2 mt-3 fw-medium"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">{t('register.submitting') || 'Registering...'}</span>
                    </>
                  ) : (
                    t('register.register_button') || 'Register Account'
                  )}
                </Button>

                <div className={`text-center mt-4 ${i18n.language === 'ar' ? 'text-end' : 'text-start'}`}>
                  <small className="text-muted">
                    {t('register.have_account')}{' '}
                    <Link to="/login" className="text-decoration-none fw-medium">
                      {t('register.login_here')}
                    </Link>
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterForm;