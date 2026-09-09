import { createClassicSwiperAdapter } from "../adapters/classic-swiper.js";
import { startBrandPromotions } from "../core/bootstrap.js";
import { onReady } from "../core/utils.js";

onReady(() => {
  startBrandPromotions(
    {
      oem: "Yamaha Powersports",
      inventoryLink: "/inventory/"
    },
    createClassicSwiperAdapter()
  );
});

