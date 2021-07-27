/* eslint-disable */
import { Flex, Link, Stack } from "@chakra-ui/layout";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import NextLink from "next/link";
import React, { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { UpvoteSection } from "../components/UpvoteSection";
import { Layout } from "./../components/Layout";
import { useMeQuery, usePostsQuery } from "./../generated/graphql";
import { createUrqlClient } from "./../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 5,
    cursor: null as null | string,
  });

  const [{ data: meData }] = useMeQuery();
  const [{ data, error, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return (
      <div>
        <div>Query failed</div>
        <div>{error?.message}</div>
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>GreenIt - Home</title>
      </Head>
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((post) =>
            !post ? null : ( // deleting a post returns null
              <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
                <UpvoteSection post={post} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                    <Link>
                      <Heading fontSize="xl">{post.title}</Heading>
                      <Text>posted by {post.creator.username}</Text>
                      <Flex align="center">
                        <Text mt={4}>
                          {post.textSnippet}
                          {post.text.length >= 100 ? "..." : ""}
                        </Text>
                        <Box ml="auto">
                          <EditDeletePostButtons
                            id={post.id}
                            creatorId={post.creator.id}
                          />
                        </Box>
                      </Flex>
                    </Link>
                  </NextLink>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                // get all items after last item in list
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            m={"auto"}
            my={8}
          >
            Show More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
