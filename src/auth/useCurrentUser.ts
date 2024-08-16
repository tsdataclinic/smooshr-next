import { useQuery } from '@tanstack/react-query';
import { UsersService } from '../client/services.gen.ts';
import { apiWrapper } from '../util/apiHelpers.ts';

/**
 * A hook which returns information about the current user.
 */
export function useCurrentUser(): {
  error: unknown;
  isLoading: boolean;
  user: { id: string } | undefined;
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
