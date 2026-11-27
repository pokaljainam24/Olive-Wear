import { useEffect, useRef, useState } from "react";

// const { data, loading, error, reload } = useFetch(() => api.call(), [deps]);
// reload(true) refreshes quietly (no loading flash), e.g. for polling.
export default function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [tick, setTick] = useState(0);
  const quiet = useRef(false);

  useEffect(() => {
    let alive = true;
    if (!quiet.current) setState({ data: null, loading: true, error: "" });
    quiet.current = false;
    fn()
      .then((data) => alive && setState({ data, loading: false, error: "" }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.message }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return {
    ...state,
    reload: (silent = false) => {
      quiet.current = silent;
      setTick((t) => t + 1);
    },
  };
}
