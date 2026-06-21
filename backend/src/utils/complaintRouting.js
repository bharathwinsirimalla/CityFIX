export const routeComplaintByCategory = (category) => {
  switch (category) {
    case "Garbage":
      return "Sanitation Department";
    case "Streetlight":
      return "Electrical Department";
    case "Water Leak":
      return "Water Department";
    case "Pothole":
    case "Road Damage":
      return "Roads Department";
    case "Drainage":
      return "Drainage Department";
    default:
      return "General Administration";
  }
};

