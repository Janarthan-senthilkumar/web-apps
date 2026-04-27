import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api';

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => {
  const { data } = await dashboardAPI.getStats();
  return data.data;
});

export const fetchMovementChart = createAsyncThunk('dashboard/fetchMovementChart', async (params) => {
  const { data } = await dashboardAPI.getMovementChart(params);
  return data.data;
});

export const fetchWarehouseSummary = createAsyncThunk('dashboard/fetchWarehouseSummary', async () => {
  const { data } = await dashboardAPI.getWarehouseSummary();
  return data.data;
});

export const fetchCategoryDistribution = createAsyncThunk('dashboard/fetchCategoryDistribution', async () => {
  const { data } = await dashboardAPI.getCategoryDistribution();
  return data.data;
});

export const fetchTopConsumed = createAsyncThunk('dashboard/fetchTopConsumed', async () => {
  const { data } = await dashboardAPI.getTopConsumed();
  return data.data;
});

export const fetchRecentActivity = createAsyncThunk('dashboard/fetchRecentActivity', async () => {
  const { data } = await dashboardAPI.getRecentActivity();
  return data.data;
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    movementChart: [],
    warehouseSummary: [],
    categoryDistribution: [],
    topConsumed: [],
    recentActivity: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchDashboardStats.rejected, (state) => { state.loading = false; })
      .addCase(fetchMovementChart.fulfilled, (state, action) => { state.movementChart = action.payload; })
      .addCase(fetchWarehouseSummary.fulfilled, (state, action) => { state.warehouseSummary = action.payload; })
      .addCase(fetchCategoryDistribution.fulfilled, (state, action) => { state.categoryDistribution = action.payload; })
      .addCase(fetchTopConsumed.fulfilled, (state, action) => { state.topConsumed = action.payload; })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => { state.recentActivity = action.payload; });
  },
});

export default dashboardSlice.reducer;
