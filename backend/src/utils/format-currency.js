// Convert rupees to paise when saving
export const convertToPaise = (amount) => {
  return Math.round(Number(amount) * 100);
};

// Convert paise to rupees when retrieving
export const convertToRupeeUnit = (amount) => {
  return Number(amount) / 100;
};

export const formatCurrency = (amount) => {
  return Number(amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};
