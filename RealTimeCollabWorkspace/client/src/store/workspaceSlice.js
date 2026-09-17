import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchWorkspaces = createAsyncThunk("workspaces/fetchAll", async () => {
  const { data } = await api.get("/workspaces");
  return data;
});

export const createWorkspace = createAsyncThunk("workspaces/create", async (name) => {
  const { data } = await api.post("/workspaces", { name });
  return data;
});

export const fetchWorkspace = createAsyncThunk("workspaces/fetchOne", async (id) => {
  const { data } = await api.get(`/workspaces/${id}`);
  return data;
});

export const addCollaborator = createAsyncThunk(
  "workspaces/addCollaborator",
  async ({ id, email, role }) => {
    await api.post(`/workspaces/${id}/collaborators`, { email, role });
    return { email, role };
  }
);

const workspaceSlice = createSlice({
  name: "workspaces",
  initialState: {
    list: [],
    current: null, // { id, name, content, role, collaborators }
    presence: [],
    status: "idle",
  },
  reducers: {
    setLiveContent(state, action) {
      if (state.current) state.current.content = action.payload;
    },
    setPresence(state, action) {
      state.presence = action.payload;
    },
    clearCurrent(state) {
      state.current = null;
      state.presence = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.list.unshift({ ...action.payload, updatedAt: new Date().toISOString() });
      })
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(addCollaborator.fulfilled, (state, action) => {
        if (state.current) {
          const existing = state.current.collaborators.find((c) => c.email === action.payload.email);
          if (existing) existing.role = action.payload.role;
          else state.current.collaborators.push({ ...action.payload, username: action.payload.email });
        }
      });
  },
});

export const { setLiveContent, setPresence, clearCurrent } = workspaceSlice.actions;
export default workspaceSlice.reducer;
