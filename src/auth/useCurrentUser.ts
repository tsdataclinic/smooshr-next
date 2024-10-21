import { useQuery } from '@tanstack/react-query';
import { UsersService } from '../client/services.gen';
import { processAPIData } from '../util/apiUtil';
import type { User } from '../client/types.gen';

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
    queryFn: () => processAPIData(UsersService.getSelfUser()),
  });

  return {
    error,
    isLoading,
    user,
  };
}
