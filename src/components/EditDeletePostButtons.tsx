import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const { data: meData } = useMeQuery();
  const [deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          variant="ghost"
          mr={4}
          aria-label="Edit Post"
          icon={<EditIcon w={6} h={6} />}
        />
      </NextLink>
      <IconButton
        variant="ghost"
        aria-label="Delete Post"
        icon={<DeleteIcon color={"red.200"} w={6} h={6} />}
        onClick={() => {
          deletePost({ variables: { id } });
        }}
      />
    </Box>
  );
};
