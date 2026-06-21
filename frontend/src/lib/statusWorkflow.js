export const requiresResolutionNotes = (status) => status === "Rejected" || status === "Resolved";

export const getTransitionHint = (role) => {
  if (role === "officer") {
    return "Assigned → In Progress → Resolved. Notes are required when marking Resolved.";
  }
  if (role === "admin") {
    return "Use Complaint Management to assign officers. Here you can reject invalid complaints or close escalated issues.";
  }
  return "";
};
