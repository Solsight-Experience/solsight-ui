import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletAlertsService } from '../services/walletAlerts.service';
import { CreateWalletAlertDto, UpdateWalletAlertDto } from '../types/watchlist.types';

const alertsKey = (address: string) => ['wallet-alerts', address];

export const useWalletAlerts = (walletAddress: string) =>
  useQuery({
    queryKey: alertsKey(walletAddress),
    queryFn: () => walletAlertsService.list(walletAddress),
    enabled: !!walletAddress,
  });

export const useCreateWalletAlert = (walletAddress: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateWalletAlertDto) =>
      walletAlertsService.create(walletAddress, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: alertsKey(walletAddress) }),
  });
};

export const useUpdateWalletAlert = (walletAddress: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, dto }: { alertId: string; dto: UpdateWalletAlertDto }) =>
      walletAlertsService.update(walletAddress, alertId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: alertsKey(walletAddress) }),
  });
};

export const useDeleteWalletAlert = (walletAddress: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) =>
      walletAlertsService.delete(walletAddress, alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: alertsKey(walletAddress) }),
  });
};
