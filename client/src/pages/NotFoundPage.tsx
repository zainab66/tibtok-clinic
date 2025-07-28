import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container text-center mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h1 className="display-1 text-danger">404</h1>
              <h2 className="mb-4">Page Not Found</h2>
              <p className="lead">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <Link to="/" className="btn btn-primary mt-3">
                <i className="bi bi-house-door"></i> Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}