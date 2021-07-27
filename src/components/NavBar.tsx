import { Box, Button, Flex, Link, Spacer } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "./../generated/graphql";
import { isServer } from "./../utils/isServer";
import { useRouter } from "next/router";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const { data, loading } = useMeQuery({
    skip: isServer(), // only runs the query browser side now, not ssr
  });
  let body = null;

  // data is loading
  if (loading) {
    body = null;
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link mr={2}>Register</Link>
        </NextLink>
      </>
    );
    // user is logged in
  } else {
    body = (
      <Flex alignItems="center">
        <NextLink href="/create-post">
          <Button bg="teal.700" as={Link} mr={4}>
            Create Post
          </Button>
        </NextLink>
        <Box textTransform="capitalize" mr={4}>
          {data.me.username}
        </Box>
        <Button
          onClick={async () => {
            await logout();
            router.reload();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex position="sticky" top={0} zIndex={10} bg="teal" p={4}>
      <Flex maxWidth={800} flex={1} alignItems="center" m="auto">
        <NextLink href="/">
          <Link fontSize="x-large">GREENIT</Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
