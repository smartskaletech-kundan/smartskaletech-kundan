import type {
  BanquetBill,
  GuestCheckIn,
  Inquiry,
  RestaurantBill,
  RoomFoodOrder,
  RoomInvoice,
} from "@/backend.d";
import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useAllInquiries() {
  const { actor, isFetching } = useActor();
  return useQuery<Inquiry[]>({
    queryKey: ["inquiries"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllInquiries();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllGuestCheckIns() {
  const { actor, isFetching } = useActor();
  return useQuery<GuestCheckIn[]>({
    queryKey: ["guestCheckIns"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllGuestCheckIns();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRestaurantBills() {
  const { actor, isFetching } = useActor();
  return useQuery<RestaurantBill[]>({
    queryKey: ["restaurantBills"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getBills();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBanquetBills() {
  const { actor, isFetching } = useActor();
  return useQuery<BanquetBill[]>({
    queryKey: ["banquetBills"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getBanquetBills();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllRoomFoodOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<RoomFoodOrder[]>({
    queryKey: ["roomFoodOrders"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as any).getAllRoomFoodOrders();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllRoomInvoices() {
  const { actor, isFetching } = useActor();
  return useQuery<RoomInvoice[]>({
    queryKey: ["roomInvoices"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as any).getAllRoomInvoices();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}
