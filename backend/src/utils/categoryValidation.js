
const ALLOWED_TYPES = new Set(["expense", "income"]);

export function validateCategory(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "A valid category object is required." };
  }

  const allowedFields = new Set(["name", "type"]);

  if (Object.keys(input).some((key) => !allowedFields.has(key))) {
    return { error: "The request contains unsupported fields." };
  }

  if (
    typeof input.name !== "string" ||
    !input.name.trim() ||
    input.name.trim().length > 80
  ) {
    return { error: "Category name must contain 1 to 80 characters." };
  }

  if (
    typeof input.type !== "string" ||
    !ALLOWED_TYPES.has(input.type)
  ) {
    return {
      error: "Category type must be either expense or income.",
    };
  }

  return {
    value: {
      name: input.name.trim(),
      type: input.type,
    },
  };
}

export function validateCategoryUpdate(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "A valid category object is required." };
  }

  if (
    Object.keys(input).some((key) => key !== "name")
  ) {
    return {
      error: "Only the category name can be updated.",
    };
  }

  if (
    typeof input.name !== "string" ||
    !input.name.trim() ||
    input.name.trim().length > 80
  ) {
    return {
      error: "Category name must contain 1 to 80 characters.",
    };
  }

  return {
    value: {
      name: input.name.trim(),
    },
  };
}
