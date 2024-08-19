import { useQuery } from '@tanstack/react-query';
import { UsersService } from '../client/services.gen.ts';
import { apiWrapper } from '../util/apiHelpers.ts';
import type { User } from '../client/types.gen.ts';

/**
 * A hook which returns information about the current user.
 */
export function useCurrentUser(): {
  error: unknown;
  isLoading: boolean;
  user: User | undefined;
} {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['user'],
    queryFn: apiWrapper(() => UsersService.getSelfUser()),
  });

  return {
    error,
    isLoading,
    user,
  };
}
