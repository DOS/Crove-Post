import { getBrandConfig } from './brand.config';

export const isGeneralServerSide = () => {
  return !!process.env.IS_GENERAL;
};

export const getBrandNameServerSide = () => {
  return getBrandConfig().name;
};
