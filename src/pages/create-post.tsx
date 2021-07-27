import { Box, Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { Inputfield } from "../components/Inputfield";
import { useCreatePostMutation } from "../generated/graphql";
import { Layout } from "./../components/Layout";
import { createUrqlClient } from "./../utils/createUrqlClient";
import { useIsAuth } from "./../utils/useIsAuth";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  useIsAuth(); // checks if user is signed in
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Head>
        <title>GreenIt - Create-Post</title>
      </Head>
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { error } = await createPost({ input: values });
          if (!error) {
            router.push("/");
          }
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
                Submit Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
