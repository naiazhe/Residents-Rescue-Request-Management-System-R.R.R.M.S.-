import { api, unwrap } from './client';

export const Auth = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }).then(unwrap),
};

// Admin — resident scope only.
export const Admin = {
  dashboard:           ()              => api.get('/admin/dashboard').then(unwrap),
  filterOptions:       ()              => api.get('/admin/filter-options').then(unwrap),

  accounts:            (params = {})   => api.get('/admin/accounts', { params: { role: 'resident', ...params } }).then(unwrap),
  approve:             (id)            => api.patch(`/admin/accounts/${id}/approve`).then(unwrap),
  bulkApprove:         (ids)           => api.patch('/admin/accounts/bulk-approve', { ids }).then(unwrap),
  reject:              (id)            => api.patch(`/admin/accounts/${id}/reject`).then(unwrap),
  setActive:           (id, is_active) => api.patch(`/admin/accounts/${id}/active`,   { is_active }).then(unwrap),
  resetPassword:       (id, password)  => api.patch(`/admin/accounts/${id}/password`, { password }).then(unwrap),

  residents:           (params = {})   => api.get('/admin/residents',  { params }).then(unwrap),
  residentsByBarangay: ()              => api.get('/admin/analytics/residents-by-barangay').then(unwrap),

  sos:                 (params = {})   => api.get('/admin/sos',        { params }).then(unwrap),
};
