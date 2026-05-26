import Head from "next/head";
import {
  AppBar,
  Badge,
  Box,
  Container,
  Divider,
  Link,
  Toolbar,
  Stack,
  Typography,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { getCartCount } from "../helpers/cartHelpers";

const Page = ({ children, subHeader }) => {
  const [cartCount, setCartCount] = useState(null);

  useEffect(() => {
    function updateCartCount() {
      setCartCount(getCartCount());
    }

    window.addEventListener("storage", updateCartCount);

    setCartCount(getCartCount());

    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <header>
        <AppBar color="background" height="70px">
          <Toolbar disableGutters>
            <Container maxWidth="xl">
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <NextLink href="/">
                  <Link href="" data-testid="logo-link"><img src="/logo.svg" alt="SkinTwin" /></Link>
                </NextLink>
                <NextLink href="/cart">
                  <Link href="/cart" data-testid="cart-link">
                    <Box>
                      <Badge badgeContent={cartCount} color="warning" data-testid="cart-badge">
                        <ShoppingCart color="primary" fontSize="large" />
                      </Badge>
                    </Box>
                  </Link>
                </NextLink>
              </Stack>
            </Container>
          </Toolbar>
          {subHeader && (
            <>
              <Divider />
              {subHeader}
            </>
          )}
        </AppBar>
      </header>
      <main>
        <Container
          disableGutters
          maxWidth={false}
          sx={{
            mt: "70px",
          }}
        >
          {children}
        </Container>
      </main>
      <Divider />
      <footer>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          flexWrap="wrap"
          sx={{
            pt: 4,
            pb: 4,
          }}
        >
          <Link href="https://skintwin.ai/" target="_blank" rel="noopener"><img alt="SkinTwin AI" src="/logo.svg" style={{ height: "40px" }} /></Link>
          <Typography textAlign="center" variant="body1">SkinTwin AI is a beauty-tech marketplace powered by <span style={{fontWeight: 600}}>AI-driven skin analysis</span> and <span style={{fontWeight: 600}}>personalized recommendations</span></Typography>
        </Stack>
      </footer>
    </>
  );
};

export default Page;