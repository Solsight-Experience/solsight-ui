'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TransferService } from '../services/transfer.service';
import { CreateTransactionDto, TransactionResponseDto } from '@/types/dto';
import { toast } from 'sonner';

export function useTransfer() {
  const queryClient = useQueryClient();

  const createTransfer = useMutation({
    mutationFn: (transferData: CreateTransactionDto) =>
      TransferService.createTransfer(transferData),
    onSuccess: (data) => {
      toast.success(`Transfer initiated! Transaction ID: ${data.id}`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
    onError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const resp = (error as any).response;
        if (resp && resp.data && resp.data.message) {
          toast.error(resp.data.message);
          return;
        }
      }
    },
  });

  return {
    createTransfer: createTransfer.mutate,
    isCreating: createTransfer.isPending,
    transferData: createTransfer.data,
  };
}

export function useTransferHistory(address?: string) {
  return useQuery({
    queryKey: ['transfer-history', address],
    queryFn: () => TransferService.getTransferHistory(address!),
    enabled: !!address,
  });
}

export function useUserTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => TransferService.getUserTransactions(),
  });
}

export function useTransactionStatus(transactionId?: string) {
  return useQuery({
    queryKey: ['transaction-status', transactionId],
    queryFn: () => TransferService.getTransactionStatus(transactionId!),
    enabled: !!transactionId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}
