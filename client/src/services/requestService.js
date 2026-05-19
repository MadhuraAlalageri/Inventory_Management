import API from "./api";
import axios from "axios";


// ✅ CREATE REQUEST
export const createRequest = async (data) => {
  const res = await API.post("/requests", data);
  return res.data;
};

// ✅ GET REQUESTS
export const getRequests = async () => {
  const res = await API.get("/requests");
  return res.data;
};

// ✅ APPROVE REQUEST
export const approveRequest = async (id) => {
  const res = await API.put(`/requests/${id}/approve`);
  return res.data;
};

// ✅ REJECT REQUEST
export const rejectRequest = async (id) => {
  const res = await API.put(`/requests/${id}/reject`);
  return res.data;
};

export const markAsPrinted = async (
  requestId
) => {

  const response = await API.put(`/requests/${requestId}/printed`);

  return response.data;
};

// ✅ DELETE REQUEST
export const deleteRequest = async (id) => {
  const res = await API.delete(`/requests/${id}`);
  return res.data;
};

// ✅ HIDE REQUEST
export const hideRequest = async (id) => {
  const res = await API.put(`/requests/${id}/hide`);
  return res.data;
};

// ✅ MERGE REQUESTS
export const mergeUserRequests = async (userId) => {
  const res = await API.post(`/requests/merge/${userId}`);
  return res.data;
};