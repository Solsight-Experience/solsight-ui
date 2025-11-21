// Minimal wallet adapter setup - only for connecting and getting public key
// All blockchain operations are handled by the NestJS backend

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
    };
  }
}

export interface WalletAdapter {
  publicKey: string | null;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export class PhantomWalletAdapter implements WalletAdapter {
  public publicKey: string | null = null;
  public connected: boolean = false;

  async connect(): Promise<void> {
    try {
      const { solana } = window;
      
      if (!solana?.isPhantom) {
        throw new Error('Phantom wallet not found! Please install Phantom.');
      }

      const response = await solana.connect();
      this.publicKey = response.publicKey.toString();
      this.connected = true;
      
      console.log('Connected to Phantom wallet:', this.publicKey);
    } catch (error) {
      console.error('Failed to connect to Phantom wallet:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      const { solana } = window;
      
      if (solana) {
        await solana.disconnect();
      }
      
      this.publicKey = null;
      this.connected = false;
      
      console.log('Disconnected from Phantom wallet');
    } catch (error) {
      console.error('Failed to disconnect from Phantom wallet:', error);
      throw error;
    }
  }
}

// Utility function to check if wallet is available
export const isPhantomAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.solana?.isPhantom;
};

// Export singleton instance
export const phantomWallet = new PhantomWalletAdapter();