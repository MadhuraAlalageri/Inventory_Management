import API from "./api";

// 🔹 GET
export const getTools = async () => {
  const res = await API.get("/tools");
  return res.data;
};

// 🔹 CREATE
export const createTool = async (data) => {
  const res = await API.post("/tools", data);
  return res.data;
};

// 🔹 UPDATE (CORRECT)
export const updateTool = async (id, data) => {
  const res = await API.put(`/tools/${id}`, data);
  return res.data;
};

// 🔹 DELETE
export const deleteTool = async (id) => {
  const res = await API.delete(`/tools/${id}`);
  return res.data;
};

export const batchUpdateStock = async (updates) => {
  const res = await API.post("/tools/batch-stock", { updates });
  return res.data;
};