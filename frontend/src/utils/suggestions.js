// utils/suggestions.js

export function getSuggestions(shape) {
  if (!shape) return [];

  // Rules-based MVP
  const label = shape.label?.toLowerCase() || "";
  const type = shape.type;

  if (type === "rectangle" && label.includes("db")) {
    return ["Add replication server?", "Add cache layer?"];
  }

  if (type === "lock" || label.includes("auth")) {
    return ["Add MFA step?", "Add login API node"];
  }

  if (type === "arrow") {
    return ["Add success/failure branch?", "Attach condition?"];
  }

  return [];
}
