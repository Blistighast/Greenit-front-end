import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Box } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment } from "../generated/graphql";
import { useVoteMutation } from "./../generated/graphql";

interface UpvoteSectionProps {
  post: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] =
    useState<"upvote-loading" | "downvote-loading" | "not-loading">(
      "not-loading"
    );
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState("upvote-loading");
          await vote({
            value: 1,
            postId: post.id,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "upvote-loading"}
        variant="ghost"
        aria-label="upvote post"
        icon={
          <ArrowUpIcon
            color={post.voteStatus === 1 ? "green.500" : undefined}
            w={10}
            h={10}
          />
        }
        onHover
      />
      <Box fontSize="x-large">{post.points}</Box>
      {/* <IconButton
        variant="ghost"
        aria-label="upvote"
        icon={<ArrowBackIcon color="yellow.500" w={10} h={10} />}
      /> */}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("downvote-loading");
          await vote({
            value: -1,
            postId: post.id,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downvote-loading"}
        variant="ghost"
        aria-label="downvote post"
        icon={
          <ArrowDownIcon
            color={post.voteStatus === -1 ? "red.500" : undefined}
            w={10}
            h={10}
          />
        }
      />
    </Flex>
  );
};
