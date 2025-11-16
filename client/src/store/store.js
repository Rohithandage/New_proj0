import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./common-slice";
import priceComparisonReducer from "./price-comparison-slice";

const store = configureStore({
  reducer: {
    common: commonReducer,
    priceComparison: priceComparisonReducer,
  },
});

export default store;