import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useCallback, useState } from 'react';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { type RootState } from '../../app/store';
import LogoutButton from '../LogoutButton';
import { useSelector } from 'react-redux';
import {
  Container,
  Navbar,
  Nav,
  Offcanvas,
  Button,
  Badge,
  Stack,
  Image,
  NavDropdown,
  Form,
  FormControl
} from 'react-bootstrap';
import {
  Speedometer2,
  GraphUp,
  Gear,
  Person,
  Calendar,
  List,
  BoxArrowRight
} from 'react-bootstrap-icons';

interface CustomNavLinkProps {
  to: string;
  end?: boolean;
  children: React.ReactNode;
  className?: string;
}

const CustomNavLink: React.FC<CustomNavLinkProps> = ({
  to,
  end,
  children,
  ...props
}) => {
  return (
    <Nav.Link
      as={NavLink}
      to={to}
      end={end}
      className={({ isActive }: { isActive: boolean }) =>
        `d-flex align-items-center py-3 ${isActive ? 'active bg-primary bg-opacity-10 rounded' : ''}`
      }
      {...props}
    >
      {children}
    </Nav.Link>
  );
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const user = useSelector((state: RootState) => state.user.user);
  const [showOffcanvas, setShowOffcanvas] = useState(false); // State for Offcanvas visibility

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      {/* Modern Navbar */}
      <Navbar expand="lg" bg="primary" variant="dark" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
            <span className="ms-2">{t('dashboard.brandName')}</span>
          </Navbar.Brand>

          {/* Toggle button for Offcanvas on small screens */}
          {/* This button will be hidden on large screens due to d-lg-none */}
          <Button
            variant="primary"
            onClick={handleShowOffcanvas}
            className="d-lg-none me-2"
            aria-label="Toggle sidebar"
          >
            <List size={24} />
          </Button>

          {/* Navbar content for large screens */}
          {/* This part of the navbar will collapse on small screens */}
          <Navbar.Collapse id="navbarNav">
            <Nav className="me-auto">
              <CustomNavLink to="/dashboard" end>
                {t('dashboard.home')}
              </CustomNavLink>
              <CustomNavLink to="/dashboard/features">
                {t('dashboard.features')}
              </CustomNavLink>
            </Nav>

            <Stack direction="horizontal" gap={3} className="align-items-center">
              {/* Search Form for Desktop Navbar - hidden on small screens */}
              <Form className="d-flex d-none d-lg-flex">
                <FormControl
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                />
                <Button variant="outline-light">{t('common.search')}</Button>
              </Form>

              {!user && (
                <>
                  <Button
                    as={Link}
                    to="/register"
                    variant="outline-light"
                    size="sm"
                  >
                    {t('register.register')}
                  </Button>
                  <Button
                    as={Link}
                    to="/login"
                    variant="light"
                    size="sm"
                  >
                    {t('login.login')}
                  </Button>
                </>
              )}

              {user && (
                <NavDropdown
                  title={
                    <span className="text-white">
                      <Person className="me-1" />
                      {user.first_name || user.email}
                    </span>
                  }
                  align="end"
                  menuVariant="dark"
                >
                  <NavDropdown.Item as={Link} to="/dashboard/profile">
                    My Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as="div">
                    <LogoutButton variant="link" className="text-dark w-100 text-start">
                      <BoxArrowRight className="me-2" />
                      Logout
                    </LogoutButton>
                  </NavDropdown.Item>
                </NavDropdown>
              )}

              <LanguageSwitcher />
            </Stack>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="d-flex flex-grow-1">
        {/* Modern Offcanvas Sidebar - Handles both mobile and desktop */}
        {/* On screens >= lg, this will be visible as a static sidebar */}
        {/* On screens < lg, this will be an offcanvas that can be toggled */}
        <Offcanvas
          show={showOffcanvas}
          onHide={handleCloseOffcanvas}
          responsive="lg"
          className="bg-dark text-white"
          // Add a width for desktop view when responsive="lg" makes it static
          style={{ width: '280px' }}
        >
          <Offcanvas.Header closeButton closeVariant="white" className="d-lg-none"> {/* Hide close button on desktop */}
            <Offcanvas.Title id="offcanvasNavbarLabel">
              <h5 className="mb-0">{t('dashboard.brandName')}</h5>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex flex-column"> {/* Use flex-column for body content */}
            {user && (
              <div className="d-flex align-items-center mb-4 p-3 bg-primary bg-opacity-10 rounded">
                <div className="bg-primary rounded-circle p-2 me-3">
                  <Person size={24} className="text-white" />
                </div>
                <div>
                  <h6 className="mb-0">{user.first_name || user.email}</h6>
                  <small className="text-muted">Premium Member</small>
                </div>
              </div>
            )}

            <Nav className="flex-column mb-4">
              <Nav.Item>
                <CustomNavLink to="/dashboard" end onClick={handleCloseOffcanvas}>
                  <Speedometer2 className="me-3" size={20} />
                  {t('dashboard.dashboard')}
                </CustomNavLink>
              </Nav.Item>
              <Nav.Item>
                <CustomNavLink to="/dashboard/patients" onClick={handleCloseOffcanvas}>
                  <Person className="me-3" size={20} />
                  {t('dashboard.patients')}
                  <Badge bg="primary" className="ms-auto">5</Badge>
                </CustomNavLink>
              </Nav.Item>
              <Nav.Item>
                <CustomNavLink to="/dashboard/appointments" onClick={handleCloseOffcanvas}>
                  <Calendar className="me-3" size={20} />
                  {t('appointments.appointments')}
                  <Badge bg="danger" className="ms-auto">3</Badge>
                </CustomNavLink>
              </Nav.Item>
              <Nav.Item>
                <CustomNavLink to="/dashboard/settings" onClick={handleCloseOffcanvas}>
                  <Gear className="me-3" size={20} />
                  {t('dashboard.settings')}
                </CustomNavLink>
              </Nav.Item>
            </Nav>

            {/* Search Form for Offcanvas (Mobile) - hide on desktop if already in Navbar */}
            <div className="d-lg-none">
              <h5>{t('common.search')}</h5>
              <Form className="mb-3">
                <FormControl
                  type="search"
                  placeholder="Search"
                  className="me-2 mb-2"
                  aria-label="Search"
                />
                <Button variant="outline-success" className="w-100">{t('common.search')}</Button>
              </Form>
            </div>

            <div className="mt-auto pt-3 border-top"> {/* Push LanguageSwitcher and Logout to bottom */}
              <LanguageSwitcher />
              {user && (
                <div className="mt-3">
                  <LogoutButton className="w-100" variant="outline-light" />
                </div>
              )}
            </div>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Main Content */}
        <main className="flex-grow-1 p-4 bg-light">
          <Container fluid>
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
}