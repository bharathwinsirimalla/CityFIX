export const ROLE_HOME = {
  citizen: "/my-complaints",
  officer: "/officer/assigned",
  admin: "/admin"
};

export const getRoleHome = (role) => ROLE_HOME[role] || "/";

export const getComplaintPath = (_role, complaintId) => `/complaints/${complaintId}`;
