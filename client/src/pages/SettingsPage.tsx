export default function SettingsPage() {
  return (
    <div className="container">
      <h1 className="mb-4">Settings</h1>
      <div className="card">
        <div className="card-body">
          <form>
            <div className="mb-3">
              <label htmlFor="themeSelect" className="form-label">
                Theme Preference
              </label>
              <select className="form-select" id="themeSelect">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            </div>
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="notifications" />
              <label className="form-check-label" htmlFor="notifications">
                Enable notifications
              </label>
            </div>
            <button type="submit" className="btn btn-primary">
              Save Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}