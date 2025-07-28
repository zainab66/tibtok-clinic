export default function FeaturesPage() {
  const features = [
    {
      icon: 'bi-speedometer2',
      title: 'Real-time Analytics',
      description: 'Get live updates on your dashboard metrics'
    },
    {
      icon: 'bi-bar-chart',
      title: 'Advanced Reporting',
      description: 'Generate detailed reports with one click'
    },
    {
      icon: 'bi-shield-lock',
      title: 'Secure Access',
      description: 'Enterprise-grade security for your data'
    }
  ];

  return (
    <div className="container">
      <h1 className="mb-4">Features</h1>
      <div className="row">
        {features.map((feature, index) => (
          <div key={index} className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className={`bi ${feature.icon} fs-1 text-primary mb-3`}></i>
                <h3 className="card-title">{feature.title}</h3>
                <p className="card-text">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}