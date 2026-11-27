const STORAGE_KEY = "olive_wear_order_history";

const readStoredTokens = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.some((token) => typeof token !== "string" || !/^[\da-f]{64}$/i.test(token))) {
    throw new Error("Saved order history data is invalid.");
  }
  return parsed;
};

export function readOrderHistoryTokens() {
  try {
    return readStoredTokens();
  } catch (error) {
    console.error("Could not read saved order history.", error);
    return [];
  }
}

export function saveOrderHistoryToken(token) {
  try {
    if (typeof token !== "string" || !/^[\da-f]{64}$/i.test(token)) {
      throw new Error("Order history access token is invalid.");
    }
    const tokens = readStoredTokens();
    const updated = [token, ...tokens.filter((saved) => saved !== token)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Could not save order history access.", error);
    return false;
  }
}
