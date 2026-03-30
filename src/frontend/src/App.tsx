import { Toaster } from "@/components/ui/sonner";
import AdminPage from "@/pages/AdminPage";
import HomePage from "@/pages/HomePage";
import RestaurantPage from "@/pages/RestaurantPage";
import SignupPage from "@/pages/SignupPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const queryClient = new QueryClient();

const rootRoute = createRootRoute();

function PaymentSuccessPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0fdf4",
        flexDirection: "column",
        gap: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: "4rem" }}>✅</div>
      <h1 style={{ color: "#16a34a", fontSize: "1.75rem", fontWeight: 700 }}>
        Payment Successful!
      </h1>
      <p style={{ color: "#15803d", fontSize: "1rem" }}>
        Your booking has been confirmed. Thank you for choosing Hotel KDM
        Palace.
      </p>
      <a
        href="/"
        style={{
          background: "#16a34a",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
        }}
      >
        Back to Home
      </a>
    </div>
  );
}

function PaymentFailurePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fef2f2",
        flexDirection: "column",
        gap: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: "4rem" }}>❌</div>
      <h1 style={{ color: "#dc2626", fontSize: "1.75rem", fontWeight: 700 }}>
        Payment Failed
      </h1>
      <p style={{ color: "#b91c1c", fontSize: "1rem" }}>
        Something went wrong with your payment. Please try again.
      </p>
      <a
        href="/admin"
        style={{
          background: "#dc2626",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
        }}
      >
        Try Again
      </a>
    </div>
  );
}

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const restaurantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurant",
  component: RestaurantPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  adminRoute,
  restaurantRoute,
  signupRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
