import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useSparePartStockStore } from "../stores/SparePartStockStore";

// Shared approve/return flow for the tickets page and the parts page:
// after every action the usage rows and warehouse remaining quantities are reloaded.
export function useSparePartActions(ticketId?: number) {
  const usageStore = useSparePartUsageStore();
  const stockStore = useSparePartStockStore();

  const refresh = async () => {
    await Promise.all([usageStore.load(ticketId), stockStore.load()]);
  };

  const approve = async (id: number, issuedQuantity: number) => {
    await usageStore.approve(id, issuedQuantity);
    await refresh();
  };

  const returnUsage = async (id: number) => {
    await usageStore.returnUsage(id);
    await refresh();
  };

  return { approve, returnUsage, refresh };
}
