/** Mapped request properties */
export type RequestProps = {
  ignore?: boolean;
};

/** Map of requests to server */
export const requestMap = new WeakMap<Request, RequestProps>();
