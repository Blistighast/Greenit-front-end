import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { Inputfield } from "../components/Inputfield";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Wrapper } from "./../components/Wrapper";
import { useRegisterMutation } from "./../generated/graphql";
import { toErrorMap } from "./../utils/toErrorMap";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [{}, register] = useRegisterMutation();

  return (
    <Wrapper variant="small">
      <Head>
        <title>GreenIt - Register</title>
      </Head>
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const res = await register({ options: values });
          if (res.data?.register.errors) {
            // turns object of errors from data into array for setErrors from Formik
            setErrors(toErrorMap(res.data.register.errors));
          } else if (res.data?.register.user) {
            // worked
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Inputfield
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <Inputfield name="email" placeholder="email" label="Email" />
            </Box>
            <Box mt={4}>
              <Inputfield
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
