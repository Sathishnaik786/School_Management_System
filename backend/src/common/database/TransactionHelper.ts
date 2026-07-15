// src/common/database/TransactionHelper.ts
import { supabase } from '../../shared/supabase';
import { BusinessException } from '../exceptions/BusinessException';

/**
 * Helper to run a series of Supabase queries atomically.
 * Supabase does not expose native transactions via the JS client, but we can
 * use a Postgres function `transaction` that executes a batch of statements.
 * For this implementation we will simply run the callback and rely on the
 * caller to ensure atomicity. In a real environment you would replace this
 * with a proper RPC.
 */
export class TransactionHelper {
  async runInTransaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      const result = await callback();
      return result;
    } catch (err: any) {
      // Wrap any error in a BusinessException to maintain consistent error format
      throw new BusinessException('Transaction failed', 500, 'TRANSACTION_ERROR', { originalError: err });
    }
  }
}
