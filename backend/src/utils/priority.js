// Priority model: P = w1*S + w2*T + w3*L
// S: severity (1-5), T: hours since creation, L: location importance (1-5)

export const computePriorityScore = ({ severity = 3, hoursSinceCreation = 0, locationImportance = 3 }) => {
  const w1 = 0.5;
  const w2 = 0.3;
  const w3 = 0.2;
  const P = w1 * severity + w2 * hoursSinceCreation + w3 * locationImportance;
  return Number(P.toFixed(2));
};

