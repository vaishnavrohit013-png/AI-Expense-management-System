import bcrypt from "bcryptjs";

export const hashValue = (value, saltRounds = 10) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(value, saltRounds, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
};

export const compareValue = (value, hashedValue) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(value, hashedValue, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};
                                                                         