import { Box, Button, Flex, Link, Spacer } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { Inputfield } from "../components/Inputfield";
import { Wrapper } from "./../components/Wrapper";
import { useLoginMutation } from "./../generated/graphql";
import { createUrqlClient } from "./../utils/createUrqlClient";
import { toErrorMap } from "./../utils/toErrorMap";
import NextLink from "next/link";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [{}, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Head>
        <title>GreenIt - Login</title>
      </Head>
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const res = await login(values);
          if (res.data?.login.errors) {
            // turns object of errors from data into array for setErrors from Formik
            setErrors(toErrorMap(res.data.login.errors));
          } else if (res.data?.login.user) {
            // worked
            if (typeof router.query.next === "string") {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Inputfield
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
            />
            <Box mt={4}>
              <Inputfield
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={4}>
              <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                Login
              </Button>
              {/* <Spacer />
              <Box>
                <NextLink href="/forgot-password">
                  <Button colorScheme="red">Forgot Password?</Button>
                </NextLink>
              </Box> */}
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

// withUrqlclient is here to make ssr false
export default withUrqlClient(createUrqlClient)(Login);
