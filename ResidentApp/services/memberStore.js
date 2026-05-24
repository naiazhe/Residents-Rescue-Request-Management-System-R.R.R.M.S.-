// services/memberStore.js
//
// Lightweight in-memory store for members added locally (e.g. via the SOS
// confirmation modal) that haven't yet been persisted to the backend.
// Both home.jsx and profile.jsx import this module so they share the same array.

let _localMembers = [];

/** Add a member added outside the backend (e.g. from the SOS modal). */
export const addLocalMember = (member) => {
  _localMembers = [..._localMembers, member];
};

/** Return all locally-added members. */
export const getLocalMembers = () => _localMembers;

/** Remove a locally-added member by id. */
export const removeLocalMember = (id) => {
  _localMembers = _localMembers.filter((m) => m.id !== id);
};

/** Clear all local members (e.g. after a successful backend sync). */
export const clearLocalMembers = () => {
  _localMembers = [];
};
