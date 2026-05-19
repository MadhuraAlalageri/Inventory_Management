import API from "./api";

export const createReturnRequest = async (payload) => {
  const res = await API.post("/returns", payload);
  return res.data;
};

export const getReturnRequests = async () => {
  const res = await API.get("/returns");
  return res.data;
};

export const approveReturnRequest = async (id) => {
  const res = await API.put(`/returns/${id}/approve`);
  return res.data;
};

export const rejectReturnRequest = async (id) => {
  const res = await API.put(`/returns/${id}/reject`);
  return res.data;
};
