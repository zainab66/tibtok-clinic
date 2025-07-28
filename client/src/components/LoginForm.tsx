import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginUser } from '../features/userSlice';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error,token, user } = useAppSelector((state) => state.user);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100 justify-content-center">
        <Col xs={10} sm={8} md={6} lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-center mb-4">
                <h3 className="fw-bold">{t('login.login')}</h3>
                <p className="text-muted">{t('login.welcome_back')}</p>
              </div>

              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              {user && <Alert variant="success" className="text-center">{t('login.success')}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">{t('login.email')}</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="email" 
                    onChange={handleChange} 
                    required 
                    placeholder={t('login.email_placeholder')}
                    className="py-2"
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label className="fw-medium">{t('login.password')}</Form.Label>
                    <Link to="/forgot-password" className="text-decoration-none text-primary">
                      <small>{t('login.forgot_password')}</small>
                    </Link>
                  </div>
                  <Form.Control 
                    type="password" 
                    name="password" 
                    onChange={handleChange} 
                    required 
                    placeholder={t('login.password_placeholder')}
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
                      <span className="ms-2">{t('login.logging_in')}</span>
                    </>
                  ) : (
                    t('login.login')
                  )}
                </Button>

                <div className={`text-center mt-4 ${i18n.language === 'ar' ? 'text-end' : 'text-start'}`}>
                  <small className="text-muted">
                    {t('login.no_account')}{' '}
                    <Link to="/register" className="text-decoration-none fw-medium">
                      {t('login.register_here')}
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

export default LoginForm;