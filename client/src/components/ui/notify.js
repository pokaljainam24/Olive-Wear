import { toast } from "react-toastify";

// Use anywhere:  notify.success("Saved")  notify.error(err.message)
export const notify = {
  success: (m) => toast.success(m),
  error: (m) => toast.error(m),
  info: (m) => toast.info(m),
  warn: (m) => toast.warn(m),
};
