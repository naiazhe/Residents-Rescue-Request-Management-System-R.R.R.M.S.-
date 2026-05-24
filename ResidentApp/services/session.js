// Module-level session store — no Redux/Context needed.
// Lives in memory for the duration of the app session.
// Shape: { accountId, residentId, username, role, isVerified }

let _session = null;

export const setSession = (data) => {
  _session = data ? { ..._session, ...data } : null;
};

export const getSession = () => _session;

export const clearSession = () => {
  _session = null;
};
