import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache';
import { Exchange, dedupExchange, fetchExchange, stringifyVariables, gql } from 'urql';
import { 
  DeletePostMutationVariables,
  LoginMutation, 
  LogoutMutation, 
  MeDocument, 
  MeQuery, 
  RegisterMutation,
  VoteMutationVariables, 
} from '../generated/graphql';
import { betterUpdateQuery } from "../utils/betterUpdateQuery";
import { pipe, tap} from 'wonka';
import Router from 'next/router' // outside react so not using hook useRouter
import { isServer } from './isServer';

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    // checks cache for queries made ie: posts
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    // filters out the unneeded the queries
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    
    // from query get list of posts in cache
    // as it paginates, continues to add posts to this list
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isItInTheCache = cache.resolve(
      cache.resolve(entityKey,fieldKey ) as string, 
      'posts'
    )
    // tells cache we only have partial of the info needed, so rerun query and update cache
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = []
    fieldInfos.forEach(fi => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore')
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    })

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results
    }

    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolve(entityKey, fieldKey) as string[];
    //   const currentOffset = args[cursorArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== 'number'
    //   ) {
    //     continue;
    //   }

    //   const tempResult: NullArray<string> = [];

    //   for (let j = 0; j < links.length; j++) {
    //     const link = links[j];
    //     if (visited.has(link)) continue;
    //     tempResult.push(link);
    //     visited.add(link);
    //   }

    //   if (
    //     (!prevOffset || currentOffset > prevOffset) ===
    //     (mergeMode === 'after')
    //   ) {
    //     result = [...result, ...tempResult];
    //   } else {
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};

const invalidateAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields('Query');
  // filters out the unneeded queries
  const fieldInfos = allFields.filter(
    info => info.fieldName === 'posts'
  );
  // invalidate all the existing post queries
  fieldInfos.forEach((fi) => {
    cache.invalidate('Query', 'posts', fi.arguments);
  })
}

const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({error}) => {
      if (error) {
        if (error?.message.includes("not authenticated")) {
          Router.replace("/login")
        }
      }
    })
  )
}

const cacheEx = cacheExchange({
  keys: {
    PaginatedPosts: () => null
  },
  resolvers: {
    Query: {
      posts: cursorPagination(), // name matches web side graphql name
    }
  },
  updates: {
    Mutation: {
      deletePost: (_result, args, cache, info) => {
        cache.invalidate({__typename: 'Post', id: (args as DeletePostMutationVariables).id })
      },
      // updating points cache for post
      vote: (_result, args, cache, info) => {
        const {postId, value} = args as VoteMutationVariables;
        // get current point values
        const data = cache.readFragment(
          gql`
          fragment __ on Post {
            id
            points
            voteStatus
          }
        `,
        { id: postId }
        );
        if (data) {
          if (data.voteStatus === value) {
            return;
          }
          const newPoints = data.points + ((!data.voteStatus ? 1 : 2) * value);
          cache.writeFragment(
            gql`
              fragment __ on Post {
                points
                voteStatus
              }
            `,
            { id: postId, points: newPoints , voteStatus: value }
          );
        }
      },
      // invalidate existing cache to make it refetch and update cache
      createPost: (_result, args, cache, info) => {
        invalidateAllPosts(cache);
      },
      logout: (_result, args, cache, info) => {
        // me query return null
        betterUpdateQuery<LogoutMutation, MeQuery>(
          cache,
          { query: MeDocument },
          _result,
          () => ({ me: null })
        );
      },
      login: (_result, args, cache, info) => {
        betterUpdateQuery<LoginMutation, MeQuery>(
          cache,
          { query: MeDocument },
          _result,
          (result, query) => {
            if (result.login.errors) {
              return query;
            } else {
              return {
                me: result.login.user,
              };
            }
          }
        );
        invalidateAllPosts(cache);
      },
      register: (_result, args, cache, info) => {
        betterUpdateQuery<RegisterMutation, MeQuery>(
          cache,
          { query: MeDocument },
          _result,
          (result, query) => {
            if (result.register.errors) {
              return query;
            } else {
              return {
                me: result.register.user,
              };
            }
          }
        );
      },
    },
  },
})

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie =""
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }
  return ({
  url: process.env.NEXT_PUBLIC_API_URL as string,
  fetchOptions: {
    credentials: "include" as const,
    headers: cookie 
    ? {
      cookie,
    } : undefined,
  },
  // this updates the cache with the MeQuery on login & register
  exchanges: [
    dedupExchange,
    cacheEx,
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
})};