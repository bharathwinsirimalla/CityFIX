export const STATUSES = ["Pending", "Assigned", "In Progress", "Resolved", "Rejected"];

const TERMINAL_STATUSES = ["Resolved", "Rejected"];

export const getAllowedTransitions = (currentStatus, role, { isAssignedOfficer = false } = {}) => {
  if (TERMINAL_STATUSES.includes(currentStatus)) return [];

  if (role === "officer") {
    if (!isAssignedOfficer) return [];
    if (currentStatus === "Assigned") return ["In Progress"];
    if (currentStatus === "In Progress") return ["Resolved"];
    return [];
  }

  if (role === "admin") {
    if (currentStatus === "Pending") return ["Rejected"];
    if (currentStatus === "Assigned") return ["Rejected", "Resolved"];
    if (currentStatus === "In Progress") return ["Rejected", "Resolved"];
    return [];
  }

  return [];
};

export const requiresResolutionNotes = (newStatus) => newStatus === "Rejected" || newStatus === "Resolved";

export const validateStatusTransition = (currentStatus, newStatus, role, options = {}) => {
  if (!STATUSES.includes(newStatus)) {
    return { valid: false, message: "Invalid status" };
  }

  if (currentStatus === newStatus) {
    return { valid: false, message: "Complaint is already in this status" };
  }

  const allowed = getAllowedTransitions(currentStatus, role, options);
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      message: `Transition from "${currentStatus}" to "${newStatus}" is not permitted for your role`
    };
  }

  return { valid: true };
};
