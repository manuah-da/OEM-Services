import { startBrandPromotions } from "../core/bootstrap.js";
import { onReady } from "../core/utils.js";
import { cfmotoAdapter } from "../adapters/cfmoto.js";

onReady(() => {
  startBrandPromotions(
    {
      oem: "CFMoto",
      inventoryLink: "/inventory/"
    },
    cfmotoAdapter
  );
});

