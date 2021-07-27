import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import Head from "next/head";
import React, { useState } from "react";
import { Inputfield } from "../components/Inputfield";
import { Wrapper } from "../components/Wrapper";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useResetPasswordMutation } from "./../generated/graphql";

const ResetPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, resetPassword] = useResetPasswordMutation();
  return (
    <Wrapper variant="small">
      <Head>
        <title>GreenIt - Reset Password</title>
      </Head>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await resetPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email exists, we sent you an email
            </Box>
          ) : (
            <Form>
              <Inputfield
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />

              <Button
                mt={4}
                type="submit"
                colorScheme="teal"
                isLoading={isSubmitting}
              >
                Reset Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ResetPassword);
