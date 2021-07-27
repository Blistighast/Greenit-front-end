import { Box, Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import React from "react";
import { Inputfield } from "../../../components/Inputfield";
import { Layout } from "../../../components/Layout";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";
import { createUrqlClient } from "./../../../utils/createUrqlClient";
import { useUpdatePostMutation } from "./../../../generated/graphql";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useRouter } from "next/router";

const EditPost = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, fetching, error }] = useGetPostFromUrl();
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>could not find the post</Box>
      </Layout>
    );
  }

  return (
    <Layout variant="small">
      <Head>
        <title>GreenIt - Edit-Post</title>
      </Head>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({ id: intId, ...values });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Inputfield name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <Inputfield
                textarea
                name="text"
                placeholder="text..."
                label="Body"
              />
            </Box>
            <Flex mt={4}>
              <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                Update Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
