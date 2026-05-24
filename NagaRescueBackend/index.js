const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Disable ETag-based 304 responses so clients always get fresh JSON.
// Without this, Express adds a weak ETag and a client revalidation can
// surface stale data right after a write (off-by-one refresh bug).
app.set('etag', false);

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Belt-and-suspenders: tell every cache layer (RN HTTP cache, OkHttp,
// NSURLCache, any reverse proxy) never to store JSON API responses.
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// Auth
app.use('/api/auth', require('./src/routes/authRoutes'));

// Admin (super_admin only — JWT-guarded inside the router)
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Core entities
app.use('/api/locations', require('./src/routes/locationRoutes'));
app.use('/api/risk-levels', require('./src/routes/riskLevelRoutes'));
app.use('/api/households', require('./src/routes/householdRoutes'));
app.use('/api/residents', require('./src/routes/residentRoutes'));
app.use('/api/accounts', require('./src/routes/accountRoutes'));

// Employee types
app.use('/api/barangay-employee-types', require('./src/routes/barangayEmployeeTypeRoutes'));
app.use('/api/city-employee-types', require('./src/routes/cityEmployeeTypeRoutes'));

// Response units
app.use('/api/barangay-units', require('./src/routes/barangayUnitRoutes'));
app.use('/api/city-response-units', require('./src/routes/cityResponseUnitRoutes'));

// Personnel
app.use('/api/barangay-operators', require('./src/routes/barangayOperatorRoutes'));
app.use('/api/comcen-operators', require('./src/routes/comcenOperatorRoutes'));
app.use('/api/barangay-rescuers', require('./src/routes/barangayRescuerRoutes'));
app.use('/api/saru-rescuers', require('./src/routes/saruRescuerRoutes'));
app.use('/api/evacuation-managers', require('./src/routes/evacuationManagerRoutes'));

// Alerts & SOS
app.use('/api/alert-levels', require('./src/routes/alertLevelRoutes'));
app.use('/api/warning-alerts', require('./src/routes/warningAlertRoutes'));
app.use('/api/sos', require('./src/routes/sosRoutes'));
app.use('/api/operation-logs', require('./src/routes/operationLogRoutes'));

// Evacuation
app.use('/api/evacuation-centers', require('./src/routes/evacuationCenterRoutes'));
app.use('/api/evacuation-logs', require('./src/routes/evacuationLogRoutes'));

// Notifications
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// Rescue reports
app.use('/api/rescue-reports', require('./src/routes/rescueReportRoutes'));

// Catch-all error handler — always return JSON so clients never get an HTML error page
app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ success: false, error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
