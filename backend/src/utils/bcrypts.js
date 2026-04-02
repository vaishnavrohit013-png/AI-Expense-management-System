import bcrypt from "bcryptjs";

export const hashValue = async (value, saltRounds = 10) => {
  try {
    return await bcrypt.hash(value, saltRounds);
  } catch (error) {
    throw error;
  }
};

export const compareValue = async (value, hashedValue) => {
  try {
    if (!value || !hashedValue) return false;
    return await bcrypt.compare(value, hashedValue);
  } catch (error) {
    return false;
  }
};
                                                                         